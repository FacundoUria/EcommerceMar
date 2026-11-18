import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import Icon from '../ui/Icon.jsx';
import CartLine from './CartLine.jsx';
import CartSummary from './CartSummary.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';

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
  useFocusTrap(ref, onClose);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70]">
      <motion.div
        className="absolute inset-0 bg-verde/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-titulo"
        initial={reducido ? { opacity: 0 } : { x: '100%' }}
        animate={reducido ? { opacity: 1 } : { x: 0 }}
        exit={reducido ? { opacity: 0 } : { x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-crema shadow-flotante sm:rounded-l-5xl"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 id="drawer-titulo" className="text-2xl">
            Tu carrito
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="flex size-10 items-center justify-center rounded-full text-verde transition hover:rotate-90 hover:bg-verde/5 active:scale-90"
          >
            <Icon name="cerrar" />
          </button>
        </div>

        {lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-amarillo/40 text-verde">
              <Icon name="carrito" size={34} />
            </div>
            <p className="font-serif text-xl text-verde">Tu carrito está vacío</p>
            <p className="text-sm text-gris">Descubrí productos para cuidar, hidratar y definir tus rulos.</p>
            <Link to="/tienda" className="btn btn-primario">
              Ver productos
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
            <div className="border-t border-verde/10 bg-white/60 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <CartSummary />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={onClose} className="btn btn-borde px-3">
                  Seguir comprando
                </button>
                <Link to="/carrito" className="btn btn-amarillo px-3">
                  Ver carrito
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.aside>
    </div>
  );
}
