-- supabase/schema.sql — Dream Hair: catálogo (categorías, productos, variantes, servicios) y admins.
--
-- Se pega ENTERO en Supabase → SQL Editor → Run. Es idempotente: correrlo otra vez no rompe ni duplica nada
-- (tablas "if not exists", políticas y triggers se borran y se vuelven a crear, bucket con "on conflict").
--
-- Permisos:
--   · Público (web, publishable key → rol anon): solo LEE lo activo.
--   · Admins (panel /admin, etapa 2 → rol authenticated): leen y escriben todo, si su email (confirmado) está en
--     `admins`. Mar puede manejar productos, variantes, categorías y servicios; nada más.
--   · Scripts locales (secret key → rol service_role): saltan RLS (migración).
--
-- Fotos: las actuales siguen en public/img (se guardan como '/img/productos/<nombre>.webp'). Las que se suban
-- desde el panel van al bucket "productos" y se guardan con su URL pública. Las dos formas conviven.

-- ───────────────────────────── Utilidades ─────────────────────────────

-- Pone `actualizado = now()` en cada update.
create or replace function public.tocar_actualizado() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado := now();
  return new;
end $$;

-- ───────────────────────────── Tablas ─────────────────────────────

create table if not exists public.categorias (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),       -- slug (va en la URL)
  nombre      text not null check (length(trim(nombre)) > 0),
  paso        smallint check (paso between 1 and 4),                          -- paso de /rutina (null = no entra)
  portada     text,                                                           -- foto de la card de categoría
  orden       integer not null default 0,
  activa      boolean not null default true,
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

create table if not exists public.productos (
  id           text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),      -- slug (va en la URL)
  nombre       text not null check (length(trim(nombre)) > 0),               -- nombre comercial completo (/producto)
  nombre_corto text,                                                          -- cards, carrito, WhatsApp (≤ ~32); null = nombre
  marca        text,
  categoria_id text not null references public.categorias (id) on update cascade on delete restrict,
  precio       integer check (precio >= 0),                                   -- null = sin precio o lo traen las variantes
  tamano       text,
  descripcion  text,                                                          -- texto de Mar tal cual
  alias        text[] not null default '{}',                                  -- otros nombres para el buscador (no se muestran)
  destacado    boolean not null default false,                                -- "Favoritos de Mar" del home
  activo       boolean not null default true,                                 -- false = oculto en toda la web
  orden        integer not null default 0,
  fotos        jsonb not null default '[]' check (jsonb_typeof(fotos) = 'array'), -- ["/img/productos/x.webp" | URL del bucket]; la 1.ª es la principal
  creado       timestamptz not null default now(),
  actualizado  timestamptz not null default now()
);
create index if not exists productos_categoria_idx on public.productos (categoria_id);

-- Promociones (nov 2026, Black Friday): entre promo_desde y promo_hasta la tienda muestra precio_promo (o el
-- precio, si no hay) con "Antes $ precio_antes" tachado y el cartel promo_nombre. Fuera de fechas, todo vuelve
-- solo a lo normal. solo_en_promo = el producto (un kit) se ve únicamente mientras dura su promo.
-- elecciones: lo que se elige al comprar un kit [{ "titulo": "Elegí tu shampoo", "clave": "Shampoo",
-- "opciones": ["…", "…"] }]; incluye: qué trae el kit (un renglón por cosa).
alter table public.productos add column if not exists precio_promo  integer check (precio_promo >= 0);
alter table public.productos add column if not exists precio_antes  integer check (precio_antes >= 0);
alter table public.productos add column if not exists promo_nombre  text;
alter table public.productos add column if not exists promo_desde   timestamptz;
alter table public.productos add column if not exists promo_hasta   timestamptz;
alter table public.productos add column if not exists solo_en_promo boolean not null default false;
alter table public.productos add column if not exists incluye       text;
alter table public.productos add column if not exists elecciones    jsonb not null default '[]';
do $$ begin
  alter table public.productos add constraint productos_elecciones_lista check (jsonb_typeof(elecciones) = 'array');
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.productos add constraint productos_promo_fechas check (promo_hasta is null or promo_desde is null or promo_hasta > promo_desde);
exception when duplicate_object then null; end $$;

-- Etiquetas (nov 2026, cepillos): la ficha muestra "Perfumado: cada color tiene su aroma" y/o "Llavero de
-- regalo" (+ " en <llavero_colores>" si el llavero viene solo en algunos colores: "Rosa y Lila").
alter table public.productos add column if not exists perfumado       boolean not null default false;
alter table public.productos add column if not exists llavero_regalo  boolean not null default false;
alter table public.productos add column if not exists llavero_colores text;

-- Sin stock del producto entero (nov 2026; para los que no tienen variantes): la ficha y la card dicen "Sin
-- stock · llega pronto", se ve pero no se puede agregar al carrito ni sale en /rutina.
alter table public.productos add column if not exists agotado boolean not null default false;
-- Paso de /rutina del producto (nov 2026): null = el de su categoría. Así una categoría sin paso (Cepillos) puede
-- tener productos en un paso (los cepillos definidores en el 3, Definir).
alter table public.productos add column if not exists paso smallint check (paso between 1 and 4);

create table if not exists public.variantes (
  id          uuid primary key default gen_random_uuid(),
  producto_id text not null references public.productos (id) on update cascade on delete cascade,
  nombre      text not null check (length(trim(nombre)) > 0),                -- el carrito identifica la variante por nombre
  precio      integer check (precio >= 0),                                    -- null = el del producto
  foto        text,                                                           -- null = la del producto
  orden       integer not null default 0,
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  constraint variantes_producto_nombre_key unique (producto_id, nombre)
);

-- Color de la variante (nov 2026): '#rrggbb' = la variante es un color (la ficha la muestra como cuadradito de
-- color); null = no es un color (sabor, tamaño…: botón con texto y foto).
alter table public.variantes add column if not exists color_hex text;
do $$ begin
  alter table public.variantes add constraint variantes_color_hex check (color_hex is null or color_hex ~ '^#[0-9a-f]{6}$');
exception when duplicate_object then null; end $$;
-- Sin stock (nov 2026): la ficha la muestra tachada con "Agotado" y no se puede elegir; si todas las variantes
-- de un producto están agotadas, el producto dice "Sin stock".
alter table public.variantes add column if not exists agotado boolean not null default false;

create table if not exists public.servicios (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre      text not null check (length(trim(nombre)) > 0),
  grupo       text not null check (length(trim(grupo)) > 0),                 -- sección de /servicios (Asesoramientos…)
  descripcion text,                                                           -- texto de Mar tal cual
  precio      integer check (precio >= 0),                                    -- hoy no se muestra (se reserva por WhatsApp)
  duracion    text,                                                           -- "1 h 40 min" (chip con reloj)
  foto        text,                                                           -- '/img/estudio/x.webp' o URL del bucket
  activo      boolean not null default true,
  orden       integer not null default 0,
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

-- Datos de las fotos que sube Mar desde el panel (las de /img los tienen en src/data/colores.json, fondos.json
-- y lqip.json): los calcula el navegador al subir, con el mismo método que scripts/optimizar-assets.mjs.
create table if not exists public.fotos (
  url    text primary key check (url like 'https://%/storage/v1/object/public/productos/%'), -- la que va en los datos (la más grande)
  color  text check (color ~ '^#[0-9a-f]{6}$'),                                -- color dominante (halo); null = neutra → dorado
  fondo  text not null default 'escena' check (fondo in ('blanco', 'escena')), -- blanco = multiply (el producto "flota")
  lqip   text check (lqip like 'data:image/%' and length(lqip) <= 2000),       -- miniatura borrosa de 20 px (blur-up)
  creado timestamptz not null default now()
);

create table if not exists public.admins (
  email  text primary key check (email = lower(trim(email)) and email like '%_@_%'),
  creado timestamptz not null default now()
);

-- ───────────────────────────── Triggers ─────────────────────────────

drop trigger if exists tocar_actualizado on public.categorias;
create trigger tocar_actualizado before update on public.categorias
  for each row execute function public.tocar_actualizado();

drop trigger if exists tocar_actualizado on public.productos;
create trigger tocar_actualizado before update on public.productos
  for each row execute function public.tocar_actualizado();

drop trigger if exists tocar_actualizado on public.variantes;
create trigger tocar_actualizado before update on public.variantes
  for each row execute function public.tocar_actualizado();

drop trigger if exists tocar_actualizado on public.servicios;
create trigger tocar_actualizado before update on public.servicios
  for each row execute function public.tocar_actualizado();

-- ───────────────────────────── ¿Es admin? ─────────────────────────────

-- true si el usuario logueado tiene su email en `admins` y lo confirmó (así nadie se registra con el email
-- de Mar sin verificarlo). security definer: lee admins y auth.users sin abrirles RLS.
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = a.email
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated, service_role;

-- ───────────────────────────── Grants (Data API) ─────────────────────────────
-- Explícitos y mínimos: primero se saca todo y después se da solo lo necesario.

grant usage on schema public to anon, authenticated, service_role;

revoke all on public.categorias, public.productos, public.variantes, public.servicios, public.fotos, public.admins
  from anon, authenticated;

grant select on public.categorias, public.productos, public.variantes, public.servicios, public.fotos to anon, authenticated;
grant insert, update, delete on public.categorias, public.productos, public.variantes, public.servicios, public.fotos to authenticated;
grant select on public.admins to authenticated;

grant all on public.categorias, public.productos, public.variantes, public.servicios, public.fotos, public.admins to service_role;

-- ───────────────────────────── RLS ─────────────────────────────

alter table public.categorias enable row level security;
alter table public.productos  enable row level security;
alter table public.variantes  enable row level security;
alter table public.servicios  enable row level security;
alter table public.fotos      enable row level security;
alter table public.admins     enable row level security;

-- categorías
drop policy if exists "categorias: lectura publica de las activas" on public.categorias;
create policy "categorias: lectura publica de las activas" on public.categorias
  for select to anon, authenticated using (activa);

drop policy if exists "categorias: admins todo" on public.categorias;
create policy "categorias: admins todo" on public.categorias
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- productos
drop policy if exists "productos: lectura publica de los activos" on public.productos;
create policy "productos: lectura publica de los activos" on public.productos
  for select to anon, authenticated using (activo);

drop policy if exists "productos: admins todo" on public.productos;
create policy "productos: admins todo" on public.productos
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- variantes (se ven solo las de productos activos)
drop policy if exists "variantes: lectura publica de productos activos" on public.variantes;
create policy "variantes: lectura publica de productos activos" on public.variantes
  for select to anon, authenticated
  using (exists (select 1 from public.productos p where p.id = producto_id and p.activo));

drop policy if exists "variantes: admins todo" on public.variantes;
create policy "variantes: admins todo" on public.variantes
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- servicios
drop policy if exists "servicios: lectura publica de los activos" on public.servicios;
create policy "servicios: lectura publica de los activos" on public.servicios
  for select to anon, authenticated using (activo);

drop policy if exists "servicios: admins todo" on public.servicios;
create policy "servicios: admins todo" on public.servicios
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- fotos: sus datos (color, fondo, miniatura) los lee cualquiera; los escriben los admins al subir
drop policy if exists "fotos: lectura publica" on public.fotos;
create policy "fotos: lectura publica" on public.fotos
  for select to anon, authenticated using (true);

drop policy if exists "fotos: admins todo" on public.fotos;
create policy "fotos: admins todo" on public.fotos
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- admins: cada usuario ve solo su propia fila. Sin escritura por la API (se cargan desde el SQL Editor).
drop policy if exists "admins: cada uno ve la suya" on public.admins;
create policy "admins: cada uno ve la suya" on public.admins
  for select to authenticated using (email = lower((select auth.jwt() ->> 'email')));

-- ───────────────────────────── Storage: bucket "productos" ─────────────────────────────
-- Público: las fotos se leen por su URL pública sin política de select (así nadie puede listar el bucket).
-- Solo admins suben, reemplazan y borran.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 10485760, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "productos: admins leen" on storage.objects;
create policy "productos: admins leen" on storage.objects
  for select to authenticated using (bucket_id = 'productos' and (select public.es_admin()));

drop policy if exists "productos: admins suben" on storage.objects;
create policy "productos: admins suben" on storage.objects
  for insert to authenticated with check (bucket_id = 'productos' and (select public.es_admin()));

drop policy if exists "productos: admins reemplazan" on storage.objects;
create policy "productos: admins reemplazan" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and (select public.es_admin()))
  with check (bucket_id = 'productos' and (select public.es_admin()));

drop policy if exists "productos: admins borran" on storage.objects;
create policy "productos: admins borran" on storage.objects
  for delete to authenticated using (bucket_id = 'productos' and (select public.es_admin()));

-- ───────────────────────────── Admins ─────────────────────────────
-- Para la etapa 2 (panel). Descomentar con el email real de Mar (en minúsculas) y correr:
-- insert into public.admins (email) values ('email-de-mar@ejemplo.com') on conflict do nothing;
