import { useEffect } from 'react';
import { formatPrecio, plural } from '../../lib/format.js';
import { useCart } from '../../context/CartContext.jsx';
import { cargarCheckout } from './CheckoutGlobal.jsx';
import Roll from '../ui/Roll.jsx';

/** Resumen con cantidad y TOTAL + "Finalizar pedido" (abre el paso de datos del pedido por WhatsApp). */
export default function CartSummary({ className = '' }) {
  const { cantidadTotal, total, abrirCheckout } = useCart();

  // Precarga el chunk del checkout mientras mira el carrito (así abre al instante)
  useEffect(() => {
    const t = setTimeout(() => cargarCheckout().catch(() => {}), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm text-texto-suave">
        <span>{plural(cantidadTotal, 'producto', 'productos')}</span>
        <span className="precio">{formatPrecio(total)}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-sm font-extrabold tracking-[0.18em] text-tinta uppercase">Total</span>
        <span className="precio text-3xl text-tinta">{formatPrecio(total)}</span>
      </div>
      <button type="button" disabled={!cantidadTotal} onClick={abrirCheckout} aria-haspopup="dialog" className="btn btn-primario mt-4 w-full">
        <Roll>Finalizar pedido</Roll>
      </button>
    </div>
  );
}
