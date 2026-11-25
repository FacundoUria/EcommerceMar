// Productos y variantes que cambiaron de id o de nombre: los carritos guardados y los links viejos siguen
// andando (el carrito pasa la línea al id / nombre nuevo; /producto/<id viejo> redirige al nuevo).

/** id viejo → id nuevo. 24/11: los ids de dos cepillos estaban cruzados y el Flexible oculto se unificó. */
export const IDS_RENOMBRADOS = {
  'cepillo-maya-cuadrado': 'cepillo-flexible-perfumado',
  'cepillo-definidor-lila': 'cepillo-flexible-perfumado',
  'cepillo-pirulito-2': 'cepillo-maya',
};

/** { [id]: { nombre viejo: nombre nuevo } }: el mismo color, con otro nombre. */
export const VARIANTES_RENOMBRADAS = {
  'cepillo-magico': { 'Fucsia · con llavero': 'Rosa · con llavero' },
  'cepillo-viral-doble': { 'Verde manzana': 'Verde agua' },
};
