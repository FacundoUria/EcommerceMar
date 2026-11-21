// Productos del panel: lista con buscador y filtros + formulario de crear/editar (con variantes y fotos).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Enlace, irA } from './ruta.jsx';
import { productoDeFila } from '../lib/catalogo.js';
import { imgFija } from '../lib/imagenes.js';
import { useCambiosSinGuardar, useDatos } from './contexto.jsx';
import { borrarProducto, cambiarVisible, fotosDeProducto, guardarCategoria, guardarFondos, guardarProducto } from './datos.js';
import FotoCampo from './FotoCampo.jsx';
import { borrarFotos } from './fotos.js';
import { BarraGuardar, DialogoBorrar, EncabezadoForm, ErrorCarga, SubirBajar } from './partes.jsx';
import { Boton, Campo, Cargando, Dialogo, ENTRADA, EntradaPrecio, Insignia, Interruptor, useAvisos } from './ui.jsx';
import { formatPrecio, leerPrecio, mensajeError, normalizar, textoPrecio } from './util.js';

// Los filtros de la lista se recuerdan mientras el panel está abierto (al volver de editar siguen igual)
const filtros = { busca: '', categoria: '', ocultos: false };

/** "$ 15.000", "Desde $ 25.000" o "Sin precio". */
function precioDeLista(fila) {
  const p = productoDeFila(fila);
  if (p.precio == null) return { texto: 'Sin precio', falta: true };
  return { texto: `${p.desde ? 'Desde ' : ''}${formatPrecio(p.precio)}`, falta: false };
}

export function ListaProductos() {
  const { datos, error, recargar } = useDatos();
  const [busca, setBusca] = useState(filtros.busca);
  const [categoria, setCategoria] = useState(filtros.categoria);
  const [ocultos, setOcultos] = useState(filtros.ocultos);
  Object.assign(filtros, { busca, categoria, ocultos });

  const lista = useMemo(() => {
    if (!datos) return [];
    const q = normalizar(busca.trim());
    return datos.productos.filter(
      (p) =>
        (!categoria || p.categoria_id === categoria) &&
        (!ocultos || !p.activo) &&
        (!q || normalizar([p.nombre, p.nombre_corto, p.marca, ...(p.alias ?? [])].join(' ')).includes(q)),
    );
  }, [datos, busca, categoria, ocultos]);

  if (!datos) return error ? <ErrorCarga onReintentar={() => recargar().catch(() => {})} /> : <Cargando />;
  const nombreCat = Object.fromEntries(datos.categorias.map((c) => [c.id, c.nombre]));
  const cantOcultos = datos.productos.filter((p) => !p.activo).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-serif text-3xl text-tinta">Productos</h1>
        <p className="text-base text-texto-suave">
          {datos.productos.length} en total · {cantOcultos} ocultos
        </p>
      </div>
      <Enlace to="/admin/productos/nuevo" className="btn-primario flex min-h-14 w-full items-center justify-center rounded-2xl text-lg font-bold text-arena">
        ＋ Nuevo producto
      </Enlace>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[17px] font-bold">Buscar</span>
          <input type="search" className={ENTRADA} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nombre o marca" />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="block flex-1">
            <span className="sr-only">Categoría</span>
            <select className={ENTRADA} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {datos.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-pressed={ocultos}
            onClick={() => setOcultos(!ocultos)}
            className={`min-h-12 rounded-xl border-2 px-5 text-[17px] font-bold ${ocultos ? 'border-verde bg-verde text-arena' : 'border-tinta/25 bg-white text-tinta'}`}
          >
            {ocultos ? '✓ ' : ''}Solo ocultos ({cantOcultos})
          </button>
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="py-8 text-center text-lg text-texto-suave">No hay productos con esos filtros.</p>
      ) : (
        <ul className="space-y-3">
          {lista.map((fila) => {
            const p = productoDeFila(fila);
            const precio = precioDeLista(fila);
            const foto = fila.fotos?.[0];
            return (
              <li key={fila.id}>
                <Enlace
                  to={`/admin/productos/${fila.id}`}
                  className={`card flex min-h-24 items-center gap-4 rounded-2xl p-3 transition hover:border-verde ${fila.activo ? '' : 'opacity-80'}`}
                >
                  <span className="size-18 shrink-0 overflow-hidden rounded-xl bg-salvia-media">
                    {foto ? (
                      <img {...imgFija(foto, 72)} alt="" width="72" height="72" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-sm text-tinta/70">Sin foto</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block text-[17px] leading-snug font-bold text-tinta">{p.nombreCorto}</span>
                    <span className="block truncate text-base text-texto-suave">
                      {[fila.marca, nombreCat[fila.categoria_id]].filter(Boolean).join(' · ')}
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={`text-[17px] font-semibold tabular-nums ${precio.falta ? 'text-red-800' : 'text-tinta'}`}>{precio.texto}</span>
                      <Insignia visible={fila.activo} />
                    </span>
                  </span>
                  <span className="text-2xl text-texto-suave" aria-hidden="true">
                    ›
                  </span>
                </Enlace>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ───────── Formulario ─────────

const aForm = (p) => ({
  nombre: p?.nombre ?? '',
  nombreCorto: p?.nombre_corto ?? '',
  marca: p?.marca ?? '',
  categoria: p?.categoria_id ?? '',
  precio: textoPrecio(p?.precio),
  tamano: p?.tamano ?? '',
  descripcion: p?.descripcion ?? '',
  alias: (p?.alias ?? []).join(', '),
  destacado: Boolean(p?.destacado),
  activo: p ? p.activo : true,
  foto: p?.fotos?.[0] ?? null,
  variantes: (p?.variantes ?? []).map((v) => ({ clave: v.id, id: v.id, nombre: v.nombre, precio: textoPrecio(v.precio), foto: v.foto })),
  fondos: {}, // "¿Cómo es la foto?" que cambió Mar: { [url]: 'blanco' | 'escena' }
});

const limpio = (s) => s.trim() || null;
const aDatos = (f, original) => ({
  nombre: f.nombre.trim(),
  nombre_corto: limpio(f.nombreCorto),
  marca: limpio(f.marca),
  categoria_id: f.categoria,
  precio: leerPrecio(f.precio),
  tamano: limpio(f.tamano),
  descripcion: limpio(f.descripcion),
  alias: f.alias.split(',').map((a) => a.trim()).filter(Boolean),
  destacado: f.destacado,
  activo: f.activo,
  fotos: [f.foto, ...(original?.fotos?.slice(1) ?? [])].filter(Boolean),
  variantes: f.variantes.map((v) => ({ id: v.id, nombre: v.nombre.trim(), precio: leerPrecio(v.precio), foto: v.foto })),
});

function validar(f) {
  const e = {};
  if (!f.nombre.trim()) e.nombre = 'Escribí el nombre del producto.';
  if (!f.categoria || f.categoria === '__nueva__') e.categoria = 'Elegí una categoría.';
  const vistos = new Set();
  f.variantes.forEach((v) => {
    const n = normalizar(v.nombre.trim());
    if (!n) e[`v-${v.clave}`] = 'Escribí el nombre de la variante (o quitala).';
    else if (vistos.has(n)) e[`v-${v.clave}`] = 'Ya hay otra variante con este nombre.';
    vistos.add(n);
  });
  return e;
}

/** Lo que le falta para poder mostrarse en la tienda: precio (del producto o de todas las variantes) y foto. */
function faltaParaMostrar(f) {
  const falta = [];
  const conPrecio = leerPrecio(f.precio) != null || (f.variantes.length > 0 && f.variantes.every((v) => leerPrecio(v.precio) != null));
  if (!conPrecio) falta.push('precio');
  if (!f.foto) falta.push('foto');
  return falta;
}

export function FormProducto({ id }) {
  const { datos, error, recargar } = useDatos();
  if (!datos) return error ? <ErrorCarga onReintentar={() => recargar().catch(() => {})} /> : <Cargando />;
  const original = id ? datos.productos.find((p) => p.id === id) : null;
  if (id && !original)
    return (
      <div className="space-y-4">
        <p className="text-lg">Ese producto no existe (quizás se borró).</p>
        <Enlace to="/admin/productos" className="text-[17px] font-bold text-verde underline">
          Volver a productos
        </Enlace>
      </div>
    );
  return <Formulario key={id ?? 'nuevo'} original={original} datos={datos} recargar={recargar} />;
}

let claveNueva = 0;

function Formulario({ original, datos, recargar }) {
  const avisar = useAvisos();
  const [inicial, setInicial] = useState(() => aForm(original));
  const [form, setForm] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [dialogo, setDialogo] = useState(null); // null | 'faltan' | 'borrar'
  const [nuevaCat, setNuevaCat] = useState(null); // nombre de la categoría que se está creando
  const subidas = useRef([]); // fotos subidas en esta edición (se borran si al final no se guardan)
  const sucio = JSON.stringify(form) !== JSON.stringify(inicial);
  const dialogoSinGuardar = useCambiosSinGuardar(sucio);

  // Al salir sin guardar: las fotos que se subieron y no quedaron en ningún lado se borran del bucket
  useEffect(
    () => () => {
      const sueltas = subidas.current;
      subidas.current = [];
      if (sueltas.length) borrarFotos(sueltas).catch(() => {});
    },
    [],
  );

  const cambiar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };
  const cambiarVariante = (clave, campo, valor) => {
    setForm((f) => ({ ...f, variantes: f.variantes.map((v) => (v.clave === clave ? { ...v, [campo]: valor } : v)) }));
    setErrores((e) => ({ ...e, [`v-${clave}`]: undefined }));
  };
  const moverVariante = (i, d) =>
    setForm((f) => {
      const vs = [...f.variantes];
      [vs[i], vs[i + d]] = [vs[i + d], vs[i]];
      return { ...f, variantes: vs };
    });
  const agregarVariante = () =>
    setForm((f) => ({ ...f, variantes: [...f.variantes, { clave: `nueva-${++claveNueva}`, id: null, nombre: '', precio: '', foto: null }] }));
  const quitarVariante = (clave) => setForm((f) => ({ ...f, variantes: f.variantes.filter((v) => v.clave !== clave) }));
  const subio = (url) => subidas.current.push(url);
  const elegirFondo = (url, f) => setForm((x) => ({ ...x, fondos: { ...x.fondos, [url]: f } }));

  const crearCategoria = async () => {
    const nombre = nuevaCat?.trim();
    if (!nombre) return;
    try {
      const id = await guardarCategoria({ nombre, paso: null, portada: null }, null, datos.categorias);
      await recargar();
      cambiar('categoria', id);
      setNuevaCat(null);
      avisar(`Categoría «${nombre}» creada ✓`);
    } catch (e) {
      avisar(mensajeError(e), 'error');
    }
  };

  const guardar = async (comoOculto = false) => {
    const e = validar(form);
    setErrores(e);
    if (Object.keys(e).length) {
      avisar('Revisá lo que está marcado en rojo.', 'error');
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    if (form.activo && !comoOculto && faltaParaMostrar(form).length) {
      setDialogo('faltan');
      return;
    }
    setGuardando(true);
    setDialogo(null);
    try {
      const f = comoOculto ? { ...form, activo: false } : form;
      const d = aDatos(f, original);
      const id = await guardarProducto(d, original, datos.productos);
      // Fotos que dejaron de usarse (las reemplazadas o quitadas): se borran del bucket
      const usadas = new Set([...d.fotos, ...d.variantes.map((v) => v.foto)]);
      await guardarFondos(Object.fromEntries(Object.entries(form.fondos).filter(([u]) => usadas.has(u))), datos.fotos);
      const viejas = [...fotosDeProducto(original ?? {}), ...subidas.current].filter((u) => !usadas.has(u));
      subidas.current = [];
      borrarFotos(viejas).catch(() => {});
      const nuevos = await recargar();
      const listo = aForm(nuevos.productos.find((p) => p.id === id));
      setInicial(listo);
      setForm(listo);
      avisar(comoOculto ? 'Guardado como oculto ✓' : 'Guardado ✓');
      if (!original) {
        irA(`/admin/productos/${id}`, { reemplazar: true, forzar: true });
      }
    } catch (err) {
      avisar(mensajeError(err), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const ocultar = async () => {
    try {
      await cambiarVisible('productos', original.id, false);
      await recargar();
      setForm((f) => ({ ...f, activo: false }));
      setInicial((f) => ({ ...f, activo: false }));
      avisar('Listo: está oculto ✓');
    } catch (e) {
      avisar(mensajeError(e), 'error');
    }
  };
  const borrar = async () => {
    setGuardando(true);
    try {
      await borrarProducto(original);
      irA('/admin/productos', { reemplazar: true, forzar: true });
      avisar(`«${original.nombre_corto || original.nombre}» se borró para siempre.`);
      recargar().catch(() => {});
    } catch (e) {
      avisar(mensajeError(e), 'error');
      setGuardando(false);
    }
  };

  const falta = faltaParaMostrar(form);
  const precioProducto = leerPrecio(form.precio);
  const marcas = [...new Set(datos.productos.map((p) => p.marca).filter(Boolean))].sort();

  return (
    <div className="space-y-8 pb-8">
      <EncabezadoForm
        volverA="/admin/productos"
        textoVolver="Volver a productos"
        titulo={original ? original.nombre_corto || original.nombre : 'Nuevo producto'}
        enTienda={original ? `/producto/${original.id}` : null}
        oculto={original && !original.activo}
      />

      <Interruptor
        activo={form.activo}
        onCambio={(v) => cambiar('activo', v)}
        etiqueta="Mostrar en la tienda"
        descripcion={form.activo ? 'Se ve en la tienda.' : 'Oculto: nadie lo ve en la tienda.'}
        textoSi="Visible"
        textoNo="Oculto"
      />
      {form.activo && falta.length > 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-base font-semibold text-amber-900">
          Para mostrarlo en la tienda le falta {falta.join(' y ')}.
        </p>
      )}

      <section className="space-y-5" aria-labelledby="sec-datos">
        <h2 id="sec-datos" className="font-serif text-2xl text-tinta">
          Datos
        </h2>
        <Campo etiqueta="Nombre" ayuda="El nombre completo, como aparece en la página del producto." error={errores.nombre}>
          {(id, a) => <input id={id} {...a} className={ENTRADA} value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />}
        </Campo>
        <Campo etiqueta="Nombre corto" opcional ayuda="Para las tarjetas, el carrito y WhatsApp. Mejor hasta 32 letras.">
          {(id, a) => (
            <>
              <input id={id} {...a} className={ENTRADA} value={form.nombreCorto} placeholder={form.nombre} onChange={(e) => cambiar('nombreCorto', e.target.value)} />
              <p className={`text-base ${form.nombreCorto.length > 32 ? 'font-semibold text-amber-800' : 'text-texto-suave'}`}>
                {form.nombreCorto.length} letras{form.nombreCorto.length > 32 ? ': es largo, en las tarjetas se puede cortar' : ''}
              </p>
            </>
          )}
        </Campo>
        <Campo etiqueta="Marca" opcional>
          {(id, a) => (
            <>
              <input id={id} {...a} list="marcas" className={ENTRADA} value={form.marca} onChange={(e) => cambiar('marca', e.target.value)} />
              <datalist id="marcas">
                {marcas.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </>
          )}
        </Campo>
        <Campo etiqueta="Categoría" error={errores.categoria}>
          {(id, a) => (
            <select
              id={id}
              {...a}
              className={ENTRADA}
              value={nuevaCat != null ? '__nueva__' : form.categoria}
              onChange={(e) => {
                if (e.target.value === '__nueva__') setNuevaCat('');
                else {
                  setNuevaCat(null);
                  cambiar('categoria', e.target.value);
                }
              }}
            >
              <option value="">Elegí una…</option>
              {datos.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
              <option value="__nueva__">＋ Crear categoría nueva…</option>
            </select>
          )}
        </Campo>
        {nuevaCat != null && (
          <div className="space-y-3 rounded-2xl bg-salvia p-4">
            <Campo etiqueta="Nombre de la categoría nueva">
              {(id, a) => (
                <input
                  id={id}
                  {...a}
                  className={ENTRADA}
                  value={nuevaCat}
                  autoFocus
                  onChange={(e) => setNuevaCat(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && crearCategoria()}
                />
              )}
            </Campo>
            <div className="flex gap-3">
              <Boton className="flex-1" disabled={!nuevaCat.trim()} onClick={crearCategoria}>
                Crear categoría
              </Boton>
              <Boton variante="secundario" onClick={() => setNuevaCat(null)}>
                Cancelar
              </Boton>
            </div>
          </div>
        )}
        <Campo etiqueta="Precio" opcional ayuda="Si lo dejás vacío, no se puede mostrar (salvo que todas las variantes tengan precio).">
          {(id, a) => <EntradaPrecio id={id} {...a} valor={form.precio} onCambio={(v) => cambiar('precio', v)} placeholder="Ej: 15.000" />}
        </Campo>
        <Campo etiqueta="Tamaño" opcional ayuda="Ej: 500 ml, 1 kg.">
          {(id, a) => <input id={id} {...a} className={ENTRADA} value={form.tamano} onChange={(e) => cambiar('tamano', e.target.value)} />}
        </Campo>
        <Campo etiqueta="Descripción" opcional>
          {(id, a) => (
            <textarea id={id} {...a} rows={6} className={`${ENTRADA} leading-relaxed`} value={form.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} />
          )}
        </Campo>
        <Campo etiqueta="Otros nombres con los que lo buscan" opcional ayuda="Separados por comas. No se muestran: sirven para el buscador. Ej: difusor de agua">
          {(id, a) => <input id={id} {...a} className={ENTRADA} value={form.alias} onChange={(e) => cambiar('alias', e.target.value)} />}
        </Campo>
        <Interruptor
          activo={form.destacado}
          onCambio={(v) => cambiar('destacado', v)}
          etiqueta="Favorito de Mar"
          descripcion="Aparece en «Favoritos de Mar» en el inicio."
        />
      </section>

      <section className="space-y-4" aria-labelledby="sec-foto">
        <h2 id="sec-foto" className="font-serif text-2xl text-tinta">
          Foto
        </h2>
        <FotoCampo
          etiqueta="Foto del producto"
          valor={form.foto}
          onCambio={(v) => cambiar('foto', v)}
          onSubida={subio}
          fondo={form.fondos[form.foto]}
          onFondo={elegirFondo}
        />
      </section>

      <section className="space-y-4" aria-labelledby="sec-variantes">
        <h2 id="sec-variantes" className="font-serif text-2xl text-tinta">
          Variantes
        </h2>
        <p className="text-base text-texto-suave">Colores, aromas o tamaños. Si no tiene, dejalo vacío.</p>
        {form.variantes.map((v, i) => (
          <fieldset key={v.clave} className="card space-y-4 rounded-2xl p-4">
            <legend className="sr-only">Variante {i + 1}</legend>
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-bold">Variante {i + 1}</span>
              <span className="flex gap-1.5">
                <SubirBajar
                  nombre={`la variante ${v.nombre || i + 1}`}
                  primero={i === 0}
                  ultimo={i === form.variantes.length - 1}
                  onSubir={() => moverVariante(i, -1)}
                  onBajar={() => moverVariante(i, 1)}
                />
                <Boton variante="peligro" className="px-3" onClick={() => quitarVariante(v.clave)} aria-label={`Quitar la variante ${v.nombre || i + 1}`}>
                  Quitar
                </Boton>
              </span>
            </div>
            <Campo etiqueta="Nombre" error={errores[`v-${v.clave}`]}>
              {(id, a) => <input id={id} {...a} className={ENTRADA} value={v.nombre} onChange={(e) => cambiarVariante(v.clave, 'nombre', e.target.value)} />}
            </Campo>
            <Campo
              etiqueta="Precio"
              opcional
              ayuda={precioProducto != null ? `Vacío = usa el del producto (${formatPrecio(precioProducto)}).` : 'Vacío = usa el del producto.'}
            >
              {(id, a) => <EntradaPrecio id={id} {...a} valor={v.precio} onCambio={(x) => cambiarVariante(v.clave, 'precio', x)} />}
            </Campo>
            <FotoCampo
              etiqueta="Foto de la variante"
              opcional
              chica
              ayuda="Sin foto, usa la del producto."
              valor={v.foto}
              onCambio={(x) => cambiarVariante(v.clave, 'foto', x)}
              onSubida={subio}
              fondo={form.fondos[v.foto]}
              onFondo={elegirFondo}
            />
          </fieldset>
        ))}
        <Boton variante="secundario" ancho onClick={agregarVariante}>
          ＋ Agregar variante
        </Boton>
      </section>

      {original && (
        <section className="space-y-3 border-t border-linea pt-6" aria-label="Ocultar o borrar">
          <Boton variante="peligro" ancho onClick={() => setDialogo('borrar')}>
            Ocultar o borrar este producto…
          </Boton>
        </section>
      )}

      <BarraGuardar sucio={sucio || !original} guardando={guardando} onGuardar={() => guardar()} texto={original ? 'Guardar cambios' : 'Crear producto'} />

      <Dialogo
        abierto={dialogo === 'faltan'}
        onCerrar={() => setDialogo(null)}
        titulo="Todavía no se puede mostrar"
        acciones={
          <>
            <Boton grande ancho disabled={guardando} onClick={() => guardar(true)}>
              Guardarlo oculto por ahora
            </Boton>
            <Boton variante="secundario" ancho onClick={() => setDialogo(null)}>
              Seguir editando
            </Boton>
          </>
        }
      >
        <p>
          Para mostrarlo en la tienda le falta <strong>{falta.join(' y ')}</strong>. Podés guardarlo oculto y mostrarlo cuando lo completes.
        </p>
      </Dialogo>

      {original && (
        <DialogoBorrar
          abierto={dialogo === 'borrar'}
          onCerrar={() => setDialogo(null)}
          nombre={original.nombre_corto || original.nombre}
          queSeBorra="el producto, sus variantes y sus fotos"
          onOcultar={original.activo ? ocultar : null}
          onBorrar={borrar}
          ocupado={guardando}
        />
      )}
      {dialogoSinGuardar}
    </div>
  );
}
