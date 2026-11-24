-- Promociones (Black Friday): pegar entero en el SQL Editor de Supabase. Idempotente (se puede correr dos veces).
-- Es lo mismo que agrega supabase/schema.sql; los grants y la RLS de productos ya cubren las columnas nuevas.
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
notify pgrst, 'reload schema';
