create function private.update_service_with_groups_internal(
  target_service_id text,
  target_service_name text,
  target_service_date timestamptz,
  target_start_time text,
  target_service_type text,
  target_location text,
  target_description text,
  target_repertoire_id text,
  target_team_ids text[]
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  service_organization_id text;
  normalized_team_ids text[] := coalesce(target_team_ids, array[]::text[]);
begin
  if not private.can_manage() then
    raise exception 'Insufficient permissions';
  end if;

  select s.organization_id
  into service_organization_id
  from public.services s
  where s.id = target_service_id
    and (private.is_super_admin() or s.organization_id = private.current_organization_id())
  for update;

  if service_organization_id is null then
    raise exception 'Service not found or cannot be edited';
  end if;

  if length(btrim(coalesce(target_service_name, ''))) < 2
    or target_service_date is null
    or length(btrim(coalesce(target_start_time, ''))) = 0
    or length(btrim(coalesce(target_service_type, ''))) = 0 then
    raise exception 'Name, date, time, and service type are required';
  end if;

  if target_repertoire_id is not null and not exists (
    select 1
    from public.repertoires r
    where r.id = target_repertoire_id
      and r.organization_id = service_organization_id
  ) then
    raise exception 'Invalid repertoire';
  end if;

  if exists (
    select 1
    from unnest(normalized_team_ids) requested(team_id)
    left join public.teams t
      on t.id = requested.team_id
     and t.organization_id = service_organization_id
     and t.status = 'active'
    where t.id is null
  ) then
    raise exception 'Every selected group must be active and belong to this organization';
  end if;

  update public.services
  set name = btrim(target_service_name),
      title = btrim(target_service_name),
      date = target_service_date,
      start_time = target_start_time,
      service_type = target_service_type,
      location = coalesce(target_location, ''),
      description = coalesce(target_description, ''),
      repertoire_id = target_repertoire_id,
      updated = now()
  where id = target_service_id;

  delete from public.service_teams st
  where st.service_id = target_service_id
    and not (st.team_id = any(normalized_team_ids));

  insert into public.service_teams (service_id, team_id, created_by)
  select target_service_id, requested.team_id, (select auth.uid())
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
    target_service_id,
    tm.user_id,
    target_service_date::date,
    coalesce(nullif(tm.role, ''), 'member'),
    'pending'
  from public.team_members tm
  join public.teams t on t.id = tm.team_id
  join public.users u on u.id = tm.user_id and u.status = 'active'
  where tm.team_id = any(normalized_team_ids)
    and t.organization_id = service_organization_id
  on conflict (service_id, team_member_id) do nothing;

  update public.service_assignments
  set assigned_date = target_service_date::date,
      updated = now()
  where service_id = target_service_id
    and assigned_date is distinct from target_service_date::date;

  return target_service_id;
end;
$$;

revoke all on function private.update_service_with_groups_internal(text, text, timestamptz, text, text, text, text, text, text[]) from public, anon;
grant execute on function private.update_service_with_groups_internal(text, text, timestamptz, text, text, text, text, text, text[]) to authenticated;

create function public.update_service_with_groups(
  target_service_id text,
  target_service_name text,
  target_service_date timestamptz,
  target_start_time text,
  target_service_type text,
  target_location text,
  target_description text,
  target_repertoire_id text,
  target_team_ids text[]
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.update_service_with_groups_internal(
    target_service_id,
    target_service_name,
    target_service_date,
    target_start_time,
    target_service_type,
    target_location,
    target_description,
    target_repertoire_id,
    target_team_ids
  )
$$;

revoke all on function public.update_service_with_groups(text, text, timestamptz, text, text, text, text, text, text[]) from public, anon;
grant execute on function public.update_service_with_groups(text, text, timestamptz, text, text, text, text, text, text[]) to authenticated;
