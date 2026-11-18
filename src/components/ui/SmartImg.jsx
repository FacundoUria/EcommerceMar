import { useState } from 'react';

/** Placeholder elegante para productos sin foto: nunca una imagen rota. */
export function ImgPlaceholder({ titulo, subtitulo = 'Dream Hair', className = '' }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-crema-200 p-4 text-center ${className}`}
      role="img"
      aria-label={titulo ? `${titulo} (sin foto)` : 'Sin foto'}
    >
      <span className="text-[10px] font-bold tracking-[0.25em] text-dorado uppercase">{subtitulo}</span>
      <span className="h-px w-8 bg-dorado/40" />
      {titulo && <span className="font-serif text-lg leading-tight text-verde">{titulo}</span>}
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
  ...rest
}) {
  const [error, setError] = useState(false);
  const [cargada, setCargada] = useState(false);

  if (!src || error) return <ImgPlaceholder titulo={placeholderTitulo ?? alt} subtitulo={placeholderSubtitulo} />;

  return (
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
      decoding="async"
      onError={() => setError(true)}
      onLoad={() => setCargada(true)}
      className={`${className} transition-opacity duration-500 ${cargada ? 'opacity-100' : 'opacity-0'}`}
      {...rest}
    />
  );
}
