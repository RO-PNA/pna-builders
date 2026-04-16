-- v0.2.1 — profiles 테이블 + Google 사용자 메타 동기화 + is_admin 플래그
--
-- 실행 방법: Supabase Dashboard → SQL Editor에 이 파일 전체를 붙여넣고 Run
-- 또는 `supabase db push` (Supabase CLI 설정되어 있을 경우)

-- ─── profiles 테이블 ───
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    avatar_url text,
    is_admin boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
    on public.profiles for select
    using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- 본인 이외에는 is_admin 수정 불가 — 트리거로 강제
create or replace function public.prevent_is_admin_self_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
    if new.is_admin is distinct from old.is_admin then
        -- 서비스 롤이 아닌 이상 is_admin 변경 금지
        if current_setting('request.jwt.claim.role', true) <> 'service_role' then
            new.is_admin := old.is_admin;
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists profiles_no_self_admin on public.profiles;
create trigger profiles_no_self_admin
    before update on public.profiles
    for each row
    execute function public.prevent_is_admin_self_escalation();

-- ─── 신규 가입 시 profiles 자동 insert ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, display_name, avatar_url)
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            split_part(new.email, '@', 1)
        ),
        new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- ─── updated_at 자동 갱신 ───
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row
    execute function public.set_updated_at();

-- ─── 기존 유저 백필 (마이그레이션 실행 시 1회) ───
insert into public.profiles (id, display_name, avatar_url)
select
    u.id,
    coalesce(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        split_part(u.email, '@', 1)
    ),
    u.raw_user_meta_data->>'avatar_url'
from auth.users u
on conflict (id) do nothing;

-- 스키마 캐시 갱신
notify pgrst, 'reload schema';
