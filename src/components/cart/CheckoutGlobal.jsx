import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router';
import { useCart } from '../../context/CartContext.jsx';

// El paso de datos va en un chunk aparte: lo precarga CartSummary (drawer o /carrito) y se pide al tocar
// "Finalizar pedido".
export const cargarCheckout = () => import('./Checkout.jsx');
const Checkout = lazy(cargarCheckout);

/** Monta el checkout (pedido por WhatsApp) cuando está abierto. Se cierra al cambiar de página. */
export default function CheckoutGlobal() {
  const { checkoutAbierto, cerrarCheckout } = useCart();
  const { pathname } = useLocation();

  useEffect(() => {
    cerrarCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {checkoutAbierto && (
        <Suspense key="checkout" fallback={null}>
          <Checkout onClose={cerrarCheckout} />
        </Suspense>
      )}
    </AnimatePresence>
  );
}
