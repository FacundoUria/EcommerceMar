-- Sin stock y paso de la rutina POR PRODUCTO (+ lo de la tanda de Mar del 25/11 que necesita estas columnas).
-- Pegar entero en el SQL Editor de Supabase. Se puede correr dos veces: las columnas se agregan si faltan (es lo
-- mismo que agrega supabase/schema.sql; los grants y la RLS de productos ya las cubren) y los datos de la tanda
-- se aplican solo la primera vez (cuando la columna `paso` todavía no existía): no pisan lo que Mar cambie después.
do $$
declare
  primera boolean := not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'productos' and column_name = 'paso'
  );
begin
  -- "Sin stock · llega pronto": se ve en la tienda pero no se puede agregar al carrito ni sale en /rutina
  alter table public.productos add column if not exists agotado boolean not null default false;
  -- Paso de /rutina del producto: null = el de su categoría
  alter table public.productos add column if not exists paso smallint check (paso between 1 and 4);

  if primera then
    -- Koiri Enrulate y Vanilla Cream llegan la semana que viene: visibles, pero sin stock
    update public.productos set agotado = true, activo = true where id in ('koiri-gel-enrulate', 'vanilla-cream-oleo');
    -- Una sola categoría "Cepillos": los definidores pasan ahí y siguen en el paso 3 de la rutina (Definir)
    update public.productos set paso = 3, categoria_id = 'cepillos' where categoria_id = 'cepillos-definidores';
    delete from public.categorias where id = 'cepillos-definidores';
  end if;
end $$;

notify pgrst, 'reload schema';
