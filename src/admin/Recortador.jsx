// Recorte cuadrado de una foto: se mueve arrastrando (un dedo o el mouse) y se agranda con dos dedos, la
// rueda del mouse o la barra de zoom (grande, para no depender de gestos). Lo que se ve en el cuadro es
// exactamente lo que se sube.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LADO_MINIMO } from './fotos.js';
import { Boton } from './ui.jsx';

const ZOOM_MAX = 4; // hasta 4 veces el encuadre inicial

/**
 * `foto`: { bitmap, ancho, alto, url } de abrirFoto(). `onListo({ x, y, lado })` en px de la foto.
 */
export default function Recortador({ foto, onListo, onCancelar, ocupado = false }) {
  const marco = useRef(null);
  const [vista, setVista] = useState(0); // lado del cuadro en px de pantalla
  const [estado, setEstado] = useState(null); // { s, x, y }: escala y posición de la foto dentro del cuadro
  const punteros = useRef(new Map());
  const gesto = useRef(null);

  const minimo = vista ? Math.max(vista / foto.ancho, vista / foto.alto) : 1; // la foto siempre cubre el cuadro
  const limitar = ({ s, x, y }) => {
    const esc = Math.min(Math.max(s, minimo), minimo * ZOOM_MAX);
    return {
      s: esc,
      x: Math.min(0, Math.max(vista - foto.ancho * esc, x)),
      y: Math.min(0, Math.max(vista - foto.alto * esc, y)),
    };
  };

  useLayoutEffect(() => {
    const el = marco.current;
    const medir = () => setVista(el.clientWidth);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Encuadre inicial: la foto cubre el cuadro, centrada
  useEffect(() => {
    if (!vista) return;
    const s = Math.max(vista / foto.ancho, vista / foto.alto);
    setEstado({ s, x: (vista - foto.ancho * s) / 2, y: (vista - foto.alto * s) / 2 });
  }, [vista, foto]);

  /** Zoom manteniendo quieto el punto (px, py) del cuadro. */
  const zoomEn = (nueva, px = vista / 2, py = vista / 2) =>
    setEstado((e) => {
      if (!e) return e;
      const k = Math.min(Math.max(nueva, minimo), minimo * ZOOM_MAX) / e.s;
      return limitar({ s: e.s * k, x: px - (px - e.x) * k, y: py - (py - e.y) * k });
    });

  const local = (ev) => {
    const r = marco.current.getBoundingClientRect();
    return [ev.clientX - r.left, ev.clientY - r.top];
  };

  const alBajar = (ev) => {
    marco.current.setPointerCapture(ev.pointerId);
    punteros.current.set(ev.pointerId, local(ev));
    gesto.current = null;
  };
  const alMover = (ev) => {
    if (!punteros.current.has(ev.pointerId) || !estado) return;
    const antes = [...punteros.current.values()];
    punteros.current.set(ev.pointerId, local(ev));
    const ahora = [...punteros.current.values()];
    if (ahora.length === 1) {
      const [[ax, ay]] = antes;
      const [[bx, by]] = ahora;
      setEstado((e) => limitar({ ...e, x: e.x + bx - ax, y: e.y + by - ay }));
    } else if (ahora.length >= 2) {
      const dist = (p) => Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
      const medio = (p) => [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2];
      const k = dist(ahora) / (dist(antes) || 1);
      const [mx, my] = medio(ahora);
      const [ox, oy] = medio(antes);
      setEstado((e) => {
        const s = Math.min(Math.max(e.s * k, minimo), minimo * ZOOM_MAX);
        const f = s / e.s;
        return limitar({ s, x: mx - (ox - e.x) * f, y: my - (oy - e.y) * f });
      });
    }
  };
  const alSoltar = (ev) => punteros.current.delete(ev.pointerId);

  useEffect(() => {
    const el = marco.current;
    const rueda = (ev) => {
      ev.preventDefault();
      const [px, py] = local(ev);
      setEstado((e) => {
        if (!e) return e;
        const s = Math.min(Math.max(e.s * (ev.deltaY < 0 ? 1.1 : 1 / 1.1), minimo), minimo * ZOOM_MAX);
        const k = s / e.s;
        return limitar({ s, x: px - (px - e.x) * k, y: py - (py - e.y) * k });
      });
    };
    el.addEventListener('wheel', rueda, { passive: false });
    return () => el.removeEventListener('wheel', rueda);
  });

  const recorte = estado ? { x: -estado.x / estado.s, y: -estado.y / estado.s, lado: vista / estado.s } : null;
  const borrosa = recorte && recorte.lado < LADO_MINIMO;
  const nivel = estado ? Math.round(((estado.s / minimo - 1) / (ZOOM_MAX - 1)) * 100) : 0;

  return (
    <div className="space-y-4">
      <p className="text-[17px] text-texto-suave">Mové la foto con el dedo y agrandala para encuadrar. Lo que ves en el cuadro es lo que se va a ver en la tienda.</p>
      <div
        ref={marco}
        className="relative mx-auto aspect-square w-full max-w-[28rem] cursor-grab touch-none overflow-hidden rounded-2xl bg-tinta/10 select-none active:cursor-grabbing"
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        aria-label="Encuadre de la foto"
        role="img"
      >
        {estado && (
          <img
            src={foto.url}
            alt=""
            draggable={false}
            className="pointer-events-none absolute top-0 left-0 max-w-none origin-top-left"
            style={{ width: foto.ancho, height: foto.alto, transform: `translate(${estado.x}px, ${estado.y}px) scale(${estado.s})` }}
          />
        )}
        {/* Guía: el centro del cuadro */}
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/80 ring-inset" aria-hidden="true" />
      </div>

      <div className="mx-auto flex max-w-[28rem] items-center gap-3">
        <Boton variante="suave" className="min-w-12 text-2xl" aria-label="Achicar" onClick={() => estado && zoomEn(estado.s / 1.25)}>
          −
        </Boton>
        <label className="flex-1">
          <span className="sr-only">Zoom</span>
          <input
            type="range"
            min="0"
            max="100"
            value={nivel}
            onChange={(e) => zoomEn(minimo * (1 + (Number(e.target.value) / 100) * (ZOOM_MAX - 1)))}
            className="h-12 w-full accent-verde"
          />
        </label>
        <Boton variante="suave" className="min-w-12 text-2xl" aria-label="Agrandar" onClick={() => estado && zoomEn(estado.s * 1.25)}>
          +
        </Boton>
      </div>

      {borrosa && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-base font-semibold text-amber-900">Con tanto zoom la foto se va a ver borrosa. Achicala un poco si podés.</p>
      )}

      <div className="flex flex-col gap-3">
        <Boton grande ancho disabled={!recorte || ocupado} onClick={() => onListo(recorte)}>
          {ocupado ? 'Subiendo la foto…' : 'Usar esta foto'}
        </Boton>
        <Boton variante="secundario" ancho disabled={ocupado} onClick={onCancelar}>
          Cancelar
        </Boton>
      </div>
    </div>
  );
}
