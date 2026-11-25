// Productos y variantes que cambiaron de id o de nombre: los carritos guardados y los links viejos siguen
// andando (el carrito pasa la línea al id / nombre nuevo; /producto/<id viejo> redirige al nuevo).

/** id viejo → id nuevo. 24/11: los ids de dos cepillos estaban cruzados y el Flexible oculto se unificó. */
export const IDS_RENOMBRADOS = {
  'cepillo-maya-cuadrado': 'cepillo-flexible-perfumado',
  'cepillo-definidor-lila': 'cepillo-flexible-perfumado',
  'cepillo-pirulito-2': 'cepillo-maya',
};

/**
 * { [id]: { nombre viejo: nombre nuevo } }: la misma variante con otro nombre (o una que Mar sacó porque era
 * igual a otra: la línea del carrito pasa a esa).
 */
export const VARIANTES_RENOMBRADAS = {
  'cepillo-magico': { 'Fucsia · con llavero': 'Rosa · con llavero' },
  'cepillo-viral-doble': { 'Verde manzana': 'Verde agua' },
  // 25/11: la Amarilla 72 h es la misma que la Super Transição; la Baunilha Doce es la Xêrosa de vainilla
  'gelatinas-500': { 'Amarilla 72 h': 'Super Transição', 'Baunilha Doce': 'Xêrosa Vainilla' },
};

/** Categoría vieja → nueva: los links viejos (/tienda?cat=…) abren la nueva. 25/11: una sola "Cepillos". */
export const CATEGORIAS_RENOMBRADAS = {
  'cepillos-definidores': 'cepillos',
};
