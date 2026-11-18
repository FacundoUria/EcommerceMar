import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { createPortal } from 'react-dom';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import Icon from '../components/ui/Icon.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import FotoProducto from '../components/product/FotoProducto.jsx';
import { GridSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import { useBrands, useCategories, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useOcultarBottomNav } from '../hooks/useOcultarBottomNav.js';
import { coincide } from '../lib/texto.js';
import { imgSm, plural } from '../lib/format.js';

const ORDENES = [
  { id: 'destacados', label: 'Destacados' },
  { id: 'menor', label: 'Menor precio' },
  { id: 'mayor', label: 'Mayor precio' },
];
const EASE = [0.22, 1, 0.36, 1];

export default function Tienda() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') ?? '';
  // Marcas: varias, separadas por coma en la URL (?marca=Skala,Bekim). Compatible con ?marca=Skala.
  const marcasSel = useMemo(() => (params.get('marca') ?? '').split(',').filter(Boolean), [params]);
  const orden = ORDENES.some((o) => o.id === params.get('orden')) ? params.get('orden') : 'destacados';
  const qUrl = params.get('q') ?? '';

  const reducido = useReducedMotion();
  const { data: productos, loading } = useProducts();
  const { data: categorias } = useCategories();
  const { data: marcas } = useBrands();
  const [panel, setPanel] = useState(false);

  // Buscador instantáneo: estado local + sincronización con la URL (replace, sin ensuciar el historial)
  const [q, setQ] = useState(qUrl);
  const inputRef = useRef(null);
  useEffect(() => setQ(qUrl), [qUrl]);

  const actualizar = (cambios, { replace = false } = {}) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(cambios)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete('buscar');
    setParams(next, { replace, preventScrollReset: true });
  };
  const toggleMarca = (mk) => {
    const set = new Set(marcasSel);
    if (set.has(mk)) set.delete(mk);
    else set.add(mk);
    actualizar({ marca: [...set].join(',') }, { replace: true });
  };

  useEffect(() => {
    if (params.get('buscar')) {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [params]);

  const catActual = categorias?.find((c) => c.id === cat);
  const titulo = catActual?.nombre ?? (marcasSel.length === 1 ? marcasSel[0] : 'Tienda');
  usePageTitle(titulo);

  const nombreCat = useMemo(() => Object.fromEntries((categorias ?? []).map((c) => [c.id, c.nombre])), [categorias]);

  const resultados = useMemo(() => {
    if (!productos) return [];
    let lista = productos.filter(
      (p) => (!cat || p.categoria === cat) && (!marcasSel.length || marcasSel.includes(p.marca)) && coincide(p, q, nombreCat[p.categoria]),
    );
    if (orden === 'menor') lista = [...lista].sort((a, b) => a.precio - b.precio);
    else if (orden === 'mayor') lista = [...lista].sort((a, b) => b.precio - a.precio);
    else lista = [...lista].sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado));
    return lista;
  }, [productos, cat, marcasSel, q, orden, nombreCat]);

  const activos = marcasSel.length + (orden !== 'destacados' ? 1 : 0);
  const hayFiltros = cat || activos || q;

  return (
    <div className="mx-auto w-full max-w-[84rem] pt-4 pb-10 md:px-4">
      <Reveal as="header" className="px-4">
        <RevealText as="h1" className="text-4xl md:text-5xl">{titulo}</RevealText>
      </Reveal>

      {/* Barra pegajosa: buscador + Filtros, y una fila de categorías */}
      <div className="sticky top-16 z-30 mt-5 transition-transform duration-500 ease-out in-data-[header=compacto]:-translate-y-2 in-data-[header=oculto]:-translate-y-16 md:top-20 md:in-data-[header=oculto]:-translate-y-20">
        <div className="glass-arena px-4 py-3">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Buscá un producto</span>
              <Icon name="buscar" size={19} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-texto-suave" />
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  actualizar({ q: e.target.value }, { replace: true });
                }}
                placeholder="Buscá un producto"
                className="h-12 w-full rounded-full border border-linea bg-crema-card pr-10 pl-11 text-[16px] shadow-suave transition-colors outline-none placeholder:text-texto-suave focus:border-verde"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ('');
                    actualizar({ q: '' }, { replace: true });
                    inputRef.current?.focus();
                  }}
                  aria-label="Borrar búsqueda"
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-texto-suave hover:bg-salvia"
                >
                  <Icon name="cerrar" size={16} />
                </button>
              )}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setPanel((v) => !v)}
                aria-expanded={panel}
                aria-haspopup="dialog"
                className={`flex h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-suave transition-colors ${
                  activos ? 'border-verde bg-salvia text-verde' : 'border-linea bg-crema-card text-tinta hover:border-verde/40'
                }`}
              >
                <Icon name="sliders" size={17} />
                Filtros
                {activos > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-verde text-[11px] font-bold text-arena" aria-label={`${activos} activos`}>
                    {activos}
                  </span>
                )}
              </button>
              <PanelFiltros
                abierto={panel}
                onClose={() => setPanel(false)}
                marcas={marcas ?? []}
                marcasSel={marcasSel}
                onMarca={toggleMarca}
                orden={orden}
                onOrden={(o) => actualizar({ orden: o === 'destacados' ? '' : o }, { replace: true })}
                onLimpiar={() => actualizar({ marca: '', orden: '' }, { replace: true })}
                resultados={resultados.length}
              />
            </div>
          </div>

          {/* Una sola fila de categorías con mini-foto; fade en los bordes */}
          <div
            className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%-24px),transparent)]"
            role="group"
            aria-label="Filtrar por categoría"
          >
            <Pildora activo={!cat} onClick={() => actualizar({ cat: '' })}>
              <span className="flex size-7 items-center justify-center rounded-full bg-salvia text-verde">
                <Icon name="tienda" size={15} />
              </span>
              Todas
            </Pildora>
            {categorias
              ? categorias.map((c) => (
                  <Pildora key={c.id} activo={cat === c.id} onClick={() => actualizar({ cat: cat === c.id ? '' : c.id })}>
                    <span className="size-7 shrink-0 overflow-hidden rounded-full">
                      <FotoProducto src={imgSm(c.imagen)} cover zoom={false} />
                    </span>
                    {c.nombre}
                  </Pildora>
                ))
              : Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-11 w-28 shrink-0 rounded-full" />)}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{loading ? 'Cargando productos' : plural(resultados.length, 'producto', 'productos')}</p>
      {hayFiltros && (
        <div className="mt-2 flex justify-end px-4">
          <button type="button" onClick={() => setParams({}, { preventScrollReset: true })} className="text-sm font-bold text-verde underline-offset-4 hover:underline">
            Limpiar
          </button>
        </div>
      )}

      <div className="mt-4 px-4">
        {loading ? (
          <GridSkeleton n={8} />
        ) : resultados.length === 0 ? (
          <div className="card flex flex-col items-center rounded-5xl px-6 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-salvia text-verde">
              <Icon name="buscar" size={28} />
            </div>
            <p className="mt-4 font-serif text-2xl text-tinta">Sin resultados</p>
            <button type="button" onClick={() => setParams({})} className="btn btn-primario mt-6">
              Ver todo
            </button>
          </div>
        ) : (
          <m.ul layout className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            <AnimatePresence mode="popLayout">
              {resultados.map((p, i) => (
                // Cascada (0.06s) solo para las cards que entran en pantalla, una vez cada una.
                <m.li
                  key={p.id}
                  layout={!reducido}
                  initial={reducido ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px 10% 0px' }}
                  exit={reducido ? undefined : { opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.6, delay: cascada(i), ease: EASE }}
                >
                  <ProductCard producto={p} priority={i < 4} nivelTitulo="h2" className="h-full" />
                </m.li>
              ))}
            </AnimatePresence>
          </m.ul>
        )}
      </div>
    </div>
  );
}

function Pildora({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm font-semibold whitespace-nowrap transition duration-300 active:scale-95 ${
        activo ? 'border-verde bg-salvia text-verde' : 'border-linea bg-crema-card text-tinta hover:border-verde/40'
      }`}
    >
      {children}
    </button>
  );
}

/** Panel de filtros (marcas + orden): bottom-sheet en mobile, popover en desktop. */
function PanelFiltros({ abierto, onClose, ...props }) {
  const desktop = useMediaQuery('(min-width: 768px)');
  return <AnimatePresence>{abierto && (desktop ? <Popover onClose={onClose} {...props} /> : <Hoja onClose={onClose} {...props} />)}</AnimatePresence>;
}

function Popover({ onClose, ...props }) {
  const ref = useRef(null);
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useEffect(() => {
    const fuera = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('[aria-haspopup="dialog"]')) onClose();
    };
    document.addEventListener('pointerdown', fuera);
    return () => document.removeEventListener('pointerdown', fuera);
  }, [onClose]);
  return (
    <m.div
      ref={ref}
      role="dialog"
      aria-label="Filtros"
      tabIndex={-1}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="card absolute top-full right-0 z-40 mt-2 w-[24rem] rounded-3xl p-5 shadow-flotante outline-none"
    >
      <ContenidoFiltros onClose={onClose} {...props} />
    </m.div>
  );
}

function Hoja({ onClose, ...props }) {
  const ref = useRef(null);
  useFocusTrap(ref, onClose, true, { enfocarContenedor: true });
  useOcultarBottomNav();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end">
      <m.div className="velo absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        tabIndex={-1}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-5xl bg-crema-card outline-none px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-flotante"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-tinta/15" aria-hidden="true" />
        <ContenidoFiltros onClose={onClose} {...props} />
      </m.div>
    </div>,
    document.body,
  );
}

function ContenidoFiltros({ onClose, marcas, marcasSel, onMarca, orden, onOrden, onLimpiar, resultados }) {
  return (
    <div className="font-sans">
      <fieldset>
        <legend className="mb-2.5 text-xs font-bold tracking-[0.18em] text-texto-suave uppercase">Ordenar</legend>
        <div className="flex flex-wrap gap-2">
          {ORDENES.map((o) => (
            <label
              key={o.id}
              className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-verde ${
                orden === o.id ? 'border-verde bg-salvia text-verde' : 'border-linea text-tinta hover:border-verde/40'
              }`}
            >
              <input type="radio" name="orden" value={o.id} checked={orden === o.id} onChange={() => onOrden(o.id)} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-2.5 text-xs font-bold tracking-[0.18em] text-texto-suave uppercase">Marcas</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {marcas.map((mk) => (
            <label key={mk} className="flex cursor-pointer items-center gap-2.5 rounded-xl px-1 py-2 text-[15px] text-tinta hover:bg-salvia/60">
              <input type="checkbox" checked={marcasSel.includes(mk)} onChange={() => onMarca(mk)} className="size-[18px] shrink-0 accent-verde" />
              {mk}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-linea pt-4">
        <button type="button" onClick={onLimpiar} className="text-sm font-bold text-verde underline-offset-4 hover:underline">
          Limpiar
        </button>
        <button type="button" onClick={onClose} className="btn btn-primario px-6 py-3">
          Listo<span className="sr-only"> ({plural(resultados, 'producto', 'productos')})</span>
        </button>
      </div>
    </div>
  );
}
