import { motion } from 'motion/react';

/** Aparición suave al entrar en pantalla (MotionConfig reducedMotion="user" la apaga si corresponde). */
export default function Reveal({ children, delay = 0, y = 24, className = '', as = 'div', ...rest }) {
  const Comp = motion[as];
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}
