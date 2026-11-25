import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m, useScroll } from 'motion/react';
import { useSearchParams } from 'react-router';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import LineaProgreso from '../components/ui/LineaProgreso.jsx';
import Icon from '../components/ui/Icon.jsx';
import FotoProducto from '../components/product/FotoProducto.jsx';
import { esDesde, precioDe } from '../lib/precios.js';
import Swatches from '../components/product/Swatches.jsx';
import { MuestraColor } from '../components/product/Colores.jsx';
import { GridSkeleton } from '../components/ui/Skeleton.jsx';
import { useCategories, usePasosRutina, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useCartAcciones } from '../context/CartContext.jsx';
import { formatPrecio, imgSm } from '../lib/format.js';
import { imgFija } from '../lib/imagenes.js';
import Precio from '../components/ui/Precio.jsx';
import { scrollA } from '../lib/smooth.js';
import Roll from '../components/ui/Roll.jsx';
import { ConDestellos, Estrella } from '../components/marca/Destellos.jsx';
import { explotarDestellos, lluviaDestellos } from '../lib/destellos.js';

export default function Rutina() {
  usePageTitle('Armá tu rutina curly');
  const { data: productos, loading } = useProducts();
  const { data: categorias } = useCategories();
  const pasos = usePasosRutina(); // los 4 pasos con sus categorías (campo `paso` de cada una)
  const { agregarVarios } = useCartAcciones();
  const pagina = useRef(null);
  const { scrollYProgress } = useScroll({ target: pagina, offset: ['start start', 'end end'] });

  // Paso inicial desde ?paso=N (1-4: links del home); la URL acompaña al paso actual
  const [params, setParams] = useSearchParams();
  const [actual, setActual] = useState(() => {
    const n = Number(params.get('paso'));
    return n >= 1 && n <= pasos.length ? n - 1 : 0;
  }); // índice del paso
  const [direccion, setDireccion] = useState(1);
  const [eleccion, setEleccion] = useState({}); // { [paso]: [{ producto, variante }, …] } (varios por paso)
  const [aviso, setAviso] = useState(null);

  const paso = pasos[actual];
  const nombreCat = useMemo(() => Object.fromEntries((categorias ?? []).map((c) => [c.id, c.nombre])), [categorias]);

  const delPaso = (p) => eleccion[p.paso] ?? [];
  const elegidos = pasos.flatMap(delPaso);
  const total = elegidos.reduce((s, e) => s + precioDe(e.producto, e.variante), 0);
  // Primer producto marcado que tiene variantes y todavía no eligió cuál (y en qué paso está)
  const faltaVariante = (() => {
    for (const p of pasos) {
      const e = delPaso(p).find((x) => x.producto.variantes.length > 0 && !x.variante);
      if (e) return { paso: p, e };
    }
    return null;
  })();

  const irA = (i) => {
    setDireccion(i > actual ? 1 : -1);
    setActual(i);
    setAviso(null);
    setParams({ paso: String(i + 1) }, { replace: true, preventScrollReset: true });
    scrollA(0);
  };

  // Marcar / desmarcar (varios por paso). Con variantes, al marcarlo aparecen para elegir cuál.
  const elegir = (producto) => {
    setAviso(null);
    setEleccion((prev) => {
      const lista = prev[paso.paso] ?? [];
      const ya = lista.some((e) => e.producto.id === producto.id);
      return { ...prev, [paso.paso]: ya ? lista.filter((e) => e.producto.id !== producto.id) : [...lista, { producto, variante: null }] };
    });
  };
  const elegirVariante = (producto, variante) => {
    setAviso(null);
    setEleccion((prev) => ({
      ...prev,
      [paso.paso]: (prev[paso.paso] ?? []).map((e) => (e.producto.id === producto.id ? { ...e, variante } : e)),
    }));
  };

  // "¡Tu rutina está lista!": con al menos un producto en el paso 4, o al llegar al último paso con algo
  // elegido. La lluvia de destellos sale una vez, cuando se cumple.
  const ultimo = pasos[pasos.length - 1];
  const rutinaLista = elegidos.length > 0 && (delPaso(ultimo).length > 0 || actual === pasos.length - 1);
  const listaAntes = useRef(rutinaLista);
  useEffect(() => {
    if (rutinaLista && !listaAntes.current) lluviaDestellos();
    listaAntes.current = rutinaLista;
  }, [rutinaLista]);

  const agregarRutina = (e) => {
    if (faltaVariante) {
      irA(pasos.indexOf(faltaVariante.paso)); // (irA limpia el aviso: va primero)
      setAviso(`Elegí una variante de ${faltaVariante.e.producto.nombreCorto}`);
      return;
    }
    explotarDestellos(e?.currentTarget);
    agregarVarios(elegidos.map((e) => ({ producto: e.producto, variante: e.variante, cantidad: 1 })));
  };

  return (
    <div ref={pagina} className="contenedor pt-4 pb-48 md:pb-16">
      <Reveal>
        <ConDestellos>
          <RevealText as="h1" className="text-4xl leading-tight md:text-5xl">
            Armá tu <em className="texto-dorado">rutina</em>
          </RevealText>
        </ConDestellos>
      </Reveal>

      {/* Stepper: los 4 pasos aparecen de a uno; la línea se dibuja con el scroll de la página */}
      <div className="relative mt-6">
        <LineaProgreso progreso={scrollYProgress} className="absolute top-[18px] right-[12.5%] left-[12.5%]" />
        <ol className="relative grid grid-cols-4" aria-label="Pasos de la rutina">
          {pasos.map((p, i) => {
            const hecho = delPaso(p).length > 0;
            const activo = i === actual;
            return (
              <Reveal as="li" key={p.paso} delay={0.1 + i * 0.12}>
                <button
                  type="button"
                  onClick={() => irA(i)}
                  aria-current={activo ? 'step' : undefined}
                  className="group flex w-full flex-col items-center gap-2 text-center"
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-full text-sm font-bold shadow-suave transition-colors duration-500 ${
                      hecho ? 'bg-verde text-arena' : activo ? 'bg-crema-card text-verde ring-2 ring-verde' : 'border border-linea bg-crema-card text-tinta'
                    }`}
                  >
                    {hecho ? <Icon name="check" size={15} strokeWidth={3} /> : p.paso}
                  </span>
                  <span className={`text-xs leading-tight font-semibold md:text-sm ${activo ? 'text-tinta' : 'text-texto-suave'}`}>{p.titulo}</span>
                </button>
              </Reveal>
            );
          })}
        </ol>
      </div>

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
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby="paso-titulo"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <RevealText id="paso-titulo" className="text-3xl">
                  <span className="text-dorado">{paso.paso}.</span> {paso.titulo}
                </RevealText>
                <p className="text-sm font-semibold text-texto-suave">Elegí uno o más</p>
              </div>

              {aviso && (
                <p className="mt-4 rounded-3xl bg-salvia px-4 py-3 text-sm font-semibold text-tinta" role="alert">
                  {aviso}
                </p>
              )}

              {loading ? (
                <div className="mt-6">
                  <GridSkeleton n={4} />
                </div>
              ) : (
                paso.categorias.map((catId) => {
                  // Sin stock (todas las variantes agotadas): no se ofrece en la rutina
                  const lista = (productos ?? []).filter((p) => p.categoria === catId && !p.sinStock);
                  if (!lista.length) return null;
                  return (
                    <div key={catId} className="mt-6">
                      {paso.categorias.length > 1 && (
                        <h3 className="mb-3 font-sans text-sm font-bold tracking-[0.15em] text-dorado uppercase">{nombreCat[catId]}</h3>
                      )}
                      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {lista.map((p, i) => (
                          <OpcionProducto
                            key={p.id}
                            indice={i}
                            producto={p}
                            seleccion={delPaso(paso).find((e) => e.producto.id === p.id) ?? null}
                            onElegir={() => elegir(p)}
                            onVariante={(v) => elegirVariante(p, v)}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}

              <div className="mt-8 flex items-center justify-between gap-3">
                <button type="button" onClick={() => irA(actual - 1)} disabled={actual === 0} className="btn btn-borde">
                  <Roll>
                    <Icon name="flechaIzq" size={18} /> Anterior
                  </Roll>
                </button>
                {actual < pasos.length - 1 ? (
                  <button type="button" onClick={() => irA(actual + 1)} className="btn btn-primario">
                    <Roll>
                      {delPaso(paso).length ? 'Siguiente' : 'Saltear'} <Icon name="flecha" size={18} />
                    </Roll>
                  </button>
                ) : (
                  <button type="button" onClick={agregarRutina} disabled={!elegidos.length} className="btn btn-primario hidden md:inline-flex">
                    <Roll>
                      Agregar rutina
                    </Roll>
                  </button>
                )}
              </div>
            </m.section>
          </AnimatePresence>
        </div>

        {/* Resumen (desktop) */}
        <aside className="hidden md:block" aria-label="Resumen de tu rutina">
          <div className="card sticky top-24 rounded-5xl p-6">
            <RevealText className="text-2xl">Tu rutina</RevealText>
            <ol className="mt-4 space-y-3">
              {pasos.map((p, i) => {
                const lista = delPaso(p);
                return (
                  <li key={p.paso}>
                    <button
                      type="button"
                      onClick={() => irA(i)}
                      className="flex w-full items-center gap-2 rounded-2xl px-2 py-1.5 text-left transition hover:bg-arena"
                    >
                      <span className="text-xs font-bold tracking-wider text-dorado uppercase">
                        {p.paso}. {p.titulo}
                      </span>
                      {!lista.length && <span className="ml-auto text-sm text-texto-suave">—</span>}
                    </button>
                    <ul className="space-y-1">
                      <AnimatePresence initial={false}>
                        {lista.map((e) => (
                          <m.li
                            key={e.producto.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-3 px-2 py-1"
                          >
                            <img {...imgFija(e.variante?.imagen ?? e.producto.imagen, 40)} alt="" width="40" height="40" className="size-10 shrink-0 rounded-xl bg-arena object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">{e.producto.nombreCorto}</span>
                              {e.variante && (
                                <span className="flex items-center gap-1.5 text-xs text-texto-suave">
                                  {e.variante.color && <MuestraColor color={e.variante.color} className="size-3" />}
                                  <span className="truncate">{e.variante.nombre}</span>
                                </span>
                              )}
                            </span>
                            <Precio valor={precioDe(e.producto, e.variante)} className="text-sm text-tinta" />
                          </m.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </li>
                );
              })}
            </ol>
            <MensajeLista visible={rutinaLista} total={total} className="mt-5" />
            <div className="mt-5 flex items-baseline justify-between border-t border-verde/10 pt-4">
              <span className="text-sm font-extrabold tracking-[0.18em] text-tinta uppercase">Total</span>
              <Total valor={total} className="text-3xl" />
            </div>
            <button type="button" onClick={agregarRutina} disabled={!elegidos.length} className="btn btn-primario mt-4 w-full">
              <Roll>
                <Icon name="carrito" size={18} /> Agregar rutina
              </Roll>
            </button>
          </div>
        </aside>
      </div>

      {/* Resumen (mobile): barra arriba del bottom nav */}
      <div className="fixed inset-x-0 bottom-[calc(4.6rem+max(0.75rem,env(safe-area-inset-bottom)))] z-30 px-3 md:hidden">
        <MensajeLista visible={rutinaLista} total={total} className="mb-2" />
        <div className="glass-arena flex items-center gap-3 rounded-4xl p-2 pl-4 shadow-flotante ring-1 ring-verde/10">
          <div className="flex gap-1.5">
            {pasos.map((p) => {
              const lista = delPaso(p);
              if (!lista.length)
                return (
                  <span key={p.paso} className="flex size-7 items-center justify-center rounded-full border border-dashed border-verde/40 text-[11px] font-bold text-texto-suave">
                    {p.paso}
                  </span>
                );
              return (
                // Una foto por paso (siempre 28px: el total entra) + cuántos hay si son más de uno
                <span key={p.paso} className="relative">
                  <img
                    {...imgFija(lista[0].variante?.imagen ?? lista[0].producto.imagen, 28)}
                    alt=""
                    width="32"
                    height="32"
                    className="size-7 rounded-full bg-crema-card object-cover ring-2 ring-verde"
                  />
                  {lista.length > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-dorado text-[9px] font-bold text-crema-card ring-2 ring-crema-card">
                      {lista.length}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <Total valor={total} className="text-lg" />
          </div>
          <button type="button" onClick={agregarRutina} disabled={!elegidos.length} className="btn btn-primario px-4 py-3 text-xs">
            <Roll>
              Agregar rutina
            </Roll>
          </button>
        </div>
      </div>

    </div>
  );
}

/** "¡Tu rutina está lista!" con el total, justo antes del botón de agregar (aparece con el 4.º paso). */
function MensajeLista({ visible, total, className = '' }) {
  return (
    <div aria-live="polite" className={visible ? className : undefined}>
      <AnimatePresence initial={false}>
        {visible && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-4xl bg-crema-card px-4 py-3 shadow-flotante ring-1 ring-dorado/20"
          >
            <Estrella className="size-7 shrink-0 text-dorado" />
            <p className="min-w-0 flex-1 font-serif text-lg leading-tight text-tinta">¡Tu rutina está lista!</p>
            <p className="text-right text-xs leading-tight text-texto-suave">
              Total
              <span className="precio block text-base text-tinta">{formatPrecio(total)}</span>
            </p>
          </m.div>
        )}
      </AnimatePresence>
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
        className={`precio inline-block text-tinta ${className}`}
        aria-live="polite"
      >
        {formatPrecio(valor)}
      </m.span>
    </AnimatePresence>
  );
}

/** Check de selección múltiple: el círculo hace un "pop" y el tilde se dibuja (stroke-dashoffset). */
function CheckAnimado({ activo }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full transition duration-300 ${
        activo ? 'scale-100 bg-verde shadow-suave' : 'scale-90 border-2 border-verde/25 bg-crema-card/85'
      }`}
      style={{ transitionTimingFunction: activo ? 'var(--ease-salto)' : undefined }}
    >
      <svg viewBox="0 0 24 24" className="size-4 text-arena">
        <path
          d="m5 12.5 4.5 4.5L19 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: activo ? 0 : 1, transition: `stroke-dashoffset 0.35s ease-out ${activo ? '0.12s' : '0s'}` }}
        />
      </svg>
    </span>
  );
}

function OpcionProducto({ producto, seleccion, onElegir, onVariante, indice = 0 }) {
  const activo = !!seleccion;
  const imagen = seleccion?.variante?.imagen ?? producto.imagen;
  return (
    // Cascada al entrar (cada paso vuelve a montar la lista)
    <Reveal as="li" delay={cascada(indice, 6)} className={`${activo && producto.variantes.length ? 'col-span-2 sm:col-span-3' : ''}`}>
      <m.div
        layout
        className={`overflow-hidden rounded-4xl border-2 bg-crema-card transition-colors ${activo ? 'border-verde shadow-flotante' : 'border-linea shadow-suave'}`}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={activo}
          onClick={onElegir}
          className={`relative flex w-full text-left transition active:scale-[0.98] ${activo && producto.variantes.length ? 'items-center gap-4 p-3' : 'flex-col'}`}
        >
          <span
            className={`relative block shrink-0 overflow-hidden ${
              activo && producto.variantes.length ? 'size-24 rounded-3xl' : 'aspect-square w-full'
            }`}
          >
            <FotoProducto
              src={imagen}
              srcSm={imgSm(imagen)}
              sizes="(min-width: 640px) 220px, 45vw"
              placeholderTitulo={producto.nombreCorto}
              zoom={false}
              compacta={!!(activo && producto.variantes.length)}
            />
          </span>
          <span className={`block ${activo && producto.variantes.length ? '' : 'p-3'}`}>
            {producto.marca && <span className="block text-[11px] font-bold tracking-[0.12em] text-dorado uppercase">{producto.marca}</span>}
            <span className="line-clamp-2 block text-sm leading-snug font-semibold">{producto.nombreCorto}</span>
            <Precio valor={precioDe(producto, seleccion?.variante)} desde={esDesde(producto, seleccion?.variante)} className="mt-1 block text-tinta" />
          </span>
          <CheckAnimado activo={activo} />
        </button>
        {activo && producto.variantes.length > 0 && (
          <div className="border-t border-verde/10 px-4 pt-3 pb-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              {seleccion.variante?.color && <MuestraColor color={seleccion.variante.color} />}
              {seleccion.variante?.nombre ?? (producto.deColores ? 'Color' : 'Variante')}
            </p>
            <Swatches
              variantes={producto.variantes}
              seleccionada={seleccion.variante?.nombre}
              onSelect={onVariante}
              size="md"
              nombreProducto={producto.nombreCorto}
            />
          </div>
        )}
      </m.div>
    </Reveal>
  );
}
