import { AnimatePresence, m } from 'motion/react';
import { useCart } from '../../context/CartContext.jsx';

/** Badge con "pop" cada vez que cambia la cantidad. */
export default function CartBadge({ className = '' }) {
  const { cantidadTotal } = useCart();
  return (
    <AnimatePresence>
      {cantidadTotal > 0 && (
        <m.span
          key={cantidadTotal}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [1.6, 0.9, 1], opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={`absolute -top-1.5 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amarillo px-1 text-[11px] font-extrabold text-verde ring-2 ring-crema tabular-nums ${className}`}
        >
          {cantidadTotal > 99 ? '99+' : cantidadTotal}
        </m.span>
      )}
    </AnimatePresence>
  );
}
