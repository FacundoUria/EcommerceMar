import { m, useReducedMotion } from 'motion/react';

const EASE = [0.76, 0, 0.24, 1];

/**
 * Revela una imagen "con cortina": clip-path inset de 100% a 0 de abajo hacia arriba (0.9s)
 * + escala del contenido de 1.15 a 1, al entrar en pantalla (una vez). Estático con movimiento reducido.
 * El padre define tamaño y bordes; este componente ocupa todo (size-full).
 */
export default function RevealImagen({ children, className = '', delay = 0 }) {
  const reducido = useReducedMotion();
  if (reducido) return <div className={`size-full ${className}`}>{children}</div>;
  return (
    <m.div
      className={`size-full overflow-hidden ${className}`}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px 10% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      <m.div
        className="size-full"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '0px 0px 10% 0px' }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </m.div>
  );
}
