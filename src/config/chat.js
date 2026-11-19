// Chat guiado de mini Mar (src/components/marca/ChatMar.jsx). Único lugar a editar: guion, opciones y
// respuestas. Los textos de Mar van tal cual.
//
// Cada respuesta puede sumar, debajo del texto:
// - servicios: ids de src/data/products.js → mini-card con foto, duración y "¡Reservar!" (WhatsApp)
// - whatsapp: { label, mensaje } → botón verde que abre WhatsApp con ese mensaje
// - boton: { label, to } → botón a una página del sitio
// - link: { label, to } → link de texto a una página del sitio

export const CHAT = {
  nombre: 'Mar · Coach de rulos',
  estado: 'en línea',
  placeholder: 'Elegí una opción 👇',
  pie: { texto: '¿Otra duda? Escribile a Mar por WhatsApp', mensaje: '¡Hola Mar! Tengo una consulta.' },
  // Mensaje del ícono de WhatsApp del header
  whatsappHeader: '¡Hola Mar! Tengo una consulta.',

  // Al abrir por primera vez en la sesión, con "escribiendo…" entre mensajes.
  // de: 'mar' | 'ejemplo' (burbuja de ejemplo de una clienta: derecha, más tenue)
  guion: [
    { de: 'mar', texto: '¡Hola! Soy Mar, tu coach de rulos' },
    {
      de: 'ejemplo',
      texto: 'Hola Mar 🥺 Estoy desesperada, ¡no sé qué hacer con mis rulos! 😩 Tengo frizz y están súper secos. ¿Me ayudas?',
    },
    { de: 'mar', texto: '¡Hola! Estoy acá para ayudarte a recuperar tus rulos. ¿Qué necesitás hoy? 👇' },
  ],

  grupos: [
    {
      titulo: '',
      opciones: [
        {
          id: 'productos',
          texto: '🧴 Necesito productos para mi tipo de cabello ✨',
          respuesta: {
            texto: '¡Cada rulo es único! Contame un poco de tu pelo y te recomiendo lo ideal ✨',
            whatsapp: { label: 'Seguir por WhatsApp', mensaje: '¡Hola Mar! Necesito productos para mi tipo de cabello' },
            link: { label: 'Mientras tanto, armá tu rutina →', to: '/rutina' },
          },
        },
        {
          id: 'frizz',
          texto: '🦁 Ya no sé qué hacer con el FRIZZ',
          respuesta: {
            texto: '¡Tranqui, el frizz tiene solución! 🦁 Contame cómo es tu rutina y te ayudo.',
            whatsapp: { label: 'Seguir por WhatsApp', mensaje: '¡Hola Mar! Ya no sé qué hacer con el frizz' },
            link: { label: 'Ver productos anti-frizz →', to: '/tienda?q=frizz' },
          },
        },
        {
          id: 'corte',
          texto: '✂️ Necesito corte y forma ✂️',
          respuesta: {
            texto: '¡Te entiendo! El corte en seco respeta la forma natural de tus rulos ✂️',
            servicios: ['corte-rulos'],
          },
        },
        {
          id: 'asesoramiento',
          texto: '💎 Necesito un ASESORAMIENTO COMPLETO 💖',
          respuesta: {
            texto: '¡Es la mejor forma de empezar! 💖',
            servicios: ['asesoramiento-completo', 'asesoramiento-deluxe'],
          },
        },
      ],
    },
    {
      titulo: 'Preguntas frecuentes',
      opciones: [
        {
          id: 'envios',
          texto: '¿Hacen envíos?',
          respuesta: {
            texto:
              '¡Sí! Enviamos a toda la provincia de Mendoza 📦🛵 El costo del envío lo coordinás conmigo por WhatsApp cuando hacés el pedido. También podés retirar en el estudio.',
          },
        },
        {
          id: 'pago',
          texto: '¿Cómo pago?',
          respuesta: {
            texto:
              'Aceptamos todos los medios de pago 💰 Cuando terminás tu pedido me llega por WhatsApp y ahí coordinamos cómo te queda más cómodo.',
          },
        },
        {
          id: 'compra',
          texto: '¿Cómo compro?',
          respuesta: {
            texto:
              "Súper fácil: agregá productos al carrito, tocá 'Finalizar pedido', completá tu nombre y si querés envío o retiro, y me llega todo por WhatsApp 💚",
            boton: { label: 'Ir a la tienda', to: '/tienda' },
          },
        },
        {
          id: 'turno',
          texto: '¿Cómo saco turno?',
          respuesta: {
            texto:
              "Elegí el servicio que necesitás y tocá '¡Reservar!': me escribís directo por WhatsApp y coordinamos día y horario ✂️",
            boton: { label: 'Ver servicios', to: '/servicios' },
          },
        },
        {
          id: 'donde',
          texto: '¿Dónde están?',
          respuesta: {
            texto: 'Estamos en Mendoza 📍 Escribime y te paso la dirección y los horarios del estudio.',
            whatsapp: { label: 'Escribile a Mar', mensaje: '¡Hola Mar! ¿Me pasás la dirección y los horarios del estudio?' },
          },
        },
      ],
    },
  ],
};

/** Opción por id (para reconstruir la conversación guardada en la sesión). */
export const opcionChat = (id) => CHAT.grupos.flatMap((g) => g.opciones).find((o) => o.id === id) ?? null;
