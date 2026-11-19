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

// Campos de cada producto:
// - nombre: nombre comercial completo de Mar (página de producto). nombreCorto: cards, carruseles, carrito y
//   mensaje de WhatsApp (máx ~32 caracteres; si falta, se usa `nombre`).
// - marca: nombres cortos y consistentes (filtro de marcas). tamano y descripcion: textos de Mar, tal cual.
// - foto: archivo en assets/productos (sin extensión). tn: slug de Tiendanube para bajar la foto que falta.
// - variantes: [nombre, foto]; sin foto propia usan la del producto.
// - `destacado`: los "Favoritos de Mar" del home (elegidos a mano, no son datos de ventas).
// - activo: false + precio: null → producto nuevo de Mar, oculto hasta tener precio y foto
//   (lista en docs/confirmar-con-mar.md). El service los filtra.
export const products = [
  // ── Low poo (paso 1: lavar) ──
  { id: 'shampoo-low-poo-han', marca: 'HAN', nombre: 'Línea de Shampoos Profesionales Sin Sulfatos, Parabenos ni Siliconas', nombreCorto: 'Shampoo low poo', tamano: '500 ml',
    categoria: 'low-poo', precio: 15000, foto: 'shampoo-low-poo-han', destacado: true,
    descripcion: 'Shampoos suaves libres de sulfatos, parabenos y siliconas en distintas variedades: Carbón Activado (purificante y detox), Action Plex (hidronutritivo y brillo intenso), Biotina + Ácido Hialurónico (fuerza y estímulo del crecimiento), Rulos Definidos (con aceite de palta y aloe vera), Prevención Caída (con centella asiática, aloe vera y D-pantenol) y Extracto de Avena & Miel (hidronutritivo y suavizante).',
    // "Ácido hialurónico" y "Lino" no están en el texto de Mar: quedan por ahora (docs/confirmar-con-mar.md)
    variantes: [['Carbón Activado','shampoo-han-detox'],['Action Plex','shampoo-han-plex'],['Biotina + Ácido Hialurónico','shampoo-han-biotina'],['Rulos Definidos','shampoo-han-rulos'],['Prevención Caída','shampoo-han-control-caida'],['Avena & Miel','shampoo-han-avena-miel'],['Ácido hialurónico','shampoo-han-acido-hialuronico'],['Lino','shampoo-han-lino']] },
  { id: 'low-poo-kleno', marca: 'Kleno', nombre: 'Perfect Curly Shampoo Rulos Perfectos', nombreCorto: 'Shampoo Rulos Perfectos', tamano: '350 cc',
    categoria: 'low-poo', precio: 13000, tn: 'low-poo-kleno-bvfi1',
    descripcion: 'Shampoo apto low-poo, sin sulfatos, parabenos, siliconas ni petrolatos, que limpia suavemente sin resecar, manteniendo la hidratación y el brillo natural.' },
  { id: 'kleno-acondicionador', marca: 'Kleno', nombre: 'Perfect Curly Acondicionador Rulos Perfectos', nombreCorto: 'Acondicionador Rulos Perfectos', tamano: '350 cc',
    categoria: 'low-poo', precio: null, activo: false,
    descripcion: 'Acondicionador apto low-poo, libre de sulfatos, parabenos, siliconas y petrolatos, diseñado para nutrir, desenredar y aportar brillo extremo.' },

  // ── Cremas 2 en 1 ──
  { id: 'cremas-skala', marca: 'Skala', nombre: 'Cremas de Tratamiento y Peinar 2 en 1', nombreCorto: 'Cremas 2 en 1', tamano: '1000 g',
    categoria: 'cremas-2en1', precio: 6900, foto: 'cremas-skala', destacado: true,
    descripcion: 'Potes de 1 kg, 100 % veganos y liberados, aptos como baño de crema o crema de peinar en distintas líneas según cada necesidad.',
    variantes: [['Mais Cachinhos','cremas-skala-mais-cachinhos'],['Dona Skala','cremas-skala-dona-skala'],['Divina Cor','cremas-skala-divina-cor'],['Divino Potão','cremas-skala-divino-potao'],['Mais Cachos','cremas-skala-mais-cachos'],['Cachonados','cremas-skala-cachonados'],['Potão do Amor','cremas-skala-potao-do-amor'],['Divino Potinho','cremas-skala-divino-potinho'],['Mais Crespos','cremas-skala-mais-crespos']] },
  { id: 'custard-cantu', marca: 'Cantu', nombre: 'Shea Butter Define & Shine Custard', nombreCorto: 'Define & Shine Custard', tamano: '340 g / 12 oz',
    categoria: 'cremas-2en1', precio: 35000, tn: 'custard-cantu-1spwg',
    descripcion: 'Crema-gel definidora enriquecida con manteca de karité pura que aporta brillo intenso, hidratación y fijación duradera sin efecto rígido para ondas, rulos y afros.' },
  { id: 'curl-fusion', marca: 'Frenzzi', nombre: 'Vesta CurlFusion Crema Gel de Lino', nombreCorto: 'CurlFusion Crema Gel de Lino', tamano: '300 ml',
    categoria: 'cremas-2en1', precio: 16000, foto: 'curl-fusion',
    descripcion: 'Crema-gel sin siliconas a base de lino que combina hidratación, reparación y fijación en un solo paso, dejando rulos definidos y brillantes.' },

  // ── Cremas de peinar ──
  { id: 'crema-peinar-kleno', marca: 'Kleno', nombre: 'Perfect Curly Crema de Peinar Definition', nombreCorto: 'Crema de Peinar Definition', tamano: '250 g',
    categoria: 'cremas-peinar', precio: 8500, tn: 'crema-de-peinar-kleno-11ush',
    descripcion: 'Crema de peinar libre de sulfatos, parabenos, siliconas y petrolatos, con aceites vegetales y filtro solar para hidratar, definir y dar brillo natural.' },
  { id: 'curl-mode', marca: 'Alfa', nombre: 'Curl Mode Crema de Peinar', nombreCorto: 'Curl Mode Crema de Peinar',
    categoria: 'cremas-peinar', precio: 10500, foto: 'curl-mode',
    descripcion: 'Crema de peinar libre de sulfatos, parabenos, siliconas y sal, vegana y cruelty-free, formulada para definir rulos y ondas con suavidad y control del frizz.' },
  { id: 'crema-bekim', marca: 'Bekim', nombre: 'Cremas de Peinar Rulos: Memory y Argán', nombreCorto: 'Cremas de Peinar Rulos', tamano: '250 g',
    categoria: 'cremas-peinar', precio: 7000, foto: 'crema-bekim',
    descripcion: 'Dos opciones para definir y cuidar el cabello con rulos u ondas: Memory (ayuda a mantener la forma y memoria del rulo) y Argán 4 Oils (tratamiento nutritivo que aporta suavidad y brillo).',
    variantes: [['Memory','crema-bekim-memory'],['Argán','crema-bekim-argan']] },
  { id: 'cremas-salon-line', marca: 'Salon Line', nombre: 'Cremas de Peinar Definición', nombreCorto: 'Cremas de Peinar Definición', tamano: '300 ml / 300 g',
    categoria: 'cremas-peinar', precio: 28000, foto: 'cremas-salon-line', destacado: true,
    descripcion: 'Dos opciones para personalizar la finalización: Definição Ostentação (efecto firme, anti-frizz y súper day after), Definição Natural (movimiento, hidratación y definición ligera).',
    variantes: [['Definição Natural','cremas-salon-line-definicion-natural'],['Ostentação','cremas-salon-line-ostentacao']] },
  { id: 'salon-line-kids-hidra-multy', marca: 'Salon Line', nombre: 'Kids Hidra Multy Crema Multifuncional 4 en 1', nombreCorto: 'Kids Hidra Multy 4 en 1', tamano: '300 ml',
    categoria: 'cremas-peinar', precio: null, activo: false,
    descripcion: 'Crema multifuncional 4 en 1 con extracto de frutilla, vitamina B5 y vitamina E, hipoalergénica y testeada dermatológicamente para el cuidado diario del cabello infantil.' },
  { id: 'curl-girl-curling-cream', marca: 'Curl Girl', nombre: 'Curling Cream Modeladora con Pantenol y Glicerina Vegetal', nombreCorto: 'Curling Cream Modeladora', tamano: '300 cc',
    categoria: 'cremas-peinar', precio: null, activo: false,
    descripcion: 'Crema modeladora con pantenol y glicerina vegetal que hidrata, suaviza y ayuda a dar forma y movimiento a ondas y rulos.' },
  { id: 'han-crema-rulos-definidos', marca: 'HAN', nombre: 'Crema de Peinar Rulos Definidos', nombreCorto: 'Crema de Peinar Rulos Definidos', tamano: '200 cc',
    categoria: 'cremas-peinar', precio: null, activo: false,
    descripcion: 'Crema de peinar sin enjuague, libre de parabenos y siliconas, con filtro solar y protector térmico. Hidrata, controla el frizz y ayuda a lograr rulos más definidos y brillantes.' },
  { id: 'han-crema-alfa-keratina', marca: 'HAN', nombre: 'Crema de Peinar Alfa Keratina', nombreCorto: 'Crema de Peinar Alfa Keratina', tamano: '200 cc',
    categoria: 'cremas-peinar', precio: null, activo: false,
    descripcion: 'Crema sin enjuague con filtro solar y sin parabenos ni siliconas. Facilita el desenredo, reduce el frizz y aporta suavidad, hidratación y brillo.' },
  { id: 'frenzzi-cremas-naturale', marca: 'Frenzzi', nombre: 'Naturale Cremas de Peinar Sin Siliconas', nombreCorto: 'Cremas de Peinar Naturale', tamano: '200 ml',
    categoria: 'cremas-peinar', precio: null, activo: false,
    descripcion: 'Línea de cremas sin siliconas con aceite de coco, acción anti-frizz y filtro solar en tres versiones: Cebolla & Ginseng (revitalizante y fortalecedora), Almendras Dulces & Chía (nutri-reparadora e hidratante) y Arándanos (nutri-hidratante y antioxidante).',
    variantes: [['Cebolla & Ginseng'],['Almendras Dulces & Chía'],['Arándanos']] },

  // ── Geles y gelatinas ──
  { id: 'gel-de-rich', marca: 'Rich', nombre: 'Gel Capilar con Proteína Vegetal (Envase Botella)', nombreCorto: 'Gel con Proteína Vegetal',
    categoria: 'geles', precio: 35000, foto: 'gel-de-rich', destacado: true,
    descripcion: 'Gel capilar formulado con proteína vegetal para aportar definición duradera, brillo y control del frizz en ondas y rulos sin resecar la fibra.' },
  { id: 'gel-rich-potenciador', marca: 'Rich', nombre: 'Gel Potenciador con Proteína Vegetal', nombreCorto: 'Gel Potenciador', tamano: '250 g',
    categoria: 'geles', precio: null, activo: false, foto: 'gel-de-rich-potenciador',
    descripcion: 'Gel de alta fijación enriquecido con proteína vegetal, pensado especialmente para cabellos ondulados y en transición, que define sin resecar.' },
  { id: 'gelatina-liquida-salon-line', marca: 'Salon Line', nombre: 'Gelatina líquida Salon Line', nombreCorto: 'Gelatina líquida',
    categoria: 'geles', precio: 28000, foto: 'gelatina-liquida-salon-line', destacado: true },
  { id: 'gelatinas-500', marca: 'Salon Line', nombre: 'Línea #todecacho Gelatinas Capilares', nombreCorto: 'Gelatinas #todecacho', tamano: '500 / 550 g',
    categoria: 'geles', precio: 26000, foto: 'gelatinas-500gr', destacado: true,
    descripcion: 'Geles de alta definición y efecto day after prolongado en distintas versiones (Verde y Amarilla de fijación 72 h, Definição Ostentação para brillo y definición intensa, y Xêrosa Baunilha Doce con aroma dulce y alta fijación).',
    variantes: [['Ostentação','gelatinas-500gr-ostentacao'],['Baunilha Doce','gelatinas-500gr-baunilha'],['Amarilla 72 h','gelatinas-500gr-7x'],['Verde 72 h','gelatinas-500gr-14x'],['Super Transição','gelatinas-500gr-transicao']] },
  { id: 'gelatinas-kids', marca: 'Salon Line', nombre: 'Gelatinas Salon Line Kids', nombreCorto: 'Gelatinas Kids',
    categoria: 'geles', precio: 26000, foto: 'gelatinas-kids',
    variantes: [['Melão','gelatinas-kids-melao'],['Melancia','gelatinas-kids-melancia'],['Uva','gelatinas-kids-uva'],['Açaí','gelatinas-kids-acai']] },
  { id: 'gel-frenzzi', marca: 'Frenzzi', nombre: 'Geles Finalizadores Sin Siliconas ni Parabenos', nombreCorto: 'Geles Finalizadores', tamano: '350 ml',
    categoria: 'geles', precio: 18000, foto: 'gel-frenzzi',
    descripcion: 'Línea de geles livianos y no grasos que definen, nutren y aportan brillo en tres opciones: Aloe y Pepino (fijación moderada e hidratante), Gel de Lino (finalizador nutritivo) y Gel de Chía (fijación alta).',
    variantes: [['Chía','gel-frenzzi-chia'],['Aloe y Pepino','gel-frenzzi-pepino'],['Lino','gel-frenzzi-lino']] },
  // id viejo (Tiendanube decía 800 g): confirmar con Mar tamaño y precio (docs/confirmar-con-mar.md)
  { id: 'gel-bekim-800', marca: 'Bekim', nombre: 'Supreme Fixer Gel de Fijación Fuerte', nombreCorto: 'Supreme Fixer con dosificador', tamano: '300 ml',
    categoria: 'geles', precio: 19000, foto: 'gel-bekim-800gr',
    descripcion: 'Gel de fijación fuerte en envase con dosificador que ayuda a sostener la forma del rulo o peinado por más tiempo sin dejar residuos.' },
  { id: 'gel-bekim-250', marca: 'Bekim', nombre: 'Supreme Fixer Gel de Fijación Fuerte en Pote', nombreCorto: 'Supreme Fixer en pote', tamano: '250 g',
    categoria: 'geles', precio: 10000, foto: 'gel-bekim-250gr',
    descripcion: 'Gel de fijación fuerte en pote de 250 g que aporta textura, definición y control duradero para sostener la forma del rulo o peinado.' },
  { id: 'gel-fuerte-fidelite', marca: 'Fidelité', nombre: 'Super Fix Gel Fijación Extrema', nombreCorto: 'Super Fix Gel', tamano: '230 ml',
    categoria: 'geles', precio: 10000, foto: 'gel-fuerte-fidelite',
    descripcion: 'Gel de fijación extrema y extra duración diseñado para modelar y sostener la definición de rulos y peinados con máximo control.' },
  { id: 'gel-aurill', marca: 'Aurill', nombre: 'Protector No Graso Oil Non Oil', nombreCorto: 'Protector Oil Non Oil', tamano: '375 ml',
    categoria: 'geles', precio: 18500, tn: 'gel-aurill-ocicv',
    descripcion: 'Acondicionador no graso con efecto fijador y filtro UV que protege del sol, el viento y la polución, controla el frizz y ayuda a mantener la estructura de rulos y ondas con brillo natural.' },
  { id: 'gel-curl-mode', marca: 'Alfa', nombre: 'Oil Non Oil Curl Scrunch Gel Finalizador', nombreCorto: 'Oil Non Oil Curl Scrunch', tamano: '250 ml',
    categoria: 'geles', precio: 11000, tn: 'gel-curl-mode-1qxgl',
    descripcion: 'Gel finalizador ligero, libre de sulfatos, parabenos y siliconas, ideal para hacer scrunch, definir rulos y ondas y dejar brillo sin sensación pesada ni grasa.' },
  { id: 'curl-girl-gel-500', marca: 'Curl Girl', nombre: 'Curling Gel Hidratante con Aceite de Jojoba y Almendras', nombreCorto: 'Curling Gel Hidratante 500 cc', tamano: '500 cc',
    categoria: 'geles', precio: null, activo: false,
    descripcion: 'Gel hidratante en presentación de 500 cc que aporta definición, brillo y fijación flexible sin resecar, ideal para acompañar la finalización de rulos y ondas.' },
  { id: 'curl-girl-gel-300', marca: 'Curl Girl', nombre: 'Curling Gel Hidratante con Aceite de Jojoba y Almendras', nombreCorto: 'Curling Gel Hidratante 300 cc', tamano: '300 cc',
    categoria: 'geles', precio: null, activo: false,
    descripcion: 'Gel hidratante en formato de 300 cc formulado con aceites de jojoba y almendras para definir rulos y ondas, controlar el frizz y mantener la hidratación.' },
  { id: 'ossono-gel-500', marca: 'Ossono', nombre: 'Gel High Power Ful con Dosificador', nombreCorto: 'Gel High Power con dosificador', tamano: '500 ml',
    categoria: 'geles', precio: null, activo: false,
    descripcion: 'Gel de fijación extrema y alta duración en envase de 500 ml con válvula, práctico para peinados definidos y de larga permanencia.' },
  { id: 'ossono-gel-250', marca: 'Ossono', nombre: 'Gel High Power Ful en Pote', nombreCorto: 'Gel High Power en pote', tamano: '250 g',
    categoria: 'geles', precio: null, activo: false,
    descripcion: 'Gel de fijación extrema y alta duración en pote de 250 g, ideal para lograr definición firme y duradera en el peinado.' },
  { id: 'skala-day-after', marca: 'Skala', nombre: 'Expert Day After Cachos Gel Líquido', nombreCorto: 'Day After Cachos Gel Líquido', tamano: '250 g',
    categoria: 'geles', precio: null, activo: false,
    descripcion: 'Gel líquido 100 % vegano y liberado, ideal para revitalizar y definir rulos y ondas al día siguiente sin frizz y con acabado natural.' },

  // ── Mousses ──
  { id: 'mousse-kleno', marca: 'Kleno', nombre: 'Mousse Rulos Definidos con ácido hialurónico', nombreCorto: 'Mousse Rulos Definidos', tamano: '150 ml',
    categoria: 'mousses', precio: 19000, tn: 'mousse-kleno-1opmw',
    descripcion: 'Espuma definidora liviana enriquecida que hidrata, protege, controla el frizz y deja rulos definidos sin efecto rígido.' },
  { id: 'mousse-cantu', marca: 'Cantu', nombre: 'Shea Butter Wave Whip Curling Mousse', nombreCorto: 'Wave Whip Curling Mousse', tamano: '248 ml',
    categoria: 'mousses', precio: 43000, tn: 'mousse-cantu-1nr2o',
    descripcion: 'Mousse liviana sin sulfatos ni siliconas que define ondas y rulos sin dejar sensación acartonada, aportando volumen, suavidad y nutrición.' },

  // ── Activadores ──
  { id: 'activador-kleno', marca: 'Kleno', nombre: 'Perfect Curly Activador de Rulos en gel, Sin Enjuague', nombreCorto: 'Activador de Rulos en gel', tamano: '150 cc',
    categoria: 'activadores', precio: 8000, tn: 'activador-kleno-8vr8y',
    descripcion: 'Activador sin sulfatos, parabenos, siliconas ni petrolatos que disciplina, hidrata en profundidad y aporta volumen y brillo natural a rulos y ondas.' },
  { id: 'activador-cantu', marca: 'Cantu', nombre: 'Shea Butter Moisturizing Curl Activator Cream', nombreCorto: 'Curl Activator Cream', tamano: '355 ml',
    categoria: 'activadores', precio: 39000, tn: 'activador-de-rizos-cantu-1l82d',
    descripcion: 'Crema activadora formulada con manteca de karité pura que suaviza, aporta brillo y activa la forma natural de ondas, rulos y afros sin frizz.' },
  { id: 'salon-line-kids-chiclete', marca: 'Salon Line', nombre: 'S.O.S Cachos Kids Hidratação Chiclete Activador de Rulos', nombreCorto: 'S.O.S Cachos Kids Chiclete', tamano: '300 ml',
    categoria: 'activadores', precio: null, activo: false,
    descripcion: 'Activador infantil (+3 años) con aroma a chicle, pensado para hidratar, desenredar sin tirones y dar definición suave y brillo a rulos y ondas (2ABC a 4ABC).' },
  { id: 'salon-line-activadores', marca: 'Salon Line', nombre: 'Línea #todecacho Activadores de Rulos', nombreCorto: 'Activadores #todecacho', tamano: '300 ml',
    categoria: 'activadores', precio: null, activo: false,
    descripcion: 'Variedad de activadores cremosos para potenciar la forma, la suavidad y el control del frizz según el tipo de rulo u onda y el nivel de definición buscado.' },

  // ── Spray ──
  { id: 'spray-revitalizante', marca: 'Cantu', nombre: 'Shea Butter Comeback Curl Next Day Curl Revitalizer', nombreCorto: 'Comeback Curl Revitalizer', tamano: '355 ml',
    categoria: 'spray', precio: 25000, tn: 'spray-revitalizante-utpsi',
    descripcion: 'Spray revitalizador formulado con manteca de karité y vitaminas para refrescar la forma, devolver el brillo y controlar el frizz de ondas y rulos entre lavados.' },
  { id: 'han-tonificante-in-one', marca: 'HAN', nombre: 'Tonificante Multipropósito In One', nombreCorto: 'Tonificante In One', tamano: '200 cc',
    categoria: 'spray', precio: null, activo: false,
    descripcion: 'Tratamiento multifunción sin sulfatos, parabenos ni siliconas. Ayuda a nivelar la porosidad, controlar el frizz, facilitar el peinado y aportar protección térmica y solar, dejando brillo natural.' },
  { id: 'han-alfa-keratina-solucion', marca: 'HAN', nombre: 'Solución de Alfa Keratina Extra Ácida Anti Frizz', nombreCorto: 'Alfa Keratina Extra Ácida', tamano: '200 cc',
    categoria: 'spray', precio: null, activo: false,
    descripcion: 'Solución extra ácida con filtro solar que ayuda a sellar la cutícula, reducir el frizz y aportar brillo express con acabado liviano.' },
  { id: 'cascada-ginseng-bambu', marca: 'Cascada de Proteínas', nombre: 'Nutri-Reparación Instantánea Ginseng y Bambú', nombreCorto: 'Nutri-Reparación Ginseng', tamano: '120 ml',
    categoria: 'spray', precio: null, activo: false,
    descripcion: 'Spray reparador sin alcohol y con filtro solar formulado con proteínas de soja, lino y arroz más extractos de ginseng y bambú. Fortalece la fibra, controla el frizz y devuelve vitalidad al instante.' },
  { id: 'cascada-manzanilla-vainilla', marca: 'Cascada de Proteínas', nombre: 'Nutri-Reparación Instantánea Manzanilla y Vainilla', nombreCorto: 'Nutri-Reparación Manzanilla', tamano: '120 ml',
    categoria: 'spray', precio: null, activo: false,
    descripcion: 'Bruma capilar sin alcohol y con filtro solar a base de proteínas de soja, lino y arroz con extractos de manzanilla y vainilla para reparar, iluminar y controlar el frizz.' },

  // ── Satén ──
  { id: 'funda-saten', marca: 'Dream Hair', nombre: 'Fundas de Almohada de Satén Anti-Frizz', nombreCorto: 'Funda de almohada satén',
    categoria: 'saten', precio: 15000, foto: 'funda-saten',
    descripcion: 'Fundas suaves de satén que reducen la fricción al dormir para evitar el frizz, el quiebre y la pérdida de hidratación, ayudando a conservar la definición al despertar.' },
  { id: 'cofia-saten', marca: 'Dream Hair', nombre: 'Cofia de Satén Anti-Frizz (Varios Colores)', nombreCorto: 'Cofia de satén',
    categoria: 'saten', precio: 7000, foto: 'cofia-saten',
    descripcion: 'Gorro de satén suave con elástico cómodo que protege rulos y ondas durante el descanso, evitando el roce, el frizz y la pérdida de hidratación.' },

  // ── Óleos ──
  { id: 'oleos-pinga', marca: 'Lola Cosmetics', nombre: 'Pinga! Aceites Multifuncionales', nombreCorto: 'Pinga! Aceites', tamano: '50 ml',
    categoria: 'oleos', precio: 19000, foto: 'oleos-pinga',
    descripcion: 'Óleos multifuncionales de rápida absorción para usar solos, en la crema de peinar o en la máscara: Cenoura & Oliva (protección y brillo), Patauá & Moringa (pre y post shampoo, suavidad y luminosidad) y Açaí & Pracaxi (nutrición y reparación pre y post química).',
    variantes: [['Cenoura & Oliva','oleos-pinga-cenoura-oliva'],['Açaí & Pracaxi','oleos-pinga-acai'],['Patauá & Moringa','oleos-pinga-pataua']] },
  { id: 'han-suero-argan', marca: 'HAN', nombre: 'Suero Oleoso Argan Oil', nombreCorto: 'Suero Oleoso Argan Oil', tamano: '85 cc',
    categoria: 'oleos', precio: null, activo: false,
    descripcion: 'Tratamiento intensivo con aceite de argán y filtro solar pensado para nutrir cabellos secos y opacos, suavizar las puntas y dar brillo express.' },

  // ── Cepillos ── (asignaciones dudosas en docs/confirmar-con-mar.md)
  { id: 'cepillo-viral', nombre: 'Cepillo Definidor de Rulos y Ondas Anti-Frizz (Rosa)', nombreCorto: 'Cepillo Definidor Rosa',
    categoria: 'cepillos', precio: 16000, tn: 'cepillo-viral-qjdcu',
    descripcion: 'Cepillo específico para finalizar rulos y ondas, con bordes laterales dentados que ayudan a separar y armar mechones definidos con menos frizz.' },
  { id: 'cepillo-viral-flexible', nombre: 'Cepillo viral flexible', categoria: 'cepillos', precio: 13000, foto: 'cepillo-viral-flexible' },
  { id: 'cepillo-viral-doble', nombre: 'Cepillo viral doble', categoria: 'cepillos', precio: 13000, foto: 'cepillo-viral-doble' },
  { id: 'cepillo-viral-tenedor', nombre: 'Cepillo Definidor de Rulos y Ondas Anti-Frizz / tenedor', nombreCorto: 'Cepillo Definidor tenedor',
    categoria: 'cepillos', precio: 15000, foto: 'cepillo-viral-tenedor', destacado: true,
    descripcion: 'Cepillo específico para finalizar rulos y ondas con bordes laterales dentados que ayudan a armar mechones definidos, reducir el frizz y dar volumen desde la raíz con su peine tridente.' },
  { id: 'cepillo-detangle-bounce', nombre: 'Cepillo Definidor de Rulos y Ondas Anti-Frizz detangle (Fucsia)', nombreCorto: 'Cepillo Definidor Fucsia',
    categoria: 'cepillos', precio: 12000, tn: 'cepillo-detangle-bounce-1gg19',
    descripcion: 'Cepillo definidor con laterales ranurados diseñado para distribuir parejo el producto de finalización y formar rulos definidos y prolijos.' },
  { id: 'cepillo-maya-cuadrado', marca: 'Dompel', nombre: 'Cepillo Flexible Rectangular Desenredante', nombreCorto: 'Cepillo Flexible Rectangular',
    categoria: 'cepillos', precio: 12000, tn: 'cepillo-maya-cuadrado-1w57z',
    descripcion: 'Cepillo de cuerpo flexible y ventilado que se adapta al contorno de la cabeza para desenredar suavemente sin tirones ni quiebre.' },
  { id: 'cepillo-definidor-lila', marca: 'Dompel', nombre: 'Cepillo Definidor Flexible con Bordes Dentados (Lila)', nombreCorto: 'Cepillo Definidor Lila',
    categoria: 'cepillos', precio: null, activo: false, foto: 'cepillo-definidor-lila',
    descripcion: 'Combina cabezal flexible con bordes laterales dentados para desenredar y definir mechones de rulos y ondas en una sola pasada.' },
  { id: 'cepillo-pirulito', marca: 'Dompel', nombre: 'Cepillo Flexible Espiral Desenredante', nombreCorto: 'Cepillo Espiral',
    categoria: 'cepillos', precio: 8000, foto: 'cepillo-pirulito',
    descripcion: 'Cepillo ergonómico con cabezal en espiral flexible que acompaña el movimiento del cabello para desenredar con suavidad en húmedo o seco.' },
  { id: 'cepillo-pirulito-2', nombre: 'Cepillo Flexible Curvo Desenredante y Ventilado', nombreCorto: 'Cepillo Curvo Ventilado',
    categoria: 'cepillos', precio: 9000, tn: 'cepillo-pirulito-lo7tv',
    descripcion: 'Cepillo de diseño curvo y cabezal flexible que se amolda al cuero cabelludo para desenredar rápido sin tirar y favorecer el secado.' },
  { id: 'cepillo-magico', nombre: 'Cepillo Pulpo Desenredante para Rulos y Ondas', nombreCorto: 'Cepillo Pulpo',
    categoria: 'cepillos', precio: 12000, tn: 'cepillo-magico-ty1bj',
    descripcion: 'Cepillo de hileras flexibles independientes que se adaptan a cada mechón para desenredar fácil, reducir el frizz y marcar la definición natural.' },

  // ── Varios ──
  { id: 'turbante-microfibra', nombre: 'Turbante de Microfibra Anti-Frizz', nombreCorto: 'Turbante de microfibra',
    categoria: 'varios', precio: 13000, foto: 'turbante-microfibra',
    descripcion: 'Toalla tipo turbante de microfibra suave con botón de ajuste, ideal para absorber el exceso de agua sin fricción ni frizz y cuidar la forma del rulo.' },
].map((p) => {
  const imagen = img(p.foto || p.id);
  return {
    ...p,
    nombreCorto: p.nombreCorto || p.nombre,
    imagen,
    variantes: (p.variantes || []).map(([nombre, f]) => ({ nombre, imagen: f ? img(f) : imagen })),
  };
});

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
