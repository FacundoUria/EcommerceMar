// Chat de mini Mar (src/components/marca/ChatMar.jsx). Único lugar a editar: saludo, opciones y respuestas.
// Pensado para que lo use cualquiera (también personas mayores): un paso a la vez, botones grandes.
//
// Cada opción es un botón grande de la pantalla de inicio. Al tocarla se muestra SOLO su respuesta:
// - texto: párrafos del mensaje de Mar
// - servicio: id de un servicio (src/data/products.js) → mini-card con foto y duración
// - accion: el botón principal (uno solo):
//     { tipo: 'whatsapp', label, mensaje }   abre WhatsApp con ese mensaje
//     { tipo: 'reservar' }                   "¡Reservar!" del servicio (WhatsApp "Quiero reservar: …")
//     { tipo: 'pagina', label, to }          va a una página del sitio
// - link: { label, to } → link chico opcional debajo del botón principal
// Una opción con `whatsapp` (sin respuesta) abre WhatsApp directo: es el botón verde.

export const CHAT = {
  nombre: 'Mar · Coach de rulos',
  estado: 'en línea',
  saludo: '¡Hola! Soy Mar, tu coach de rulos 💚 ¿En qué te ayudo?',
  volver: '← Volver a las opciones',

  opciones: [
    {
      id: 'productos',
      icono: '🧴',
      texto: 'Productos para mi pelo',
      respuesta: {
        texto: ['¡Cada rulo es único! Contame cómo es tu pelo y te recomiendo lo ideal ✨'],
        accion: { tipo: 'whatsapp', label: 'Seguir por WhatsApp', mensaje: '¡Hola Mar! Necesito productos para mi tipo de cabello' },
        link: { label: 'o armá tu rutina', to: '/rutina' },
      },
    },
    {
      id: 'frizz',
      icono: '🦁',
      texto: 'Tengo frizz',
      respuesta: {
        texto: ['¡Tranqui, el frizz tiene solución! 🦁 Contame cómo es tu rutina y te ayudo.'],
        accion: { tipo: 'whatsapp', label: 'Seguir por WhatsApp', mensaje: '¡Hola Mar! Ya no sé qué hacer con el frizz' },
      },
    },
    {
      id: 'corte',
      icono: '✂️',
      texto: 'Quiero un corte',
      respuesta: {
        texto: ['El corte en seco respeta la forma natural de tus rulos ✂️'],
        servicio: 'corte-rulos',
        accion: { tipo: 'reservar' },
      },
    },
    {
      id: 'asesoramiento',
      icono: '💎',
      texto: 'Asesoramiento completo',
      respuesta: {
        texto: ['¡Es la mejor forma de empezar! 💖'],
        servicio: 'asesoramiento-completo',
        accion: { tipo: 'reservar' },
        link: { label: 'Ver todos los asesoramientos', to: '/servicios' },
      },
    },
    {
      id: 'envios',
      icono: '📦',
      texto: 'Envíos y pagos',
      respuesta: {
        texto: [
          '📦 Enviamos a toda la provincia de Mendoza (el costo lo coordinás conmigo) o podés retirar en el estudio.',
          '💳 Aceptamos todos los medios de pago.',
          "Para comprar: agregá productos al carrito y tocá 'Finalizar pedido', me llega todo por WhatsApp 💚",
        ],
        accion: { tipo: 'pagina', label: 'Ver productos', to: '/tienda' },
      },
    },
    {
      id: 'whatsapp',
      icono: '💬',
      texto: 'Hablar con Mar',
      whatsapp: '¡Hola Mar! Tengo una consulta.',
    },
  ],
};

/** Opción por id (para volver a la pantalla guardada en la sesión). */
export const opcionChat = (id) => CHAT.opciones.find((o) => o.id === id && o.respuesta) ?? null;
