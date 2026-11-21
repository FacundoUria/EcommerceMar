// Cliente de Supabase del panel: supabase-js COMPLETO (login, storage). Solo lo importa src/admin/ → queda en
// el chunk del panel (vite.config.js lo deja fuera de `comun`). La tienda usa postgrest-js (lib/supabase.js).
import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'productos';

export const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Mar no tiene que loguearse cada vez
    autoRefreshToken: true,
    detectSessionInUrl: true, // link del mail de "Olvidé mi contraseña"
    flowType: 'implicit', // el link anda aunque lo abra en otro navegador o en la app del mail
    storageKey: 'dh-panel-sesion',
  },
});
