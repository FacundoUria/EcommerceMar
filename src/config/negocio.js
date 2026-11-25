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

// Barra de anuncio (arriba de todo): un mensaje a la vez, cada uno con su ícono (src/components/ui/Icon.jsx)
export const ANUNCIO = [
  { icono: 'corazon', texto: 'La comunidad de rulos más grande de Mendoza' },
  { icono: 'camionFino', texto: 'Envíos a toda la provincia' },
  { icono: 'tarjetaFina', texto: 'Aceptamos todos los medios de pago' },
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
  { paso: 2, titulo: 'Hidratar y peinar', bajada: 'Cremas 2 en 1, de peinar y tratamientos', categorias: ['cremas-2en1', 'cremas-peinar', 'tratamientos'] },
  { paso: 3, titulo: 'Definir', bajada: 'Geles, mousses, activadores y cepillos definidores', categorias: ['geles', 'mousses', 'activadores', 'cepillos'] },
  { paso: 4, titulo: 'Proteger', bajada: 'Satén, óleos, sprays y toallas', categorias: ['saten', 'oleos', 'spray', 'toallas'] },
];
