import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import Icon from '../ui/Icon.jsx';
import CartBadge from './CartBadge.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { NEGOCIO } from '../../config/negocio.js';

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/tienda', label: 'Tienda' },
  { to: '/rutina', label: 'Rutina' },
  { to: '/servicios', label: 'Servicios' },
];

export default function Header() {
  const { abrir, cantidadTotal } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-arena border-b border-linea shadow-[0_4px_24px_-12px_rgb(34_56_43/0.18)]' : 'glass-arena border-b border-transparent'
      }`}
    >
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-full focus:bg-verde focus:px-4 focus:py-2 focus:text-arena">
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 rounded-full" aria-label={`${NEGOCIO.nombre} — inicio`}>
          <img src="/img/marca/LOGO-sm.webp" alt="" width="44" height="44" className="size-10 rounded-full mix-blend-multiply md:size-11" />
          <span className="leading-none">
            <span className="block font-serif text-xl font-semibold tracking-tight text-tinta md:text-2xl">{NEGOCIO.nombre}</span>
            <span className="block text-[10px] font-bold tracking-[0.28em] text-dorado uppercase">{NEGOCIO.bajada}</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `relative rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-salvia ${isActive ? 'bg-salvia text-verde' : 'text-texto-suave hover:text-tinta'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-verde" />}
                    </>
                  )}
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
          <button
            type="button"
            onClick={abrir}
            aria-label={`Abrir carrito (${cantidadTotal} productos)`}
            className="relative flex size-11 items-center justify-center rounded-full text-tinta transition hover:bg-salvia active:scale-90"
          >
            <span data-cart-target className="relative">
              <Icon name="carrito" />
              <CartBadge />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
