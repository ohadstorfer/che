-- Partner reminders: bidireccional. Dos usuarios linkeados pueden ver/actualizar
-- el push_subscriptions del otro (i.e. activarle / setearle reminder_time desde
-- la propia cuenta). Por ahora la única pareja existente es la sembrada acá
-- abajo; agregar más es un INSERT en partner_links.

------------------------------------------------------------
-- partner_links: pares dirigidos. Para que A ↔ B sean partners,
-- insertamos (A, B) y (B, A). Esto simplifica las policies y los lookups.
------------------------------------------------------------
create table public.partner_links (
  user_id    uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, partner_id),
  check (user_id <> partner_id)
);

create index partner_links_partner_idx on public.partner_links(partner_id);

alter table public.partner_links enable row level security;

-- Cada usuario ve sus propios links (necesario para que el cliente sepa
-- quién es su partner). Inserción/borrado quedan fuera del cliente:
-- son operaciones administrativas vía migration o service-role.
create policy "partner_links: owner read"
  on public.partner_links for select
  using (auth.uid() = user_id);

------------------------------------------------------------
-- Seed: par bidireccional entre los dos usuarios solicitados.
-- where exists evita el FK violation si todavía no signaron-up;
-- correr esta migración de nuevo (o re-aplicarla con un script de seed)
-- cuando ambos existan.
------------------------------------------------------------
insert into public.partner_links (user_id, partner_id)
select '6a20e9b4-13d8-4c69-8118-78d992a5b464'::uuid,
       'd7f8ac53-25f8-4c6a-9a9f-a3ec744e09e0'::uuid
where exists (select 1 from auth.users where id = '6a20e9b4-13d8-4c69-8118-78d992a5b464'::uuid)
  and exists (select 1 from auth.users where id = 'd7f8ac53-25f8-4c6a-9a9f-a3ec744e09e0'::uuid)
on conflict do nothing;

insert into public.partner_links (user_id, partner_id)
select 'd7f8ac53-25f8-4c6a-9a9f-a3ec744e09e0'::uuid,
       '6a20e9b4-13d8-4c69-8118-78d992a5b464'::uuid
where exists (select 1 from auth.users where id = '6a20e9b4-13d8-4c69-8118-78d992a5b464'::uuid)
  and exists (select 1 from auth.users where id = 'd7f8ac53-25f8-4c6a-9a9f-a3ec744e09e0'::uuid)
on conflict do nothing;

------------------------------------------------------------
-- RLS extra sobre push_subscriptions: partner puede leer y actualizar
-- las suscripciones del otro. No agregamos INSERT/DELETE porque eso
-- requiere el push token del dispositivo del otro, que no tenemos.
------------------------------------------------------------
create policy "push: partner read"
  on public.push_subscriptions for select
  using (
    exists (
      select 1 from public.partner_links pl
      where pl.user_id = auth.uid()
        and pl.partner_id = push_subscriptions.user_id
    )
  );

create policy "push: partner update"
  on public.push_subscriptions for update
  using (
    exists (
      select 1 from public.partner_links pl
      where pl.user_id = auth.uid()
        and pl.partner_id = push_subscriptions.user_id
    )
  )
  with check (
    exists (
      select 1 from public.partner_links pl
      where pl.user_id = auth.uid()
        and pl.partner_id = push_subscriptions.user_id
    )
  );

------------------------------------------------------------
-- sync_partner_reminder: aplica reminder_time y notifications_enabled
-- a todas las suscripciones del partner del caller. Devuelve cuántas
-- filas se tocaron (0 = el partner todavía no activó notificaciones en
-- ningún dispositivo).
--
-- SECURITY DEFINER + verificación explícita del link: el dueño efectivo
-- queda fijado a auth.uid() del caller, y solo puede afectar al partner
-- listado en partner_links.
------------------------------------------------------------
create or replace function public.sync_partner_reminder(
  p_reminder_time text,
  p_enabled       boolean
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  partner uuid;
  touched int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_reminder_time !~ '^[0-2][0-9]:[0-5][0-9]$' then
    raise exception 'invalid reminder_time format (expected HH:MM)';
  end if;

  select pl.partner_id into partner
  from public.partner_links pl
  where pl.user_id = uid
  limit 1;

  if partner is null then
    return 0;
  end if;

  update public.push_subscriptions
  set reminder_time = p_reminder_time,
      notifications_enabled = p_enabled
  where user_id = partner;

  get diagnostics touched = row_count;
  return touched;
end;
$$;

revoke all on function public.sync_partner_reminder(text, boolean) from public;
grant execute on function public.sync_partner_reminder(text, boolean) to authenticated;
