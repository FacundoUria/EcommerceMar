import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import { usePausaFueraDePantalla } from '../hooks/usePausaFueraDePantalla.js';
import FotosMar from '../components/marca/FotosMar.jsx';
import FirmaMar from '../components/marca/FirmaMar.jsx';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import Carrusel from '../components/ui/Carrusel.jsx';
import Banners from '../components/ui/Banners.jsx';
import Resenas from '../components/ui/Resenas.jsx';
import Expandible from '../components/ui/Expandible.jsx';
import MeshFondo from '../components/ui/MeshFondo.jsx';
import LineaProgreso from '../components/ui/LineaProgreso.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import FotoProducto from '../components/product/FotoProducto.jsx';
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx';
import { useBrands, usePasosRutina, useProducts } from '../hooks/useCatalog.js';
import Precio from '../components/ui/Precio.jsx';
import { imgSm } from '../lib/format.js';
import Roll from '../components/ui/Roll.jsx';
import Rulos from '../components/marca/Rulos.jsx';
import { ConDestellos } from '../components/marca/Destellos.jsx';

const EASE = [0.22, 1, 0.36, 1];


/** Secciones del home de abajo del pliegue (chunk aparte: lo pide Home.jsx después del load). */
export default function HomeResto() {
  return (
    <>
      <FavoritosDeMar />
      <CintaMarcas />
      <RutinaHistoria />
      <HolaSoyMar />
      <Resenas />
      <Banners items={BANNERS} />
    </>
  );
}

/* ═════════ BANNERS de Mar (al final del home, después de "Hola, soy Mar") ═════════ */
// Sin repetir lo que ya dice el sitio: envíos y medios de pago están en la barra de anuncio, las marcas
// en la cinta de marcas, y hola-soy-mar en la sección "Hola, soy Mar" (además tiene un typo).
const BANNERS = [
  ['asesoramiento-corte-en-seco', 'Asesoramiento y corte en seco'],
  ['dream-hair-studio', 'Dream Hair Studio'],
  ['promos-rulos', 'Promos para rulos'],
  ['promociones-mensuales', 'Promociones mensuales'],
].map(([nombre, alt]) => ({ src: `/img/banners/${nombre}.webp`, alt }));

/* ═════════ FAVORITOS DE MAR (los `destacado` del catálogo) ═════════
   No son "más vendidos": se eligieron sin datos de ventas. Cuando haya ventas reales, esta sección pasa a
   mostrarlas (y vuelve a llamarse "Más vendidos"). */
function FavoritosDeMar() {
  const { data: productos, loading } = useProducts();
  const destacados = useMemo(() => (productos ?? []).filter((p) => p.destacado), [productos]);
  return (
    <section aria-labelledby="dest-titulo" className="fondo-salvia grano py-14 md:py-20">
      <Reveal className="contenedor mb-1 flex items-end justify-between gap-4">
        <RevealText id="dest-titulo" className="text-3xl leading-tight md:text-4xl">
          Favoritos de <em className="texto-dorado">Mar</em>
        </RevealText>
        <Link to="/tienda" className="group/l inline-flex shrink-0 items-center gap-1 py-2 text-sm font-bold text-verde">
          Ver todo <Icon name="flecha" size={16} className="transition-transform group-hover/l:translate-x-1" />
        </Link>
      </Reveal>
      {loading ? (
        <div className="contenedor mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Carrusel label="Favoritos de Mar" autoplay={4500} fondo="var(--color-salvia)">
          {destacados.map((p, i) => (
            <Reveal key={p.id} delay={cascada(i)} className="h-full">
              <ProductCard producto={p} className="h-full" />
            </Reveal>
          ))}
        </Carrusel>
      )}
    </section>
  );
}

/* ═════════ Cinta infinita de marcas (sin título) ═════════ */
/**
 * Cinta infinita de marcas (CSS, solo transform). Reacciona al scroll: la velocidad del scroll sube el
 * playbackRate de la animación (hasta 4x) y vuelve suave a 1x. Con movimiento reducido: quieta y centrada
 * (una sola fila; justify-center reparte lo que sobra a los dos lados).
 */
function CintaMarcas() {
  const { data: marcas } = useBrands();
  const reducido = useReducedMotion();
  const pista = useRef(null);
  // Fuera de pantalla, la cinta queda quieta
  const cinta = useRef(null);
  usePausaFueraDePantalla(cinta, { listo: !!marcas?.length });

  useEffect(() => {
    const el = pista.current;
    if (reducido || !el?.getAnimations) return;
    let raf = 0;
    let rate = 1;
    let objetivo = 1;
    let yPrev = window.scrollY;
    let tPrev = performance.now();
    const onScroll = () => {
      const t = performance.now();
      const v = Math.abs(window.scrollY - yPrev) / Math.max(1, t - tPrev); // px/ms
      yPrev = window.scrollY;
      tPrev = t;
      objetivo = Math.max(objetivo, Math.min(4, 1 + v * 2.5));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      const anim = el.getAnimations()[0];
      objetivo += (1 - objetivo) * 0.06; // el empujón se va apagando
      rate += (objetivo - rate) * 0.15;
      if (anim) anim.playbackRate = rate;
      if (Math.abs(rate - 1) < 0.01 && Math.abs(objetivo - 1) < 0.01) {
        if (anim) anim.playbackRate = 1;
        rate = objetivo = 1;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducido, marcas?.length]);

  if (!marcas?.length) return <div className="h-20" aria-hidden="true" />;
  const fila = (copia) => (
    <ul className="flex shrink-0 items-center" aria-hidden={copia || undefined}>
      {marcas.map((mk) => (
        <li key={mk} className="flex items-center">
          <Link
            to={`/tienda?marca=${encodeURIComponent(mk)}`}
            tabIndex={copia ? -1 : undefined}
            className="px-6 font-serif text-3xl whitespace-nowrap text-tinta transition-colors hover:text-verde md:px-9 md:text-5xl"
          >
            {mk}
          </Link>
          <span className="size-2 rounded-full bg-dorado" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <nav ref={cinta} aria-label="Marcas" className="group/cinta overflow-hidden py-8 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] md:py-12">
      {reducido ? (
        <div className="flex justify-center">{fila(false)}</div>
      ) : (
        <div ref={pista} className="flex w-max animate-[cinta_45s_linear_infinite] group-hover/cinta:[animation-play-state:paused]">
          {fila(false)}
          {fila(true)}
        </div>
      )}
    </nav>
  );
}

/* ═════════ ARMÁ TU RUTINA: scroll storytelling (sticky en desktop, apilado en mobile) ═════════ */
const PASOS_CHIPS = ['Lavar', 'Hidratar', 'Definir', 'Proteger'];

/** Opciones de cada paso (destacados primero). En /rutina se puede elegir más de una por paso. */
function useOpcionesPorPaso() {
  const { data: productos } = useProducts();
  const pasos = usePasosRutina();
  return useMemo(
    () =>
      pasos.map((p) =>
        (productos ?? []).filter((x) => p.categorias.includes(x.categoria)).sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado)),
      ),
    [productos, pasos],
  );
}
const useProductosPorPaso = () => useOpcionesPorPaso().map((l) => l[0] ?? null);

function RutinaHistoria() {
  return (
    <section aria-labelledby="rutina-titulo" className="grano">
      <MeshFondo />
      {/* `fijo`: en desktop la sección mide 320vh con un panel sticky; los rulos acompañan la pantalla */}
      <Rulos variante="rutina" fijo />
      <RutinaDesktop />
      <RutinaMobile />
    </section>
  );
}

function RutinaDesktop() {
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const porPaso = useProductosPorPaso();
  const [activo, setActivo] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActivo(Math.min(3, Math.max(0, Math.floor(v * 4)))));
  const producto = porPaso[activo];

  // Movimiento reducido: sin sticky ni escenas; los 4 pasos a la vista en una grilla.
  if (reducido) {
    return (
      <div className="contenedor hidden py-24 md:block">
        <RevealText id="rutina-titulo" className="text-[clamp(2.75rem,5vw,4.5rem)] leading-none">
          Armá tu <em className="texto-dorado">rutina</em>
        </RevealText>
        <ol className="mt-10 grid grid-cols-4 gap-6">
          {PASOS_CHIPS.map((p, i) => {
            const prod = porPaso[i];
            return (
              <li key={p}>
                <Link to={`/rutina?paso=${i + 1}`} className="card group block overflow-hidden rounded-3xl">
                  <span className="block aspect-[4/5] overflow-hidden">
                    {prod && <FotoProducto src={prod.imagen} srcSm={imgSm(prod.imagen)} sizes="300px" />}
                  </span>
                  <span className="flex items-center gap-3 p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-verde text-sm font-bold text-verde">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block font-serif text-2xl text-tinta">{p}</span>
                      {prod && <span className="block truncate text-xs text-texto-suave">{prod.nombreCorto}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <Link to="/rutina" className="btn btn-primario mt-10 px-8 py-4 text-base">
          <Roll>
            Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
          </Roll>
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="hidden h-[320vh] md:block">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="contenedor grid grid-cols-[0.95fr_1.05fr] items-center gap-16">
          <div>
            <RevealText id="rutina-titulo" className="text-[clamp(2.75rem,5vw,4.5rem)] leading-none">
              Armá tu <em className="texto-dorado">rutina</em>
            </RevealText>
            <div className="relative mt-10">
              <LineaProgreso progreso={scrollYProgress} vertical className="absolute top-5 bottom-5 left-[19px]" />
              <ol className="relative space-y-5">
                {PASOS_CHIPS.map((p, i) => {
                  const on = i === activo;
                  const hecho = i < activo;
                  return (
                    <li key={p}>
                      <Link to={`/rutina?paso=${i + 1}`} className="group flex w-fit items-center gap-5 rounded-full pr-3">
                      <span
                        className={`flex size-10 items-center justify-center rounded-full border text-sm font-bold transition duration-500 group-hover:border-verde ${
                          on ? 'scale-110 border-verde bg-verde text-arena shadow-flotante' : hecho ? 'border-verde bg-crema-card text-verde' : 'border-linea bg-crema-card text-texto-suave'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`font-serif text-3xl transition duration-500 group-hover:text-verde ${on ? 'translate-x-1 text-tinta' : 'text-texto-suave'}`}
                        aria-current={on ? 'step' : undefined}
                      >
                        {p}
                      </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
            <Link to="/rutina" className="btn btn-primario mt-10 px-8 py-4 text-base">
              <Roll>
                Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
              </Roll>
            </Link>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem]">
            <AnimatePresence mode="popLayout" initial={false}>
              {producto && (
                <m.div
                  key={producto.id}
                  initial={reducido ? false : { opacity: 0, scale: 0.94, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reducido ? undefined : { opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Link to={`/producto/${producto.id}`} className="group block size-full">
                    <span className="block size-full overflow-hidden rounded-[2.5rem] shadow-flotante">
                      <FotoProducto src={producto.imagen} srcSm={imgSm(producto.imagen)} sizes="448px" alt={producto.nombreCorto} />
                    </span>
                    <span className="absolute -bottom-5 left-6 rounded-2xl border border-linea bg-crema-card/95 px-4 py-3 shadow-flotante backdrop-blur">
                      <span className="block text-sm font-semibold text-tinta">{producto.nombreCorto}</span>
                      <Precio valor={producto.precio} desde={producto.desde} className="block text-sm text-verde" />
                    </span>
                  </Link>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function RutinaMobile() {
  const ref = useRef(null);
  const opciones = useOpcionesPorPaso();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  // pb-8: con el pt-20 de "Hola, soy Mar" el hueco queda como entre las otras secciones (≈ 96px)
  return (
    <div className="contenedor pt-16 pb-8 md:hidden">
      <Reveal>
        <RevealText className="text-4xl leading-none">
          Armá tu <em className="texto-dorado">rutina</em>
        </RevealText>
      </Reveal>
      <div ref={ref} className="relative mt-8">
        <LineaProgreso progreso={scrollYProgress} vertical className="absolute top-8 bottom-8 left-[19px]" />
        <ol className="relative space-y-4">
          {PASOS_CHIPS.map((p, i) => {
            const lista = opciones[i];
            return (
              <Reveal as="li" key={p} delay={i * 0.1}>
                <Link to={`/rutina?paso=${i + 1}`} className="group flex items-center gap-4 rounded-2xl transition active:scale-[0.98]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-verde bg-crema-card text-sm font-bold text-verde transition-colors group-active:bg-verde group-active:text-arena">
                  {i + 1}
                </span>
                <span className="card flex flex-1 items-center gap-3 rounded-2xl p-2 pr-3">
                  {/* Varias opciones por paso: hasta 3 fotos apiladas */}
                  {lista.length > 0 && (
                    <span className="flex shrink-0 -space-x-6">
                      {lista.slice(0, 3).map((prod, k) => (
                        <span key={prod.id} className="size-14 overflow-hidden rounded-xl shadow-suave ring-2 ring-crema-card" style={{ zIndex: 3 - k }}>
                          <FotoProducto src={imgSm(prod.imagen)} zoom={false} compacta halo={false} />
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-xl text-tinta">{p}</span>
                    {lista.length > 0 && <span className="block truncate text-xs text-texto-suave">{lista.length === 1 ? lista[0].nombre : `${lista.length} opciones`}</span>}
                  </span>
                  <Icon name="flecha" size={18} className="shrink-0 text-verde" />
                </span>
                </Link>
              </Reveal>
            );
          })}
        </ol>
      </div>
      <Reveal delay={0.2}>
        <Link to="/rutina" className="btn btn-primario mt-8">
          <Roll>
            Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
          </Roll>
        </Link>
      </Reveal>
    </div>
  );
}

/* ═════════ HOLA, SOY MAR (textos de Mar tal cual; "Leer más" despliega el resto; mazo de fotos, firma y etiquetas) ═════════ */
function HolaSoyMar() {
  const ref = useRef(null);
  return (
    // overflow-x: clip → la foto que pasa al fondo sale un momento hacia el costado sin generar scroll horizontal
    <section ref={ref} aria-labelledby="mar-titulo" className="contenedor overflow-x-clip pt-20 pb-8 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
        {/* Mazo de fotos de Mar con etiquetas flotantes (tocar = pasa la de adelante al fondo) */}
        <Reveal>
          <FotosMar seccion={ref} />
        </Reveal>
        <Reveal delay={0.1}>
          <ConDestellos>
            <RevealText id="mar-titulo" className="text-5xl leading-none md:text-7xl">
              Hola, soy <em className="texto-dorado">Mar</em>
            </RevealText>
          </ConDestellos>
          <p className="mt-5 max-w-lg font-serif text-2xl leading-snug text-tinta md:text-[1.7rem]">
            Coach capilar, emprendedora y creadora de Dream Hair. Juntas vamos a potenciar la belleza natural de tu cabello ❤️
          </p>
          {/* Firma de Mar, que se dibuja con el scroll */}
          <FirmaMar className="mt-3 -ml-1" />
          <Expandible lineas={0} textoAbrir="Leer más" textoCerrar="Leer menos" className="mt-3 max-w-lg">
            <p className="pt-1 pb-2 text-base leading-relaxed text-texto-suave">
              También realizo cortes de cabellos ondulados, afro y rizados en seco, tratamientos, asesoramiento para que puedas
              aprender a identificar tu tipo de cabello, los productos adecuados y técnicas (de lavado, finalización, etc.) en
              nuestro showroom, en el cual no solo vas a aprender, sino que también podrás conseguir los mejores productos
              nacionales e importados. Espero poder ayudarlas en esta hermosa aventura de amar y cuidar nuestro cabello.
            </p>
          </Expandible>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/servicios" className="btn btn-primario">
              <Roll>
                Conocé los servicios
              </Roll>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
