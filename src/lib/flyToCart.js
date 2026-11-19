// Animación del producto "volando" al ícono del carrito visible (el del header; en /producto mobile puede
// ser el de la barra de "Agregar"). Si el header está oculto por el scroll, lo muestra un momento
// (evento dh:mostrar-header) y apunta a donde va a quedar el carrito cuando termine de entrar.
// Devuelve una promesa que resuelve al llegar (o al instante si no hay animación).
export function flyToCart(imgEl) {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const destino = [...document.querySelectorAll('[data-cart-target]')].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  const header = destino?.closest('header');
  const headerOculto = !!header && document.documentElement.dataset.header === 'oculto';
  // Aunque no haya vuelo (sin imagen), el header aparece para que se vea el badge
  if (headerOculto) window.dispatchEvent(new CustomEvent('dh:mostrar-header'));
  if (reducido || !imgEl || !destino || !imgEl.animate) return Promise.resolve();

  const o = imgEl.getBoundingClientRect();
  const d = destino.getBoundingClientRect();
  // El header oculto está corrido -100%; al volver queda en su posición compacta (-8px)
  const ajusteY = headerOculto ? -new DOMMatrixReadOnly(getComputedStyle(header).transform).m42 - 8 : 0;
  const lado = Math.min(o.width, o.height, 220);

  const clon = document.createElement('img');
  clon.src = imgEl.currentSrc || imgEl.src;
  clon.alt = '';
  Object.assign(clon.style, {
    position: 'fixed',
    left: `${o.left + (o.width - lado) / 2}px`,
    top: `${o.top + (o.height - lado) / 2}px`,
    width: `${lado}px`,
    height: `${lado}px`,
    objectFit: 'cover',
    borderRadius: '24px',
    zIndex: 9999,
    pointerEvents: 'none',
    boxShadow: '0 18px 48px -12px rgb(34 56 43 / 0.3)',
    background: '#fff',
  });
  document.body.appendChild(clon);

  const dx = d.left + d.width / 2 - (o.left + o.width / 2);
  const dy = d.top + ajusteY + d.height / 2 - (o.top + o.height / 2);
  const anim = clon.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1, borderRadius: '24px' },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 80}px) scale(0.55)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.4, borderRadius: '50%' },
    ],
    { duration: 750, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
  );
  return anim.finished.catch(() => {}).finally(() => clon.remove());
}
