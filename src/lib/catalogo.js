// Arma los objetos del catálogo tal cual los usa la web desde las filas de Supabase (las mismas del respaldo
// src/data/respaldo-catalogo.json): la UI no se entera de dónde vienen. Lo usan el service, el panel (precio
// de la lista) y, con productoLocal / servicioLocal, products.js para los scripts.

import { ahoraPromo, vigente } from './promo.js';
import { COLOR_A_COORDINAR, COLOR_UNICO } from '../config/color.js';

const img = (carpeta, nombre) => `/img/${carpeta}/${nombre}.webp`;

/**
 * Producto de la web. `imagen`: su foto; cada variante trae { nombre, precio, imagen } con null = la del
 * producto. Precio base: el del producto o, si solo lo traen las variantes, el más bajo de ellas. Con
 * variantes de precios distintos, el producto vale el más bajo y `desde` = true ("Desde $ X").
 * Los campos opcionales (marca, tamaño, alias, destacado, activo: false) solo aparecen si tienen valor.
 */
function armarProducto({ id, nombre, nombreCorto, marca, tamano, categoria, precio, alias, destacado, activo, imagen, variantes, promo, incluye, elecciones }) {
  // Promo vigente (ver promoDe): con precio promo, ese precio va para todo el producto (también sus variantes)
  const enPromo = promo?.precio != null;
  const propios = variantes.map((v) => v.precio).filter((x) => x != null);
  const base = enPromo ? promo.precio : (precio ?? (propios.length ? Math.min(...propios) : null));
  // propia: la variante tiene foto suya (la galería de /producto muestra solo esas además de la principal).
  // color: '#rrggbb' si la variante es un color (Mar lo marca en /admin)
  const vs = variantes.map((v) => ({
    nombre: v.nombre,
    imagen: v.imagen || imagen,
    propia: !!v.imagen,
    precio: enPromo ? base : (v.precio ?? base),
    ...(v.color && { color: v.color }),
  }));
  const precios = vs.map((v) => v.precio).filter((x) => x != null);
  return {
    // promo: { nombre (el cartel), hasta } y precioAntes (tachado). Solo mientras está vigente.
    ...(promo && { promo: { nombre: promo.nombre, hasta: promo.hasta } }),
    ...(promo?.antes != null && { precioAntes: promo.antes }),
    // Kits: qué trae (renglones) y qué se elige al comprarlo ([{ titulo, clave, opciones }])
    ...(incluye?.length && { incluye }),
    ...(elecciones?.length && { elecciones }),
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
    // Todas sus variantes son colores: la ficha las muestra como cuadraditos de color
    ...(vs.length && vs.every((v) => v.color) && { deColores: true }),
    // Sin selector de color (config/color.js), solo si no tiene variantes: "color a coordinar" o un único color
    ...(!vs.length && COLOR_A_COORDINAR.includes(id) && { colorACoordinar: true }),
    ...(!vs.length && COLOR_UNICO[id] && { colorUnico: COLOR_UNICO[id] }),
    ...(alias?.length && { alias }),
    ...(destacado && { destacado: true }),
    ...(activo === false && { activo: false }),
  };
}

const porOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0);

// ───────── Desde Supabase (filas tal cual las devuelve la API) ─────────

/**
 * Promo vigente de una fila (a la hora de `ahoraPromo`), o null. precio: el promo (null = el de siempre);
 * antes: el tachado (si Mar no lo cargó y hay precio promo, el precio de siempre).
 */
export function promoDe(f, t = ahoraPromo()) {
  if (!vigente(f.promo_desde, f.promo_hasta, t)) return null;
  const precio = f.precio_promo ?? null;
  const antes = f.precio_antes ?? (precio != null ? f.precio : null);
  return { nombre: f.promo_nombre?.trim() || 'Promo', hasta: f.promo_hasta, precio, antes: antes != null && antes > (precio ?? f.precio ?? 0) ? antes : null };
}

/** Opciones de un "Elegí…" de kit: las escritas a mano o las variantes de otro producto (`variantesDe`). */
const opcionesDe = (e, filas) =>
  e.variantesDe
    ? [...(filas.find((p) => p.id === e.variantesDe)?.variantes ?? [])].sort(porOrden).map((v) => v.nombre)
    : (e.opciones ?? []).map((o) => String(o).trim()).filter(Boolean);

export const productoDeFila = (f, filas = [], t = ahoraPromo()) => {
  const promo = promoDe(f, t);
  const elecciones = (Array.isArray(f.elecciones) ? f.elecciones : [])
    .map((e) => ({ titulo: e.titulo?.trim() || `Elegí ${e.clave}`, clave: e.clave?.trim() || e.titulo, opciones: opcionesDe(e, filas) }))
    .filter((e) => e.clave && e.opciones.length);
  return armarProducto({
    id: f.id,
    nombre: f.nombre,
    nombreCorto: f.nombre_corto,
    marca: f.marca,
    tamano: f.tamano,
    categoria: f.categoria_id,
    precio: f.precio,
    alias: f.alias,
    destacado: f.destacado,
    // Kit "solo durante la promo": fuera de fechas, como oculto
    activo: f.activo === false || (f.solo_en_promo && !promo) ? false : f.activo,
    imagen: f.fotos?.[0] ?? img('productos', f.id),
    variantes: [...(f.variantes ?? [])].sort(porOrden).map((v) => ({ nombre: v.nombre, precio: v.precio, imagen: v.foto, color: v.color_hex })),
    promo,
    incluye: (f.incluye ?? '').split('\n').map((x) => x.trim()).filter(Boolean),
    elecciones,
  });
};

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
