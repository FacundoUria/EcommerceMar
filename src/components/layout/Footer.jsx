import { useRef } from 'react';
import { Link } from 'react-router';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import { NEGOCIO } from '../../config/negocio.js';

const LINKS = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/rutina', label: 'Rutina' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/carrito', label: 'Carrito' },
];

/**
 * Footer de borde a borde: degradé arena → salvia con grano. Abajo, "Dream Hair" en Playfair
 * gigante (18vw) en salvia-media, a todo el ancho y cortado abajo, que sube con parallax al llegar al final.
 */
export default function Footer() {
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const yMarca = useTransform(scrollYProgress, [0, 1], ['45%', '0%']);

  return (
    <footer ref={ref} className="fondo-salvia-abajo grano overflow-hidden pt-16 md:pt-24">
      <div className="contenedor text-tinta">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-4xl md:text-5xl">{NEGOCIO.nombre}</p>
            <p className="text-xs font-bold tracking-[0.28em] text-dorado uppercase">{NEGOCIO.bajada}</p>
          </div>
          <nav aria-label="Pie de página">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link className="text-tinta hover:text-verde" to={l.to}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm text-texto-suave">
            {NEGOCIO.direccion && <p>{NEGOCIO.direccion}</p>}
            {NEGOCIO.horarios && <p>{NEGOCIO.horarios}</p>}
            <div className={`flex flex-wrap gap-2 ${NEGOCIO.direccion || NEGOCIO.horarios ? 'mt-4' : ''}`}>
              <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primario">
                <Icon name="whatsapp" size={18} /> WhatsApp
              </a>
              <a href={NEGOCIO.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-borde">
                <Icon name="instagram" size={18} /> Instagram
              </a>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-linea pt-5 text-xs text-texto-suave">
          © {new Date().getFullYear()} {NEGOCIO.nombre} · {NEGOCIO.ciudad}
        </p>
      </div>

      {/* Marca gigante, decorativa: cortada abajo (el contenedor muestra ~72% de la altura de la letra) */}
      <div aria-hidden="true" className="mt-8 h-[13vw] overflow-hidden md:mt-12">
        <m.p
          style={{ y: reducido ? 0 : yMarca }}
          className="text-center font-serif text-[18vw] leading-[0.95] tracking-[-0.03em] whitespace-nowrap text-salvia-media select-none"
        >
          {NEGOCIO.nombre}
        </m.p>
      </div>
      {/* espacio para el bottom nav en mobile */}
      <div className="h-24 md:hidden" aria-hidden="true" />
    </footer>
  );
}
