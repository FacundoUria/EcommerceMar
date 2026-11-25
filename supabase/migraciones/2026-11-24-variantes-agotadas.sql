-- Variantes agotadas ("Sin stock" por variante en /admin): pegar entero en el SQL Editor de Supabase.
-- Idempotente (se puede correr dos veces). Es lo mismo que agrega supabase/schema.sql; los grants y la RLS de
-- variantes ya cubren la columna nueva.
alter table public.variantes add column if not exists agotado boolean not null default false;
notify pgrst, 'reload schema';
