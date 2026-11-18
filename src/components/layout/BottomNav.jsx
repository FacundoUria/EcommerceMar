import { NavLink, useLocation } from 'react-router';
import { m } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import CartBadge from './CartBadge.jsx';
import { useCart } from '../../context/CartContext.jsx';

const ITEMS = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/tienda', label: 'Tienda', icon: 'tienda' },
  { to: '/rutina', label: 'Rutina', icon: 'rutina' },
  { to: '/carrito', label: 'Carrito', icon: 'carrito', carrito: true },
];

/** Navegación inferior tipo app (solo mobile). */
export default function BottomNav() {
  const { cantidadTotal } = useCart();
  const { pathname } = useLocation();
  // En el detalle de producto la barra "Agregar al carrito" ocupa su lugar
  if (pathname.startsWith('/producto/')) return null;
  return (
    <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-500 ease-out in-data-[overlay=abierto]:pointer-events-none in-data-[overlay=abierto]:translate-y-[calc(100%+1.5rem)] md:hidden">
      <ul className="glass-arena mx-auto flex max-w-md items-center justify-around rounded-full px-2 py-1.5 shadow-flotante">
        {ITEMS.map((it) => (
          <li key={it.to} className="flex-1">
            <NavLink
              to={it.to}
              end={it.end}
              aria-label={it.carrito ? `Carrito (${cantidadTotal} productos)` : undefined}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-semibold transition active:scale-90 ${
                  isActive ? 'text-verde' : 'text-tinta'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <m.span
                      layoutId="bottomnav-activo"
                      className="absolute inset-0 rounded-full bg-salvia"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative" {...(it.carrito ? { 'data-cart-target': '' } : {})}>
                    <Icon name={it.icon} size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                    {it.carrito && <CartBadge />}
                  </span>
                  <span className="relative">{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
