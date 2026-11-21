// Consultas de la tienda a Supabase (solo lectura de lo activo). Reciben el cliente: las usa el service
// (cliente del navegador, lib/supabase.js) y también scripts de Node para verificar.
// Devuelven las filas tal cual (se guardan así en localStorage); lib/catalogo.js las arma para la web.

const PRODUCTO =
  'id, nombre, nombre_corto, marca, categoria_id, precio, tamano, alias, destacado, fotos, variantes (nombre, precio, foto, orden)';

const revisar = (r, tabla) => {
  if (r.error) throw new Error(`${tabla}: ${r.error.message}`);
  return r.data;
};

/**
 * { categorias, productos (con sus variantes), servicios, fotos }. Falla si viene vacío: la tienda nunca queda
 * vacía. `fotos`: color y fondo de las fotos subidas desde el panel (las miniaturas van aparte, consultarLqip).
 */
export async function consultarCatalogo(sb) {
  // El filtro por activo/a también lo hace RLS; va explícito por si algún día el cliente tiene sesión de admin.
  const [categorias, productos, servicios, fotos] = await Promise.all([
    sb.from('categorias').select('id, nombre, paso, portada').eq('activa', true).order('orden').order('id'),
    sb.from('productos').select(PRODUCTO).eq('activo', true).order('orden').order('id'),
    sb.from('servicios').select('id, nombre, grupo, descripcion, duracion, foto').eq('activo', true).order('orden').order('id'),
    sb.from('fotos').select('url, color, fondo').order('url'),
  ]);
  const filas = {
    categorias: revisar(categorias, 'categorias'),
    productos: revisar(productos, 'productos'),
    servicios: revisar(servicios, 'servicios'),
    // Decoración (halo y fondo de las fotos subidas): si falla, la tienda anda igual
    fotos: fotos.error ? [] : fotos.data,
  };
  if (!filas.categorias.length || !filas.productos.length) throw new Error('catálogo vacío');
  return filas;
}

/** Descripciones de Mar de los productos activos: { [id]: texto }. */
export async function consultarDescripciones(sb) {
  const filas = revisar(
    await sb.from('productos').select('id, descripcion').eq('activo', true).not('descripcion', 'is', null).order('id'),
    'descripciones',
  );
  if (!filas.length) throw new Error('sin descripciones');
  return Object.fromEntries(filas.map((f) => [f.id, f.descripcion]));
}

/** Miniaturas borrosas de las fotos subidas desde el panel: { [url]: data URI }. */
export async function consultarLqip(sb) {
  const filas = revisar(await sb.from('fotos').select('url, lqip').not('lqip', 'is', null).order('url'), 'fotos');
  return Object.fromEntries(filas.map((f) => [f.url, f.lqip]));
}
