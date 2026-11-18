import { useEffect, useRef } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import Icon from '../ui/Icon.jsx';
import CartLine from './CartLine.jsx';
import CartSummary from './CartSummary.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useOcultarBottomNav } from '../../hooks/useOcultarBottomNav.js';
import Roll from '../ui/Roll.jsx';

export default function CartDrawer() {
  const { abierto, cerrar } = useCart();
  const { pathname } = useLocation();

  // Cerrar al navegar
  useEffect(() => {
    cerrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <AnimatePresence>{abierto && <Panel onClose={cerrar} />}</AnimatePresence>;
}

function Panel({ onClose }) {
  const { lineas } = useCart();
  const reducido = useReducedMotion();
  const ref = useRef(null);
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useOcultarBottomNav();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70]">
      <m.div
        className="velo absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <m.aside
        ref={ref}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="drawer-titulo"
        initial={reducido ? { opacity: 0 } : { x: '100%' }}
        animate={reducido ? { opacity: 1 } : { x: 0 }}
        exit={reducido ? { opacity: 0 } : { x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-crema-card shadow-flotante outline-none sm:rounded-l-5xl"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 id="drawer-titulo" className="text-2xl">
            Tu carrito
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="flex size-10 items-center justify-center rounded-full text-tinta transition hover:rotate-90 hover:bg-salvia active:scale-90"
          >
            <Icon name="cerrar" />
          </button>
        </div>

        {lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-salvia text-verde">
              <Icon name="carrito" size={34} />
            </div>
            <p className="font-serif text-xl text-tinta">Carrito vacío</p>
            <Link to="/tienda" className="btn btn-primario">
              <Roll>
                Ver productos
              </Roll>
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-4">
              <AnimatePresence initial={false}>
                {lineas.map((l) => (
                  <CartLine key={l.clave} linea={l} compacta />
                ))}
              </AnimatePresence>
            </ul>
            <div className="border-t border-linea bg-arena px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <CartSummary />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={onClose} className="btn btn-borde px-3">
                  <Roll>
                    Seguir
                  </Roll>
                </button>
                <Link to="/carrito" className="btn btn-primario px-3">
                  <Roll>
                    Ver carrito
                  </Roll>
                </Link>
              </div>
            </div>
          </>
        )}
      </m.aside>
    </div>
  );
}
