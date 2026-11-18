import { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import Swatches from '../components/product/Swatches.jsx';
import { GridSkeleton } from '../components/ui/Skeleton.jsx';
import { useCategories, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPrecio, imgSm } from '../lib/format.js';
import { PASOS_RUTINA } from '../config/negocio.js';

export default function Rutina() {
  usePageTitle('Armá tu rutina curly');
  const { data: productos, loading } = useProducts();
  const { data: categorias } = useCategories();
  const { agregarVarios } = useCart();

  const [actual, setActual] = useState(0); // índice del paso
  const [direccion, setDireccion] = useState(1);
  const [eleccion, setEleccion] = useState({}); // { [paso]: { producto, variante } }
  const [aviso, setAviso] = useState(null);

  const paso = PASOS_RUTINA[actual];
  const nombreCat = useMemo(() => Object.fromEntries((categorias ?? []).map((c) => [c.id, c.nombre])), [categorias]);

  const elegidos = PASOS_RUTINA.map((p) => eleccion[p.paso]).filter(Boolean);
  const total = elegidos.reduce((s, e) => s + e.producto.precio, 0);
  const faltaVariante = PASOS_RUTINA.find((p) => {
    const e = eleccion[p.paso];
    return e && e.producto.variantes.length > 0 && !e.variante;
  });

  const irA = (i) => {
    setDireccion(i > actual ? 1 : -1);
    setActual(i);
    setAviso(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const elegir = (producto) => {
    setAviso(null);
    setEleccion((prev) => {
      const ya = prev[paso.paso]?.producto.id === producto.id;
      const next = { ...prev };
      if (ya) delete next[paso.paso];
      else next[paso.paso] = { producto, variante: null };
      return next;
    });
  };

  const agregarRutina = () => {
    if (faltaVariante) {
      setAviso(`Elegí una variante de ${eleccion[faltaVariante.paso].producto.nombre}`);
      irA(PASOS_RUTINA.indexOf(faltaVariante));
      return;
    }
    agregarVarios(elegidos.map((e) => ({ producto: e.producto, variante: e.variante, cantidad: 1 })));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-48 md:pb-16">
      <h1 className="text-4xl leading-tight md:text-5xl">
        Armá tu <em className="text-dorado">rutina</em>
      </h1>

      {/* Stepper */}
      <ol className="mt-6 grid grid-cols-4 gap-1.5" aria-label="Pasos de la rutina">
        {PASOS_RUTINA.map((p, i) => {
          const hecho = !!eleccion[p.paso];
          const activo = i === actual;
          return (
            <li key={p.paso}>
              <button
                type="button"
                onClick={() => irA(i)}
                aria-current={activo ? 'step' : undefined}
                className="group flex w-full flex-col items-start gap-2 text-left"
              >
                <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-verde/10">
                  <m.span
                    className="absolute inset-y-0 left-0 rounded-full bg-verde"
                    initial={false}
                    animate={{ width: hecho ? '100%' : activo ? '45%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      hecho ? 'bg-verde text-amarillo' : activo ? 'bg-amarillo text-verde' : 'bg-verde/10 text-verde'
                    }`}
                  >
                    {hecho ? <Icon name="check" size={13} strokeWidth={3} /> : p.paso}
                  </span>
                  <span className={`text-xs leading-tight font-semibold md:text-sm ${activo ? 'text-verde' : 'text-gris'}`}>{p.titulo}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        {/* Paso actual */}
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={direccion} initial={false}>
            <m.section
              key={paso.paso}
              custom={direccion}
              initial={{ opacity: 0, x: direccion * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direccion * -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby="paso-titulo"
            >
              <h2 id="paso-titulo" className="text-3xl">
                <span className="text-dorado">{paso.paso}.</span> {paso.titulo}
              </h2>

              {aviso && (
                <p className="mt-4 rounded-3xl bg-amarillo/40 px-4 py-3 text-sm font-semibold text-verde" role="alert">
                  {aviso}
                </p>
              )}

              {loading ? (
                <div className="mt-6">
                  <GridSkeleton n={4} />
                </div>
              ) : (
                paso.categorias.map((catId) => {
                  const lista = (productos ?? []).filter((p) => p.categoria === catId);
                  if (!lista.length) return null;
                  return (
                    <div key={catId} className="mt-6">
                      {paso.categorias.length > 1 && (
                        <h3 className="mb-3 font-sans text-sm font-bold tracking-[0.15em] text-dorado uppercase">{nombreCat[catId]}</h3>
                      )}
                      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {lista.map((p) => (
                          <OpcionProducto
                            key={p.id}
                            producto={p}
                            seleccion={eleccion[paso.paso]?.producto.id === p.id ? eleccion[paso.paso] : null}
                            onElegir={() => elegir(p)}
                            onVariante={(v) => {
                              setAviso(null);
                              setEleccion((prev) => ({ ...prev, [paso.paso]: { producto: p, variante: v } }));
                            }}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}

              <div className="mt-8 flex items-center justify-between gap-3">
                <button type="button" onClick={() => irA(actual - 1)} disabled={actual === 0} className="btn btn-borde">
                  <Icon name="flechaIzq" size={18} /> Anterior
                </button>
                {actual < PASOS_RUTINA.length - 1 ? (
                  <button type="button" onClick={() => irA(actual + 1)} className="btn btn-primario">
                    {eleccion[paso.paso] ? 'Siguiente' : 'Saltear'} <Icon name="flecha" size={18} />
                  </button>
                ) : (
                  <button type="button" onClick={agregarRutina} disabled={!elegidos.length} className="btn btn-primario hidden md:inline-flex">
                    Agregar rutina
                  </button>
                )}
              </div>
            </m.section>
          </AnimatePresence>
        </div>

        {/* Resumen (desktop) */}
        <aside className="hidden md:block" aria-label="Resumen de tu rutina">
          <div className="card sticky top-24 rounded-5xl p-6">
            <h2 className="text-2xl">Tu rutina</h2>
            <ol className="mt-4 space-y-3">
              {PASOS_RUTINA.map((p, i) => {
                const e = eleccion[p.paso];
                return (
                  <li key={p.paso}>
                    <button
                      type="button"
                      onClick={() => irA(i)}
                      className="flex w-full items-center gap-3 rounded-3xl p-2 text-left transition hover:bg-crema"
                    >
                      {e ? (
                        <img
                          src={imgSm(e.variante?.imagen ?? e.producto.imagen)}
                          alt=""
                          width="48"
                          height="48"
                          className="size-12 shrink-0 rounded-2xl bg-crema object-cover"
                        />
                      ) : (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-verde/15 font-serif text-lg text-verde/40">
                          {p.paso}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold tracking-wider text-dorado uppercase">{p.titulo}</span>
                        <span className="block truncate text-sm font-semibold">{e ? e.producto.nombre : '—'}</span>
                        {e?.variante && <span className="block truncate text-xs text-gris">{e.variante.nombre}</span>}
                      </span>
                      {e && <span className="text-sm font-bold text-verde tabular-nums">{formatPrecio(e.producto.precio)}</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 flex items-baseline justify-between border-t border-verde/10 pt-4">
              <span className="text-sm font-extrabold tracking-[0.18em] text-verde uppercase">Total</span>
              <Total valor={total} className="text-3xl" />
            </div>
            <button type="button" onClick={agregarRutina} disabled={!elegidos.length} className="btn btn-primario mt-4 w-full">
              <Icon name="carrito" size={18} /> Agregar rutina
            </button>
          </div>
        </aside>
      </div>

      {/* Resumen (mobile): barra arriba del bottom nav */}
      <div className="fixed inset-x-0 bottom-[calc(4.6rem+max(0.75rem,env(safe-area-inset-bottom)))] z-30 px-3 md:hidden">
        <div className="glass-crema flex items-center gap-3 rounded-4xl p-2 pl-4 shadow-flotante ring-1 ring-verde/10">
          <div className="flex gap-1">
            {PASOS_RUTINA.map((p) => {
              const e = eleccion[p.paso];
              return e ? (
                <img
                  key={p.paso}
                  src={imgSm(e.variante?.imagen ?? e.producto.imagen)}
                  alt=""
                  width="32"
                  height="32"
                  className="size-7 rounded-full bg-white object-cover ring-2 ring-verde"
                />
              ) : (
                <span key={p.paso} className="flex size-7 items-center justify-center rounded-full border border-dashed border-verde/25 text-[11px] font-bold text-verde/50">
                  {p.paso}
                </span>
              );
            })}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <Total valor={total} className="text-lg" />
          </div>
          <button type="button" onClick={agregarRutina} disabled={!elegidos.length} className="btn btn-primario px-4 py-3 text-xs">
            Agregar rutina
          </button>
        </div>
      </div>

    </div>
  );
}

function Total({ valor, className = '' }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.span
        key={valor}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className={`inline-block font-serif font-semibold text-verde tabular-nums ${className}`}
        aria-live="polite"
      >
        {formatPrecio(valor)}
      </m.span>
    </AnimatePresence>
  );
}

function OpcionProducto({ producto, seleccion, onElegir, onVariante }) {
  const activo = !!seleccion;
  const imagen = seleccion?.variante?.imagen ?? producto.imagen;
  return (
    <li className={`${activo && producto.variantes.length ? 'col-span-2 sm:col-span-3' : ''}`}>
      <m.div
        layout
        className={`overflow-hidden rounded-4xl border-2 bg-white transition-colors ${activo ? 'border-verde shadow-flotante' : 'border-linea shadow-suave'}`}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={activo}
          onClick={onElegir}
          className={`relative flex w-full text-left transition active:scale-[0.98] ${activo && producto.variantes.length ? 'items-center gap-4 p-3' : 'flex-col'}`}
        >
          <span
            className={`relative block shrink-0 overflow-hidden bg-white ${
              activo && producto.variantes.length ? 'size-24 rounded-3xl' : 'aspect-square w-full'
            }`}
          >
            <SmartImg
              src={imagen}
              srcSm={imgSm(imagen)}
              sizes="(min-width: 640px) 220px, 45vw"
              alt=""
              placeholderTitulo={producto.nombre}
              className="size-full object-cover"
            />
          </span>
          <span className={`block ${activo && producto.variantes.length ? '' : 'p-3'}`}>
            {producto.marca && <span className="block text-[11px] font-bold tracking-[0.12em] text-dorado uppercase">{producto.marca}</span>}
            <span className="line-clamp-2 block text-sm leading-snug font-semibold">{producto.nombre}</span>
            <span className="mt-1 block font-serif font-semibold text-verde">{formatPrecio(producto.precio)}</span>
          </span>
          <span
            className={`absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full transition ${
              activo ? 'scale-100 bg-verde text-amarillo' : 'scale-90 border-2 border-verde/20 bg-white/80'
            }`}
            aria-hidden="true"
          >
            {activo && <Icon name="check" size={15} strokeWidth={3} />}
          </span>
        </button>
        {activo && producto.variantes.length > 0 && (
          <div className="border-t border-verde/10 px-4 pt-3 pb-4">
            <p className="mb-2 text-sm font-semibold">
              {seleccion.variante?.nombre ?? 'Variante'}
            </p>
            <Swatches
              variantes={producto.variantes}
              seleccionada={seleccion.variante?.nombre}
              onSelect={onVariante}
              size="md"
              nombreProducto={producto.nombre}
            />
          </div>
        )}
      </m.div>
    </li>
  );
}
