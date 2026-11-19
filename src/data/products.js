// src/data/products.js — precios de su Tiendanube (nov 2026)
// ⚠️ Los componentes NO importan este archivo: todo pasa por src/services/productsService.js
const img = (f) => `/img/productos/${f}.webp`;

export const categories = [
  { id: 'low-poo', nombre: 'Low poo', paso: 1, portada: 'shampoo-low-poo-han' },
  { id: 'cremas-2en1', nombre: 'Cremas 2 en 1', paso: 2, portada: 'cremas-skala' },
  { id: 'cremas-peinar', nombre: 'Cremas de peinar', paso: 2, portada: 'cremas-salon-line' },
  { id: 'geles', nombre: 'Geles y gelatinas', paso: 3, portada: 'gelatinas-500gr' },
  { id: 'mousses', nombre: 'Mousses', paso: 3, portada: 'mousse-cantu' },
  { id: 'activadores', nombre: 'Activadores de rulos', paso: 3, portada: 'activador-cantu' },
  { id: 'spray', nombre: 'Spray', paso: 3, portada: 'spray-revitalizante' },
  { id: 'saten', nombre: 'Satén', paso: 4, portada: 'cofia-saten' },
  { id: 'oleos', nombre: 'Óleos', paso: 4, portada: 'oleos-pinga' },
  { id: 'cepillos', nombre: 'Cepillos', paso: null, portada: 'cepillo-viral-tenedor' },
  { id: 'varios', nombre: 'Varios', paso: null, portada: 'turbante-microfibra' },
];

// foto: nombre del archivo en assets/productos (sin extensión). tn: slug de Tiendanube para bajar la foto que falta.
export const products = [
  { id: 'shampoo-low-poo-han', nombre: 'Shampoo low poo HAN', marca: 'HAN', categoria: 'low-poo', precio: 15000, foto: 'shampoo-low-poo-han', destacado: true,
    variantes: [['Ácido hialurónico','shampoo-han-acido-hialuronico'],['Avena y miel','shampoo-han-avena-miel'],['Biotina','shampoo-han-biotina'],['Control caída','shampoo-han-control-caida'],['Detox','shampoo-han-detox'],['Lino','shampoo-han-lino'],['Plex','shampoo-han-plex'],['Rulos','shampoo-han-rulos']] },
  { id: 'low-poo-kleno', nombre: 'Low poo Kleno', marca: 'Kleno', categoria: 'low-poo', precio: 13000, tn: 'low-poo-kleno-bvfi1' },

  { id: 'cremas-skala', nombre: 'Cremas Skala 1kg', marca: 'Skala', categoria: 'cremas-2en1', precio: 6900, foto: 'cremas-skala', destacado: true,
    variantes: [['Mais Cachinhos','cremas-skala-mais-cachinhos'],['Dona Skala','cremas-skala-dona-skala'],['Divina Cor','cremas-skala-divina-cor'],['Divino Potão','cremas-skala-divino-potao'],['Mais Cachos','cremas-skala-mais-cachos'],['Cachonados','cremas-skala-cachonados'],['Potão do Amor','cremas-skala-potao-do-amor'],['Divino Potinho','cremas-skala-divino-potinho'],['Mais Crespos','cremas-skala-mais-crespos']] },
  { id: 'custard-cantu', nombre: 'Custard Cantú', marca: 'Cantú', categoria: 'cremas-2en1', precio: 35000, tn: 'custard-cantu-1spwg' },
  { id: 'curl-fusion', nombre: 'Curl Fusion', marca: 'Frenzzi', categoria: 'cremas-2en1', precio: 16000, foto: 'curl-fusion' },

  { id: 'crema-peinar-kleno', nombre: 'Crema de peinar Kleno', marca: 'Kleno', categoria: 'cremas-peinar', precio: 8500, tn: 'crema-de-peinar-kleno-11ush' },
  { id: 'curl-mode', nombre: 'Curl Mode', marca: 'Alfa', categoria: 'cremas-peinar', precio: 10500, foto: 'curl-mode' },
  { id: 'crema-bekim', nombre: 'Crema de peinar Bekim', marca: 'Bekim', categoria: 'cremas-peinar', precio: 7000, foto: 'crema-bekim',
    variantes: [['Memory','crema-bekim-memory'],['Argán','crema-bekim-argan']] },
  { id: 'cremas-salon-line', nombre: 'Cremas Salon Line', marca: 'Salon Line', categoria: 'cremas-peinar', precio: 28000, foto: 'cremas-salon-line', destacado: true,
    variantes: [['Definição Natural','cremas-salon-line-definicion-natural'],['Ostentação','cremas-salon-line-ostentacao']] },

  { id: 'gel-de-rich', nombre: 'Gel De Rich', marca: 'De Rich', categoria: 'geles', precio: 35000, foto: 'gel-de-rich', destacado: true },
  { id: 'gelatina-liquida-salon-line', nombre: 'Gelatina líquida Salon Line', marca: 'Salon Line', categoria: 'geles', precio: 28000, foto: 'gelatina-liquida-salon-line', destacado: true },
  { id: 'gelatinas-500', nombre: 'Gelatinas Salon Line', marca: 'Salon Line', categoria: 'geles', precio: 26000, foto: 'gelatinas-500gr', destacado: true,
    variantes: [['Ostentação','gelatinas-500gr-ostentacao'],['Baunilha Doce','gelatinas-500gr-baunilha'],['7x','gelatinas-500gr-7x'],['14x','gelatinas-500gr-14x'],['Super Transição','gelatinas-500gr-transicao']] },
  { id: 'gelatinas-kids', nombre: 'Gelatinas Salon Line Kids', marca: 'Salon Line', categoria: 'geles', precio: 26000, foto: 'gelatinas-kids',
    variantes: [['Melão','gelatinas-kids-melao'],['Melancia','gelatinas-kids-melancia'],['Uva','gelatinas-kids-uva'],['Açaí','gelatinas-kids-acai']] },
  { id: 'gel-frenzzi', nombre: 'Gel Frenzzi', marca: 'Frenzzi', categoria: 'geles', precio: 18000, foto: 'gel-frenzzi',
    variantes: [['Chía','gel-frenzzi-chia'],['Pepino','gel-frenzzi-pepino'],['Lino','gel-frenzzi-lino']] },
  { id: 'gel-bekim-800', nombre: 'Gel Bekim Supreme Fixer 800g', marca: 'Bekim', categoria: 'geles', precio: 19000, foto: 'gel-bekim-800gr' },
  { id: 'gel-bekim-250', nombre: 'Gel Bekim Supreme Fixer 250g', marca: 'Bekim', categoria: 'geles', precio: 10000, foto: 'gel-bekim-250gr' },
  { id: 'gel-fuerte-fidelite', nombre: 'Gel fuerte Fidelité', marca: 'Fidelité', categoria: 'geles', precio: 10000, foto: 'gel-fuerte-fidelite' },
  { id: 'gel-aurill', nombre: 'Gel Aurill', marca: 'Aurill', categoria: 'geles', precio: 18500, tn: 'gel-aurill-ocicv' },
  { id: 'gel-curl-mode', nombre: 'Gel Curl Mode', marca: 'Alfa', categoria: 'geles', precio: 11000, tn: 'gel-curl-mode-1qxgl' },

  { id: 'mousse-kleno', nombre: 'Mousse Kleno', marca: 'Kleno', categoria: 'mousses', precio: 19000, tn: 'mousse-kleno-1opmw' },
  { id: 'mousse-cantu', nombre: 'Mousse Cantú', marca: 'Cantú', categoria: 'mousses', precio: 43000, tn: 'mousse-cantu-1nr2o' },
  { id: 'activador-kleno', nombre: 'Activador Kleno', marca: 'Kleno', categoria: 'activadores', precio: 8000, tn: 'activador-kleno-8vr8y' },
  { id: 'activador-cantu', nombre: 'Activador de rizos Cantú', marca: 'Cantú', categoria: 'activadores', precio: 39000, tn: 'activador-de-rizos-cantu-1l82d' },
  { id: 'spray-revitalizante', nombre: 'Spray revitalizante', marca: 'Cantú', categoria: 'spray', precio: 25000, tn: 'spray-revitalizante-utpsi' },

  { id: 'funda-saten', nombre: 'Funda de almohada satén', marca: 'Dream Hair', categoria: 'saten', precio: 15000, foto: 'funda-saten' },
  { id: 'cofia-saten', nombre: 'Cofia satén', marca: 'Dream Hair', categoria: 'saten', precio: 7000, foto: 'cofia-saten' },
  { id: 'oleos-pinga', nombre: 'Óleos Pinga', marca: 'Lola', categoria: 'oleos', precio: 19000, foto: 'oleos-pinga',
    variantes: [['Cenoura & Oliva','oleos-pinga-cenoura-oliva'],['Açaí & Pracaxi','oleos-pinga-acai'],['Patauá & Moringa','oleos-pinga-pataua']] },

  { id: 'cepillo-viral', nombre: 'Cepillo viral', categoria: 'cepillos', precio: 16000, tn: 'cepillo-viral-qjdcu' },
  { id: 'cepillo-viral-flexible', nombre: 'Cepillo viral flexible', categoria: 'cepillos', precio: 13000, foto: 'cepillo-viral-flexible' },
  { id: 'cepillo-viral-doble', nombre: 'Cepillo viral doble', categoria: 'cepillos', precio: 13000, foto: 'cepillo-viral-doble' },
  { id: 'cepillo-viral-tenedor', nombre: 'Cepillo viral tenedor', categoria: 'cepillos', precio: 15000, foto: 'cepillo-viral-tenedor', destacado: true },
  { id: 'cepillo-detangle-bounce', nombre: 'Cepillo Detangle Bounce', categoria: 'cepillos', precio: 12000, tn: 'cepillo-detangle-bounce-1gg19' },
  { id: 'cepillo-maya-cuadrado', nombre: 'Cepillo maya cuadrado', categoria: 'cepillos', precio: 12000, tn: 'cepillo-maya-cuadrado-1w57z' },
  { id: 'cepillo-pirulito', nombre: 'Cepillo pirulito', categoria: 'cepillos', precio: 8000, foto: 'cepillo-pirulito' },
  { id: 'cepillo-pirulito-2', nombre: 'Cepillo pirulito', categoria: 'cepillos', precio: 9000, tn: 'cepillo-pirulito-lo7tv' },
  { id: 'cepillo-magico', nombre: 'Cepillo mágico', categoria: 'cepillos', precio: 12000, tn: 'cepillo-magico-ty1bj' },
  { id: 'turbante-microfibra', nombre: 'Turbante microfibra', categoria: 'varios', precio: 13000, foto: 'turbante-microfibra' },
].map((p) => ({
  ...p,
  imagen: img(p.foto || p.id),
  variantes: (p.variantes || []).map(([nombre, f]) => ({ nombre, imagen: img(f) })),
}));

// Servicios del estudio (textos, duraciones y fotos de Mar, nov 2026). Sin precio: se reservan por WhatsApp.
// `grupo` arma las secciones de /servicios (en este orden).
export const serviceGroups = ['Asesoramientos', 'Cortes y clases', 'Tratamientos'];

export const services = [
  {
    id: 'asesoramiento-basico',
    nombre: 'Asesoramiento básico',
    grupo: 'Asesoramientos',
    duracion: '1 h',
    foto: 'asesoramiento-basico',
    descripcion:
      'Diagnóstico personalizado y rutina a medida para tus rulos. Evaluamos tu patrón y las necesidades reales de tu hebra para diseñar el cuidado ideal. Incluye lavado, tratamiento nutritivo, clase práctica de finalización para que aprendas a definirte en casa y secado.',
  },
  {
    id: 'asesoramiento-completo',
    nombre: 'Asesoramiento completo',
    grupo: 'Asesoramientos',
    duracion: '1 h 40 min',
    foto: 'asesoramiento-completo',
    descripcion:
      'Diagnóstico capilar, corte en seco, tratamiento y clase de finalización. Todo el asesoramiento personalizado para conocer las necesidades de tu cabello, sumado al corte a medida, lavado, tratamiento específico, clase de definición para tu casa y secado.',
  },
  {
    id: 'asesoramiento-deluxe',
    nombre: 'Asesoramiento De luxe',
    grupo: 'Asesoramientos',
    duracion: '2 h',
    foto: 'asesoramiento-deluxe',
    descripcion:
      'La experiencia capilar más completa y avanzada. Incluye diagnóstico completo, corte en seco, lavado, tratamiento, análisis con cámara y un tratamiento con tecnología avanzada (ozonoterapia, infrarrojo o ambos según lo que tu fibra necesite).',
  },
  {
    id: 'corte-rulos',
    nombre: 'Corte de rulos',
    grupo: 'Cortes y clases',
    duracion: '1 h',
    foto: 'corte-en-seco',
    descripcion:
      'Corte especializado, ritual de lavado, tratamiento e hidratación profunda. Diseñado específicamente para respetar la forma natural de tus rulos y ondas en seco, finalizando con secado profesional.',
  },
  {
    id: 'lo-hiciste-tu',
    nombre: 'Lo hiciste tú',
    grupo: 'Cortes y clases',
    duracion: '1 h 20 min',
    foto: 'lo-hiciste-tu',
    descripcion:
      'Clase teórico-práctica de finalización. Incluye productos y materiales para usar durante la clase. Vas a aprender a finalizar tu cabello según tus gustos, tiempos y tipo de cabello. Incluye tratamiento y lavado.',
  },
  {
    id: 'tratamiento-finalizacion',
    nombre: 'Tratamiento y finalización',
    grupo: 'Cortes y clases',
    duracion: '50 min',
    foto: 'lavado',
    descripcion:
      'Tratamiento específico según tu tipo de cabello (se evalúa en el momento). Finalización (peinado) de rulos, ondas o afro y secado.',
  },
  {
    id: 'ozonoterapia',
    nombre: 'Ozonoterapia',
    grupo: 'Tratamientos',
    duracion: '1 h',
    foto: 'ozonoterapia',
    descripcion:
      'Oxigenación y detox profundo para el cuero cabelludo. Purifica el folículo, estimula el crecimiento y devuelve la vitalidad a los rizos fatigados, potenciando la absorción de cada nutriente.',
  },
  {
    id: 'celulas-madre-infrarrojo',
    nombre: 'Células madre + infrarrojo',
    grupo: 'Tratamientos',
    duracion: '1 h',
    foto: 'celulas-madre-infrarrojo',
    descripcion:
      'Reconstrucción extrema, suavidad y control total del frizz. Combina activos regeneradores con fototerapia infrarroja para reparar la fibra desde adentro y sellar la cutícula, logrando rulos elásticos y con brillo espejo.',
  },
].map(({ foto, ...s }) => ({ ...s, imagen: `/img/estudio/${foto}.webp` }));
