import { AnimatePresence, motion } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function Toaster() {
  const { toast, cerrarToast } = useUI();
  const { abrir } = useCart();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:top-24 md:right-6 md:bottom-auto md:left-auto md:justify-end"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass-oscuro pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-3xl p-2.5 pr-3 text-crema shadow-flotante"
          >
            {toast.imagen ? (
              <img src={toast.imagen} alt="" width="48" height="48" className="size-12 shrink-0 rounded-2xl bg-white object-contain p-0.5" />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amarillo text-verde">
                <Icon name="check" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-bold text-amarillo">
                <Icon name="check" size={15} strokeWidth={2.6} /> {toast.titulo}
              </p>
              {toast.texto && <p className="truncate text-xs text-crema/80">{toast.texto}</p>}
            </div>
            {toast.tipo === 'carrito' && (
              <button
                type="button"
                onClick={() => {
                  cerrarToast();
                  abrir();
                }}
                className="shrink-0 rounded-full bg-amarillo px-3.5 py-2 text-xs font-extrabold text-verde transition active:scale-95"
              >
                Ver carrito
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
