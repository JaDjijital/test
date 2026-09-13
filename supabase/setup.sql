begin;
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null, display_name text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.tasks (
 id uuid primary key default gen_random_uuid(), title text not null,
 category text not null default 'other', target_value numeric, unit text,
 task_date date not null default current_date,
 assigned_to uuid not null references public.profiles(id) on delete cascade,
 assigned_by uuid not null references public.profiles(id) on delete cascade,
 completed boolean not null default false, completed_at timestamptz,
 proof_url text, notes text, created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
create policy "authenticated users can view profiles" on public.profiles for select to authenticated using (true);
create policy "authenticated users can view tasks" on public.tasks for select to authenticated using (true);
create policy "authenticated users can create tasks" on public.tasks for insert to authenticated with check (assigned_by = auth.uid());
create policy "assignee can update own tasks" on public.tasks for update to authenticated using (assigned_to = auth.uid()) with check (assigned_to = auth.uid());
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('training-proofs','training-proofs',false,10485760,array['image/jpeg','image/png','image/webp','image/gif']) on conflict (id) do nothing;
create policy "authenticated users can view training proofs" on storage.objects for select to authenticated using (bucket_id = 'training-proofs');
create policy "users can upload own training proofs" on storage.objects for insert to authenticated with check (bucket_id = 'training-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users can update own training proofs" on storage.objects for update to authenticated using (bucket_id = 'training-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
commit;
