import { m } from 'motion/react';
import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import FotoProducto from '../product/FotoProducto.jsx';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import { formatPrecio, imgSm } from '../../lib/format.js';
import { useCart } from '../../context/CartContext.jsx';

/** Una línea del carrito (producto + variante). Se usa en el drawer y en /carrito. */
export default function CartLine({ linea, compacta = false, onNavigate, delay = 0 }) {
  const { setCantidad, quitar } = useCart();
  const url = `/producto/${linea.id}${linea.variante ? `?v=${encodeURIComponent(linea.variante)}` : ''}`;

  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      className="card flex gap-4 rounded-4xl p-3"
    >
      <Link to={url} onClick={onNavigate} className={`shrink-0 overflow-hidden rounded-3xl ${compacta ? 'size-20' : 'size-24 md:size-28'}`}>
        <FotoProducto src={imgSm(linea.imagen)} alt={linea.nombre} placeholderTitulo={linea.nombre} zoom={false} compacta />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {linea.marca && <p className="text-[11px] font-bold tracking-[0.14em] text-dorado uppercase">{linea.marca}</p>}
            <Link to={url} onClick={onNavigate} className="line-clamp-2 text-sm leading-snug font-bold text-tinta hover:text-verde">
              {linea.nombre}
            </Link>
            {linea.variante && <p className="truncate text-xs text-texto-suave">{linea.variante}</p>}
            <p className="mt-0.5 text-xs text-texto-suave"><span className="precio">{formatPrecio(linea.precio)}</span> c/u</p>
          </div>
          <button
            type="button"
            onClick={() => quitar(linea.clave)}
            aria-label={`Quitar ${linea.nombre}${linea.variante ? ` (${linea.variante})` : ''} del carrito`}
            className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-texto-suave transition hover:bg-red-50 hover:text-red-700 active:scale-90"
          >
            <Icon name="basura" size={18} />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <QuantityStepper
            size="sm"
            value={linea.cantidad}
            onChange={(n) => (n < 1 ? quitar(linea.clave) : setCantidad(linea.clave, n))}
            label={`Cantidad de ${linea.nombre}`}
          />
          <p className="precio text-lg text-tinta">{formatPrecio(linea.precio * linea.cantidad)}</p>
        </div>
      </div>
    </m.li>
  );
}
