import SmartImg from '../ui/SmartImg.jsx';
import fondos from '../../data/fondos.json';
import { colorDe } from '../../lib/colores.js';
import { claveImagen, conTope, infoImagen } from '../../lib/imagenes.js';

/** 'blanco' (foto de estudio) o 'escena' (madera, exterior…). Lo calcula scripts/optimizar-assets.mjs. */
export const tipoFondo = (src) => (src && fondos[`${claveImagen(src)}.webp`]) || 'escena';

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
  halo = true, // halo de luz del color del producto detrás de la foto (se intensifica con el hover del `.group`)
  placeholderTitulo,
  placeholderSubtitulo,
  className = '',
  style,
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
  // Foto de escena con pocos px: el marco se achica (máx la mitad del original) y queda centrado,
  // en vez de estirar la foto. Las de fondo blanco las topea SmartImg.
  const info = !cover && !blanco && conTope() ? infoImagen(src) : null;
  const tope = info ? { maxWidth: info.o[0] / 2, maxHeight: info.o[1] / 2, margin: 'auto' } : undefined;
  // Encuadre del cover (fotos con modelo: que no se corte la cara ni el producto). scripts/fuentes-imagenes.mjs
  const encuadre = blanco ? undefined : infoImagen(src)?.p;

  return (
    <span className={`fondo-foto relative isolate block size-full overflow-hidden ${className}`} style={{ '--color-producto': colorDe(src), ...style }}>
      {/* Entre el fondo y la foto: en las fotos blancas (multiply) el producto "flota" sobre su propia luz */}
      {halo && <span className="halo-producto" aria-hidden="true" />}
      {/* Fondo blanco: el multiply va en el marco esfumado (la máscara aísla: un multiply en la foto de adentro
          se mezclaba solo dentro del marco y el blanco se veía como un recuadro) */}
      <span className={`absolute ${inset} ${blanco ? 'foto-bordes-suaves mix-blend-multiply' : 'overflow-hidden'}`} style={tope}>
        <SmartImg
          src={src}
          srcSm={srcSm}
          sizes={sizes}
          alt={alt}
          priority={priority}
          sinFondo={blanco}
          style={encuadre ? { objectPosition: encuadre } : undefined}
          placeholderTitulo={placeholderTitulo}
          placeholderSubtitulo={placeholderSubtitulo}
          className={`size-full transition-transform duration-700 ease-out ${hover} ${ajuste}`}
        />
        {!blanco && <span className="pointer-events-none absolute inset-0 bg-salvia-media/10" aria-hidden="true" />}
      </span>
    </span>
  );
}
