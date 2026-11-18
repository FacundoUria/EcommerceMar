import { useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import { ConDestellos } from '../components/marca/Destellos.jsx';
import CartLine from '../components/cart/CartLine.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import { useCart } from '../context/CartContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Roll from '../components/ui/Roll.jsx';

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
        <ConDestellos className="mt-6">
          <RevealText as="h1" className="text-4xl">Carrito vacío</RevealText>
        </ConDestellos>
        <Link to="/tienda" className="btn btn-primario mt-8">
          <Roll>
            Ver productos
          </Roll>
        </Link>
      </section>
    );
  }

  return (
    <div className="contenedor pt-4 pb-32 md:pb-12">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <ConDestellos>
          <RevealText as="h1" className="text-4xl md:text-5xl">Tu carrito</RevealText>
        </ConDestellos>
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
                <Roll>
                  Sí
                </Roll>
              </button>
              <button type="button" onClick={() => setConfirmar(false)} className="btn btn-borde px-4 py-2.5">
                <Roll>
                  No
                </Roll>
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirmar(true)} className="btn btn-borde px-4 py-2.5">
              <Roll>
                <Icon name="basura" size={16} /> Vaciar
              </Roll>
            </button>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {lineas.map((l, i) => (
              <CartLine key={l.clave} linea={l} delay={cascada(i, 8)} />
            ))}
          </AnimatePresence>
        </ul>

        <aside aria-label="Resumen del pedido">
          <div className="card sticky top-24 rounded-5xl p-6">
            <RevealText className="mb-4 text-2xl">Resumen</RevealText>
            <CartSummary />
            <Link to="/tienda" className="btn btn-borde mt-3 w-full">
              <Roll>
                <Icon name="flechaIzq" size={18} /> Seguir comprando
              </Roll>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
