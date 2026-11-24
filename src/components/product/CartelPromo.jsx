/**
 * Cartel de promo sobre la foto ("Black Friday"): píldora tinta con letra arena y un corazón, en la paleta de la
 * marca (nada de negro neón). Solo se dibuja con promo vigente.
 */
export default function CartelPromo({ promo, className = '' }) {
  if (!promo) return null;
  return (
    <span
      className={`pointer-events-none inline-flex items-center gap-1.5 rounded-full whitespace-nowrap bg-tinta px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-arena uppercase shadow-suave ${className}`}
    >
      <span aria-hidden="true">🖤</span>
      {promo.nombre}
    </span>
  );
}
