// "Especial de Navidad" (promo de servicios, no va al carrito). Todo lo editable está acá: textos, precios,
// códigos y fechas. Se prende y se apaga sola por fecha, en el navegador, como el Black Friday
// (config/promo.js), sin deploy. Vista previa: ?promo=navidad-preview (simula el 28/11 al mediodía).
// Fechas con la zona de Argentina (-03:00). No se superpone con el Black Friday (termina el 27/11 23:59).
// En los textos, {precio} se reemplaza por el precio ("$70.000"), {codigo} y {nombre} por los de cada opción.
export const NAVIDAD = {
  desde: '2026-11-28T00:00:00-03:00',
  hasta: '2026-12-31T23:59:59-03:00',

  titulo: 'Especial de Navidad', // la última palabra va en cursiva dorada
  bajada: 'Regalate un look espectacular en diciembre.',
  precio: 70000,
  antes: 100000,
  incluye: 'Corte en seco + Finalización + Tratamiento profundo a elección',
  opciones: [
    { codigo: 'NAVIDADOZONO', nombre: 'Corte en seco + Ozonoterapia capilar' },
    { codigo: 'NAVIDADINFRARROJO', nombre: 'Corte en seco + Tratamiento infrarrojo' },
  ],
  letraChica: 'Válido para canjear durante diciembre con turno previo. Reservá con tu código.',

  // Barra de anuncio (reemplaza a los mensajes de siempre mientras dura). En mobile va partida en dos.
  anuncio: '🎄 Especial de Navidad · Corte + tratamiento {precio} · reservá con tu código',
  anuncioMobile: ['🎄 Especial de Navidad · {precio}', '🎄 Corte + tratamiento · reservá con tu código'],

  // WhatsApp de cada opción ("Reservar con este código")
  mensaje: '¡Hola Mar! 🎄 Quiero reservar turno con el código {codigo} ({nombre} · Especial de Navidad {precio}). ¿Qué días tenés?',
};

/** "$70.000" (así lo escribe Mar en los textos; en la página los precios van con formatPrecio). */
const precioTexto = (n) => `$${new Intl.NumberFormat('es-AR').format(n)}`;

/** Reemplaza {precio}, {codigo} y {nombre}. */
export const textoNavidad = (plantilla, opcion = {}) =>
  plantilla.replaceAll('{precio}', precioTexto(NAVIDAD.precio)).replaceAll('{codigo}', opcion.codigo ?? '').replaceAll('{nombre}', opcion.nombre ?? '');
