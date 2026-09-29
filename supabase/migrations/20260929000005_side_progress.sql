-- Progress outside the course: finished culture classes and Argentine pack
-- scores. Until now both lived only on the phone, so a reinstall or a new
-- phone wiped them while the streak and the road survived. The app still keeps
-- its own copy for instant reads and syncs with this table (lib/side-progress.ts).

create table public.side_progress (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  -- 'culture': key is "<section>/<class>", finished. 'pack': key is the pack slug.
  kind       text not null check (kind in ('culture', 'pack')),
  key        text not null,
  -- Pack scores: percent right on the first try, best and most recent.
  best       smallint not null default 0 check (best between 0 and 100),
  last       smallint not null default 0 check (last between 0 and 100),
  plays      int      not null default 0 check (plays >= 0),
  at         timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, key)
);

alter table public.side_progress enable row level security;

create policy "side_progress: owner read"
  on public.side_progress for select to authenticated
  using (auth.uid() = user_id);

create policy "side_progress: owner insert"
  on public.side_progress for insert to authenticated
  with check (auth.uid() = user_id);

create policy "side_progress: owner update"
  on public.side_progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
