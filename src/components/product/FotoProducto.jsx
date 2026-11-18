import SmartImg from '../ui/SmartImg.jsx';
import fondos from '../../data/fondos.json';

/** 'blanco' (foto de estudio) o 'escena' (madera, exterior…). Lo calcula scripts/optimizar-assets.mjs. */
export const tipoFondo = (src) => fondos[src?.replace(/-sm\.webp$/, '.webp')] ?? 'escena';

/**
 * Foto de producto consistente en todo el sitio: siempre sobre el mismo fondo de la marca
 * (degradé muy suave salvia-media → arena, utilidad `fondo-foto`).
 * - Fondo blanco: mix-blend-mode multiply → el blanco desaparece y el producto "flota".
 * - Fondo de escena: object-cover en un marco con padding + overlay salvia al 10% para unificar el tono.
 * El contenedor padre define el tamaño (ej. aspect-[4/5]). `zoom` = zoom suave en hover del `.group`.
 */
export default function FotoProducto({
  src,
  srcSm,
  alt = '',
  sizes,
  priority = false,
  zoom = true,
  compacta = false,
  cover = false, // a sangre (categorías): sin padding; las fotos blancas igual usan multiply sobre el fondo
  placeholderTitulo,
  placeholderSubtitulo,
  className = '',
}) {
  const blanco = tipoFondo(src) === 'blanco';
  const hover = zoom ? 'group-hover:scale-[1.07]' : '';
  const inset = cover
    ? 'inset-0'
    : compacta
      ? blanco
        ? 'inset-[10%]'
        : 'inset-[6%] rounded-lg'
      : blanco
        ? 'inset-[9%]'
        : 'inset-[6%] rounded-2xl';
  const ajuste = cover ? 'object-cover' : blanco ? 'object-contain' : 'object-cover';

  return (
    <span className={`fondo-foto relative isolate block size-full overflow-hidden ${className}`}>
      <span className={`absolute ${inset} ${blanco ? '' : 'overflow-hidden'}`}>
        <SmartImg
          src={src}
          srcSm={srcSm}
          sizes={sizes}
          alt={alt}
          priority={priority}
          sinFondo={blanco}
          placeholderTitulo={placeholderTitulo}
          placeholderSubtitulo={placeholderSubtitulo}
          className={`size-full transition-transform duration-700 ease-out ${hover} ${ajuste} ${blanco ? 'mix-blend-multiply' : ''}`}
        />
        {!blanco && <span className="pointer-events-none absolute inset-0 bg-salvia-media/10" aria-hidden="true" />}
      </span>
    </span>
  );
}
