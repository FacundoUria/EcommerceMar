// "Promoción" del formulario de producto (plegable): precio promo, "antes" tachado, cartel, fechas y, para los
// kits, qué trae y qué se elige al comprarlo. En la tienda todo se prende y se apaga solo por fecha.
import { Boton, Campo, ENTRADA, EntradaPrecio, Interruptor } from './ui.jsx';
import { formatPrecio, leerPrecio, textoPrecio } from './util.js';

const HORA = 3600 * 1000;
/** "2026-11-24T03:00:00+00:00" → "2026-11-24" (el día en Argentina). */
const diaArg = (iso) => (iso ? new Date(Date.parse(iso) - 3 * HORA).toISOString().slice(0, 10) : '');
let claveNueva = 0;

export const aFormPromo = (p) => ({
  precioPromo: textoPrecio(p?.precio_promo),
  precioAntes: textoPrecio(p?.precio_antes),
  nombre: p?.promo_nombre ?? '',
  desde: diaArg(p?.promo_desde),
  hasta: diaArg(p?.promo_hasta),
  soloEnPromo: Boolean(p?.solo_en_promo),
  incluye: p?.incluye ?? '',
  elecciones: (p?.elecciones ?? []).map((e, i) => ({
    k: `e${i}`,
    titulo: e.titulo ?? '',
    clave: e.clave ?? '',
    tipo: e.variantesDe ? 'variantes' : 'lista',
    opciones: (e.opciones ?? []).join('\n'),
    variantesDe: e.variantesDe ?? '',
  })),
});

const limpio = (s) => s.trim() || null;
export const aDatosPromo = (f) => ({
  precio_promo: leerPrecio(f.precioPromo),
  precio_antes: leerPrecio(f.precioAntes),
  promo_nombre: limpio(f.nombre),
  // Desde las 0:00 del primer día hasta las 23:59 del último (hora de Argentina)
  promo_desde: f.desde ? `${f.desde}T00:00:00-03:00` : null,
  promo_hasta: f.hasta ? `${f.hasta}T23:59:59-03:00` : null,
  solo_en_promo: f.soloEnPromo,
  incluye: limpio(f.incluye),
  elecciones: f.elecciones.map((e) => {
    const base = { titulo: e.titulo.trim(), clave: e.clave.trim() || e.titulo.trim() };
    return e.tipo === 'variantes'
      ? { ...base, variantesDe: e.variantesDe }
      : { ...base, opciones: e.opciones.split('\n').map((o) => o.trim()).filter(Boolean) };
  }),
});

/** Errores de la promo ({ promo: '…', 'e-<k>': '…' }). */
export function validarPromo(f) {
  const e = {};
  const algo = f.precioPromo.trim() || f.precioAntes.trim() || f.nombre.trim() || f.soloEnPromo;
  if (algo && (!f.desde || !f.hasta)) e.promo = 'Elegí desde qué día y hasta qué día dura la promoción.';
  else if (f.desde && f.hasta && f.hasta < f.desde) e.promo = 'El último día tiene que ser después del primero.';
  for (const x of f.elecciones) {
    if (!x.titulo.trim()) e[`e-${x.k}`] = 'Escribí qué tiene que elegir (ej: Elegí tu shampoo).';
    else if (x.tipo === 'lista' && !x.opciones.trim()) e[`e-${x.k}`] = 'Escribí las opciones, una por renglón.';
    else if (x.tipo === 'variantes' && !x.variantesDe) e[`e-${x.k}`] = 'Elegí de qué producto salen las opciones.';
  }
  return e;
}

/** ¿Tiene algo de promoción cargado? (la sección arranca abierta) */
export const tienePromo = (f) => Boolean(f.precioPromo || f.precioAntes || f.nombre || f.desde || f.soloEnPromo || f.incluye || f.elecciones.length);

export default function PromoCampos({ promo, onCambio, errores, precioProducto, productos }) {
  const cambiar = (campo, valor) => onCambio({ ...promo, [campo]: valor });
  const cambiarEleccion = (k, campo, valor) => cambiar('elecciones', promo.elecciones.map((e) => (e.k === k ? { ...e, [campo]: valor } : e)));
  const conVariantes = productos.filter((p) => p.variantes?.length).sort((a, b) => (a.nombre_corto || a.nombre).localeCompare(b.nombre_corto || b.nombre));
  const nombreDe = (p) => `${p.marca ? `${p.marca} — ` : ''}${p.nombre_corto || p.nombre}`;

  return (
    <details className="group rounded-2xl border-2 border-linea bg-crema-card" open={tienePromo(promo)}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-serif text-2xl text-tinta">
        Promoción
        <span className="font-sans text-base font-bold text-verde group-open:hidden">Abrir</span>
        <span className="hidden font-sans text-base font-bold text-verde group-open:inline">Cerrar</span>
      </summary>
      <div className="space-y-5 border-t border-linea px-4 pt-4 pb-5">
        <p className="text-base text-texto-suave">
          Entre el primer y el último día, la tienda muestra el precio de promoción con el precio de antes tachado y el
          cartel. Después vuelve sola al precio de siempre.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Primer día">
            {(id, a) => <input id={id} {...a} type="date" className={ENTRADA} value={promo.desde} onChange={(e) => cambiar('desde', e.target.value)} />}
          </Campo>
          <Campo etiqueta="Último día" ayuda="Incluido: termina a las 23:59.">
            {(id, a) => <input id={id} {...a} type="date" className={ENTRADA} value={promo.hasta} onChange={(e) => cambiar('hasta', e.target.value)} />}
          </Campo>
        </div>
        {errores.promo && (
          <p className="text-base font-semibold text-red-700" role="alert">
            {errores.promo}
          </p>
        )}
        <Campo
          etiqueta="Precio de promoción"
          opcional
          ayuda={precioProducto != null ? `El de siempre es ${formatPrecio(precioProducto)}. Vacío = no cambia el precio.` : 'Vacío = no cambia el precio.'}
        >
          {(id, a) => <EntradaPrecio id={id} {...a} valor={promo.precioPromo} onCambio={(v) => cambiar('precioPromo', v)} placeholder="Ej: 13.000" />}
        </Campo>
        <Campo etiqueta="Precio de antes (tachado)" opcional ayuda="Vacío = se tacha el precio de siempre.">
          {(id, a) => <EntradaPrecio id={id} {...a} valor={promo.precioAntes} onCambio={(v) => cambiar('precioAntes', v)} placeholder="Ej: 18.000" />}
        </Campo>
        <Campo etiqueta="Texto del cartel" opcional ayuda="Ej: Black Friday. Vacío = «Promo».">
          {(id, a) => <input id={id} {...a} className={ENTRADA} value={promo.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />}
        </Campo>
        <Interruptor
          activo={promo.soloEnPromo}
          onCambio={(v) => cambiar('soloEnPromo', v)}
          etiqueta="Mostrarlo solo durante la promoción"
          descripcion="Para los kits: antes y después de esas fechas no aparece en la tienda."
        />

        <h3 className="pt-2 font-serif text-xl text-tinta">Si es un kit</h3>
        <Campo etiqueta="Qué trae" opcional ayuda="Una cosa por renglón. Ej: Shampoo a elección">
          {(id, a) => <textarea id={id} {...a} rows={4} className={`${ENTRADA} leading-relaxed`} value={promo.incluye} onChange={(e) => cambiar('incluye', e.target.value)} />}
        </Campo>
        {promo.elecciones.map((x, i) => (
          <fieldset key={x.k} className="card space-y-4 rounded-2xl p-4">
            <legend className="sr-only">Para elegir {i + 1}</legend>
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-bold">Para elegir {i + 1}</span>
              <Boton variante="peligro" className="px-3" onClick={() => cambiar('elecciones', promo.elecciones.filter((e) => e.k !== x.k))}>
                Quitar
              </Boton>
            </div>
            <Campo etiqueta="Qué tiene que elegir" ayuda="Así se ve arriba del selector. Ej: Elegí tu shampoo" error={errores[`e-${x.k}`]}>
              {(id, a) => <input id={id} {...a} className={ENTRADA} value={x.titulo} onChange={(e) => cambiarEleccion(x.k, 'titulo', e.target.value)} />}
            </Campo>
            <Campo etiqueta="Cómo aparece en el pedido" opcional ayuda="Una palabra. Ej: Shampoo → «Shampoo: Rulos Definidos»">
              {(id, a) => <input id={id} {...a} className={ENTRADA} value={x.clave} onChange={(e) => cambiarEleccion(x.k, 'clave', e.target.value)} />}
            </Campo>
            <Campo etiqueta="Opciones">
              {(id, a) => (
                <select id={id} {...a} className={ENTRADA} value={x.tipo} onChange={(e) => cambiarEleccion(x.k, 'tipo', e.target.value)}>
                  <option value="lista">Las escribo yo</option>
                  <option value="variantes">Las variantes de un producto (se actualizan solas)</option>
                </select>
              )}
            </Campo>
            {x.tipo === 'lista' ? (
              <Campo etiqueta="Las opciones" ayuda="Una por renglón.">
                {(id, a) => <textarea id={id} {...a} rows={5} className={`${ENTRADA} leading-relaxed`} value={x.opciones} onChange={(e) => cambiarEleccion(x.k, 'opciones', e.target.value)} />}
              </Campo>
            ) : (
              <Campo etiqueta="De qué producto">
                {(id, a) => (
                  <select id={id} {...a} className={ENTRADA} value={x.variantesDe} onChange={(e) => cambiarEleccion(x.k, 'variantesDe', e.target.value)}>
                    <option value="">Elegí un producto…</option>
                    {conVariantes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {nombreDe(p)} ({p.variantes.length})
                      </option>
                    ))}
                  </select>
                )}
              </Campo>
            )}
          </fieldset>
        ))}
        <Boton
          variante="secundario"
          ancho
          onClick={() => cambiar('elecciones', [...promo.elecciones, { k: `n${++claveNueva}`, titulo: '', clave: '', tipo: 'lista', opciones: '', variantesDe: '' }])}
        >
          ＋ Agregar algo para elegir
        </Boton>
      </div>
    </details>
  );
}
