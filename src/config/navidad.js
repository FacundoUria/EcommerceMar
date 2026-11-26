// "Especial de Navidad" (promo de servicios, no va al carrito). Todo lo editable está acá: textos, precios,
// códigos y fechas. Se prende y se apaga sola por fecha, en el navegador, como el Black Friday
// (config/promo.js), sin deploy. Vista previa: ?promo=navidad-preview (simula el primer día sin el Black Friday,
// el 28/11, al mediodía). Fechas con la zona de Argentina (-03:00). Desde el 25/11 (pedido de Mar: ya agenda
// turnos de diciembre): hasta el viernes 27/11 23:59 convive con el Black Friday (en el inicio va debajo de él y
// la barra de anuncio rota los dos mensajes).
// En los textos, {precio} se reemplaza por el precio ("$70.000"), {codigo} y {nombre} por los de cada opción.
// Ojo (Mar, 26/11): su "corte + tratamiento" común vale $63.000. En la promo NUNCA "corte + tratamiento" a secas
// (parece más caro): siempre con ozonoterapia o infrarrojo.
export const NAVIDAD = {
  desde: '2026-11-25T00:00:00-03:00',
  hasta: '2026-12-31T23:59:59-03:00',

  titulo: 'Súper combo navideño', // la última palabra va en cursiva dorada
  bajada: 'Corte en seco + finalización + tratamiento de ozonoterapia o infrarrojo',
  precio: 70000,
  antes: 100000,
  incluye: '', // "Incluye: …" debajo de la bajada (vacío = no se muestra: la bajada ya dice qué trae)
  // Una card por opción: el nombre va arriba del precio
  opciones: [
    { codigo: 'NAVIDADOZONO', nombre: 'Corte + Ozonoterapia capilar' },
    { codigo: 'NAVIDADINFRARROJO', nombre: 'Corte + Tratamiento infrarrojo' },
  ],
  letraChica: 'Válido para canjear durante diciembre con turno previo. Reservá con tu código.',

  // Barra de anuncio (reemplaza a los mensajes de siempre mientras dura; con el Black Friday, rotan los dos). En
  // mobile va partida en dos.
  anuncio: '🎄 Súper combo navideño · corte + ozono o infrarrojo {precio} · reservá con tu código',
  anuncioMobile: ['🎄 Súper combo navideño · reservá con tu código', '🎄 Corte + ozono o infrarrojo {precio}'],

  // WhatsApp de cada opción ("Reservar con este código")
  mensaje: '¡Hola Mar! 🎄 Quiero reservar turno con el código {codigo} ({nombre} · Súper combo navideño {precio}). ¿Qué días tenés?',
};

/** "$70.000" (así lo escribe Mar en los textos; en la página los precios van con formatPrecio). */
const precioTexto = (n) => `$${new Intl.NumberFormat('es-AR').format(n)}`;

/** Reemplaza {precio}, {codigo} y {nombre}. */
export const textoNavidad = (plantilla, opcion = {}) =>
  plantilla.replaceAll('{precio}', precioTexto(NAVIDAD.precio)).replaceAll('{codigo}', opcion.codigo ?? '').replaceAll('{nombre}', opcion.nombre ?? '');
