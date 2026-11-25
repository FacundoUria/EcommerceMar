// Productos del panel: lista con buscador y filtros + formulario de crear/editar (con variantes y fotos).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Enlace, irA } from './ruta.jsx';
import { productoDeFila } from '../lib/catalogo.js';
import { imgFija } from '../lib/imagenes.js';
import { useCambiosSinGuardar, useDatos } from './contexto.jsx';
import { borrarProducto, cambiarVisible, fotosDeProducto, guardarCategoria, guardarFondos, guardarProducto } from './datos.js';
import FotoCampo from './FotoCampo.jsx';
import ColorCampo from './ColorCampo.jsx';
import { colorSugerido } from '../config/colores-variantes.js';
import { PASOS_RUTINA } from '../config/negocio.js';
import PromoCampos, { aDatosPromo, aFormPromo, validarPromo } from './PromoCampos.jsx';
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
                      {fila.agotado && <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-[15px] font-bold text-red-800">Sin stock</span>}
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
  // Etiquetas de la ficha (supabase/migraciones/2026-11-24-etiquetas.sql)
  perfumado: Boolean(p?.perfumado),
  llavero: Boolean(p?.llavero_regalo),
  llaveroColores: p?.llavero_colores ?? '',
  activo: p ? p.activo : true,
  // Sin stock del producto entero y paso propio de la rutina (supabase/migraciones/2026-11-25-stock-y-paso-por-producto.sql)
  agotado: Boolean(p?.agotado),
  paso: p?.paso ?? null,
  foto: p?.fotos?.[0] ?? null,
  variantes: (p?.variantes ?? []).map((v) => ({
    clave: v.id,
    id: v.id,
    nombre: v.nombre,
    precio: textoPrecio(v.precio),
    foto: v.foto,
    esColor: Boolean(v.color_hex), // "Esta variante es un color" (cuadradito de color en la tienda)
    color: v.color_hex ?? '',
    agotado: Boolean(v.agotado), // "Sin stock" (supabase/migraciones/2026-11-24-variantes-agotadas.sql)
  })),
  fondos: {}, // "¿Cómo es la foto?" que cambió Mar: { [url]: 'blanco' | 'escena' }
  promo: aFormPromo(p), // "Promoción" (plegable): precio promo, antes, fechas, kit
});

const limpio = (s) => s.trim() || null;
// conPromo / conEtiquetas / conAgotado / conPorProducto: la base ya tiene esas columnas (supabase/migraciones/
// 2026-11-23-promos.sql, 2026-11-24-etiquetas.sql, 2026-11-24-variantes-agotadas.sql y
// 2026-11-25-stock-y-paso-por-producto.sql)
const aDatos = (f, original, { conPromo, conEtiquetas, conAgotado, conPorProducto }) => ({
  ...(conPromo && aDatosPromo(f.promo)),
  ...(conPorProducto && { agotado: f.agotado, paso: f.paso }),
  ...(conEtiquetas && { perfumado: f.perfumado, llavero_regalo: f.llavero, llavero_colores: f.llavero ? limpio(f.llaveroColores) : null }),
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
  variantes: f.variantes.map((v) => ({
    id: v.id,
    nombre: v.nombre.trim(),
    precio: leerPrecio(v.precio),
    foto: v.foto,
    color_hex: v.esColor && v.color ? v.color.toLowerCase() : null,
    ...(conAgotado && { agotado: v.agotado }),
  })),
});

function validar(f) {
  const e = { ...validarPromo(f.promo) };
  if (!f.nombre.trim()) e.nombre = 'Escribí el nombre del producto.';
  if (!f.categoria || f.categoria === '__nueva__') e.categoria = 'Elegí una categoría.';
  const vistos = new Set();
  f.variantes.forEach((v) => {
    const n = normalizar(v.nombre.trim());
    if (!n) e[`v-${v.clave}`] = 'Escribí el nombre de la variante (o quitala).';
    else if (vistos.has(n)) e[`v-${v.clave}`] = 'Ya hay otra variante con este nombre.';
    vistos.add(n);
    if (v.esColor && !/^#[0-9a-f]{6}$/i.test(v.color)) e[`vc-${v.clave}`] = 'Elegí el color (o apagá «Esta variante es un color»).';
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
    setForm((f) => ({
      ...f,
      variantes: f.variantes.map((v) => {
        if (v.clave !== clave) return v;
        const nueva = { ...v, [campo]: valor };
        // Es un color y todavía no eligió cuál: se sugiere por el nombre ("Rosa bebé" → rosa bebé)
        if (campo === 'nombre' && nueva.esColor && !v.color) nueva.color = colorSugerido(valor) ?? '';
        return nueva;
      }),
    }));
    setErrores((e) => ({ ...e, [`v-${clave}`]: undefined }));
  };
  const cambiarColorVariante = (clave, { esColor, color }) => {
    setForm((f) => ({
      ...f,
      variantes: f.variantes.map((v) => (v.clave === clave ? { ...v, esColor, color: esColor ? color || colorSugerido(v.nombre) || '' : color } : v)),
    }));
    setErrores((e) => ({ ...e, [`vc-${clave}`]: undefined }));
  };
  const moverVariante = (i, d) =>
    setForm((f) => {
      const vs = [...f.variantes];
      [vs[i], vs[i + d]] = [vs[i + d], vs[i]];
      return { ...f, variantes: vs };
    });
  // Si las otras variantes son colores, la nueva también arranca como color
  const agregarVariante = () =>
    setForm((f) => ({
      ...f,
      variantes: [
        ...f.variantes,
        {
          clave: `nueva-${++claveNueva}`,
          id: null,
          nombre: '',
          precio: '',
          foto: null,
          esColor: f.variantes.length > 0 && f.variantes.every((v) => v.esColor),
          color: '',
          agotado: false,
        },
      ],
    }));
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
      const d = aDatos(f, original, { conPromo, conEtiquetas, conAgotado, conPorProducto });
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
  const conPromo = datos.productos.some((p) => 'precio_promo' in p);
  const conEtiquetas = datos.productos.some((p) => 'perfumado' in p);
  const conAgotado = datos.productos.some((p) => p.variantes?.some((v) => 'agotado' in v));
  const conPorProducto = datos.productos.some((p) => 'paso' in p);
  const pasoCategoria = PASOS_RUTINA.find((p) => p.paso === datos.categorias.find((c) => c.id === form.categoria)?.paso);
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
      {conPorProducto && (
        <Interruptor
          activo={form.agotado}
          onCambio={(v) => cambiar('agotado', v)}
          etiqueta="Sin stock"
          descripcion={
            form.agotado
              ? 'Se ve en la tienda con «Sin stock · llega pronto», pero no se puede pedir.'
              : 'Prendelo si se terminó (o está por llegar): se sigue viendo, pero no se puede pedir. Si es solo un color o una variante, marcala abajo, en esa variante.'
          }
          textoSi="Sin stock"
          textoNo="Hay stock"
        />
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
        {conEtiquetas && (
          <>
            <Interruptor
              activo={form.perfumado}
              onCambio={(v) => cambiar('perfumado', v)}
              etiqueta="Perfumado"
              descripcion="La ficha dice «Perfumado: cada color tiene su aroma»."
            />
            <Interruptor
              activo={form.llavero}
              onCambio={(v) => cambiar('llavero', v)}
              etiqueta="Llavero de regalo"
              descripcion="La ficha dice «Llavero de regalo»."
            />
            {form.llavero && (
              <Campo etiqueta="¿El llavero viene solo en algunos colores?" opcional ayuda="Ej: Rosa y Lila. Vacío = en todos.">
                {(id, a) => (
                  <input id={id} {...a} className={ENTRADA} value={form.llaveroColores} onChange={(e) => cambiar('llaveroColores', e.target.value)} />
                )}
              </Campo>
            )}
          </>
        )}
        {conPorProducto && (
          <details className="group rounded-2xl border border-linea bg-crema-card">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-[17px] font-bold">
              <span>
                Opciones avanzadas
                {/* Paso propio de la rutina: se ve sin abrir */}
                {form.paso && (
                  <span className="block text-base font-normal text-verde">
                    Rutina: paso {form.paso} ({PASOS_RUTINA.find((p) => p.paso === form.paso)?.titulo})
                  </span>
                )}
              </span>
              <span className="text-xl transition group-open:rotate-180" aria-hidden="true">
                ⌄
              </span>
            </summary>
            <fieldset className="space-y-2 px-4 pb-4">
              <legend className="mb-2 text-base text-texto-suave">¿En qué paso de «Armá tu rutina» aparece este producto?</legend>
              {[null, ...PASOS_RUTINA.map((p) => p.paso)].map((paso) => (
                <label
                  key={paso ?? 'cat'}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 ${form.paso === paso ? 'border-verde bg-salvia' : 'border-transparent'}`}
                >
                  <input type="radio" name="paso-producto" className="size-5 shrink-0 accent-verde" checked={form.paso === paso} onChange={() => cambiar('paso', paso)} />
                  <span className="text-[17px]">
                    {paso
                      ? `Paso ${paso} (${PASOS_RUTINA.find((p) => p.paso === paso).titulo})`
                      : `Como su categoría (${pasoCategoria ? `paso ${pasoCategoria.paso}: ${pasoCategoria.titulo}` : 'no aparece en la rutina'})`}
                  </span>
                </label>
              ))}
            </fieldset>
          </details>
        )}
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
            <ColorCampo
              esColor={v.esColor}
              color={v.color}
              error={errores[`vc-${v.clave}`]}
              nombreVariante={v.nombre.trim()}
              onCambio={(x) => cambiarColorVariante(v.clave, x)}
            />
            {conAgotado && (
              <Interruptor
                activo={v.agotado}
                onCambio={(x) => cambiarVariante(v.clave, 'agotado', x)}
                etiqueta="Sin stock"
                descripcion="En la tienda se ve tachada con «Agotado» y no se puede elegir. Si todas están sin stock, el producto dice «Sin stock»."
                textoSi="Agotada"
              />
            )}
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

      {conPromo && (
        <PromoCampos
          promo={form.promo}
          onCambio={(v) => {
            cambiar('promo', v);
            setErrores((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== 'promo' && !k.startsWith('e-'))));
          }}
          errores={errores}
          precioProducto={precioProducto}
          productos={datos.productos}
        />
      )}

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
