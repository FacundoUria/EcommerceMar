// Utilidades del panel: ids, precios, búsqueda y errores en lenguaje humano.
import { formatPrecio } from '../lib/format.js';

/** "Cremas de Peinar Ñandú" → "cremas-de-peinar-nandu" (id en la URL: no cambia después). */
export const slug = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '') || 'nuevo';

/** Id que no esté usado: base, base-2, base-3… */
export function idUnico(texto, usados) {
  const base = slug(texto);
  const set = new Set(usados);
  if (!set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Texto del campo de precio → número entero, o null si está vacío. Acepta "15000", "15.000", "$ 15.000". */
export const leerPrecio = (texto) => {
  const digitos = String(texto ?? '').replace(/\D/g, '');
  return digitos ? Number(digitos) : null;
};
/** Número → texto del campo ("15.000"), o "" si es null. */
export const textoPrecio = (n) => (n == null ? '' : new Intl.NumberFormat('es-AR').format(n));
export { formatPrecio };

/** Para buscar sin importar mayúsculas ni tildes. */
export const normalizar = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Error de Supabase / red → mensaje para Mar (nunca un código). */
export function mensajeError(e) {
  const texto = `${e?.message ?? ''} ${e?.code ?? ''} ${e?.status ?? ''}`.toLowerCase();
  if (!navigator.onLine || /failed to fetch|networkerror|load failed|network request failed/.test(texto))
    return 'No hay conexión a internet. Revisala y probá de nuevo.';
  if (/invalid login credentials/.test(texto)) return 'El email o la contraseña no son correctos.';
  if (/email not confirmed/.test(texto)) return 'Esa cuenta todavía no confirmó su email.';
  if (/rate limit|too many|429|over_email_send_rate_limit/.test(texto))
    return 'Hubo demasiados intentos seguidos. Esperá unos minutos y probá de nuevo.';
  if (/jwt expired|session.*(missing|expired)|refresh token/.test(texto))
    return 'Se cerró tu sesión. Volvé a entrar con tu email y contraseña.';
  if (/42501|permission denied|row-level security|not authorized|unauthorized|403/.test(texto))
    return 'Tu cuenta no tiene permiso para hacer esto.';
  if (/23505|duplicate key|already exists/.test(texto)) return 'Ya existe uno con ese nombre. Probá con otro.';
  if (/23503|foreign key|violates.*restrict/.test(texto))
    return 'No se puede borrar porque todavía tiene productos adentro.';
  if (/payload too large|413|exceeded the maximum allowed size/.test(texto)) return 'La foto es muy pesada. Probá con otra.';
  if (/password should be|weak password|at least/.test(texto)) return 'La contraseña tiene que tener al menos 8 letras o números.';
  if (/same password|different from the old/.test(texto)) return 'La contraseña nueva tiene que ser distinta de la anterior.';
  return 'Algo salió mal. Probá de nuevo en un ratito; si sigue, avisale a Facu.';
}
