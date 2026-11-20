-- Onboarding and paywall knobs from the dashboard, no app update (2026-11-19).
-- What each one means and examples: supabase/onboarding-config-README.md;
-- the app side is src/lib/remote-config.ts. Read with the anon key (onboarding
-- runs before there is an account).

-- app_config: empty values = the app's defaults.
--   paywall          {} : hero, preselect, show_monthly, close_after_seconds (default 15 on the
--                         hard paywall), close_offer (default true: the X opens the 40% offer),
--                         offer_decline ("plans" default, or "free_week")
--   onboarding_skip  [] : questions left out (name, why, struggle, goal)
--   experiments      {} : A/B splits for custom screens, { "bf": { "a": 50, "none": 50 } }
insert into public.app_config (key, value) values
  ('paywall', '{}'::jsonb),
  ('onboarding_skip', '[]'::jsonb),
  ('experiments', '{}'::jsonb)
on conflict (key) do nothing;

-- Custom screens: blocks on a page, shown at a slot of the flow.
create table if not exists public.onboarding_screens (
  id text primary key,
  slot text not null check (slot in ('before_class', 'after_class', 'before_paywall')),
  position integer not null default 0,
  published boolean not null default false,
  -- { levels?: [...], whys?: [...], experiment?: "bf", variant?: "a" }
  audience jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  note text,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.onboarding_screens enable row level security;
drop policy if exists "onboarding_screens: anyone reads published" on public.onboarding_screens;
create policy "onboarding_screens: anyone reads published" on public.onboarding_screens
  for select to anon, authenticated using (published or public.is_staff());

drop trigger if exists onboarding_screens_touch on public.onboarding_screens;
create trigger onboarding_screens_touch before update on public.onboarding_screens
  for each row execute function public.first_classes_touch();

-- The three designs approved 2026-11-19, as drafts (published = false): nobody
-- sees them until one is published. The Black Friday one promises 40% off, so
-- it goes live only with a paywall that sells at that price.
insert into public.onboarding_screens (id, slot, position, published, ends_at, note, content) values
('black-friday', 'before_paywall', 10, false, '2026-12-01 03:00:00+00',
 'Design A. Publish only with a 40% paywall behind it (BLACKFRIDAY50 ends 2026-12-01).',
 $json${
   "bg": "butter",
   "blocks": [
     { "type": "sticker", "text": "BLACK FRIDAY" },
     { "type": "headline", "small": "Your first year", "big": "40% OFF" },
     { "type": "countdown", "until": "2026-12-01T03:00:00Z", "label": "ENDS IN" },
     { "type": "bullets", "items": ["Every unit, all the slang", "Daily chats with Pancho", "Cancel anytime"] }
   ],
   "button": { "label": "See the offer", "action": "paywall" },
   "skip": { "label": "Not now" }
 }$json$::jsonb),
('learners-like-you', 'before_paywall', 20, false, null,
 'Design B. Put a real review in the quote before publishing.',
 $json${
   "bg": "lav",
   "blocks": [
     { "type": "kicker", "text": "Learners like you" },
     { "type": "image", "pancho": "mate", "height": 180 },
     { "type": "quote", "text": "A REAL REVIEW GOES HERE", "author": "Name, country", "stars": 5 },
     { "type": "text", "text": "Built for **Argentine** Spanish, not textbook Spanish." }
   ],
   "button": { "label": "Continue" }
 }$json$::jsonb),
('note-from-us', 'after_class', 10, false, null,
 'Design C. Example text: make sure it is true before publishing.',
 $json${
   "bg": "oat",
   "blocks": [
     { "type": "kicker", "text": "A note from us" },
     { "type": "title", "text": "We’re a tiny team in Buenos Aires" },
     { "type": "text", "text": "Your subscription pays for new units every week. Thanks for being early." },
     { "type": "image", "pancho": "saludando", "height": 180 }
   ],
   "button": { "label": "Continue" }
 }$json$::jsonb)
on conflict (id) do nothing;
