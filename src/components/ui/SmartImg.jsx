import { useState } from 'react';
import { useLqip } from '../../lib/lqip.js';

/** Placeholder elegante para productos sin foto: nunca una imagen rota. */
export function ImgPlaceholder({ titulo, subtitulo = 'Dream Hair', className = '' }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-salvia-media p-4 text-center ${className}`}
      role="img"
      aria-label={titulo ? `${titulo} (sin foto)` : 'Sin foto'}
    >
      <span className="text-[10px] font-bold tracking-[0.25em] text-tinta uppercase">{subtitulo}</span>
      <span className="h-px w-8 bg-tinta/30" />
      {titulo && <span className="font-serif text-lg leading-tight text-tinta">{titulo}</span>}
    </div>
  );
}

/**
 * <img> lazy con tamaño declarado (evita saltos de layout) y fallback al placeholder si falla.
 * `sizes`/`srcSm` permiten que el navegador elija la versión de 400px en cards.
 */
export default function SmartImg({
  src,
  srcSm,
  alt,
  width = 900,
  height = 900,
  sizes,
  className = '',
  placeholderTitulo,
  placeholderSubtitulo,
  priority = false,
  sinFondo = false, // true: sin fondo ni blur-up (fotos con mix-blend multiply sobre un fondo propio)
  ...rest
}) {
  const [error, setError] = useState(false);
  const [cargada, setCargada] = useState(false);
  const lqip = useLqip(src);

  if (!src || error) return <ImgPlaceholder titulo={placeholderTitulo ?? alt} subtitulo={placeholderSubtitulo} />;

  // Blur-up: la miniatura de 20px (agrandada, se ve borrosa) queda de fondo hasta que la foto
  // real carga y aparece con fade de opacidad. Sin miniatura, el fondo es salvia-media.
  return (
    <span
      className={`block size-full overflow-hidden ${sinFondo ? '' : 'bg-salvia-media bg-cover bg-center'}`}
      style={!sinFondo && lqip && !cargada ? { backgroundImage: `url("${lqip}")` } : undefined}
    >
      <img
        key={src}
        src={src}
        srcSet={srcSm ? `${srcSm} 400w, ${src} 900w` : undefined}
        sizes={srcSm ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        onError={() => setError(true)}
        onLoad={() => setCargada(true)}
        // Las prioritarias (arriba de todo / LCP) se pintan apenas llegan; el resto aparece con fade.
        className={priority ? className : `${className} transition-opacity duration-[600ms] ease-out ${cargada ? 'opacity-100' : 'opacity-0'}`}
        {...rest}
      />
    </span>
  );
}
