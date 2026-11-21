// Cliente de Supabase para la tienda (solo lectura pública, publishable key). Va en un chunk aparte: el
// service lo pide con import() y así no engorda el JS principal.
// Usa solo el cliente de consultas de supabase-js (@supabase/postgrest-js, la misma API `.from().select()`):
// 5 KB gzip en vez de 56 KB (supabase-js completo trae auth, realtime, storage y functions, que la tienda no
// usa; medido: con el completo /rutina bajaba 6 puntos en Lighthouse). El panel /admin (etapa 2) usa
// supabase-js completo, en su propio chunk.
// Sin sesión: la tienda siempre lee como visitante (aunque Mar esté logueada en /admin en el mismo navegador,
// acá no ve los productos ocultos).
// Sin reintentos: si falla, el service usa la copia o el respaldo local al instante (con reintentos, sin
// conexión había que esperar los 3 s del tope).
import { PostgrestClient } from '@supabase/postgrest-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY; // publishable key (sb_publishable_…)

export const supabase =
  url && clave ? new PostgrestClient(`${url}/rest/v1`, { headers: { apikey: clave }, retry: false }) : null;
