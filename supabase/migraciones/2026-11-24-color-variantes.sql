-- Color de las variantes (cuadraditos de color en la ficha): pegar entero en el SQL Editor de Supabase.
-- Idempotente (se puede correr dos veces). Es lo mismo que agrega supabase/schema.sql; los grants y la RLS de
-- variantes ya cubren la columna nueva.
alter table public.variantes add column if not exists color_hex text;
do $$ begin
  alter table public.variantes add constraint variantes_color_hex check (color_hex is null or color_hex ~ '^#[0-9a-f]{6}$');
exception when duplicate_object then null; end $$;
notify pgrst, 'reload schema';
