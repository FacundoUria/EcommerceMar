// Arma los objetos del catálogo tal cual los usa la web desde las filas de Supabase (las mismas del respaldo
// src/data/respaldo-catalogo.json): la UI no se entera de dónde vienen. Lo usan el service, el panel (precio
// de la lista) y, con productoLocal / servicioLocal, products.js para los scripts.

const img = (carpeta, nombre) => `/img/${carpeta}/${nombre}.webp`;

/**
 * Producto de la web. `imagen`: su foto; cada variante trae { nombre, precio, imagen } con null = la del
 * producto. Precio base: el del producto o, si solo lo traen las variantes, el más bajo de ellas. Con
 * variantes de precios distintos, el producto vale el más bajo y `desde` = true ("Desde $ X").
 * Los campos opcionales (marca, tamaño, alias, destacado, activo: false) solo aparecen si tienen valor.
 */
function armarProducto({ id, nombre, nombreCorto, marca, tamano, categoria, precio, alias, destacado, activo, imagen, variantes }) {
  const propios = variantes.map((v) => v.precio).filter((x) => x != null);
  const base = precio ?? (propios.length ? Math.min(...propios) : null);
  const vs = variantes.map((v) => ({ nombre: v.nombre, imagen: v.imagen || imagen, precio: v.precio ?? base }));
  const precios = vs.map((v) => v.precio).filter((x) => x != null);
  return {
    id,
    nombre,
    nombreCorto: nombreCorto || nombre,
    ...(marca && { marca }),
    ...(tamano && { tamano }),
    categoria,
    imagen,
    precio: precios.length ? Math.min(...precios) : base,
    desde: new Set(precios).size > 1,
    variantes: vs,
    ...(alias?.length && { alias }),
    ...(destacado && { destacado: true }),
    ...(activo === false && { activo: false }),
  };
}

const porOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0);

// ───────── Desde Supabase (filas tal cual las devuelve la API) ─────────

export const productoDeFila = (f) =>
  armarProducto({
    id: f.id,
    nombre: f.nombre,
    nombreCorto: f.nombre_corto,
    marca: f.marca,
    tamano: f.tamano,
    categoria: f.categoria_id,
    precio: f.precio,
    alias: f.alias,
    destacado: f.destacado,
    activo: f.activo,
    imagen: f.fotos?.[0] ?? img('productos', f.id),
    variantes: [...(f.variantes ?? [])].sort(porOrden).map((v) => ({ nombre: v.nombre, precio: v.precio, imagen: v.foto })),
  });

export const categoriaDeFila = (f) => ({ id: f.id, nombre: f.nombre, paso: f.paso ?? null, imagen: f.portada });

export const servicioDeFila = (f) => ({
  id: f.id,
  nombre: f.nombre,
  grupo: f.grupo,
  ...(f.duracion && { duracion: f.duracion }),
  ...(f.descripcion && { descripcion: f.descripcion }),
  imagen: f.foto,
});

// ───────── Desde src/data/products.js (carga inicial; lo usan los scripts) ─────────

/** Variantes como [nombre, foto, precio]; `foto` = nombre del archivo en /img/productos (sin extensión). */
export const productoLocal = (p) =>
  armarProducto({
    ...p,
    imagen: img('productos', p.foto || p.id),
    variantes: (p.variantes || []).map(([nombre, foto, precio]) => ({ nombre, precio, imagen: foto ? img('productos', foto) : null })),
  });

export const categoriaLocal = (c) => ({ id: c.id, nombre: c.nombre, paso: c.paso ?? null, imagen: img('productos', c.portada) });

export const servicioLocal = ({ foto, ...s }) => servicioDeFila({ ...s, foto: img('estudio', foto) });
