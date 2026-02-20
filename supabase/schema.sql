-- Profiles table: auto-created via trigger on auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Anonymous',
  name_chosen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case-insensitive uniqueness on display names
create unique index if not exists idx_profiles_display_name_lower
  on public.profiles (lower(display_name));

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  base_name text;
  chosen boolean;
  final_name text;
begin
  base_name := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1)
  );
  -- If an explicit display_name was provided (password signup), mark as chosen
  chosen := (new.raw_user_meta_data ->> 'display_name') is not null;
  final_name := base_name;

  -- Try inserting; on collision append random suffix
  loop
    begin
      insert into public.profiles (id, display_name, name_chosen)
      values (new.id, final_name, chosen);
      exit; -- success
    exception when unique_violation then
      final_name := base_name || '_' || substr(md5(random()::text), 1, 4);
      chosen := false; -- suffixed names should prompt the user to pick a new one
    end;
  end loop;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Scores table: immutable session results
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  puzzle_slug text not null,
  score integer not null check (score >= 0),
  max_difficulty integer not null check (max_difficulty >= 1),
  rounds_played integer not null check (rounds_played >= 1),
  created_at timestamptz not null default now()
);

create index if not exists idx_scores_leaderboard
  on public.scores (puzzle_slug, score desc);

create index if not exists idx_scores_user
  on public.scores (user_id);

alter table public.scores enable row level security;

create policy "Scores are viewable by everyone"
  on public.scores for select using (true);

create policy "Users can insert their own scores"
  on public.scores for insert with check (auth.uid() = user_id);

-- No update or delete on scores (immutable)


-- Anti-cheat trigger: reject unreasonably high scores
create or replace function public.validate_score()
returns trigger
language plpgsql
as $$
declare
  max_possible integer;
begin
  -- Maximum possible score = rounds * max_difficulty^1.5 * 10
  max_possible := new.rounds_played * floor(power(new.max_difficulty, 1.5) * 10);
  if new.score > max_possible then
    raise exception 'Score exceeds maximum possible value';
  end if;
  return new;
end;
$$;

create or replace trigger validate_score_before_insert
  before insert on public.scores
  for each row execute function public.validate_score();


-- Leaderboard view: best score per user per puzzle
create or replace view public.leaderboard as
select distinct on (puzzle_slug, user_id)
  s.id,
  s.user_id,
  p.display_name,
  s.puzzle_slug,
  s.score,
  s.max_difficulty,
  s.rounds_played,
  s.created_at
from public.scores s
join public.profiles p on p.id = s.user_id
order by puzzle_slug, user_id, score desc;


-- RPC: get ranked leaderboard
create or replace function public.get_leaderboard(
  p_slug text default null,
  p_limit integer default 20
)
returns table (
  rank bigint,
  display_name text,
  score integer,
  max_difficulty integer,
  rounds_played integer,
  created_at timestamptz
)
language sql
stable
as $$
  select
    row_number() over (order by l.score desc) as rank,
    l.display_name,
    l.score,
    l.max_difficulty,
    l.rounds_played,
    l.created_at
  from public.leaderboard l
  where (p_slug is null or l.puzzle_slug = p_slug)
  order by l.score desc
  limit p_limit;
$$;


-- RPC: get top leaders (sum of best scores across all puzzle-mode combos)
create or replace function public.get_top_leaders(p_limit integer default 10)
returns table (rank bigint, display_name text, total_score bigint)
language sql stable as $$
  select
    row_number() over (order by sum(l.score) desc) as rank,
    l.display_name,
    sum(l.score)::bigint as total_score
  from public.leaderboard l
  group by l.user_id, l.display_name
  order by total_score desc
  limit p_limit;
$$;


-- RPC: check if a display name is available (case-insensitive)
create or replace function public.is_display_name_available(name text)
returns boolean
language sql
stable
security definer
as $$
  select not exists (
    select 1 from public.profiles where lower(display_name) = lower(name)
  );
$$;


-- RPC: update current user's display name and mark as chosen
create or replace function public.update_display_name(new_name text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if length(new_name) < 2 or length(new_name) > 20 then
    raise exception 'Display name must be between 2 and 20 characters';
  end if;

  update public.profiles
  set display_name = new_name,
      name_chosen = true,
      updated_at = now()
  where id = auth.uid();
end;
$$;
