import { motion } from 'motion/react';
import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import SmartImg from '../ui/SmartImg.jsx';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import { formatPrecio, imgSm } from '../../lib/format.js';
import { useCart } from '../../context/CartContext.jsx';

/** Una línea del carrito (producto + variante). Se usa en el drawer y en /carrito. */
export default function CartLine({ linea, compacta = false, onNavigate }) {
  const { setCantidad, quitar } = useCart();
  const url = `/producto/${linea.id}${linea.variante ? `?v=${encodeURIComponent(linea.variante)}` : ''}`;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      className="flex gap-4 rounded-4xl bg-white p-3 shadow-suave"
    >
      <Link to={url} onClick={onNavigate} className={`shrink-0 overflow-hidden rounded-3xl bg-white ${compacta ? 'size-20' : 'size-24 md:size-28'}`}>
        <SmartImg src={imgSm(linea.imagen)} alt={linea.nombre} width={400} height={400} placeholderTitulo={linea.nombre} className="size-full object-contain p-1" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={url} onClick={onNavigate} className="line-clamp-2 text-sm leading-snug font-bold text-tinta hover:text-verde-700">
              {linea.nombre}
            </Link>
            {linea.variante && <p className="truncate text-xs text-gris">{linea.variante}</p>}
            <p className="mt-0.5 text-xs text-gris">{formatPrecio(linea.precio)} c/u</p>
          </div>
          <button
            type="button"
            onClick={() => quitar(linea.clave)}
            aria-label={`Quitar ${linea.nombre}${linea.variante ? ` (${linea.variante})` : ''} del carrito`}
            className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-gris transition hover:bg-red-50 hover:text-red-700 active:scale-90"
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
          <p className="font-serif text-lg font-semibold text-verde tabular-nums">{formatPrecio(linea.precio * linea.cantidad)}</p>
        </div>
      </div>
    </motion.li>
  );
}
