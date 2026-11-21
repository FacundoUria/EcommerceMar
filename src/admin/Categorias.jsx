// Categorías del panel: lista (con orden), crear/editar (nombre, portada, paso de la rutina) y borrar
// (si tiene productos, primero se pasan a otra categoría).
import { useEffect, useRef, useState } from 'react';
import { Enlace, irA } from './ruta.jsx';
import { PASOS_RUTINA } from '../config/negocio.js';
import { imgFija } from '../lib/imagenes.js';
import { useCambiosSinGuardar, useDatos } from './contexto.jsx';
import { borrarCategoria, guardarCategoria, reordenar } from './datos.js';
import FotoCampo from './FotoCampo.jsx';
import { borrarFotos } from './fotos.js';
import { BarraGuardar, EncabezadoForm, ErrorCarga, SubirBajar } from './partes.jsx';
import { Boton, Campo, Cargando, Dialogo, ENTRADA, useAvisos } from './ui.jsx';
import { mensajeError } from './util.js';

const textoPaso = (paso) => {
  const p = PASOS_RUTINA.find((x) => x.paso === paso);
  return p ? `Rutina: paso ${p.paso} (${p.titulo})` : null;
};
/** Portada de la lista: la propia o la del primer producto (como en la tienda). */
const portadaDe = (c, productos) => c.portada ?? productos.find((p) => p.categoria_id === c.id && p.activo && p.fotos?.[0])?.fotos[0] ?? null;

export function ListaCategorias() {
  const { datos, error, recargar } = useDatos();
  const avisar = useAvisos();
  const [ocupado, setOcupado] = useState(false);
  if (!datos) return error ? <ErrorCarga onReintentar={() => recargar().catch(() => {})} /> : <Cargando />;

  const mover = async (i, d) => {
    const filas = [...datos.categorias];
    [filas[i], filas[i + d]] = [filas[i + d], filas[i]];
    setOcupado(true);
    try {
      await reordenar('categorias', filas);
      await recargar();
      avisar('Orden guardado ✓');
    } catch (e) {
      avisar(mensajeError(e), 'error');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-3xl text-tinta">Categorías</h1>
      <p className="text-base text-texto-suave">Con las flechas elegís en qué orden aparecen en la tienda.</p>
      <Enlace to="/admin/categorias/nueva" className="btn-primario flex min-h-14 w-full items-center justify-center rounded-2xl text-lg font-bold text-arena">
        ＋ Nueva categoría
      </Enlace>
      <ul className="space-y-3">
        {datos.categorias.map((c, i) => {
          const productos = datos.productos.filter((p) => p.categoria_id === c.id);
          const visibles = productos.filter((p) => p.activo).length;
          const foto = portadaDe(c, datos.productos);
          return (
            <li key={c.id} className="card flex items-center gap-3 rounded-2xl p-3">
              <Enlace to={`/admin/categorias/${c.id}`} className="flex min-h-20 min-w-0 flex-1 items-center gap-3">
                <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-salvia-media">
                  {foto && <img {...imgFija(foto, 64)} alt="" width="64" height="64" loading="lazy" className="size-full object-cover" />}
                </span>
                <span className="min-w-0 flex-1 space-y-0.5">
                  <span className="block text-[17px] font-bold text-tinta">{c.nombre}</span>
                  <span className="block text-base text-texto-suave">
                    {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
                    {productos.length !== visibles ? ` (${visibles} visibles)` : ''}
                  </span>
                  {textoPaso(c.paso) && <span className="block text-base text-verde">{textoPaso(c.paso)}</span>}
                  {visibles === 0 && <span className="block text-base text-amber-800">Sin productos visibles: no aparece en la tienda.</span>}
                </span>
              </Enlace>
              <SubirBajar
                nombre={c.nombre}
                primero={i === 0}
                ultimo={i === datos.categorias.length - 1}
                ocupado={ocupado}
                onSubir={() => mover(i, -1)}
                onBajar={() => mover(i, 1)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const aForm = (c) => ({ nombre: c?.nombre ?? '', portada: c?.portada ?? null, paso: c?.paso ?? null });

export function FormCategoria({ id }) {
  const { datos, error, recargar } = useDatos();
  if (!datos) return error ? <ErrorCarga onReintentar={() => recargar().catch(() => {})} /> : <Cargando />;
  const original = id ? datos.categorias.find((c) => c.id === id) : null;
  if (id && !original)
    return (
      <div className="space-y-4">
        <p className="text-lg">Esa categoría no existe (quizás se borró).</p>
        <Enlace to="/admin/categorias" className="text-[17px] font-bold text-verde underline">
          Volver a categorías
        </Enlace>
      </div>
    );
  return <Formulario key={id ?? 'nueva'} original={original} datos={datos} recargar={recargar} />;
}

function Formulario({ original, datos, recargar }) {
  const avisar = useAvisos();
  const [inicial, setInicial] = useState(() => aForm(original));
  const [form, setForm] = useState(inicial);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [destino, setDestino] = useState('');
  const subidas = useRef([]);
  const sucio = JSON.stringify(form) !== JSON.stringify(inicial);
  const dialogo = useCambiosSinGuardar(sucio);
  const productos = original ? datos.productos.filter((p) => p.categoria_id === original.id) : [];
  const otras = datos.categorias.filter((c) => c.id !== original?.id);

  useEffect(
    () => () => {
      if (subidas.current.length) borrarFotos(subidas.current).catch(() => {});
    },
    [],
  );

  const guardar = async () => {
    if (!form.nombre.trim()) {
      setError('Escribí el nombre de la categoría.');
      return;
    }
    setGuardando(true);
    try {
      const id = await guardarCategoria({ nombre: form.nombre.trim(), portada: form.portada, paso: form.paso }, original, datos.categorias);
      const viejas = [original?.portada, ...subidas.current].filter((u) => u && u !== form.portada);
      subidas.current = [];
      borrarFotos(viejas).catch(() => {});
      const nuevos = await recargar();
      const listo = aForm(nuevos.categorias.find((c) => c.id === id));
      setInicial(listo);
      setForm(listo);
      avisar('Guardado ✓');
      if (!original) {
        irA(`/admin/categorias/${id}`, { reemplazar: true, forzar: true });
      }
    } catch (e) {
      avisar(mensajeError(e), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    if (productos.length && !destino) return;
    setGuardando(true);
    try {
      await borrarCategoria(original, productos.length ? destino : null);
      irA('/admin/categorias', { reemplazar: true, forzar: true });
      const a = otras.find((c) => c.id === destino)?.nombre;
      avisar(productos.length ? `Productos pasados a «${a}» y categoría borrada ✓` : 'Categoría borrada ✓');
      recargar().catch(() => {});
    } catch (e) {
      avisar(mensajeError(e), 'error');
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <EncabezadoForm volverA="/admin/categorias" textoVolver="Volver a categorías" titulo={original ? original.nombre : 'Nueva categoría'} />

      <Campo etiqueta="Nombre" error={error}>
        {(id, a) => (
          <input
            id={id}
            {...a}
            className={ENTRADA}
            value={form.nombre}
            onChange={(e) => {
              setForm((f) => ({ ...f, nombre: e.target.value }));
              setError(null);
            }}
          />
        )}
      </Campo>

      <FotoCampo
        etiqueta="Foto de portada"
        opcional
        ayuda="Si no le ponés foto, usa la del primer producto de la categoría."
        valor={form.portada}
        onCambio={(v) => setForm((f) => ({ ...f, portada: v }))}
        onSubida={(u) => subidas.current.push(u)}
      />

      <details className="group rounded-2xl border border-linea bg-crema-card">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 text-[17px] font-bold">
          Opciones avanzadas
          <span className="text-xl transition group-open:rotate-180" aria-hidden="true">
            ⌄
          </span>
        </summary>
        <fieldset className="space-y-2 px-4 pb-4">
          <legend className="mb-2 text-base text-texto-suave">¿En qué paso de «Armá tu rutina» aparecen sus productos?</legend>
          {[null, ...PASOS_RUTINA.map((p) => p.paso)].map((paso) => (
            <label key={paso ?? 'no'} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 ${form.paso === paso ? 'border-verde bg-salvia' : 'border-transparent'}`}>
              <input type="radio" name="paso" className="size-5 accent-verde" checked={form.paso === paso} onChange={() => setForm((f) => ({ ...f, paso }))} />
              <span className="text-[17px]">{paso ? textoPaso(paso).replace('Rutina: p', 'P') : 'No aparece en la rutina'}</span>
            </label>
          ))}
        </fieldset>
      </details>

      {original && (
        <section className="border-t border-linea pt-6">
          <Boton variante="peligro" ancho onClick={() => setBorrando(true)}>
            Borrar esta categoría…
          </Boton>
        </section>
      )}

      <BarraGuardar sucio={sucio || !original} guardando={guardando} onGuardar={guardar} texto={original ? 'Guardar cambios' : 'Crear categoría'} />

      {original && (
        <Dialogo
          abierto={borrando}
          onCerrar={() => setBorrando(false)}
          titulo={`¿Borrar «${original.nombre}»?`}
          acciones={
            <>
              <Boton variante="peligroLleno" grande ancho disabled={guardando || (productos.length > 0 && !destino)} onClick={borrar}>
                {guardando ? 'Borrando…' : productos.length ? 'Mover y borrar' : 'Borrar categoría'}
              </Boton>
              <Boton variante="suave" ancho onClick={() => setBorrando(false)}>
                Cancelar
              </Boton>
            </>
          }
        >
          {productos.length ? (
            <>
              <p>
                Tiene {productos.length} {productos.length === 1 ? 'producto' : 'productos'}. Antes de borrarla, elegí a qué categoría pasarlos:
              </p>
              <label className="block">
                <span className="sr-only">Mover sus productos a</span>
                <select className={ENTRADA} value={destino} onChange={(e) => setDestino(e.target.value)}>
                  <option value="">Mover sus productos a…</option>
                  {otras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <p>No tiene productos. Se borra para siempre.</p>
          )}
        </Dialogo>
      )}
      {dialogo}
    </div>
  );
}
