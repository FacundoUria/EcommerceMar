import Icon from '../ui/Icon.jsx';
import { esColorClaro, partesVariante } from '../../lib/variantes.js';

/** Cuadradito chico del color de una variante (quick view, rutina, carrito). Borde fino: el blanco se ve. */
export function MuestraColor({ color, className = 'size-3.5' }) {
  return <span aria-hidden="true" className={`inline-block shrink-0 rounded-[5px] inset-ring inset-ring-tinta/20 ${className}`} style={{ backgroundColor: color }} />;
}

/**
 * Selector de colores de la ficha: un cuadradito lleno por variante (48 px) con el nombre abajo y, en los
 * perfumados ("Rosa bebé · frutilla"), el aroma en una segunda línea. Elegido = aro verde + tilde.
 * - onPreview: al pasar el mouse / foco (cambia la foto y el precio sin elegir)
 * - onSelect: al tocar (elige la variante)
 */
export default function SelectorColores({ variantes, seleccionada, onSelect, onPreview, nombreProducto = '' }) {
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-3" role="radiogroup" aria-label={`Colores de ${nombreProducto}`} onMouseLeave={() => onPreview?.(null)}>
      {variantes.map((v) => {
        const activa = seleccionada === v.nombre;
        const [color, detalle] = partesVariante(v.nombre);
        return (
          <button
            key={v.nombre}
            type="button"
            role="radio"
            aria-checked={activa}
            aria-label={detalle ? `${color}, ${detalle}` : color}
            onClick={() => onSelect?.(v)}
            onMouseEnter={() => onPreview?.(v)}
            onFocus={() => onPreview?.(v)}
            onBlur={() => onPreview?.(null)}
            className="group flex w-[4.75rem] flex-col items-center rounded-2xl px-0.5 pt-1.5 pb-1 text-center outline-none focus-visible:bg-salvia"
          >
            <span
              className={`flex size-12 items-center justify-center rounded-xl inset-ring inset-ring-tinta/20 transition duration-200 group-active:scale-95 ${
                activa ? 'ring-[2.5px] ring-verde ring-offset-[3px] ring-offset-arena' : 'shadow-suave group-hover:scale-105'
              }`}
              style={{ backgroundColor: v.color }}
            >
              {activa && <Icon name="check" size={22} strokeWidth={3} className={esColorClaro(v.color) ? 'text-tinta' : 'text-white'} />}
            </span>
            <span className={`mt-2 text-[13px] leading-tight text-tinta ${activa ? 'font-bold' : 'font-medium'}`}>{color}</span>
            {detalle && <span className="mt-0.5 text-xs leading-tight text-texto-suave">{detalle}</span>}
          </button>
        );
      })}
    </div>
  );
}
