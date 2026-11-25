-- Etiquetas de producto (cepillos): pegar entero en el SQL Editor de Supabase. Idempotente (se puede correr dos
-- veces). Es lo mismo que agrega supabase/schema.sql; los grants y la RLS de productos ya cubren las columnas.
alter table public.productos add column if not exists perfumado       boolean not null default false;
alter table public.productos add column if not exists llavero_regalo  boolean not null default false;
alter table public.productos add column if not exists llavero_colores text;
notify pgrst, 'reload schema';
