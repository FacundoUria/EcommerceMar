import { useEffect, useRef, useState } from 'react';
import { useLqip } from '../../lib/lqip.js';

/**
 * true cuando el elemento está a menos de 300px de la pantalla (una vez).
 * Las fotos no prioritarias recién ponen su src ahí: con conexiones lentas o desconocidas Chrome
 * agranda mucho el margen del loading="lazy" y pedía casi todas las fotos del home al cargar,
 * compitiendo con la foto del hero (LCP). Mientras tanto se ve el blur-up.
 */
function useCerca(ref, activo) {
  const [cerca, setCerca] = useState(!activo);
  useEffect(() => {
    if (cerca) return;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setCerca(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setCerca(true);
        io.disconnect();
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cerca, ref]);
  return cerca;
}

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
  const caja = useRef(null);
  const cerca = useCerca(caja, !priority);

  if (!src || error) return <ImgPlaceholder titulo={placeholderTitulo ?? alt} subtitulo={placeholderSubtitulo} />;

  // Blur-up: la miniatura de 20px (agrandada, se ve borrosa) queda de fondo hasta que la foto
  // real carga y aparece con fade de opacidad. Sin miniatura, el fondo es salvia-media.
  return (
    <span
      ref={caja}
      className={`block size-full overflow-hidden ${sinFondo ? '' : 'bg-salvia-media bg-cover bg-center'}`}
      style={!sinFondo && lqip && !cargada ? { backgroundImage: `url("${lqip}")` } : undefined}
    >
      <img
        key={src}
        src={cerca ? src : undefined}
        // `width` = ancho real de la versión grande (900 por defecto; la del hero mide 793)
        srcSet={cerca && srcSm ? `${srcSm} 400w, ${src} ${width}w` : undefined}
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
