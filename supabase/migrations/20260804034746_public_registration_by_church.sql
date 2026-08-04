-- Public registration is intentionally decided in the database. The client
-- supplies a church choice, but never a role.

update public.organizations
set name = btrim(name), updated = now()
where name <> btrim(name);

create unique index if not exists organizations_normalized_name_key
on public.organizations (lower(btrim(name)));

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration_type text := coalesce(new.raw_user_meta_data ->> 'registration_type', 'existing_church');
  selected_organization text;
  new_church_name text := btrim(coalesce(new.raw_user_meta_data ->> 'church_name', ''));
  generated_slug text;
  initial_role text;
begin
  if registration_type = 'new_church' then
    if char_length(new_church_name) < 3 or char_length(new_church_name) > 120 then
      raise exception 'Church name must contain between 3 and 120 characters';
    end if;

    if exists (
      select 1
      from public.organizations o
      where lower(btrim(o.name)) = lower(new_church_name)
    ) then
      raise exception 'This church is already registered. Select it from the catalog';
    end if;

    generated_slug := coalesce(
      nullif(
        btrim(
          regexp_replace(lower(new_church_name), '[^a-z0-9]+', '-', 'g'),
          '-'
        ),
        ''
      ),
      'church'
    ) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

    begin
      insert into public.organizations (name, slug, email, status, subscription_plan)
      values (new_church_name, generated_slug, coalesce(new.email, ''), 'active', 'free')
      returning id into selected_organization;
    exception
      when unique_violation then
        raise exception 'This church is already registered. Select it from the catalog';
    end;

    initial_role := 'church_admin';
  elsif registration_type = 'existing_church' then
    select o.id into selected_organization
    from public.organizations o
    where o.id = new.raw_user_meta_data ->> 'organization_id'
      and o.status = 'active';

    if selected_organization is null then
      raise exception 'A valid active church is required';
    end if;

    initial_role := 'volunteer';
  else
    raise exception 'Invalid registration type';
  end if;

  insert into public.users (
    id,
    email,
    first_name,
    last_name,
    name,
    organization_id,
    role,
    verified
  ) values (
    new.id,
    coalesce(new.email, ''),
    left(btrim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 80),
    left(btrim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), 80),
    left(
      btrim(concat(
        coalesce(new.raw_user_meta_data ->> 'first_name', ''),
        ' ',
        coalesce(new.raw_user_meta_data ->> 'last_name', '')
      )),
      161
    ),
    selected_organization,
    initial_role,
    new.email_confirmed_at is not null
  );

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create or replace function private.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users
  set verified = new.email_confirmed_at is not null,
      updated = now()
  where id = new.id;

  return new;
end;
$$;

revoke all on function private.handle_user_email_confirmed() from public, anon, authenticated;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
after update of email_confirmed_at on auth.users
for each row
when (old.email_confirmed_at is distinct from new.email_confirmed_at)
execute function private.handle_user_email_confirmed();
