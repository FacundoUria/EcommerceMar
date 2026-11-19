// Pedido por WhatsApp (decisión de Mar: no hay pago online; el pedido le llega a su WhatsApp y ella
// coordina pago y entrega). Funciones puras: número de pedido, mensaje y link.
import { formatPrecio, plural } from './format.js';
import { whatsappCon } from '../config/negocio.js';

/** Si el mensaje pasa este largo, además del link se ofrece "Copiar pedido" (WhatsApp puede cortarlo). */
export const LARGO_MAXIMO = 1800;

/** Número de pedido corto y aleatorio: DH-XXXX */
export const numeroPedido = () => `DH-${Math.floor(1000 + Math.random() * 9000)}`;

/**
 * Mensaje en texto plano con el formato de WhatsApp (*negrita*). `datos`: { nombre, entrega ('envio' |
 * 'retiro'), direccion, departamento, pago, nota }. Precios con el mismo formato ARS del sitio.
 */
export function armarMensaje({ lineas, datos, numero }) {
  const items = lineas.map((l) => {
    const nombre = l.variante ? `${l.nombre} (${l.variante})` : l.nombre;
    return l.cantidad > 1
      ? `• ${l.cantidad} × ${nombre} — ${formatPrecio(l.precio)} c/u = ${formatPrecio(l.precio * l.cantidad)}`
      : `• 1 × ${nombre} — ${formatPrecio(l.precio)}`;
  });
  const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
  const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const partes = [
    '¡Hola Mar! 👋 Quiero hacer este pedido:',
    `*Pedido ${numero}*`,
    '',
    ...items,
    '',
    `*Total: ${formatPrecio(total)}* (${lineas.length === 1 ? '1 producto' : `${lineas.length} productos distintos`}, ${plural(unidades, 'unidad', 'unidades')})`,
    '',
    `👤 Nombre: ${datos.nombre.trim()}`,
    datos.entrega === 'envio'
      ? `📦 Entrega: Envío a domicilio — ${datos.direccion.trim()}, ${datos.departamento}`
      : '🏠 Entrega: Retiro en el estudio',
  ];
  if (datos.pago) partes.push(`💳 Pago: ${datos.pago}`);
  if (datos.nota?.trim()) partes.push(`📝 Nota: ${datos.nota.trim()}`);
  return partes.join('\n');
}

/** Link de WhatsApp al estudio con el mensaje (URL-encoded). */
export const linkPedido = (texto) => whatsappCon(texto);

/** Errores de validación por campo ({} si está todo bien). */
export function validarDatos(d) {
  const e = {};
  if (d.nombre.trim().length < 3) e.nombre = 'Escribí tu nombre y apellido';
  if (!d.entrega) e.entrega = 'Elegí cómo querés recibir tu pedido';
  if (d.entrega === 'envio') {
    if (d.direccion.trim().length < 4) e.direccion = 'Escribí la dirección de entrega';
    if (!d.departamento) e.departamento = 'Elegí el departamento';
  }
  return e;
}

// Datos que se guardan para precargar la próxima vez (solo los de la entrega, con try/catch)
const CLAVE = 'dreamhair:datos-pedido:v1';
export function leerDatosGuardados() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    return {
      nombre: typeof d.nombre === 'string' ? d.nombre : '',
      entrega: d.entrega === 'envio' || d.entrega === 'retiro' ? d.entrega : '',
      direccion: typeof d.direccion === 'string' ? d.direccion : '',
      departamento: typeof d.departamento === 'string' ? d.departamento : '',
    };
  } catch {
    return {};
  }
}
export function guardarDatos({ nombre, entrega, direccion, departamento }) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ nombre, entrega, direccion, departamento }));
  } catch {
    /* sin localStorage: no se precarga la próxima vez */
  }
}
