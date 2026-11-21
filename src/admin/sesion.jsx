// Sesión del panel: quién está logueado y si es admin (función es_admin() de supabase/schema.sql).
// Estados: 'cargando' | 'fuera' (login) | 'recuperar' (vino del mail de "Olvidé mi contraseña")
//          | 'sinAcceso' (logueada pero no está en admins) | 'admin' | 'error' (sin conexión al chequear)
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { sb } from './cliente.js';

const SesionContext = createContext(null);
export const useSesion = () => useContext(SesionContext);

export function SesionProvider({ children }) {
  const [estado, setEstado] = useState('cargando');
  const [usuario, setUsuario] = useState(null);
  const recuperando = useRef(typeof location !== 'undefined' && /type=recovery/.test(location.hash));

  const evaluar = useCallback(async (session) => {
    if (!session) return setEstado('fuera');
    if (recuperando.current) return setEstado('recuperar');
    const { data, error } = await sb.rpc('es_admin');
    if (error) return setEstado('error');
    setEstado(data ? 'admin' : 'sinAcceso');
  }, []);

  useEffect(() => {
    const { data } = sb.auth.onAuthStateChange((evento, session) => {
      setUsuario(session?.user ?? null);
      if (evento === 'PASSWORD_RECOVERY') {
        recuperando.current = true;
        setEstado('recuperar');
        return;
      }
      if (evento === 'TOKEN_REFRESHED') return; // misma persona: no hace falta volver a chequear
      // supabase-js pide no llamar a Supabase adentro de este callback: se hace en la vuelta siguiente
      setTimeout(() => evaluar(session), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [evaluar]);

  const valor = {
    estado,
    usuario,
    /** Entrar con email y contraseña. Tira el error de Supabase si falla. */
    entrar: async (email, clave) => {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: clave });
      if (error) throw error;
    },
    salir: async () => {
      await sb.auth.signOut();
      setEstado('fuera');
    },
    /** Mail para elegir una contraseña nueva; el link vuelve a /admin. */
    pedirMailClave: async (email) => {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/admin` });
      if (error) throw error;
    },
    /** Guarda la contraseña nueva (después del link del mail) y entra al panel. */
    nuevaClave: async (clave) => {
      const { data, error } = await sb.auth.updateUser({ password: clave });
      if (error) throw error;
      recuperando.current = false;
      history.replaceState(null, '', location.pathname);
      setEstado('cargando');
      await evaluar(data.user ? (await sb.auth.getSession()).data.session : null);
    },
    reintentar: async () => {
      setEstado('cargando');
      await evaluar((await sb.auth.getSession()).data.session);
    },
  };
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
