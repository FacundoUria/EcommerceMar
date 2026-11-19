import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import Roll from '../ui/Roll.jsx';
import Destellos from '../marca/Destellos.jsx';

const DESTELLO_LOGO = [{ x: '78%', y: '-14%', tam: 12 }];
import CartBadge from './CartBadge.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { NEGOCIO } from '../../config/negocio.js';
import { imgFija } from '../../lib/imagenes.js';

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/tienda', label: 'Tienda' },
  { to: '/rutina', label: 'Rutina' },
  { to: '/servicios', label: 'Servicios' },
];

const EASE = [0.22, 1, 0.36, 1];
const COMPACTO_DESDE = 40; // px de scroll para achicar el header
const OCULTAR_DESDE = 120; // no se oculta en el primer tramo de la página

export default function Header() {
  const { abrir, cantidadTotal } = useCart();
  const reducido = useReducedMotion();
  const { scrollY } = useScroll();
  const [compacto, setCompacto] = useState(false);
  const [oculto, setOculto] = useState(false);
  const ultimo = useRef(0);

  // Se achica después de 40px; se oculta al bajar y reaparece al subir.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - ultimo.current;
    ultimo.current = y;
    setCompacto(y > COMPACTO_DESDE);
    if (reducido) return; // con movimiento reducido el header queda fijo, sin ocultarse
    if (Math.abs(delta) < 4) return; // evita temblores
    setOculto(delta > 0 && y > OCULTAR_DESDE);
  });

  // Otros elementos sticky (barra de filtros de /tienda) acompañan al header.
  useEffect(() => {
    document.documentElement.dataset.header = oculto ? 'oculto' : compacto && !reducido ? 'compacto' : '';
  }, [oculto, compacto, reducido]);

  const desplazamiento = oculto ? '-100%' : compacto && !reducido ? -8 : 0;

  return (
    <m.header
      initial={false}
      animate={{ y: desplazamiento }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`glass-arena sticky top-0 z-40 border-b transition-[border-color,box-shadow] duration-500 ${
        compacto ? 'border-linea shadow-[0_4px_24px_-12px_rgb(34_56_43/0.18)]' : 'border-transparent'
      }`}
    >
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-full focus:bg-verde focus:px-4 focus:py-2 focus:text-arena">
        Saltar al contenido
      </a>
      <m.div
        initial={false}
        animate={{ y: compacto && !reducido ? 4 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="contenedor flex h-16 items-center justify-between gap-4 md:h-20"
      >
        <Link to="/" className="rounded-full" aria-label={`${NEGOCIO.nombre} — inicio`}>
          <m.span
            initial={false}
            animate={{ scale: compacto && !reducido ? 0.86 : 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex origin-left items-center gap-2.5"
          >
          <span className="relative shrink-0">
            <img {...imgFija('/img/marca/LOGO.webp', 44)} alt="" width="44" height="44" className="size-10 rounded-full mix-blend-multiply md:size-11" />
            <Destellos puntos={DESTELLO_LOGO} />
          </span>
          <span className="leading-none">
            <span className="block font-serif text-xl font-semibold tracking-tight text-tinta md:text-2xl">{NEGOCIO.nombre}</span>
            <span className="block text-[10px] font-bold tracking-[0.28em] text-dorado uppercase">{NEGOCIO.bajada}</span>
          </span>
          </m.span>
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-2 lg:gap-4">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `subrayado px-3 py-2 text-[15px] font-semibold transition-colors duration-300 ${isActive ? 'text-verde' : 'text-texto-suave hover:text-tinta'}`
                  }
                >
                  <Roll>{l.label}</Roll>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            to="/tienda?buscar=1"
            aria-label="Buscar productos"
            className="flex size-11 items-center justify-center rounded-full text-tinta transition hover:bg-salvia active:scale-90"
          >
            <Icon name="buscar" />
          </Link>
          {/* Carrito: solo desktop. En mobile está en el bottom nav (y en /producto, en la barra de "Agregar") */}
          <button
            type="button"
            onClick={abrir}
            aria-label={`Abrir carrito (${cantidadTotal} productos)`}
            className="relative hidden size-11 items-center justify-center rounded-full text-tinta transition hover:bg-salvia active:scale-90 md:flex"
          >
            <span data-cart-target className="relative">
              <Icon name="carrito" />
              <CartBadge />
            </span>
          </button>
        </div>
      </m.div>
    </m.header>
  );
}
