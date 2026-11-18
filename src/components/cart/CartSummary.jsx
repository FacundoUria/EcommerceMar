import { formatPrecio, plural } from '../../lib/format.js';
import { useCart } from '../../context/CartContext.jsx';

/** Resumen con cantidad y TOTAL + "Finalizar pedido" (deshabilitado en Fase 1: no hay pagos). */
export default function CartSummary({ className = '' }) {
  const { cantidadTotal, total } = useCart();
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
      <button type="button" disabled className="btn btn-primario mt-4 w-full">
        Finalizar pedido
        <span className="rounded-full bg-salvia px-2 py-0.5 text-[10px] font-extrabold text-verde uppercase">Próximamente</span>
      </button>
    </div>
  );
}
