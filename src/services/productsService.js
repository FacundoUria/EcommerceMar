// Única puerta de entrada a los datos del catálogo.
// Hoy lee src/data/products.js (cargado bajo demanda, en un chunk aparte).
// Mañana: reemplazar `cargar()` por un fetch a la base de datos donde Mar carga productos,
// manteniendo la misma forma de los objetos. La UI no se toca.

let cache = null;

function cargar() {
  if (!cache) {
    cache = import('../data/products.js').catch((e) => {
      cache = null; // si falla la red, permitir reintentar
      throw e;
    });
  }
  return cache;
}

/** Productos del catálogo. */
export async function getProducts() {
  const { products } = await cargar();
  return products;
}

/** Un producto por id, o null si no existe. */
export async function getProductById(id) {
  const { products } = await cargar();
  return products.find((p) => p.id === id) ?? null;
}

/** Categorías con su paso de la rutina (1-4 o null) y la foto de portada. */
export async function getCategories() {
  const { categories } = await cargar();
  return categories.map((c) => ({ ...c, imagen: `/img/productos/${c.portada}.webp` }));
}

/** Servicios de peluquería (no van al carrito). */
export async function getServices() {
  const { services } = await cargar();
  return services;
}

/** Marcas presentes en el catálogo, ordenadas por cantidad de productos. */
export async function getBrands() {
  const { products } = await cargar();
  const cuenta = new Map();
  for (const p of products) if (p.marca) cuenta.set(p.marca, (cuenta.get(p.marca) || 0) + 1);
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]).map(([nombre]) => nombre);
}
