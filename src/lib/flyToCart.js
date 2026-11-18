// Animación del producto "volando" al ícono del carrito visible (header en desktop, bottom nav en mobile).
// Devuelve una promesa que resuelve al llegar (o al instante si no hay animación).
export function flyToCart(imgEl) {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const destino = [...document.querySelectorAll('[data-cart-target]')].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  if (reducido || !imgEl || !destino || !imgEl.animate) return Promise.resolve();

  const o = imgEl.getBoundingClientRect();
  const d = destino.getBoundingClientRect();
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
  const dy = d.top + d.height / 2 - (o.top + o.height / 2);
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
