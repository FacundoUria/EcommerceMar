// Pedido por WhatsApp (decisión de Mar: no hay pago online; el pedido le llega a su WhatsApp y ella
// coordina pago y entrega). Funciones puras: número de pedido, envío, mensaje y link.
import { formatPrecio, plural } from './format.js';
import { whatsappCon } from '../config/negocio.js';
import { departamentoEnvio, localidadEnvio, localidadesDe } from '../config/envios.js';

/** Si el mensaje pasa este largo, además del link se ofrece "Copiar pedido" (WhatsApp puede cortarlo). */
export const LARGO_MAXIMO = 1800;

/** Número de pedido corto y aleatorio: DH-XXXX */
export const numeroPedido = () => `DH-${Math.floor(1000 + Math.random() * 9000)}`;

/**
 * Envío del pedido según la entrega elegida. null = retiro en el estudio, o envío sin departamento/localidad
 * todavía. Si no: { depto, localidad (null si el departamento no tiene tarifa; "Otra / no sé" tiene
 * `otra: true`), precio (el de la zona de la localidad; null = a coordinar) }.
 */
export function envioDe({ entrega, departamento, localidad }) {
  if (entrega !== 'envio') return null;
  const depto = departamentoEnvio(departamento);
  if (!depto) return null;
  if (!localidadesDe(depto).length) return { depto, localidad: null, precio: null };
  const l = localidadEnvio(depto, localidad);
  return l ? { depto, localidad: l, precio: l.precio } : null;
}

/**
 * Mensaje en texto plano con el formato de WhatsApp (*negrita*). `datos`: { nombre, entrega ('envio' |
 * 'retiro'), direccion, departamento, localidad, pago, nota }. Precios con el mismo formato ARS del sitio.
 */
export function armarMensaje({ lineas, datos, numero, encabezado = null }) {
  const items = lineas.map((l) => {
    // Con la marca adelante: los nombres cortos no la llevan ("Cantu Comeback Curl Revitalizer")
    const conMarca = l.marca && l.marca !== 'Dream Hair' ? `${l.marca} ${l.nombre}` : l.nombre;
    // Variante y lo elegido en un kit: "Kit El preferido (Shampoo: X, Skala: Y)"; sin selector de color:
    // "Kit Antifrizz (color a coordinar)"
    const detalle = [l.variante, ...(l.elecciones ?? []).map(([k, v]) => `${k}: ${v}`), l.colorACoordinar && 'color a coordinar']
      .filter(Boolean)
      .join(', ');
    const nombre = detalle ? `${conMarca} (${detalle})` : conMarca;
    return l.cantidad > 1
      ? `• ${l.cantidad} × ${nombre} — ${formatPrecio(l.precio)} c/u = ${formatPrecio(l.precio * l.cantidad)}`
      : `• 1 × ${nombre} — ${formatPrecio(l.precio)}`;
  });
  const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
  const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const envio = envioDe(datos);
  const conCosto = envio?.precio != null;
  const partes = [
    '¡Hola Mar! 👋 Quiero hacer este pedido:',
    // Con productos en promo de la campaña: "🖤 Pedido Black Friday DH-1234"
    encabezado ? `*${encabezado} ${numero}*` : `*Pedido ${numero}*`,
    '',
    ...items,
    '',
    // Con costo de envío, el total de los productos pasa a ser el subtotal (el total va abajo, con el envío)
    `*${conCosto ? 'Subtotal' : 'Total'}: ${formatPrecio(total)}* (${lineas.length === 1 ? '1 producto' : `${lineas.length} productos distintos`}, ${plural(unidades, 'unidad', 'unidades')})`,
    '',
    `👤 Nombre: ${datos.nombre.trim()}`,
  ];
  if (envio) {
    // Solo la localidad elegida ("Otra / no sé" y los departamentos sin tarifa: sin localidad)
    const localidad = envio.localidad && !envio.localidad.otra ? `, ${envio.localidad.nombre}` : '';
    partes.push(
      `📦 Entrega: Envío a domicilio — ${datos.direccion.trim()}${localidad} (${envio.depto.nombre})`,
      `🚚 Envío: ${conCosto ? formatPrecio(envio.precio) : 'a coordinar'}`,
    );
    if (conCosto) partes.push(`*Total con envío: ${formatPrecio(total + envio.precio)}*`);
  } else {
    partes.push('🏠 Entrega: Retiro en el estudio');
  }
  if (datos.pago) partes.push(`💳 Pago: ${datos.pago}`);
  if (datos.nota?.trim()) partes.push(`📝 Nota: ${datos.nota.trim()}`);
  return partes.join('\n');
}

/** Link de WhatsApp al estudio con el mensaje (URL-encoded). */
export const linkPedido = (texto) => whatsappCon(texto);

/** Errores de validación por campo ({} si está todo bien). Retiro: solo el nombre. */
export function validarDatos(d) {
  const e = {};
  if (d.nombre.trim().length < 3) e.nombre = 'Escribí tu nombre y apellido';
  if (!d.entrega) e.entrega = 'Elegí cómo querés recibir tu pedido';
  if (d.entrega === 'envio') {
    const depto = departamentoEnvio(d.departamento);
    if (!depto) e.departamento = 'Elegí el departamento';
    else if (localidadesDe(depto).length && !localidadEnvio(depto, d.localidad)) e.localidad = 'Elegí tu localidad o barrio';
    if (d.direccion.trim().length < 4) e.direccion = 'Escribí la dirección de entrega';
  }
  return e;
}

// Datos que se guardan para precargar la próxima vez (solo los de la entrega, con try/catch)
const CLAVE = 'dreamhair:datos-pedido:v1';
export function leerDatosGuardados() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    // Departamento por id (los pedidos viejos lo guardaban por nombre); localidad solo si sigue existiendo
    const depto = typeof d.departamento === 'string' ? departamentoEnvio(d.departamento) : null;
    return {
      nombre: typeof d.nombre === 'string' ? d.nombre : '',
      entrega: d.entrega === 'envio' || d.entrega === 'retiro' ? d.entrega : '',
      direccion: typeof d.direccion === 'string' ? d.direccion : '',
      departamento: depto?.id ?? '',
      localidad: localidadEnvio(depto, d.localidad)?.id ?? '',
    };
  } catch {
    return {};
  }
}
export function guardarDatos({ nombre, entrega, direccion, departamento, localidad }) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ nombre, entrega, direccion, departamento, localidad }));
  } catch {
    /* sin localStorage: no se precarga la próxima vez */
  }
}
