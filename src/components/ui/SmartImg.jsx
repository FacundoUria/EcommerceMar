import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLqip } from '../../lib/lqip.js';
import { conTope, fuenteImagen, infoImagen } from '../../lib/imagenes.js';

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

/**
 * Ancho al que se ve la foto (px CSS), según su caja y su object-fit. Se mide el layout (clientWidth),
 * no el rect: las animaciones de entrada (escala, 3D) no cuentan. Solo crece: si la caja se agranda
 * (panel de categoría que se expande) el navegador baja una versión más grande; si se achica, no.
 */
function useAnchoMostrado(caja, img, info) {
  const [medida, setMedida] = useState(null); // { css, fit }
  useLayoutEffect(() => {
    const el = caja.current;
    const im = img.current;
    if (!el || !im || !info) return;
    const ar = info.o[0] / info.o[1];
    const medir = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w) return;
      const fit = getComputedStyle(im).objectFit;
      let css = fit === 'cover' ? Math.max(w, h * ar) : fit === 'contain' && h ? Math.min(w, h * ar) : w;
      // Fotos "contain" con poca resolución: se muestran como máximo a la mitad de sus px (nunca estiradas)
      if (fit === 'contain' && conTope()) css = Math.min(css, info.o[0] / 2);
      css = Math.ceil(css);
      setMedida((m) => (m && m.fit === fit && m.css >= css ? m : { css, fit }));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [caja, img, info]);
  return medida;
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
 * <img> de /img con srcset de todos los anchos generados (src/data/imagenes.json) y `sizes` = el ancho
 * real al que se ve (medido): el navegador baja la versión justa para 1x, 2x o 3x, nunca más grande que
 * el original. `sizes` explícito solo cuenta en las prioritarias (hero: el preload usa el mismo).
 * Lazy (src recién cerca de la pantalla), con blur-up y fallback al placeholder si falla.
 * Fotos `object-contain` (productos de fondo blanco): se muestran como máximo a la mitad de los px del
 * original, centradas; así una foto chica se ve más chica pero nítida en vez de estirada.
 */
export default function SmartImg({
  src,
  srcSm, // eslint-disable-line no-unused-vars -- compat: el srcset sale del manifiesto
  alt,
  width,
  height,
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
  const imgRef = useRef(null);
  const info = infoImagen(src);
  const cerca = useCerca(caja, !priority);
  const medida = useAnchoMostrado(caja, imgRef, info);

  if (!src || error) return <ImgPlaceholder titulo={placeholderTitulo ?? alt} subtitulo={placeholderSubtitulo} />;

  // Prioritarias: el `sizes` explícito (el preload del hero usa el mismo). El resto: el ancho medido.
  const tamanios = priority && sizes ? sizes : medida ? `${medida.css}px` : sizes;
  const listo = cerca && (!info || tamanios);
  const fuente = info ? fuenteImagen(src, 640) : { src }; // src fijo de respaldo: el srcset decide
  const limitada = info && medida?.fit === 'contain' && conTope();

  // Blur-up: la miniatura de 20px (agrandada, se ve borrosa) queda de fondo hasta que la foto
  // real carga y aparece con fade de opacidad. Sin miniatura, el fondo es salvia-media.
  return (
    <span
      ref={caja}
      className={`size-full overflow-hidden ${limitada ? 'flex items-center justify-center' : 'block'} ${sinFondo ? '' : 'bg-salvia-media bg-cover bg-center'}`}
      style={!sinFondo && lqip && !cargada ? { backgroundImage: `url("${lqip}")` } : undefined}
    >
      <img
        key={src}
        ref={imgRef}
        src={listo ? fuente.src : undefined}
        srcSet={listo ? fuente.srcSet : undefined}
        sizes={listo && fuente.srcSet ? tamanios : undefined}
        alt={alt}
        width={width ?? info?.o[0] ?? 900}
        height={height ?? info?.o[1] ?? 900}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        onError={() => setError(true)}
        onLoad={() => setCargada(true)}
        style={limitada ? { maxWidth: info.o[0] / 2, maxHeight: info.o[1] / 2 } : undefined}
        // Las prioritarias (arriba de todo / LCP) se pintan apenas llegan; el resto aparece con fade.
        // Topeada y sin fondo (foto blanca con multiply): el esfumado de bordes va en la foto, no en el marco
        className={`${className} ${limitada && sinFondo ? 'foto-bordes-suaves' : ''} ${priority ? '' : `transition-opacity duration-[600ms] ease-out ${cargada ? 'opacity-100' : 'opacity-0'}`}`}
        {...rest}
      />
    </span>
  );
}
