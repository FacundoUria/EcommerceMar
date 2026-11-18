import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import Icon from '../components/ui/Icon.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import { GridSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import { useBrands, useCategories, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { coincide } from '../lib/texto.js';
import { plural } from '../lib/format.js';

const ORDENES = [
  { id: 'destacados', label: 'Destacados' },
  { id: 'menor', label: 'Menor precio' },
  { id: 'mayor', label: 'Mayor precio' },
];

export default function Tienda() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') ?? '';
  const marca = params.get('marca') ?? '';
  const orden = ORDENES.some((o) => o.id === params.get('orden')) ? params.get('orden') : 'destacados';
  const qUrl = params.get('q') ?? '';

  const reducido = useReducedMotion();
  const { data: productos, loading } = useProducts();
  const { data: categorias } = useCategories();
  const { data: marcas } = useBrands();

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

  useEffect(() => {
    if (params.get('buscar')) {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [params]);

  const catActual = categorias?.find((c) => c.id === cat);
  usePageTitle(catActual ? catActual.nombre : marca || 'Tienda');

  const nombreCat = useMemo(() => Object.fromEntries((categorias ?? []).map((c) => [c.id, c.nombre])), [categorias]);

  const resultados = useMemo(() => {
    if (!productos) return [];
    let lista = productos.filter(
      (p) => (!cat || p.categoria === cat) && (!marca || p.marca === marca) && coincide(p, q, nombreCat[p.categoria]),
    );
    if (orden === 'menor') lista = [...lista].sort((a, b) => a.precio - b.precio);
    else if (orden === 'mayor') lista = [...lista].sort((a, b) => b.precio - a.precio);
    else lista = [...lista].sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado));
    return lista;
  }, [productos, cat, marca, q, orden, nombreCat]);

  const hayFiltros = cat || marca || q;

  return (
    <div className="mx-auto w-full max-w-[84rem] pt-4 pb-10 md:px-4">
      <Reveal as="header" className="px-4">
        <h1 className="text-4xl md:text-5xl">{catActual?.nombre ?? (marca || 'Tienda')}</h1>
      </Reveal>

      {/* Barra de búsqueda + orden, pegajosa debajo del header */}
      <div className="sticky top-16 z-30 mt-5 transition-transform duration-500 ease-out in-data-[header=compacto]:-translate-y-2 in-data-[header=oculto]:-translate-y-16 md:top-20 md:in-data-[header=oculto]:-translate-y-20">
        <div className="glass-arena px-4 py-3">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Buscar productos</span>
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
                placeholder="Buscar…"
                className="h-12 w-full rounded-full border border-verde/15 bg-crema-card pr-10 pl-11 text-[16px] shadow-suave transition outline-none placeholder:text-texto-suave/70 focus:border-verde focus:ring-4 focus:ring-salvia-media"
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
            <label className="relative">
              <span className="sr-only">Ordenar por</span>
              <select
                value={orden}
                onChange={(e) => actualizar({ orden: e.target.value === 'destacados' ? '' : e.target.value }, { replace: true })}
                className="h-12 appearance-none rounded-full border border-verde/15 bg-crema-card pr-9 pl-4 text-sm font-semibold text-tinta shadow-suave outline-none focus:border-verde focus:ring-4 focus:ring-salvia-media"
              >
                {ORDENES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Icon name="sliders" size={16} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-tinta" />
            </label>
          </div>

          {/* Chips de categoría */}
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtrar por categoría">
            <Chip activo={!cat} onClick={() => actualizar({ cat: '' })}>
              Todas
            </Chip>
            {categorias
              ? categorias.map((c) => (
                  <Chip key={c.id} activo={cat === c.id} onClick={() => actualizar({ cat: cat === c.id ? '' : c.id })}>
                    {c.nombre}
                  </Chip>
                ))
              : Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-full" />)}
          </div>
        </div>
      </div>

      {/* Chips de marca */}
      <div className="no-scrollbar mt-1 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por marca">
        {(marcas ?? []).map((m) => (
          <Chip key={m} variante="marca" activo={marca === m} onClick={() => actualizar({ marca: marca === m ? '' : m })}>
            {m}
          </Chip>
        ))}
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
                  viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                  exit={reducido ? undefined : { opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.6, delay: cascada(i), ease: [0.22, 1, 0.36, 1] }}
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

function Chip({ activo, onClick, children, variante }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`chip ${variante === 'marca' ? 'font-serif' : ''} ${
        activo ? 'border-verde bg-salvia text-verde' : 'border-linea bg-crema-card text-tinta hover:border-verde/40'
      }`}
    >
      {activo && <Icon name="check" size={14} strokeWidth={2.6} />}
      {children}
    </button>
  );
}
