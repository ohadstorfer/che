-- ---------------------------------------------------------------------------
-- Three more classes in every unit (scripts/course/unit-extras.mjs wrote this):
--   speak    a chat with Pancho about the unit (hablar kind 'unit')
--   slang    three Argentine words (src/lib/unit-extras.json says which)
--   culture  a culture class (the same file says which)
-- They are lessons like any other on the road: circles on the path, walked in
-- order, and finished through finish_lesson. What they play lives in the app;
-- the rows only give them their place.
--
-- In a unit: slang a third of the way in, culture two thirds in, the chat
-- last, just before the unit check. A learner already past one of them has it
-- done for her, so nobody is sent back down the road.
-- ---------------------------------------------------------------------------

alter table public.lessons drop constraint lessons_kind_check;
alter table public.lessons add constraint lessons_kind_check
  check (kind in ('lesson', 'practice', 'story', 'listening', 'review', 'checkpoint', 'speak', 'slang', 'culture'));

create temp table unit_extras (slug text primary key, slang boolean not null, culture boolean not null);
insert into unit_extras (slug, slang, culture) values
  ('un-cafe-por-favor', true, true),
  ('otro-cafe', true, true),
  ('hola-che', true, true),
  ('buen-dia', true, true),
  ('vos-y-sos', true, true),
  ('sos-turista', true, true),
  ('practica-hola', true, true),
  ('como-te-llamas', true, true),
  ('encantado', true, true),
  ('de-donde-sos', true, true),
  ('soy-de-zona-norte', true, true),
  ('el-y-ella', true, true),
  ('quien-es', true, true),
  ('practica-quien-es', true, true),
  ('argentino-argentina', true, true),
  ('de-todos-lados', true, true),
  ('la-familia', true, true),
  ('tios-y-primos', true, true),
  ('cuantos-anos-tenes', true, true),
  ('tengo-hambre', true, true),
  ('practica-tengo-hambre', true, true),
  ('alfajores-y-chicles', true, true),
  ('en-el-kiosco', true, true),
  ('la-gente', true, true),
  ('altos-y-morochos', true, true),
  ('donde-esta', true, true),
  ('donde-estan-las-llaves', true, true),
  ('hay-un-kiosco', true, true),
  ('hay-un-tren', true, true),
  ('practica-por-aca', true, true),
  ('como-estas', true, true),
  ('esta-cerrado', true, true),
  ('que-haces', true, true),
  ('practico-castellano', true, true),
  ('mate-y-facturas', true, true),
  ('nos-gustan-los-fideos', true, true),
  ('practica-nos-gusta', true, true),
  ('me-traes-un-cafe', true, true),
  ('que-quieren-tomar', true, true),
  ('facu-y-laburo', true, true),
  ('es-enfermera', true, true),
  ('comes-vivis', true, true),
  ('vendo-diarios', true, true),
  ('practica-el-vecino', true, true),
  ('mi-edificio', true, true),
  ('mi-casa', true, true),
  ('la-hora', true, true),
  ('a-que-hora-abre', true, true),
  ('el-barrio', true, true),
  ('a-la-vuelta', true, true),
  ('queres-podes-vas', true, true),
  ('preferis-salir', true, true),
  ('practica-a-la-vuelta', true, true),
  ('dale-veni', true, true),
  ('segui-derecho', true, true),
  ('ropa-y-colores', true, true),
  ('este-buzo', true, true),
  ('cuanto-sale', true, true),
  ('me-cobras', true, true),
  ('practica-me-cobras', true, true),
  ('la-rutina', true, true),
  ('me-despierto-temprano', true, true),
  ('que-te-gusta-hacer', true, true),
  ('me-interesa', true, true),
  ('clima', true, true),
  ('en-febrero', true, true),
  ('practica-el-clima', true, true),
  ('el-cumple', true, true),
  ('ahora-y-planes', true, true),
  ('ayer-labure', true, true),
  ('cenamos-afuera', true, true),
  ('comi-y-sali', true, true),
  ('naci-en', true, true),
  ('fui-a-la-cancha', true, true),
  ('la-pasamos-barbaro', true, true),
  ('practica-que-hiciste', true, true),
  ('practica-como-estuvo', true, true),
  ('el-finde', true, true),
  ('vinieron-todos', true, true),
  ('mas-alto-que', true, true),
  ('el-mas-tranquilo', true, true),
  ('me-duele', true, true),
  ('me-dolio', true, true),
  ('practica-el-finde', true, true),
  ('practica-quien-vino', true, false),
  ('te-llamo', true, false),
  ('te-llame', true, false),
  ('las-tareas', true, false),
  ('quien-lavo', true, false),
  ('de-viaje', true, false),
  ('las-vacaciones', true, false),
  ('practica-el-viaje', true, false),
  ('practica-las-vacaciones', true, false),
  ('menos-mal', true, false),
  ('contame', true, false),
  ('cuando-era-chico', true, false),
  ('en-la-primaria', true, false),
  ('siempre-jugabamos', true, false),
  ('me-encantaba', true, false),
  ('estaba-lloviendo', true, false),
  ('sono-el-timbre', true, false),
  ('practica-de-chico', true, false),
  ('practica-en-esa-epoca', true, false),
  ('en-el-restaurante', true, false),
  ('una-grande-de-muzza', true, false),
  ('tipo-ocho', true, false),
  ('llegue-tarde', true, false),
  ('las-fiestas', true, false),
  ('en-lo-de-la-abuela', true, false),
  ('practica-la-juntada', true, false),
  ('practica-la-sobremesa', true, false),
  ('me-puse-nervioso', true, false),
  ('me-olvide', true, false),
  ('la-semana-que-viene', true, false),
  ('voy-a-tener-que', true, false),
  ('me-mude', true, false),
  ('el-depto-nuevo', true, false),
  ('practica-me-mude', true, false),
  ('practica-antes-y-ahora', true, false),
  ('las-figuritas', true, false),
  ('te-acordas', true, false),
  ('me-haces-un-favor', true, false),
  ('me-das-una-mano', true, false),
  ('hay-que', true, false),
  ('hay-que-sacar-turno', true, false),
  ('en-la-verduleria', true, false),
  ('cien-gramos-de-jamon', true, false),
  ('practica-los-mandados', true, false),
  ('practica-la-feria', true, false),
  ('el-celu', true, false),
  ('no-tengo-senal', true, false),
  ('te-lo-devuelvo', true, false),
  ('te-lo-presto', true, false),
  ('laburo-nuevo', true, false),
  ('me-contrataron', true, false),
  ('practica-el-laburo', true, false),
  ('practica-te-lo-presto', true, false),
  ('salir-con-alguien', true, false),
  ('estamos-de-novios', true, false),
  ('donde-estara', true, false),
  ('quien-sera', true, false),
  ('me-siento-mal', true, false),
  ('como-se-siente', true, false),
  ('practica-capaz', true, false),
  ('practica-a-lo-mejor', true, false),
  ('sos-un-genio', true, false),
  ('te-debo-una', true, false),
  ('quiero-que-vengas', true, false),
  ('necesito-que-me-ayudes', true, false),
  ('que-te-vaya-bien', true, false),
  ('que-te-mejores', true, false),
  ('cuando-llegues', true, false),
  ('cuando-vuelvas', true, false),
  ('practica-ojala', true, false),
  ('practica-cuando-vuelvas', true, false),
  ('no-creo', true, false),
  ('puede-ser-que', true, false),
  ('no-te-preocupes', true, false),
  ('no-seas-asi', true, false),
  ('te-recomiendo', true, false),
  ('te-aconsejo', true, false),
  ('practica-te-recomiendo', true, false),
  ('practica-te-aconsejo', true, false),
  ('que-bueno', true, false),
  ('me-preocupa', true, false),
  ('no-se', true, false),
  ('que-significa', true, false),
  ('lunfardo', true, false),
  ('es-un-afano', true, false),
  ('practica-que-bueno', true, false),
  ('practica-es-un-afano', true, false),
  ('saludos-a-tu-vieja', true, false),
  ('cuidate', true, false),
  ('yo-que-vos', true, false),
  ('yo-en-tu-lugar', true, false),
  ('si-tuviera', true, false),
  ('si-ganara', true, false),
  ('me-gustaria', true, false),
  ('preferiria', true, false),
  ('practica-yo-que-vos', true, false),
  ('practica-si-ganara', true, false),
  ('manejar-en-baires', true, false),
  ('la-ruta', true, false),
  ('en-cuotas', true, false),
  ('a-medias', true, false),
  ('dicen-que', true, false),
  ('me-contaron', true, false),
  ('practica-la-guita', true, false),
  ('practica-a-medias', true, false),
  ('buena-onda', true, false),
  ('es-medio-vago', true, false),
  ('donde-queda', true, false),
  ('zona-norte', true, false),
  ('me-pregunto', true, false),
  ('me-dijo-que', true, false),
  ('practica-quien-dijo', true, false),
  ('practica-me-dijo', true, false),
  ('ponele', true, false),
  ('por-las-dudas', true, false),
  ('se-me-cayo', true, false),
  ('se-me-quemo', true, false),
  ('para-que', true, false),
  ('para-que-entres', true, false),
  ('ya-habia', true, false),
  ('nunca-habia', true, false),
  ('practica-se-me-olvido', true, false),
  ('practica-nunca-habia', true, false),
  ('el-partido', true, false),
  ('la-final', true, false),
  ('no-anda', true, false),
  ('el-tecnico', true, false),
  ('de-acuerdo', true, false),
  ('tenes-razon', true, false),
  ('practica-depende', true, false),
  ('practica-tenes-razon', true, false),
  ('el-cajero', false, false),
  ('pasame-el-alias', false, false),
  ('que-susto', false, false),
  ('me-dan-asco', false, false),
  ('costumbres', false, false),
  ('se-aplaude-al-asador', false, false),
  ('practica-que-susto', false, false),
  ('practica-un-aplauso', false, false),
  ('no-sabes-lo-que-me-contaron', false, false),
  ('viste-lo-que-paso', false, false),
  ('queria-que-vinieras', false, false),
  ('mis-viejos-querian', false, false),
  ('aunque-llueva', false, false),
  ('aunque-no-tenga-ganas', false, false),
  ('llevo-dos-anos', false, false),
  ('llevo-un-ano-aprendiendo', false, false),
  ('practica-llevo-un-rato', false, false),
  ('practica-aunque-sea', false, false),
  ('pasen-pasen', false, false),
  ('a-la-mesa', false, false),
  ('como-si-nada', false, false),
  ('no-te-hagas-el-gil', false, false),
  ('el-que-quieras', false, false),
  ('el-de-la-vidriera', false, false),
  ('practica-como-si', false, false),
  ('practica-a-la-mesa', false, false),
  ('si-hubiera-sabido', false, false),
  ('si-hubieramos-salido', false, false),
  ('por-un-lado', false, false),
  ('la-ventaja-es-que', false, false),
  ('el-tramite', false, false),
  ('migraciones', false, false),
  ('practica-el-tramite', false, false),
  ('practica-migraciones', false, false),
  ('te-doy-la-razon', false, false),
  ('que-opinas', false, false),
  ('un-depto-que-tenga', false, false),
  ('conoces-a-alguien-que', false, false),
  ('me-da-bronca', false, false),
  ('me-pone-nervioso-que', false, false),
  ('deberias', false, false),
  ('deberias-tomarte-unos-dias', false, false),
  ('practica-me-da-igual', false, false),
  ('practica-alguien-que-sepa', false, false),
  ('dijo-que-vendria', false, false),
  ('dijo-que-pasaria', false, false),
  ('a-menos-que', false, false),
  ('con-tal-de-que', false, false),
  ('se-alquila', false, false),
  ('se-aceptan-tarjetas', false, false),
  ('practica-se-alquila', false, false),
  ('practica-se-aceptan-tarjetas', false, false),
  ('todo-aumenta', false, false),
  ('no-me-alcanza', false, false),
  ('voy-entendiendo', false, false),
  ('ando-buscando', false, false),
  ('me-cae-bien', false, false),
  ('no-lo-aguanto', false, false),
  ('practica-me-cae-bien', false, false),
  ('practica-no-lo-aguanto', false, false),
  ('que-novedad', false, false),
  ('ni-ahi', false, false),
  ('me-pidio-que', false, false),
  ('me-encargo-que', false, false),
  ('me-pregunto-si', false, false),
  ('fijate-si-tienen', false, false),
  ('usted', false, false),
  ('como-no-dona-rosa', false, false),
  ('practica-me-pidio', false, false),
  ('practica-como-no', false, false),
  ('cualquier-cosa-avisame', false, false),
  ('te-reenvio-el-archivo', false, false),
  ('resulta-que', false, false),
  ('para-colmo', false, false),
  ('se-la-cree', false, false),
  ('me-la-jugue', false, false),
  ('practica-resulta-que', false, false),
  ('practica-me-la-jugue', false, false),
  ('acabo-de', false, false),
  ('deje-de-fumar', false, false),
  ('cada-vez-mas', false, false),
  ('estas-cambiado', false, false),
  ('estoy-podrido', false, false),
  ('me-pudri', false, false),
  ('practica-no-doy-mas', false, false),
  ('practica-me-pudri', false, false),
  ('como-te-decia', false, false),
  ('te-la-hago-corta', false, false),
  ('hay-paro', false, false),
  ('paro-docente', false, false),
  ('fue-construido', false, false),
  ('fue-clausurado', false, false),
  ('las-elecciones', false, false),
  ('el-cuarto-oscuro', false, false),
  ('practica-hay-paro', false, false),
  ('practica-el-cuarto-oscuro', false, false),
  ('segun-el-diario', false, false),
  ('aparentemente', false, false),
  ('me-robaron', false, false),
  ('me-afanaron', false, false),
  ('el-consorcio', false, false),
  ('se-tapo-la-pileta', false, false),
  ('practica-me-robaron', false, false),
  ('practica-me-afanaron', false, false),
  ('de-que-cuadro-sos', false, false),
  ('socio-del-club', false, false),
  ('el-tango', false, false),
  ('tocas-la-guitarra', false, false),
  ('la-parrilla', false, false),
  ('la-parrillada', false, false),
  ('practica-la-parrilla', false, false),
  ('practica-la-parrillada', false, false),
  ('lo-lindo-de-la-ciudad', false, false),
  ('lo-bueno-de-vivir-aca', false, false),
  ('no-es-que', false, false),
  ('no-es-que-no-me-guste', false, false),
  ('si-hubiera-ahorrado', false, false),
  ('si-hubieras-estudiado', false, false),
  ('tendria-que-haber', false, false),
  ('me-hubiera-gustado', false, false),
  ('practica-no-es-que', false, false),
  ('practica-me-hubiera-gustado', false, false),
  ('un-ratito', false, false),
  ('hace-fresquito', false, false),
  ('lo-que-pasa-es-que', false, false),
  ('lo-que-paso-fue-que', false, false),
  ('como-dice-el-dicho', false, false),
  ('cada-loco-con-su-tema', false, false),
  ('practica-lo-que-pasa', false, false),
  ('practica-cada-loco-con-su-tema', false, false),
  ('ese-chabon', false, false),
  ('estoy-al-horno', false, false),
  ('me-hizo-reir', false, false),
  ('me-mori-de-risa', false, false),
  ('cuanto-mas', false, false),
  ('cuanto-antes-lleguemos', false, false),
  ('practica-cuanto-mas', false, false),
  ('practica-me-mori-de-risa', false, false),
  ('sin-ofender', false, false),
  ('no-te-lo-tomes-a-mal', false, false),
  ('la-entrega', false, false),
  ('sobre-la-hora', false, false),
  ('merezco-un-aumento', false, false),
  ('se-merece-el-ascenso', false, false),
  ('me-cayo-la-ficha', false, false),
  ('me-hace-ruido', false, false),
  ('practica-la-entrega', false, false),
  ('practica-me-hace-ruido', false, false),
  ('recorrer-el-pais', false, false),
  ('acampamos-en-el-sur', false, false),
  ('quien-ceba', false, false),
  ('te-convido-un-mate', false, false),
  ('mis-abuelos-italianos', false, false),
  ('se-instalaron-en-la-boca', false, false),
  ('practica-quien-ceba', false, false),
  ('practica-se-instalaron', false, false),
  ('me-estas-cargando', false, false),
  ('caiste', false, false),
  ('se-caso', false, false),
  ('se-recibio', false, false),
  ('me-emocione', false, false),
  ('se-emociono', false, false),
  ('practica-me-emocione', false, false),
  ('practica-se-emociono', false, false),
  ('gracias-por-todo', false, false),
  ('ya-sos-de-aca', false, false);

-- The road, numbered the way the app draws it (course.ts assemble).
create temp table extras_road as
select u.id as unit_id, row_number() over (order by s.ordinal, u.ordinal) as n
from public.units u
join public.sections s on s.id = u.section_id
where u.status = 'published'
  and s.status = 'published'
  and exists (select 1 from public.lessons l where l.unit_id = u.id and l.status = 'published');

do $$
declare
  u record;
  body uuid[];
  checks uuid[];
  seq uuid[];
  m int;
  a int;
  b int;
  v_slang uuid;
  v_culture uuid;
  v_speak uuid;
  added uuid[];
  x uuid;
  i int;
begin
  for u in
    select un.id, ex.slang, ex.culture, r.n
    from unit_extras ex
    join public.units un on un.slug = ex.slug
    join extras_road r on r.unit_id = un.id
    where not exists (
      select 1 from public.lessons l where l.unit_id = un.id and l.kind in ('speak', 'slang', 'culture')
    )
  loop
    select coalesce(array_agg(id order by ordinal), '{}') into body
    from public.lessons where unit_id = u.id and status = 'published' and kind <> 'review';
    select coalesce(array_agg(id order by ordinal), '{}') into checks
    from public.lessons where unit_id = u.id and status = 'published' and kind = 'review';
    m := coalesce(array_length(body, 1), 0);
    a := greatest(1, round(m / 3.0)::int);
    b := greatest(a, round(2 * m / 3.0)::int);

    -- Out of the way while the unit is renumbered: drafts and retired lessons
    -- low enough to collide go past the end, the published ones go negative.
    update public.lessons l set ordinal = 31000 + p.k
    from (
      select id, row_number() over (order by ordinal) as k
      from public.lessons where unit_id = u.id and status <> 'published' and ordinal < 1000
    ) p
    where l.id = p.id;
    update public.lessons set ordinal = -ordinal where unit_id = u.id and status = 'published';

    v_slang := case when u.slang then gen_random_uuid() end;
    v_culture := case when u.culture then gen_random_uuid() end;
    v_speak := gen_random_uuid();
    insert into public.lessons (id, unit_id, ordinal, title_en, kind, status)
    select id, u.id, -1000 - k, title, kind, 'published'
    from (values (v_slang, 1, 'Slang', 'slang'), (v_culture, 2, 'Culture', 'culture'), (v_speak, 3, 'Speaking', 'speak'))
      as t(id, k, title, kind)
    where id is not null;

    seq := body[1:a]
      || case when v_slang is null then '{}'::uuid[] else array[v_slang] end
      || body[a + 1:b]
      || case when v_culture is null then '{}'::uuid[] else array[v_culture] end
      || body[b + 1:m]
      || array[v_speak]
      || checks;
    for i in 1 .. array_length(seq, 1) loop
      update public.lessons set ordinal = i where id = seq[i];
    end loop;

    -- Done already for whoever is past it: she has the step after it, or
    -- anything further down the road. Last one first, so the one before it
    -- sees it done.
    added := array_remove(array[v_speak, v_culture, v_slang], null);
    foreach x in array added loop
      i := array_position(seq, x);
      insert into public.lesson_progress (user_id, lesson_id, score, attempts, passed, passed_by)
      select distinct lp.user_id, x, null::smallint, 0::smallint, true, 'placement'
      from public.lesson_progress lp
      join public.lessons l on l.id = lp.lesson_id
      left join extras_road r on r.unit_id = l.unit_id
      where lp.lesson_id = seq[i + 1]
         or r.n > u.n
      on conflict (user_id, lesson_id) do nothing;
    end loop;
  end loop;
end;
$$;

drop table unit_extras;
drop table extras_road;
