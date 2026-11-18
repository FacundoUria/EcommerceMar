import { useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import CartLine from '../components/cart/CartLine.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import { useCart } from '../context/CartContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Carrito() {
  usePageTitle('Carrito');
  const { lineas, vaciar } = useCart();
  const [confirmar, setConfirmar] = useState(false);

  if (!lineas.length) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-salvia text-verde">
          <Icon name="carrito" size={40} />
        </div>
        <h1 className="mt-6 text-4xl">Carrito vacío</h1>
        <Link to="/tienda" className="btn btn-primario mt-8">
          Ver productos
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-32 md:pb-12">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl md:text-5xl">Tu carrito</h1>
        <div className="flex items-center gap-2">
          {confirmar ? (
            <>
              <span className="text-sm font-semibold">¿Seguro?</span>
              <button
                type="button"
                onClick={() => {
                  vaciar();
                  setConfirmar(false);
                }}
                className="btn bg-red-700 px-4 py-2.5 text-arena hover:bg-red-800"
              >
                Sí
              </button>
              <button type="button" onClick={() => setConfirmar(false)} className="btn btn-borde px-4 py-2.5">
                No
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirmar(true)} className="btn btn-borde px-4 py-2.5">
              <Icon name="basura" size={16} /> Vaciar
            </button>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {lineas.map((l) => (
              <CartLine key={l.clave} linea={l} />
            ))}
          </AnimatePresence>
        </ul>

        <aside aria-label="Resumen del pedido">
          <div className="card sticky top-24 rounded-5xl p-6">
            <h2 className="mb-4 text-2xl">Resumen</h2>
            <CartSummary />
            <Link to="/tienda" className="btn btn-borde mt-3 w-full">
              <Icon name="flechaIzq" size={18} /> Seguir comprando
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
