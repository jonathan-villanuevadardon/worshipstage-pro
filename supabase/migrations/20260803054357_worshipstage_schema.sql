-- WorshipStage Pro schema migrated from PocketBase.
-- Every public table is protected with RLS because public is exposed by the Data API.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.organizations (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text not null unique,
  description text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  logo text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  subscription_plan text not null default 'free',
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  avatar text not null default '',
  organization_id text references public.organizations(id) on delete set null,
  role text not null default 'volunteer' check (role in ('super_admin', 'church_admin', 'pastor', 'worship_leader', 'musician', 'volunteer')),
  phone text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  verified boolean not null default false,
  last_login timestamptz,
  theme_preference text not null default 'dark',
  notification_preferences jsonb not null default '{}'::jsonb,
  last_notification_read_at timestamptz,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.song_categories (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  color text not null default '#3B82F6',
  icon text not null default 'music',
  created timestamptz not null default now(),
  updated timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.songs (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  title text not null,
  artist text not null default '',
  composer text not null default '',
  key text not null default '',
  bpm numeric not null default 0,
  tempo numeric not null default 0,
  time_signature text not null default '',
  duration text not null default '',
  duration_seconds numeric not null default 0,
  category text not null default '',
  genre text not null default '',
  theme jsonb,
  difficulty text not null default '',
  language text not null default '',
  lyrics text not null default '',
  chords text not null default '',
  notes text not null default '',
  ccli_number text not null default '',
  audio_url text not null default '',
  video_url text not null default '',
  youtube_url text not null default '',
  spotify_url text not null default '',
  pdf_url text not null default '',
  tags jsonb,
  status text not null default 'active',
  is_archived boolean not null default false,
  version numeric not null default 1,
  created_by text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.song_tags (
  id text primary key default gen_random_uuid()::text,
  song_id text not null references public.songs(id) on delete cascade,
  category_id text references public.song_categories(id) on delete set null,
  tag_name text not null,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.repertoires (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'draft',
  service_type text not null default '',
  total_duration numeric not null default 0,
  song_count numeric not null default 0,
  created_by text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.repertoire_songs (
  id text primary key default gen_random_uuid()::text,
  repertoire_id text not null references public.repertoires(id) on delete cascade,
  song_id text not null references public.songs(id) on delete cascade,
  "order" numeric not null default 0,
  key_adjustment text not null default '',
  notes text not null default '',
  duration_seconds numeric not null default 0,
  leader_id text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now(),
  unique (repertoire_id, song_id)
);

create table public.teams (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  type text not null default '',
  status text not null default 'active',
  leader_id text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.services (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null default '',
  title text not null default '',
  description text not null default '',
  service_type text not null default '',
  date timestamptz not null,
  start_time text not null default '',
  end_time text not null default '',
  location text not null default '',
  status text not null default 'planning',
  theme text not null default '',
  sermon_title text not null default '',
  preacher_id text not null default '',
  repertoire_id text references public.repertoires(id) on delete set null,
  notes text not null default '',
  created_by text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.service_assignments (
  id text primary key default gen_random_uuid()::text,
  service_id text not null references public.services(id) on delete cascade,
  team_member_id uuid not null references public.users(id) on delete cascade,
  assigned_date date,
  role text not null default 'member',
  status text not null default 'pending',
  notes text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now(),
  unique (service_id, team_member_id)
);

create table public.team_availability (
  id text primary key default gen_random_uuid()::text,
  team_member_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  availability_status text not null default 'available',
  reason text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now(),
  unique (team_member_id, date)
);

create table public.team_members (
  id text primary key default gen_random_uuid()::text,
  team_id text not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member',
  availability text not null default 'available',
  last_status_update timestamptz,
  created timestamptz not null default now(),
  updated timestamptz not null default now(),
  unique (team_id, user_id)
);

create table public.role_permissions (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  role_name text not null,
  description text not null default '',
  permissions jsonb not null default '{}'::jsonb,
  is_custom boolean not null default false,
  created timestamptz not null default now(),
  updated timestamptz not null default now(),
  unique (organization_id, role_name)
);

create table public.notifications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id text not null references public.organizations(id) on delete cascade,
  type text not null default 'info',
  title text not null default '',
  message text not null default '',
  read boolean not null default false,
  related_entity_id text not null default '',
  related_entity_type text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.chat_conversations (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null default '',
  type text not null default 'group',
  created_by uuid not null references public.users(id) on delete cascade,
  last_message_at timestamptz,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.chat_participants (
  id text primary key default gen_random_uuid()::text,
  conversation_id text not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_read_at timestamptz,
  created timestamptz not null default now(),
  updated timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create table public.chat_messages (
  id text primary key default gen_random_uuid()::text,
  conversation_id text not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  attachments jsonb not null default '[]'::jsonb,
  deleted_at timestamptz,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.service_notes (
  id text primary key default gen_random_uuid()::text,
  service_id text not null references public.services(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete cascade,
  content text not null,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.service_checklist (
  id text primary key default gen_random_uuid()::text,
  service_id text not null references public.services(id) on delete cascade,
  task text not null,
  assigned_to uuid references public.users(id) on delete set null,
  due_date timestamptz,
  completed boolean not null default false,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.service_elements (
  id text primary key default gen_random_uuid()::text,
  service_id text not null references public.services(id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null default '',
  "order" numeric not null default 0,
  start_time text not null default '',
  duration_minutes numeric not null default 0,
  assigned_team_id text references public.teams(id) on delete set null,
  assigned_user_id uuid references public.users(id) on delete set null,
  notes text not null default '',
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table public.integrated_ai_messages (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  content jsonb,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create index songs_organization_idx on public.songs (organization_id);
create index services_organization_date_idx on public.services (organization_id, date);
create index repertoires_organization_idx on public.repertoires (organization_id);
create index service_assignments_member_idx on public.service_assignments (team_member_id);
create index notifications_user_created_idx on public.notifications (user_id, created desc);
create index chat_messages_conversation_created_idx on public.chat_messages (conversation_id, created);
create index users_organization_idx on public.users (organization_id);
create index teams_organization_idx on public.teams (organization_id);
create index repertoire_songs_song_idx on public.repertoire_songs (song_id);
create index services_repertoire_idx on public.services (repertoire_id);
create index song_tags_song_idx on public.song_tags (song_id);
create index song_tags_category_idx on public.song_tags (category_id);
create index team_members_user_idx on public.team_members (user_id);
create index notifications_organization_idx on public.notifications (organization_id);
create index chat_conversations_organization_idx on public.chat_conversations (organization_id);
create index chat_conversations_creator_idx on public.chat_conversations (created_by);
create index chat_participants_user_idx on public.chat_participants (user_id);
create index chat_messages_user_idx on public.chat_messages (user_id);
create index service_notes_service_idx on public.service_notes (service_id);
create index service_notes_creator_idx on public.service_notes (created_by);
create index service_checklist_service_idx on public.service_checklist (service_id);
create index service_checklist_assignee_idx on public.service_checklist (assigned_to);
create index service_elements_service_idx on public.service_elements (service_id);
create index service_elements_team_idx on public.service_elements (assigned_team_id);
create index service_elements_user_idx on public.service_elements (assigned_user_id);
create index integrated_ai_messages_user_idx on public.integrated_ai_messages (user_id);

create function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.role from public.users u where u.id = (select auth.uid()) and u.status = 'active'
$$;

create function private.current_organization_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.organization_id from public.users u where u.id = (select auth.uid()) and u.status = 'active'
$$;

create function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_user_role() = 'super_admin', false)
$$;

create function private.can_manage()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_user_role() in ('super_admin', 'church_admin', 'pastor', 'worship_leader'), false)
$$;

revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.current_organization_id() to authenticated;
grant execute on function private.is_super_admin() to authenticated;
grant execute on function private.can_manage() to authenticated;

create function private.is_conversation_participant(target_conversation_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.chat_participants p
    where p.conversation_id = target_conversation_id
      and p.user_id = (select auth.uid())
  )
$$;

create function private.owns_conversation(target_conversation_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.chat_conversations c
    where c.id = target_conversation_id
      and c.created_by = (select auth.uid())
  )
$$;

revoke all on function private.is_conversation_participant(text) from public, anon;
revoke all on function private.owns_conversation(text) from public, anon;
grant execute on function private.is_conversation_participant(text) to authenticated;
grant execute on function private.owns_conversation(text) to authenticated;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_organization text;
  initial_role text;
begin
  select o.id into selected_organization
  from public.organizations o
  where o.id = new.raw_user_meta_data ->> 'organization_id'
    and o.status = 'active';

  if selected_organization is null then
    raise exception 'A valid active organization is required';
  end if;

  select case when exists (select 1 from public.users) then 'volunteer' else 'super_admin' end
  into initial_role;

  insert into public.users (
    id, email, first_name, last_name, name, organization_id, role, verified
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    trim(concat(
      coalesce(new.raw_user_meta_data ->> 'first_name', ''),
      ' ',
      coalesce(new.raw_user_meta_data ->> 'last_name', '')
    )),
    selected_organization,
    initial_role,
    new.email_confirmed_at is not null
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create function private.set_user_role_internal(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.current_user_role() not in ('super_admin', 'church_admin', 'pastor', 'worship_leader') then
    raise exception 'Insufficient permissions';
  end if;
  if new_role not in ('church_admin', 'pastor', 'worship_leader', 'musician', 'volunteer') then
    raise exception 'Invalid role';
  end if;
  update public.users
  set role = new_role, updated = now()
  where id = target_user_id
    and (private.is_super_admin() or organization_id = private.current_organization_id())
    and role <> 'super_admin';
  if not found then raise exception 'User not found or cannot be changed'; end if;
end;
$$;

create function private.deactivate_user_internal(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.current_user_role() not in ('super_admin', 'church_admin', 'pastor') then
    raise exception 'Insufficient permissions';
  end if;
  update public.users
  set status = 'inactive', updated = now()
  where id = target_user_id
    and id <> (select auth.uid())
    and (private.is_super_admin() or organization_id = private.current_organization_id())
    and role <> 'super_admin';
  if not found then raise exception 'User not found or cannot be deactivated'; end if;
end;
$$;

revoke all on function private.set_user_role_internal(uuid, text) from public, anon;
revoke all on function private.deactivate_user_internal(uuid) from public, anon;
grant execute on function private.set_user_role_internal(uuid, text) to authenticated;
grant execute on function private.deactivate_user_internal(uuid) to authenticated;

create function public.set_user_role(target_user_id uuid, new_role text)
returns void
language sql
security invoker
set search_path = ''
as $$ select private.set_user_role_internal(target_user_id, new_role) $$;

create function public.deactivate_user(target_user_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$ select private.deactivate_user_internal(target_user_id) $$;

revoke all on function public.set_user_role(uuid, text) from public, anon;
revoke all on function public.deactivate_user(uuid) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;
grant execute on function public.deactivate_user(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.users enable row level security;

create policy organizations_registration_read on public.organizations
for select to anon using (status = 'active');
create policy organizations_member_read on public.organizations
for select to authenticated
using (private.is_super_admin() or id = private.current_organization_id());
create policy organizations_super_admin_insert on public.organizations
for insert to authenticated with check (private.is_super_admin());
create policy organizations_super_admin_update on public.organizations
for update to authenticated using (private.is_super_admin()) with check (private.is_super_admin());
create policy organizations_super_admin_delete on public.organizations
for delete to authenticated using (private.is_super_admin());

create policy users_member_read on public.users
for select to authenticated
using (id = (select auth.uid()) or private.is_super_admin() or organization_id = private.current_organization_id());
create policy users_profile_update on public.users
for update to authenticated
using (
  id = (select auth.uid())
  or (private.can_manage() and (private.is_super_admin() or organization_id = private.current_organization_id()))
)
with check (
  id = (select auth.uid())
  or (private.can_manage() and (private.is_super_admin() or organization_id = private.current_organization_id()))
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'song_categories', 'songs', 'repertoires', 'teams', 'services', 'role_permissions'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (private.is_super_admin() or organization_id = private.current_organization_id())',
      table_name || '_org_read', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (private.can_manage() and (private.is_super_admin() or organization_id = private.current_organization_id()))',
      table_name || '_org_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (private.can_manage() and (private.is_super_admin() or organization_id = private.current_organization_id())) with check (private.can_manage() and (private.is_super_admin() or organization_id = private.current_organization_id()))',
      table_name || '_org_update', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (private.can_manage() and (private.is_super_admin() or organization_id = private.current_organization_id()))',
      table_name || '_org_delete', table_name
    );
  end loop;
end
$$;

alter table public.song_tags enable row level security;
create policy song_tags_read on public.song_tags for select to authenticated
using (exists (select 1 from public.songs s where s.id = song_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())));
create policy song_tags_insert on public.song_tags for insert to authenticated
with check (private.can_manage() and exists (select 1 from public.songs s where s.id = song_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())));
create policy song_tags_update on public.song_tags for update to authenticated
using (private.can_manage() and exists (select 1 from public.songs s where s.id = song_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())))
with check (private.can_manage() and exists (select 1 from public.songs s where s.id = song_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())));
create policy song_tags_delete on public.song_tags for delete to authenticated
using (private.can_manage() and exists (select 1 from public.songs s where s.id = song_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())));

alter table public.repertoire_songs enable row level security;
create policy repertoire_songs_read on public.repertoire_songs for select to authenticated
using (exists (select 1 from public.repertoires r where r.id = repertoire_id and (private.is_super_admin() or r.organization_id = private.current_organization_id())));
create policy repertoire_songs_insert on public.repertoire_songs for insert to authenticated
with check (private.can_manage() and exists (select 1 from public.repertoires r where r.id = repertoire_id and (private.is_super_admin() or r.organization_id = private.current_organization_id())));
create policy repertoire_songs_update on public.repertoire_songs for update to authenticated
using (private.can_manage() and exists (select 1 from public.repertoires r where r.id = repertoire_id and (private.is_super_admin() or r.organization_id = private.current_organization_id())))
with check (private.can_manage() and exists (select 1 from public.repertoires r where r.id = repertoire_id and (private.is_super_admin() or r.organization_id = private.current_organization_id())));
create policy repertoire_songs_delete on public.repertoire_songs for delete to authenticated
using (private.can_manage() and exists (select 1 from public.repertoires r where r.id = repertoire_id and (private.is_super_admin() or r.organization_id = private.current_organization_id())));

alter table public.service_assignments enable row level security;
create policy service_assignments_read on public.service_assignments for select to authenticated
using (team_member_id = (select auth.uid()) or exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())));
create policy service_assignments_insert on public.service_assignments for insert to authenticated
with check (private.can_manage() and exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())));
create policy service_assignments_update on public.service_assignments for update to authenticated
using (private.can_manage() and exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())))
with check (private.can_manage() and exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())));
create policy service_assignments_delete on public.service_assignments for delete to authenticated
using (private.can_manage() and exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())));

alter table public.team_availability enable row level security;
create policy team_availability_read on public.team_availability for select to authenticated
using (team_member_id = (select auth.uid()) or exists (select 1 from public.users u where u.id = team_member_id and (private.is_super_admin() or u.organization_id = private.current_organization_id())));
create policy team_availability_own_insert on public.team_availability for insert to authenticated with check (team_member_id = (select auth.uid()));
create policy team_availability_own_update on public.team_availability for update to authenticated using (team_member_id = (select auth.uid())) with check (team_member_id = (select auth.uid()));
create policy team_availability_own_delete on public.team_availability for delete to authenticated using (team_member_id = (select auth.uid()));

alter table public.team_members enable row level security;
create policy team_members_read on public.team_members for select to authenticated
using (user_id = (select auth.uid()) or exists (select 1 from public.teams t where t.id = team_id and (private.is_super_admin() or t.organization_id = private.current_organization_id())));
create policy team_members_insert on public.team_members for insert to authenticated
with check (private.can_manage() and exists (select 1 from public.teams t where t.id = team_id and (private.is_super_admin() or t.organization_id = private.current_organization_id())));
create policy team_members_update on public.team_members for update to authenticated
using (private.can_manage() and exists (select 1 from public.teams t where t.id = team_id and (private.is_super_admin() or t.organization_id = private.current_organization_id())))
with check (private.can_manage() and exists (select 1 from public.teams t where t.id = team_id and (private.is_super_admin() or t.organization_id = private.current_organization_id())));
create policy team_members_delete on public.team_members for delete to authenticated
using (private.can_manage() and exists (select 1 from public.teams t where t.id = team_id and (private.is_super_admin() or t.organization_id = private.current_organization_id())));

alter table public.notifications enable row level security;
create policy notifications_own_read on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_own_update on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_own_delete on public.notifications for delete to authenticated using (user_id = (select auth.uid()));

alter table public.chat_conversations enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;
create policy chat_conversations_participant_read on public.chat_conversations for select to authenticated
using (private.is_conversation_participant(id));
create policy chat_conversations_create on public.chat_conversations for insert to authenticated
with check (created_by = (select auth.uid()) and organization_id = private.current_organization_id());
create policy chat_participants_read on public.chat_participants for select to authenticated
using (user_id = (select auth.uid()) or private.is_conversation_participant(conversation_id));
create policy chat_participants_insert on public.chat_participants for insert to authenticated
with check (private.owns_conversation(conversation_id));
create policy chat_participants_update on public.chat_participants for update to authenticated
using (private.owns_conversation(conversation_id))
with check (private.owns_conversation(conversation_id));
create policy chat_participants_delete on public.chat_participants for delete to authenticated
using (private.owns_conversation(conversation_id));
create policy chat_messages_participant_read on public.chat_messages for select to authenticated
using (private.is_conversation_participant(conversation_id));
create policy chat_messages_own_insert on public.chat_messages for insert to authenticated
with check (user_id = (select auth.uid()) and private.is_conversation_participant(conversation_id));
create policy chat_messages_own_delete on public.chat_messages for delete to authenticated using (user_id = (select auth.uid()));

do $$
declare
  table_name text;
begin
  foreach table_name in array array['service_notes', 'service_checklist', 'service_elements'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())))',
      table_name || '_read', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (private.can_manage() and exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())))',
      table_name || '_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (private.can_manage() and exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id()))) with check (private.can_manage() and exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())))',
      table_name || '_update', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (private.can_manage() and exists (select 1 from public.services s where s.id = service_id and (private.is_super_admin() or s.organization_id = private.current_organization_id())))',
      table_name || '_delete', table_name
    );
  end loop;
end
$$;

alter table public.integrated_ai_messages enable row level security;
create policy integrated_ai_messages_own on public.integrated_ai_messages for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
grant select on public.organizations to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, delete on public.users from authenticated;
revoke update on public.users from authenticated;
grant update (first_name, last_name, name, phone, avatar, theme_preference, notification_preferences, last_notification_read_at, updated) on public.users to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('integrated-ai', 'integrated-ai', false)
on conflict (id) do nothing;

create policy avatars_own_insert on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_own_update on storage.objects for update to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);
create policy avatars_own_delete on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);

create policy integrated_ai_own_read on storage.objects for select to authenticated
using (bucket_id = 'integrated-ai' and owner_id = (select auth.uid())::text);
create policy integrated_ai_own_insert on storage.objects for insert to authenticated
with check (bucket_id = 'integrated-ai' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy integrated_ai_own_update on storage.objects for update to authenticated
using (bucket_id = 'integrated-ai' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'integrated-ai' and owner_id = (select auth.uid())::text);

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.users;
