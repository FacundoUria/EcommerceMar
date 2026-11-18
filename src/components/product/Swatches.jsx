import { imgSm } from '../../lib/format.js';

/**
 * Swatches de variantes con la foto de cada una.
 * - onPreview: al pasar el mouse / foco (cambia la foto sin elegir)
 * - onSelect: al tocar / click (elige la variante)
 */
export default function Swatches({ variantes, seleccionada, onSelect, onPreview, max, size = 'md', nombreProducto = '' }) {
  if (!variantes?.length) return null;
  const visibles = max ? variantes.slice(0, max) : variantes;
  const resto = variantes.length - visibles.length;
  const dim = size === 'sm' ? 'size-7' : 'size-14';

  return (
    <div
      className={`flex flex-wrap items-center ${size === 'sm' ? 'gap-1.5' : 'gap-2.5'}`}
      role="radiogroup"
      aria-label={`Variantes de ${nombreProducto}`}
      onMouseLeave={() => onPreview?.(null)}
    >
      {visibles.map((v) => {
        const activa = seleccionada === v.nombre;
        return (
          <button
            key={v.nombre}
            type="button"
            role="radio"
            aria-checked={activa}
            aria-label={v.nombre}
            title={v.nombre}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect?.(v);
            }}
            onMouseEnter={() => onPreview?.(v)}
            onFocus={() => onPreview?.(v)}
            onBlur={() => onPreview?.(null)}
            className={`${dim} shrink-0 overflow-hidden rounded-full border-2 bg-crema-card transition duration-200 hover:scale-110 active:scale-95 ${
              activa ? 'border-verde ring-2 ring-salvia-media ring-offset-1' : 'border-crema-card shadow-suave'
            }`}
          >
            <img src={imgSm(v.imagen)} alt="" width="56" height="56" loading="lazy" decoding="async" className="size-full object-cover" />
          </button>
        );
      })}
      {resto > 0 && <span className="text-xs font-bold text-texto-suave">+{resto}</span>}
    </div>
  );
}
