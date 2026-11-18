import { Children, cloneElement, isValidElement, useLayoutEffect, useRef, useState } from 'react';
import { MotionConfig, m, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];
const VIEWPORT = { once: true, margin: '0px 0px 10% 0px' };
// La palabra en cursiva dorada entra un poco después y con un leve desplazamiento horizontal
const DORADO_DELAY = 0.14;
const DORADO_X = 14;

/**
 * Convierte los hijos (texto + <em className="texto-dorado">…</em>) en una lista de palabras.
 * La clase del envoltorio (ej. el degradé dorado) se pasa a la palabra que se anima: un
 * background-clip:text en el padre no pinta texto de un hijo con transform.
 */
function aPalabras(children) {
  const out = [];
  Children.forEach(children, (hijo) => {
    if (typeof hijo === 'string' || typeof hijo === 'number') {
      String(hijo)
        .split(/\s+/)
        .filter(Boolean)
        .forEach((t) => out.push({ t }));
    } else if (isValidElement(hijo)) {
      const texto = Children.toArray(hijo.props.children).join('');
      const clase = hijo.props.className;
      texto
        .split(/\s+/)
        .filter(Boolean)
        .forEach((t) => out.push({ t, clase, destacada: true, envolver: (n) => cloneElement(hijo, { className: undefined, children: n }) }));
    }
  });
  return out;
}

/**
 * Título que se revela por línea con máscara: cada línea sube desde translateY(100%) dentro de un
 * contenedor overflow-hidden, con stagger de 0.08s entre líneas. Una sola vez.
 * Uso: <RevealText as="h2" className="…">Hola, soy <em className="texto-dorado">Mar</em></RevealText>
 * `alCargar`: anima al montar (hero) en vez de al entrar en pantalla.
 * Movimiento reducido: misma secuencia pero cada línea sube solo 12px con fade (no 100%).
 */
export default function RevealText({ as = 'h2', children, className = '', delay = 0, alCargar = false, ...rest }) {
  const Tag = as;
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const [lineas, setLineas] = useState(null); // índice de línea de cada palabra
  const palabras = aPalabras(children);

  // Medir en qué línea cae cada palabra (y volver a medir si cambia el ancho)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => {
      let top = null;
      let n = -1;
      const res = [];
      el.querySelectorAll('[data-palabra]').forEach((s) => {
        const t = Math.round(s.offsetTop);
        if (top === null || Math.abs(t - top) > 4) {
          n += 1;
          top = t;
        }
        res.push(n);
      });
      setLineas(res);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [palabras.length]);

  // Animación de montaje (hero) o al entrar en pantalla: en ambos casos el destino es fijo,
  // así motion la ejecuta aunque sus features terminen de cargar después (LazyMotion).
  const destino = reducido ? { y: 0, x: 0, opacity: 1 } : { y: 0, x: 0 };
  const disparo = alCargar ? { animate: destino } : { whileInView: destino, viewport: VIEWPORT };
  let orden = 0; // posición de cada palabra destacada (desfasa el brillo del hero)

  // Este componente decide su propia versión reducida: el MotionConfig global ("user") anularía el desplazamiento de 12px.
  return (
    <MotionConfig reducedMotion="never">
      <Tag ref={ref} className={className} {...rest}>
        {palabras.map((p, i) => {
          const dx = p.destacada ? (reducido ? DORADO_X / 2 : DORADO_X) : 0;
          const interior = (
            <m.span
              className={`inline-block ${p.clase ?? ''}`}
              style={p.destacada ? { '--orden': orden++ } : undefined}
              initial={reducido ? { y: 12, x: dx, opacity: 0 } : { y: '100%', x: dx }}
              {...disparo}
              transition={{
                duration: reducido ? 0.6 : 0.8,
                delay: delay + (lineas?.[i] ?? 0) * 0.08 + (p.destacada ? DORADO_DELAY : 0),
                ease: EASE,
              }}
            >
              {p.t}
            </m.span>
          );
          return (
            <span key={i}>
              {/* máscara: deja espacio a descendentes (g, p) y a la inclinación de la cursiva */}
              <span data-palabra className={`-mb-[0.14em] inline-block pr-[0.06em] pb-[0.14em] align-bottom ${reducido ? '' : 'overflow-hidden'}`}>
                {p.envolver ? p.envolver(interior) : interior}
              </span>
              {i < palabras.length - 1 && ' '}
            </span>
          );
        })}
      </Tag>
    </MotionConfig>
  );
}
