// Campaña de promociones en curso (lo que es de toda la tienda: barra de anuncio, sección del inicio, forma de
// pago y encabezado del pedido). Las promos de cada producto (precio promo, "antes", fechas, kits) las carga Mar
// desde /admin. Todo se prende y se apaga solo por fecha (en el navegador): no hace falta deploy.
// Fechas con la zona de Argentina (-03:00).
export const CAMPANA = {
  nombre: 'Black Friday',
  desde: '2026-11-24T00:00:00-03:00',
  hasta: '2026-11-27T23:59:59-03:00',
  // Barra de anuncio mientras dura (reemplaza a los mensajes de siempre). En mobile va partido en dos.
  anuncio: '🖤 BLACK FRIDAY · hasta el viernes 27/11 · solo efectivo o transferencia',
  anuncioMobile: ['🖤 BLACK FRIDAY · hasta el viernes 27/11', '🖤 Solo efectivo o transferencia'],
  // Con algún producto en promo en el carrito: solo estas formas de pago, con este aviso
  pagos: ['Efectivo', 'Transferencia'],
  avisoPago: 'Los precios Black Friday son solo con efectivo o transferencia',
  // Primera línea del mensaje de WhatsApp
  encabezadoPedido: '🖤 Pedido Black Friday',
};
