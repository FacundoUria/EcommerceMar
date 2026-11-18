import { m, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1]; // ease-out suave

/**
 * Aparición al entrar en pantalla: fade + translateY (24px → 0), UNA sola vez.
 * Con prefers-reduced-motion se renderiza estático (sin animar ni opacidad).
 * `delay` sirve para cascadas: pasar índice * 0.06.
 */
export default function Reveal({ children, delay = 0, y = 24, duration = 0.6, className = '', as = 'div', ...rest }) {
  const reducido = useReducedMotion();
  if (reducido) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }
  const Comp = m[as];
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Delay de cascada (stagger 0.06s) que se reinicia cada `porFila` ítems. */
export const cascada = (i, porFila = 4) => (i % porFila) * 0.06;
