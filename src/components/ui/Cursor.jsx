import { useEffect, useRef, useState } from 'react';

const TAM = 72; // tamaño real del círculo; se escala para cada estado (solo transform)
const ESCALA = { normal: 12 / TAM, ver: 1, chico: 6 / TAM };
const CAMPOS = 'input, textarea, select, [contenteditable="true"]';
const INTERACTIVOS = 'a, button, [role="button"], label, summary';

/**
 * Cursor propio (solo desktop con mouse y sin movimiento reducido):
 * círculo verde de 12px que sigue al mouse con inercia; sobre cards de producto/categoría
 * ([data-cursor="ver"]) crece a 72px con "Ver"; sobre links/botones se achica.
 * En campos de texto se oculta y queda el cursor nativo.
 */
export default function Cursor() {
  const [activo, setActivo] = useState(false);
  const exterior = useRef(null);
  const interior = useRef(null);
  const texto = useRef(null);

  useEffect(() => {
    const ok = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setActivo(ok);
  }, []);

  useEffect(() => {
    if (!activo) return;
    document.documentElement.classList.add('cursor-propio');
    const pos = { x: -100, y: -100 };
    const obj = { x: -100, y: -100 };
    let estado = 'normal';
    let visible = false;
    let raf = 0;

    const aplicarEstado = (nuevo, mostrar) => {
      if (nuevo !== estado) {
        estado = nuevo;
        interior.current.style.transform = `scale(${ESCALA[nuevo]})`;
        texto.current.style.opacity = nuevo === 'ver' ? '1' : '0';
      }
      if (mostrar !== visible) {
        visible = mostrar;
        exterior.current.style.opacity = mostrar ? '1' : '0';
      }
    };

    const mover = (e) => {
      obj.x = e.clientX;
      obj.y = e.clientY;
      if (pos.x < 0) {
        pos.x = obj.x;
        pos.y = obj.y;
      }
      const el = e.target;
      if (el.closest?.(CAMPOS)) return aplicarEstado(estado, false);
      const boton = el.closest?.('button, input, select');
      if (el.closest?.('[data-cursor="ver"]') && !boton) return aplicarEstado('ver', true);
      if (el.closest?.(INTERACTIVOS)) return aplicarEstado('chico', true);
      aplicarEstado('normal', true);
    };
    const salir = () => aplicarEstado(estado, false);

    const loop = () => {
      // inercia: se acerca un 18% por frame
      pos.x += (obj.x - pos.x) * 0.18;
      pos.y += (obj.y - pos.y) * 0.18;
      exterior.current.style.transform = `translate3d(${pos.x - TAM / 2}px, ${pos.y - TAM / 2}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', mover, { passive: true });
    document.addEventListener('pointerleave', salir);
    window.addEventListener('blur', salir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', mover);
      document.removeEventListener('pointerleave', salir);
      window.removeEventListener('blur', salir);
      document.documentElement.classList.remove('cursor-propio');
    };
  }, [activo]);

  if (!activo) return null;
  return (
    <div ref={exterior} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[100] opacity-0 transition-opacity duration-300" style={{ width: TAM, height: TAM }}>
      <div
        ref={interior}
        className="flex size-full items-center justify-center rounded-full bg-verde/90 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `scale(${ESCALA.normal})` }}
      >
        <span ref={texto} className="text-sm font-bold text-arena opacity-0 transition-opacity duration-300">
          Ver
        </span>
      </div>
    </div>
  );
}
