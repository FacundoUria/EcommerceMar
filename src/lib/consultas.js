// Consultas de la tienda a Supabase (solo lectura de lo activo). Reciben el cliente: las usa el service
// (cliente del navegador, lib/supabase.js) y también scripts de Node para verificar.
// Devuelven las filas tal cual (se guardan así en localStorage); lib/catalogo.js las arma para la web.

const PRODUCTO = 'id, nombre, nombre_corto, marca, categoria_id, precio, tamano, alias, destacado, fotos';
// Promos (supabase/migraciones/2026-11-23-promos.sql), color de las variantes (2026-11-24-color-variantes.sql)
// y etiquetas (2026-11-24-etiquetas.sql). Si la base todavía no tiene esas columnas, se piden los productos sin
// ellas (la tienda anda igual, sin eso): se prueba de la consulta más completa a la más simple.
// Variantes agotadas: 2026-11-24-variantes-agotadas.sql. Sin stock y paso de la rutina del producto:
// 2026-11-25-stock-y-paso-por-producto.sql.
const PROMO = 'precio_promo, precio_antes, promo_nombre, promo_desde, promo_hasta, solo_en_promo, incluye, elecciones';
const ETIQUETAS = 'perfumado, llavero_regalo, llavero_colores';
const POR_PRODUCTO = 'agotado, paso';
const consulta = ({ promo, color, etiquetas, agotado, porProducto }) =>
  [
    PRODUCTO,
    etiquetas && ETIQUETAS,
    porProducto && POR_PRODUCTO,
    `variantes (nombre, precio, foto, orden${color ? ', color_hex' : ''}${agotado ? ', agotado' : ''})`,
    promo && PROMO,
  ]
    .filter(Boolean)
    .join(', ');
// De la más completa a la más simple: cada paso saca lo más nuevo
const CONSULTAS_PRODUCTOS = [
  { promo: 1, color: 1, etiquetas: 1, agotado: 1, porProducto: 1 },
  { promo: 1, color: 1, etiquetas: 1, agotado: 1 },
  { promo: 1, color: 1, etiquetas: 1 },
  { promo: 1, color: 1 },
  { promo: 1 },
  {},
].map(consulta);
const faltaColumna = (r) => r.error && /column|42703|schema cache/i.test(`${r.error.code} ${r.error.message}`);

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
  const pedirProductos = async (i = 0) => {
    const r = await sb.from('productos').select(CONSULTAS_PRODUCTOS[i]).eq('activo', true).order('orden').order('id');
    return faltaColumna(r) && i + 1 < CONSULTAS_PRODUCTOS.length ? pedirProductos(i + 1) : r;
  };
  const [categorias, productos, servicios, fotos] = await Promise.all([
    sb.from('categorias').select('id, nombre, paso, portada').eq('activa', true).order('orden').order('id'),
    pedirProductos(),
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
