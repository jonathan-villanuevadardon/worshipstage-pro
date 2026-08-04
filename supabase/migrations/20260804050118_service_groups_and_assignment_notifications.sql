create table public.service_teams (
  id text primary key default gen_random_uuid()::text,
  service_id text not null references public.services(id) on delete cascade,
  team_id text not null references public.teams(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  created timestamptz not null default now(),
  unique (service_id, team_id)
);

create index service_teams_team_id_idx on public.service_teams(team_id);
create index service_teams_created_by_idx on public.service_teams(created_by);

alter table public.service_teams enable row level security;

create policy service_teams_read on public.service_teams
for select to authenticated
using (
  exists (
    select 1
    from public.services s
    where s.id = service_id
      and (private.is_super_admin() or s.organization_id = private.current_organization_id())
  )
);

create policy service_teams_insert on public.service_teams
for insert to authenticated
with check (
  private.can_manage()
  and exists (
    select 1
    from public.services s
    join public.teams t on t.id = team_id
    where s.id = service_id
      and s.organization_id = t.organization_id
      and (private.is_super_admin() or s.organization_id = private.current_organization_id())
  )
);

create policy service_teams_delete on public.service_teams
for delete to authenticated
using (
  private.can_manage()
  and exists (
    select 1
    from public.services s
    where s.id = service_id
      and (private.is_super_admin() or s.organization_id = private.current_organization_id())
  )
);

revoke all on public.service_teams from anon;
grant select, insert, delete on public.service_teams to authenticated;

create function private.save_team_with_members_internal(
  target_team_id text,
  target_organization_id text,
  team_name text,
  team_description text,
  member_user_ids uuid[]
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_team_id text;
  normalized_member_ids uuid[] := coalesce(member_user_ids, array[]::uuid[]);
begin
  if not private.can_manage() then
    raise exception 'Insufficient permissions';
  end if;

  if target_organization_id is null
    or (not private.is_super_admin() and target_organization_id <> private.current_organization_id()) then
    raise exception 'Invalid organization';
  end if;

  if length(btrim(coalesce(team_name, ''))) < 2 then
    raise exception 'Group name must contain at least 2 characters';
  end if;

  if exists (
    select 1
    from public.teams t
    where t.organization_id = target_organization_id
      and lower(btrim(t.name)) = lower(btrim(team_name))
      and (target_team_id is null or t.id <> target_team_id)
      and (
        target_team_id is null
        or lower(btrim(team_name)) <> (
          select lower(btrim(current_team.name))
          from public.teams current_team
          where current_team.id = target_team_id
        )
      )
  ) then
    raise exception 'A group with this name already exists';
  end if;

  if exists (
    select 1
    from unnest(normalized_member_ids) requested(user_id)
    left join public.users u
      on u.id = requested.user_id
     and u.organization_id = target_organization_id
     and u.status = 'active'
    where u.id is null
  ) then
    raise exception 'Every selected member must be active and belong to this organization';
  end if;

  if target_team_id is null then
    insert into public.teams (organization_id, name, description, type, status)
    values (target_organization_id, btrim(team_name), coalesce(team_description, ''), 'group', 'active')
    returning id into saved_team_id;
  else
    update public.teams
    set name = btrim(team_name),
        description = coalesce(team_description, ''),
        type = 'group',
        updated = now()
    where id = target_team_id
      and organization_id = target_organization_id
    returning id into saved_team_id;

    if saved_team_id is null then
      raise exception 'Group not found';
    end if;
  end if;

  delete from public.team_members tm
  where tm.team_id = saved_team_id
    and not (tm.user_id = any(normalized_member_ids));

  insert into public.team_members (team_id, user_id, role, availability)
  select saved_team_id, requested.user_id, 'member', 'available'
  from (select distinct unnest(normalized_member_ids) as user_id) requested
  on conflict (team_id, user_id) do nothing;

  return saved_team_id;
end;
$$;

revoke all on function private.save_team_with_members_internal(text, text, text, text, uuid[]) from public, anon;
grant execute on function private.save_team_with_members_internal(text, text, text, text, uuid[]) to authenticated;

create function public.save_team_with_members(
  target_team_id text,
  target_organization_id text,
  team_name text,
  team_description text,
  member_user_ids uuid[]
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.save_team_with_members_internal(
    target_team_id,
    target_organization_id,
    team_name,
    team_description,
    member_user_ids
  )
$$;

revoke all on function public.save_team_with_members(text, text, text, text, uuid[]) from public, anon;
grant execute on function public.save_team_with_members(text, text, text, text, uuid[]) to authenticated;

create function private.notify_volunteer_service_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_user public.users%rowtype;
  assigned_service public.services%rowtype;
begin
  select * into assigned_user
  from public.users u
  where u.id = new.team_member_id;

  if assigned_user.role <> 'volunteer' or assigned_user.status <> 'active' then
    return new;
  end if;

  select * into assigned_service
  from public.services s
  where s.id = new.service_id;

  insert into public.notifications (
    user_id,
    organization_id,
    type,
    title,
    message,
    related_entity_id,
    related_entity_type
  ) values (
    assigned_user.id,
    assigned_service.organization_id,
    'service_assignment',
    'Nuevo servicio asignado',
    format(
      'Fuiste asignado a %s el %s a las %s.',
      coalesce(nullif(assigned_service.title, ''), nullif(assigned_service.name, ''), 'un servicio'),
      to_char(assigned_service.date, 'DD/MM/YYYY'),
      coalesce(nullif(assigned_service.start_time, ''), 'hora por confirmar')
    ),
    assigned_service.id,
    'service'
  );

  return new;
end;
$$;

revoke all on function private.notify_volunteer_service_assignment() from public, anon, authenticated;

create trigger notify_volunteer_after_service_assignment
after insert on public.service_assignments
for each row execute function private.notify_volunteer_service_assignment();

create function private.create_service_with_groups_internal(
  target_organization_id text,
  service_name text,
  service_date timestamptz,
  service_start_time text,
  service_type text,
  service_location text,
  service_description text,
  target_repertoire_id text,
  target_team_ids text[]
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_service_id text;
  normalized_team_ids text[] := coalesce(target_team_ids, array[]::text[]);
begin
  if not private.can_manage() then
    raise exception 'Insufficient permissions';
  end if;

  if target_organization_id is null
    or (not private.is_super_admin() and target_organization_id <> private.current_organization_id()) then
    raise exception 'Invalid organization';
  end if;

  if length(btrim(coalesce(service_name, ''))) < 2
    or service_date is null
    or length(btrim(coalesce(service_start_time, ''))) = 0
    or length(btrim(coalesce(service_type, ''))) = 0 then
    raise exception 'Name, date, time, and service type are required';
  end if;

  if target_repertoire_id is not null and not exists (
    select 1
    from public.repertoires r
    where r.id = target_repertoire_id
      and r.organization_id = target_organization_id
  ) then
    raise exception 'Invalid repertoire';
  end if;

  if exists (
    select 1
    from unnest(normalized_team_ids) requested(team_id)
    left join public.teams t
      on t.id = requested.team_id
     and t.organization_id = target_organization_id
     and t.status = 'active'
    where t.id is null
  ) then
    raise exception 'Every selected group must be active and belong to this organization';
  end if;

  insert into public.services (
    organization_id,
    name,
    title,
    description,
    service_type,
    date,
    start_time,
    location,
    status,
    repertoire_id,
    created_by
  ) values (
    target_organization_id,
    btrim(service_name),
    btrim(service_name),
    coalesce(service_description, ''),
    service_type,
    service_date,
    service_start_time,
    coalesce(service_location, ''),
    'planning',
    target_repertoire_id,
    (select auth.uid())::text
  ) returning id into saved_service_id;

  insert into public.service_teams (service_id, team_id, created_by)
  select saved_service_id, requested.team_id, (select auth.uid())
  from (select distinct unnest(normalized_team_ids) as team_id) requested
  on conflict (service_id, team_id) do nothing;

  insert into public.service_assignments (
    service_id,
    team_member_id,
    assigned_date,
    role,
    status
  )
  select distinct
    saved_service_id,
    tm.user_id,
    service_date::date,
    coalesce(nullif(tm.role, ''), 'member'),
    'pending'
  from public.team_members tm
  join public.teams t on t.id = tm.team_id
  join public.users u on u.id = tm.user_id and u.status = 'active'
  where tm.team_id = any(normalized_team_ids)
    and t.organization_id = target_organization_id
  on conflict (service_id, team_member_id) do nothing;

  return saved_service_id;
end;
$$;

revoke all on function private.create_service_with_groups_internal(text, text, timestamptz, text, text, text, text, text, text[]) from public, anon;
grant execute on function private.create_service_with_groups_internal(text, text, timestamptz, text, text, text, text, text, text[]) to authenticated;

create function public.create_service_with_groups(
  target_organization_id text,
  service_name text,
  service_date timestamptz,
  service_start_time text,
  service_type text,
  service_location text,
  service_description text,
  target_repertoire_id text,
  target_team_ids text[]
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.create_service_with_groups_internal(
    target_organization_id,
    service_name,
    service_date,
    service_start_time,
    service_type,
    service_location,
    service_description,
    target_repertoire_id,
    target_team_ids
  )
$$;

revoke all on function public.create_service_with_groups(text, text, timestamptz, text, text, text, text, text, text[]) from public, anon;
grant execute on function public.create_service_with_groups(text, text, timestamptz, text, text, text, text, text, text[]) to authenticated;
