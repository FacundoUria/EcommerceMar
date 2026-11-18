import Icon from '../ui/Icon.jsx';
import { formatPrecio, plural } from '../../lib/format.js';
import { useCart } from '../../context/CartContext.jsx';

/** Resumen con cantidad y TOTAL + "Finalizar pedido" (deshabilitado en Fase 1: no hay pagos). */
export default function CartSummary({ className = '' }) {
  const { cantidadTotal, total } = useCart();
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm text-gris">
        <span>{plural(cantidadTotal, 'producto', 'productos')}</span>
        <span className="tabular-nums">{formatPrecio(total)}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-sm font-extrabold tracking-[0.18em] text-verde uppercase">Total</span>
        <span className="font-serif text-3xl font-semibold text-verde tabular-nums">{formatPrecio(total)}</span>
      </div>
      <button type="button" disabled aria-describedby="finalizar-nota" className="btn btn-primario mt-4 w-full">
        Finalizar pedido
        <span className="rounded-full bg-amarillo px-2 py-0.5 text-[10px] font-extrabold text-verde uppercase">Próximamente</span>
      </button>
      <p id="finalizar-nota" className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-gris">
        <Icon name="check" size={14} /> Muy pronto vas a poder enviar tu pedido desde acá.
      </p>
    </div>
  );
}
