-- Add user_id to get_leaderboard return type so the UI can highlight the current player's row
create or replace function public.get_leaderboard(
  p_slug text default null,
  p_limit integer default 20
)
returns table (
  rank bigint,
  user_id uuid,
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
    l.user_id,
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
