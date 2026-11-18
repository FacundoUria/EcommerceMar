import { NavLink } from 'react-router';
import { motion } from 'motion/react';
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
  return (
    <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <ul className="glass-oscuro mx-auto flex max-w-md items-center justify-around rounded-full px-2 py-1.5 shadow-flotante">
        {ITEMS.map((it) => (
          <li key={it.to} className="flex-1">
            <NavLink
              to={it.to}
              end={it.end}
              aria-label={it.carrito ? `Carrito (${cantidadTotal} productos)` : undefined}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-semibold transition active:scale-90 ${
                  isActive ? 'text-verde' : 'text-crema/75'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottomnav-activo"
                      className="absolute inset-0 rounded-full bg-amarillo"
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
