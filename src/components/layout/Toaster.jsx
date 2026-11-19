import { AnimatePresence, m } from 'motion/react';
import Icon from '../ui/Icon.jsx';
import { imgFija } from '../../lib/imagenes.js';
import { useUI } from '../../context/UIContext.jsx';
import { useCartAcciones } from '../../context/CartContext.jsx';

export default function Toaster() {
  const { toast, cerrarToast } = useUI();
  const { abrir } = useCartAcciones();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:top-24 md:right-6 md:bottom-auto md:left-auto md:justify-end"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence>
        {toast && (
          <m.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex border border-linea bg-crema-card w-full max-w-sm items-center gap-3 rounded-3xl p-2.5 pr-3 text-tinta shadow-flotante"
          >
            {toast.imagen ? (
              <img {...imgFija(toast.imagen, 48)} alt="" width="48" height="48" className="size-12 shrink-0 rounded-2xl border border-linea bg-crema-card object-cover" />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arena text-tinta">
                <Icon name="check" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-bold text-verde">
                <Icon name="check" size={15} strokeWidth={2.6} /> {toast.titulo}
              </p>
              {toast.texto && <p className="truncate text-xs text-texto-suave">{toast.texto}</p>}
            </div>
            {toast.tipo === 'carrito' && (
              <button
                type="button"
                onClick={() => {
                  cerrarToast();
                  abrir();
                }}
                className="shrink-0 rounded-full bg-verde px-3.5 py-2 text-xs font-extrabold text-arena transition active:scale-95"
              >
                Ver
              </button>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
