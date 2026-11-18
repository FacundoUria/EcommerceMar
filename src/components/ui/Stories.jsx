import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import Icon from './Icon.jsx';
import SmartImg from './SmartImg.jsx';
import { imgSm } from '../../lib/format.js';

/**
 * Carrusel tipo stories: barras de progreso arriba (scaleX), avanza solo mientras está en pantalla.
 * Tocar a la izquierda / derecha navega; mantener apretado o pasar el mouse pausa; botón de pausa visible.
 * Con prefers-reduced-motion no avanza solo.
 *
 * items: [{ tipo: 'video' | 'foto', src, poster?, alt, duracion (s) }]
 */
export default function Stories({ items, className = '', label = 'Resultados' }) {
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const enPantalla = useInView(ref, { amount: 0.5 });
  const [i, setI] = useState(0);
  const [pausaUsuario, setPausaUsuario] = useState(null); // null = por defecto
  const [pausaTemporal, setPausaTemporal] = useState(false);

  // Por defecto avanza sola; con movimiento reducido arranca pausada (se puede reproducir a mano).
  const pausado = pausaUsuario ?? !!reducido;
  const corriendo = enPantalla && !pausado && !pausaTemporal;
  const actual = items[i];
  const ir = (n) => setI((n + items.length) % items.length);

  // El video activo se reproduce solo mientras la story corre
  const videoRef = useRef(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (corriendo) v.play().catch(() => {});
    else v.pause();
  }, [corriendo, i]);

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      className={`relative overflow-hidden bg-salvia-media select-none ${className}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPausaTemporal(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPausaTemporal(false)}
    >
      {/* Contenido */}
      <div className="absolute inset-0" aria-live="polite">
        {actual.tipo === 'video' ? (
          <>
            {/* Poster como imagen debajo del video: nunca queda una caja vacía mientras el video carga */}
            {actual.poster && (
              <img src={actual.poster} alt="" aria-hidden="true" width="576" height="1024" decoding="async" className="absolute inset-0 size-full object-cover" />
            )}
            <video
              key={actual.src}
              ref={videoRef}
              src={enPantalla ? actual.src : undefined}
              poster={actual.poster}
              muted
              playsInline
              preload="none"
              aria-label={actual.alt}
              className="relative size-full object-cover"
            />
          </>
        ) : (
          <SmartImg key={actual.src} src={actual.src} srcSm={imgSm(actual.src)} sizes="320px" alt={actual.alt} className="size-full object-cover" />
        )}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#16241C]/55 to-transparent" />
      </div>

      {/* Barras de progreso */}
      <div className="absolute inset-x-3 top-3 z-10 flex gap-1" aria-hidden="true">
        {items.map((it, n) => (
          <span key={it.src} className="h-[3px] flex-1 overflow-hidden rounded-full bg-crema-card/40">
            {n === i ? (
              <span
                key={`${i}-${pausado && reducido}`}
                className="block h-full origin-left rounded-full bg-crema-card"
                style={
                  pausado && reducido
                    ? { transform: 'scaleX(1)' }
                    : {
                        animation: `llenar ${it.duracion}s linear forwards`,
                        animationPlayState: corriendo ? 'running' : 'paused',
                      }
                }
                onAnimationEnd={() => ir(i + 1)}
              />
            ) : (
              <span className="block h-full origin-left rounded-full bg-crema-card" style={{ transform: `scaleX(${n < i ? 1 : 0})` }} />
            )}
          </span>
        ))}
      </div>

      {/* Zonas táctiles: izquierda = anterior, derecha = siguiente; mantener = pausa */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => ir(i - 1)}
        onPointerDown={() => setPausaTemporal(true)}
        onPointerUp={() => setPausaTemporal(false)}
        onPointerCancel={() => setPausaTemporal(false)}
        className="absolute inset-y-0 left-0 z-[5] w-1/3"
      />
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => ir(i + 1)}
        onPointerDown={() => setPausaTemporal(true)}
        onPointerUp={() => setPausaTemporal(false)}
        onPointerCancel={() => setPausaTemporal(false)}
        className="absolute inset-y-0 right-0 z-[5] w-2/3"
      />

      <button
        type="button"
        onClick={() => setPausaUsuario(!pausado)}
        aria-label={pausado ? 'Reproducir' : 'Pausar'}
        className="absolute top-7 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-[#16241C]/45 text-crema-card backdrop-blur-sm transition hover:bg-[#16241C]/65"
      >
        {pausado ? <Icon name="play" size={14} /> : <span className="flex gap-1"><span className="h-3 w-[3px] rounded bg-current" /><span className="h-3 w-[3px] rounded bg-current" /></span>}
      </button>
      <p className="sr-only">
        {i + 1} de {items.length}
      </p>
    </div>
  );
}
