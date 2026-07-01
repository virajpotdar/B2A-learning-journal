-- Supabase SQL to create a custom users table for app-managed authentication

create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create index if not exists users_email_idx on users (email);
