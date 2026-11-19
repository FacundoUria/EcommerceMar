// Datos reales del negocio (de su Tiendanube / banners / Instagram).
// Dato que falta = string vacío o null: la UI no lo muestra (nada de "[A CONFIRMAR CON MAR]" visible).
// Pendientes de Mar: dirección y horarios.
export const NEGOCIO = {
  nombre: 'Dream Hair',
  bajada: 'The Curly Studio',
  ciudad: 'Mendoza',
  frase: 'El cabello es el espejo de tu amor propio',
  whatsapp: 'https://wa.me/5492616951803', // +54 9 2616 95-1803 (estudio)
  dominio: 'dreamhair.ar',
  direccion: '',
  horarios: '',
  instagram: 'https://www.instagram.com/dreamhair_mza',
};

/** Link de WhatsApp al estudio con un mensaje ya escrito (por defecto "¡Hola Mar!"). */
export const whatsappCon = (texto = '¡Hola Mar!') => `${NEGOCIO.whatsapp}?text=${encodeURIComponent(texto)}`;

// Barra de anuncio (arriba de todo). Texto de Mar, tal cual; cada frase es un tramo que puede
// quedar oculto si no entra (versión quieta con movimiento reducido).
export const ANUNCIO = [
  '🫶🫶 La comunidad más grande de rulos de Mendoza 🫶🫶',
  'Envíos a toda la provincia 📦🛵',
  'Aceptamos todos los medios de pago 💰💵',
];

// Franja de beneficios (textos de sus banners)
export const BENEFICIOS = [
  { icono: 'camion', texto: 'Envíos a todo Mendoza' },
  { icono: 'tarjeta', texto: 'Recibimos todos los medios de pago' },
  { icono: 'regalo', texto: 'Promociones todos los meses' },
];

// Pasos de la rutina curly → categorías del catálogo
export const PASOS_RUTINA = [
  { paso: 1, titulo: 'Lavar', bajada: 'Low poo', categorias: ['low-poo'] },
  { paso: 2, titulo: 'Hidratar y peinar', bajada: 'Cremas 2 en 1 y de peinar', categorias: ['cremas-2en1', 'cremas-peinar'] },
  { paso: 3, titulo: 'Definir', bajada: 'Geles, mousses, activadores y spray', categorias: ['geles', 'mousses', 'activadores', 'spray'] },
  { paso: 4, titulo: 'Proteger', bajada: 'Satén y óleos', categorias: ['saten', 'oleos'] },
];
