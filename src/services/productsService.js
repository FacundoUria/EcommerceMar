// Única puerta de entrada a los datos del catálogo.
// Hoy lee src/data/products.js (estático: son ~2 KB y así no alarga la carga de la página).
// Mañana: reemplazar `cargar()` por un fetch a la base de datos donde Mar carga productos,
// manteniendo la misma forma de los objetos y la API async. La UI no se toca.
import * as productos from '../data/products.js';
import { reviews } from '../data/resenas.js';

const catalogo = { ...productos, reviews };
let cache = null;

// Productos nuevos de Mar sin precio ni foto: `activo: false` → ocultos en tienda, rutina, carruseles,
// búsqueda, chat y carrito (y su página da "No encontrado").
const visibles = (products) => products.filter((p) => p.activo !== false);

function cargar() {
  if (!cache) {
    cache = Promise.resolve(catalogo);
    // Con base de datos, algo así:
    // cache = fetch('/api/catalogo').then((r) => r.json()).catch((e) => { cache = null; throw e; });
  }
  return cache;
}

let descripciones = null;
/**
 * Descripciones de Mar por id de producto ({ [id]: texto }). Van en un archivo aparte (~25 KB) que se pide
 * recién cuando hace falta: /producto y el buscador de la tienda. Con base de datos: un fetch aparte.
 */
export function getDescripciones() {
  if (!descripciones) {
    descripciones = import('../data/descripciones.js')
      .then((m) => m.default)
      .catch((e) => {
        descripciones = null;
        throw e;
      });
  }
  return descripciones;
}

/** Productos del catálogo (solo los activos). */
export async function getProducts() {
  const { products } = await cargar();
  return visibles(products);
}

/** Un producto activo por id, o null si no existe (o está oculto). */
export async function getProductById(id) {
  const { products } = await cargar();
  return visibles(products).find((p) => p.id === id) ?? null;
}

/** Categorías con su paso de la rutina (1-4 o null) y la foto de portada. */
export async function getCategories() {
  const { categories } = await cargar();
  return categories.map((c) => ({ ...c, imagen: `/img/productos/${c.portada}.webp` }));
}

/** Servicios de peluquería (no van al carrito), en el orden de Mar. Cada uno trae su `grupo`. */
export async function getServices() {
  const { services } = await cargar();
  return services;
}

/** Grupos de servicios con sus servicios: [{ titulo, servicios }] (en el orden de /servicios). */
export async function getServiceGroups() {
  const { services, serviceGroups } = await cargar();
  return serviceGroups.map((titulo) => ({ titulo, servicios: services.filter((s) => s.grupo === titulo) }));
}

/** Reseñas de clientas (home). */
export async function getReviews() {
  const { reviews } = await cargar();
  return reviews;
}

/** Marcas presentes en el catálogo, ordenadas por cantidad de productos. */
export async function getBrands() {
  const { products } = await cargar();
  const cuenta = new Map();
  for (const p of visibles(products)) if (p.marca) cuenta.set(p.marca, (cuenta.get(p.marca) || 0) + 1);
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]).map(([nombre]) => nombre);
}
