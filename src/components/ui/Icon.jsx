// Íconos SVG inline (sin fuentes de íconos: más livianos para Lighthouse).
const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  tienda: 'M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9zM9 8V6a3 3 0 0 1 6 0v2',
  rutina: 'M12 3c-3 4-6 6.5-6 10a6 6 0 0 0 12 0c0-3.5-3-6-6-10zM9.5 14.5a2.5 2.5 0 0 0 2.5 2.5',
  carrito: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2M10 21h.01M17 21h.01',
  buscar: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm9 3-4.3-4.3',
  cerrar: 'M6 6l12 12M18 6 6 18',
  mas: 'M12 5v14M5 12h14',
  menos: 'M5 12h14',
  flecha: 'M5 12h14m-6-6 6 6-6 6',
  flechaIzq: 'M19 12H5m6 6-6-6 6-6',
  check: 'm5 12.5 4.5 4.5L19 7',
  basura: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  ojo: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  camion: 'M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  tarjeta: 'M3 6h18v12H3zM3 10h18M7 15h3',
  regalo: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7S10.5 3 8 3.5 7 7 12 7zm0 0s1.5-4 4-3.5S17 7 12 7z',
  whatsapp:
    'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm-3.1 5.2c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5a6.6 6.6 0 0 0 3.3 2.9c.2.1.4 0 .5-.1l.7-.8c.1-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.4 0 .4-.1 1.2-.7 1.6-.6.4-1.5.6-2.6.2a9.6 9.6 0 0 1-5-4.5c-.5-1-.5-2 .1-2.8.3-.4.6-.4.8-.4z',
  play: 'M8 5.5v13l11-6.5z',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',
  estrella: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  // Lucide (trazo fino): barra de anuncio
  corazon: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z',
  camionFino: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  tarjetaFina: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM2 10h20',
  sonido: 'M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14',
  mudo: 'M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6',
  reloj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13.5V12l3 2',
  tijera:'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.1 8.1 20 20M8.1 15.9 20 4',
  abajo: 'm6 9 6 6 6-6',
  copiar: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  local: 'M3.5 9 5 4h14l1.5 5M4.5 9v11h15V9M3 9h18M10 20v-5h4v5',
  // Globito de chat (Lucide message-circle-more): botón de mini Mar
  chat: 'M7.9 20A9 9 0 1 0 4 16.1L2 22zM8 12h.01M12 12h.01M16 12h.01',
  instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5.5-9.5h.01',
};

export default function Icon({ name, size = 22, className = '', strokeWidth = 1.8, filled = false, ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  const relleno = filled || name === 'whatsapp' || name === 'play';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={relleno ? 'currentColor' : 'none'}
      stroke={relleno && name !== 'whatsapp' ? 'none' : 'currentColor'}
      strokeWidth={name === 'whatsapp' ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fillRule="evenodd"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
