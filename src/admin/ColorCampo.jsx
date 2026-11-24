// "Esta variante es un color" + la paleta (16 colores comunes y "Otro color" con selector libre).
// Grande y simple: cuadrados de 56 px con el nombre abajo, el elegido con aro verde y tilde.
import { useId } from 'react';
import { PALETA_COLORES } from '../config/colores-variantes.js';
import { esColorClaro } from '../lib/variantes.js';
import { Interruptor } from './ui.jsx';

const ARCOIRIS = 'conic-gradient(#e5484d, #f5d443, #5fbf6f, #3fbfb5, #2e5daa, #8a5cb8, #d63384, #e5484d)';

function Tilde({ color }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-7 ${esColorClaro(color) ? 'text-tinta' : 'text-white'}`} aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CUADRADO = 'flex size-14 items-center justify-center rounded-xl inset-ring inset-ring-tinta/25';
const ELEGIDO = 'ring-[3px] ring-verde ring-offset-2 ring-offset-white';

/** `esColor`, `color` ('#rrggbb' o ''); onCambio({ esColor, color }). */
export default function ColorCampo({ esColor, color, error, onCambio, nombreVariante }) {
  const id = useId();
  const actual = color?.toLowerCase() ?? '';
  const enPaleta = PALETA_COLORES.some((c) => c.hex === actual);
  const otro = actual && !enPaleta;
  return (
    <div className="space-y-3">
      <Interruptor
        activo={esColor}
        onCambio={(v) => onCambio({ esColor: v, color })}
        etiqueta="Esta variante es un color"
        descripcion="En la tienda se ve como un cuadradito de ese color."
      />
      {esColor && (
        <fieldset className="space-y-3" aria-describedby={error ? `${id}-error` : undefined}>
          <legend className="text-[17px] font-bold text-tinta">Elegí el color{nombreVariante ? ` de «${nombreVariante}»` : ''}</legend>
          <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6">
            {PALETA_COLORES.map((c) => {
              const elegido = c.hex === actual;
              return (
                <button
                  key={c.hex}
                  type="button"
                  aria-pressed={elegido}
                  onClick={() => onCambio({ esColor: true, color: c.hex })}
                  className="flex flex-col items-center gap-1.5 rounded-xl py-1 text-center focus-visible:outline-2 focus-visible:outline-verde"
                >
                  <span className={`${CUADRADO} ${elegido ? ELEGIDO : ''}`} style={{ backgroundColor: c.hex }}>
                    {elegido && <Tilde color={c.hex} />}
                  </span>
                  <span className={`text-[15px] leading-tight text-tinta ${elegido ? 'font-bold' : ''}`}>{c.nombre}</span>
                </button>
              );
            })}
            {/* Otro color: el selector del navegador (rueda de colores), tapado por el cuadrado */}
            <label className="relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl py-1 text-center focus-within:outline-2 focus-within:outline-verde">
              <span className={`${CUADRADO} ${otro ? ELEGIDO : ''}`} style={{ background: otro ? actual : ARCOIRIS }}>
                {otro && <Tilde color={actual} />}
              </span>
              <span className={`text-[15px] leading-tight text-tinta ${otro ? 'font-bold' : ''}`}>Otro color</span>
              <input
                type="color"
                value={actual || '#c4a7dc'}
                onChange={(e) => onCambio({ esColor: true, color: e.target.value.toLowerCase() })}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                aria-label="Elegir otro color"
              />
            </label>
          </div>
          {error && (
            <p id={`${id}-error`} className="text-base font-semibold text-red-800">
              {error}
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
}
