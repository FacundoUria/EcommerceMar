import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useDragControls, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import FotoProducto from './FotoProducto.jsx';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import Swatches from './Swatches.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import Precio from '../ui/Precio.jsx';
import { useOcultarBottomNav } from '../../hooks/useOcultarBottomNav.js';
import Roll from '../ui/Roll.jsx';
import { explotarDestellos } from '../../lib/destellos.js';

/** Vista rápida: bottom-sheet en mobile (arrastrable para cerrar), modal en desktop. */
export default function QuickView() {
  const { quickView, cerrarQuickView } = useUI();
  return (
    <AnimatePresence>
      {quickView && <Panel key={quickView.producto.id} {...quickView} onClose={cerrarQuickView} />}
    </AnimatePresence>
  );
}

function Panel({ producto, variante: varianteInicial, onClose }) {
  const { agregar } = useCart();
  const desktop = useMediaQuery('(min-width: 768px)');
  const reducido = useReducedMotion();
  const [variante, setVariante] = useState(varianteInicial ?? null);
  const [preview, setPreview] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [aviso, setAviso] = useState(false);
  const ref = useRef(null);
  const controles = useDragControls();
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useOcultarBottomNav();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const tieneVariantes = producto.variantes.length > 0;
  const imagen = (preview ?? variante)?.imagen ?? producto.imagen;

  const confirmar = (e) => {
    if (tieneVariantes && !variante) {
      setAviso(true);
      return;
    }
    explotarDestellos(e?.currentTarget); // van en <body>: se ven aunque la quick view se cierre
    agregar(producto, variante, cantidad);
    onClose();
  };

  const animSheet = reducido
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : desktop
      ? { initial: { opacity: 0, scale: 0.94, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 10 } }
      : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
      <m.div
        className="velo absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <m.div
        ref={ref}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="qv-titulo"
        {...animSheet}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        drag={desktop || reducido ? false : 'y'}
        dragListener={false}
        dragControls={controles}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-5xl bg-crema-card shadow-flotante outline-none md:grid md:max-w-4xl md:grid-cols-2 md:rounded-5xl"
      >
        <div
          className="sticky top-0 z-10 flex touch-none justify-center pt-3 pb-3 md:hidden"
          onPointerDown={(e) => controles.start(e)}
          aria-hidden="true"
        >
          <span className="h-1.5 w-12 rounded-full bg-verde/20" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista rápida"
          className="glass absolute top-4 right-4 z-20 flex size-10 items-center justify-center rounded-full text-tinta shadow-suave transition hover:rotate-90 active:scale-90"
        >
          <Icon name="cerrar" size={20} />
        </button>

        <div className="mx-4 aspect-square overflow-hidden rounded-4xl md:m-0 md:aspect-auto md:h-full md:rounded-none">
          <AnimatePresence mode="popLayout" initial={false}>
            <m.div
              key={imagen}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="size-full"
            >
              <FotoProducto src={imagen} alt={producto.nombre} placeholderTitulo={producto.nombre} priority zoom={false} />
            </m.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div>
            {producto.marca && <p className="text-xs font-bold tracking-[0.18em] text-dorado uppercase">{producto.marca}</p>}
            <h2 id="qv-titulo" className="mt-1 text-3xl leading-tight">
              {producto.nombre}
            </h2>
            <Precio as="p" valor={producto.precio} className="mt-2 text-2xl text-tinta" />
          </div>

          {tieneVariantes && (
            <div>
              <p className="mb-2 text-sm font-semibold">
                {(preview ?? variante)?.nombre ?? 'Variante'}
              </p>
              <Swatches
                variantes={producto.variantes}
                seleccionada={variante?.nombre}
                onSelect={(v) => {
                  setVariante(v);
                  setAviso(false);
                }}
                onPreview={setPreview}
                nombreProducto={producto.nombre}
              />
              {aviso && (
                <p className="mt-2 text-sm font-semibold text-dorado" role="alert">
                  Elegí una variante
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <QuantityStepper value={cantidad} onChange={setCantidad} />
            <button type="button" onClick={confirmar} className="btn btn-primario flex-1 px-4 whitespace-nowrap">
              <Roll>
                <Icon name="carrito" size={18} />
                Agregar
              </Roll>
            </button>
          </div>

          <Link
            to={`/producto/${producto.id}${variante ? `?v=${encodeURIComponent(variante.nombre)}` : ''}`}
            onClick={onClose}
            className="inline-flex items-center gap-1 self-start text-sm font-bold text-verde underline-offset-4 hover:underline"
          >
            Ver detalle <Icon name="flecha" size={16} />
          </Link>
          <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
        </div>
      </m.div>
    </div>
  );
}
