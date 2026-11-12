-- AgriAdviser Pro - PostgreSQL Database Schema for Supabase
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  farm_location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Advisories table
create table if not exists public.advisories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  crop_name text not null,
  growth_stage text not null,
  soil_type text not null,
  irrigation_type text not null,
  symptoms_description text not null,
  image_url text,
  ai_diagnosis jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_advisories_user_id on public.advisories(user_id);
create index if not exists idx_advisories_created_at on public.advisories(created_at desc);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.advisories enable row level security;

-- Profiles Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Advisories Policies
drop policy if exists "Users can view own advisories" on public.advisories;
create policy "Users can view own advisories" on public.advisories
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own advisories" on public.advisories;
create policy "Users can insert own advisories" on public.advisories
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own advisories" on public.advisories;
create policy "Users can delete own advisories" on public.advisories
  for delete using (auth.uid() = user_id);

-- Optional trigger to auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, farm_location)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'farm_location');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

