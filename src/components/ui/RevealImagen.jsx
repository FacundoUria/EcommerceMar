import { useRef } from 'react';
import { m, useInView, useReducedMotion } from 'motion/react';

const EASE = [0.76, 0, 0.24, 1];
const OCULTO = 'inset(100% 0% 0% 0%)';

/**
 * Revela una imagen "con cortina": clip-path inset de 100% a 0 de abajo hacia arriba (0.9s)
 * + escala del contenido de 1.15 a 1, al entrar en pantalla (una vez). Con movimiento reducido: fade.
 *
 * `listo`: la cortina no se abre hasta que el contenido está cargado (ej. el poster de un video),
 * así nunca se revela una caja vacía. La animación se monta recién cuando está listo y en pantalla
 * (animación de montaje: funciona aunque las features de motion carguen después).
 */
export default function RevealImagen({ children, className = '', delay = 0, listo = true }) {
  const reducido = useReducedMotion();
  const ref = useRef(null);
  const enPantalla = useInView(ref, { once: true, margin: '0px 0px 10% 0px' });

  const abrir = enPantalla && listo;

  if (reducido) {
    return (
      <div ref={ref} className={`size-full ${className}`}>
        <m.div className="size-full" initial={{ opacity: 0 }} animate={{ opacity: abrir ? 1 : 0 }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
          {children}
        </m.div>
      </div>
    );
  }
  return (
    <div ref={ref} className={`size-full ${className}`}>
      {abrir ? (
        <m.div
          className="size-full overflow-hidden"
          initial={{ clipPath: OCULTO }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 0.9, delay, ease: EASE }}
        >
          <m.div className="size-full" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
          </m.div>
        </m.div>
      ) : (
        // Cerrada: el contenido ya está montado (y cargando) pero oculto por la cortina
        <div className="size-full overflow-hidden" style={{ clipPath: OCULTO }}>
          <div className="size-full" style={{ transform: 'scale(1.15)' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
