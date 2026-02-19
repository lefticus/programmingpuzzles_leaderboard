-- Profiles table: auto-created via trigger on auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Anonymous',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  );
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
