import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { AnimatePresence, m } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import CartBadge from './CartBadge.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { whatsappCon } from '../../config/negocio.js';
import { imgFija } from '../../lib/imagenes.js';
import { HAY_INTRO } from '../marca/IntroMarca.jsx';

const ITEMS = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/tienda', label: 'Tienda', icon: 'tienda' },
  null, // botón central: mini Mar → WhatsApp
  { to: '/rutina', label: 'Rutina', icon: 'rutina' },
  { to: '/carrito', label: 'Carrito', icon: 'carrito', carrito: true },
];

const CLAVE_GLOBITO = 'dh-globito';
const LINK_MAR = whatsappCon('¡Hola Mar! Tengo una consulta.');

/** ¿Primera vez en la sesión? (con try/catch: sin sessionStorage, no se muestra) */
function primeraVez() {
  try {
    if (sessionStorage.getItem(CLAVE_GLOBITO)) return false;
    sessionStorage.setItem(CLAVE_GLOBITO, '1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Botón central del bottom nav: círculo elevado (sobresale ~14px arriba de la barra), verde con borde
 * arena y la carita de mini Mar recortada; abre WhatsApp. La primera vez de la sesión asoma 3 s el
 * globito "¿Te ayudo a elegir?". En mobile reemplaza al widget flotante de mini Mar (que queda en desktop).
 */
function BotonMar() {
  const [globito, setGlobito] = useState(false);
  useEffect(() => {
    if (!primeraVez()) return;
    const mostrar = setTimeout(() => setGlobito(true), HAY_INTRO ? 2200 : 1200);
    const ocultar = setTimeout(() => setGlobito(false), (HAY_INTRO ? 2200 : 1200) + 3000);
    return () => {
      clearTimeout(mostrar);
      clearTimeout(ocultar);
    };
  }, []);
  return (
    <li className="relative flex-1 self-stretch">
      <AnimatePresence>
        {globito && (
          <m.span
            aria-hidden="true"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[calc(100%+1.6rem)] left-1/2 -translate-x-1/2 rounded-2xl bg-crema-card px-3.5 py-2 text-[13px] font-bold whitespace-nowrap text-tinta shadow-flotante ring-1 ring-linea after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[7px] after:border-transparent after:border-t-crema-card"
          >
            ¿Te ayudo a elegir?
          </m.span>
        )}
      </AnimatePresence>
      <a
        href={LINK_MAR}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="¿Te ayudo a elegir? Escribile a Mar por WhatsApp"
        className="absolute -top-5 left-1/2 flex size-[3.75rem] -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-arena shadow-flotante transition active:scale-90"
        style={{ backgroundImage: 'linear-gradient(135deg, #3e6450 0%, #2f5240 100%)' }}
      >
        <img {...imgFija('/img/marca/mini-mar-cara.webp', 52)} alt="" width="192" height="192" className="mt-3 size-[3.05rem] object-cover" />
      </a>
      {/* Marca de WhatsApp en la esquina del círculo (fuera del overflow-hidden) */}
      <span aria-hidden="true" className="pointer-events-none absolute top-[1.6rem] left-[calc(50%+0.95rem)] flex size-5 items-center justify-center rounded-full bg-crema-card text-verde shadow-suave">
        <Icon name="whatsapp" size={13} />
      </span>
    </li>
  );
}

/** Navegación inferior tipo app (solo mobile): Inicio, Tienda, [mini Mar → WhatsApp], Rutina, Carrito. */
export default function BottomNav() {
  const { cantidadTotal } = useCart();
  const { pathname } = useLocation();
  // En el detalle de producto la barra "Agregar al carrito" ocupa su lugar
  if (pathname.startsWith('/producto/')) return null;
  return (
    <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-500 ease-out in-data-[overlay=abierto]:pointer-events-none in-data-[overlay=abierto]:translate-y-[calc(100%+2.5rem)] md:hidden">
      <ul className="glass-arena mx-auto flex max-w-md items-center justify-around rounded-full px-2 py-1.5 shadow-flotante">
        {ITEMS.map((it) =>
          !it ? (
            <BotonMar key="mar" />
          ) : (
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
          ),
        )}
      </ul>
    </nav>
  );
}
