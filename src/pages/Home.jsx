import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import { usePausaFueraDePantalla } from '../hooks/usePausaFueraDePantalla.js';
import RevealText from '../components/ui/RevealText.jsx';
import RevealImagen from '../components/ui/RevealImagen.jsx';
import Carrusel from '../components/ui/Carrusel.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import MeshFondo from '../components/ui/MeshFondo.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import FotoProducto from '../components/product/FotoProducto.jsx';
import { esDesde, precioDe } from '../lib/precios.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { useCategories, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { HERO_CARDS } from '../config/hero.js';
import Precio from '../components/ui/Precio.jsx';
import { imgSm } from '../lib/format.js';
import { colorDe } from '../lib/colores.js';
import Roll from '../components/ui/Roll.jsx';
import Rulos from '../components/marca/Rulos.jsx';
import AdornoTitulo from '../components/marca/AdornoTitulo.jsx';
import { DEMORA_INTRO } from '../components/marca/IntroMarca.jsx';
import { campanaActiva } from '../lib/promo.js';
import { useNavidadActiva } from '../hooks/useCampana.js';
import { CAMPANA } from '../config/promo.js';

const EASE = [0.22, 1, 0.36, 1];


// Secciones de abajo del pliegue (favoritos, cinta de marcas, rutina, "Hola, soy Mar", reseñas y banners)
// en un chunk aparte (HomeResto.jsx), que se pide apenas el hero ya está montado: el primer render (el que
// pinta el hero, el LCP) monta mucho menos y el resto llega en una tarea aparte. Mientras no llega, un
// espacio del alto aproximado (abajo del pliegue: no se ve ni mueve nada en pantalla).
const cargarResto = () => import('./HomeResto.jsx');
const HomeResto = lazy(cargarResto);
let restoListo = false;
const ESPACIO_RESTO = <div aria-hidden="true" className="min-h-[300svh]" />;

function useResto() {
  const [listo, setListo] = useState(restoListo);
  useEffect(() => {
    if (listo) return;
    let vivo = true;
    cargarResto().then(() => {
      restoListo = true;
      if (vivo) setListo(true);
    });
    return () => {
      vivo = false;
    };
  }, [listo]);
  return listo;
}

// Promos vigentes (Black Friday): sección entre el hero y las categorías, en un chunk que se pide solo si hay
// alguna. El resto del año no se dibuja ni se baja nada.
const PromoInicio = lazy(() => import('./PromoInicio.jsx'));
// Especial de Navidad (config/navidad.js): mismo lugar, mismo criterio (chunk aparte, solo mientras dura)
const EspecialNavidad = lazy(() => import('../components/promo/EspecialNavidad.jsx'));

/**
 * Promos del inicio: primero las del Black Friday (productos) y debajo el Especial de Navidad (servicios).
 * Cuando están las dos (hasta el 27/11) comparten un solo fondo salvia: una franja, no dos seguidas.
 */
function Especiales() {
  const navidad = useNavidadActiva();
  const { data: productos } = useProducts();
  const enPromo = productos?.filter((p) => p.promo) ?? [];
  if (!navidad && !enPromo.length) return null;
  const juntas = navidad && enPromo.length > 0;
  const campana = campanaActiva();
  const hasta = campana ? CAMPANA.hasta : enPromo.map((p) => p.promo.hasta).sort()[0];
  return (
    <div className={juntas ? 'fondo-salvia' : undefined}>
      {enPromo.length > 0 && (
        <Suspense fallback={null}>
          <PromoInicio productos={enPromo} titulo={campana ? CAMPANA.nombre : 'Promos'} hasta={hasta} sinFondo={juntas} />
        </Suspense>
      )}
      {navidad && (
        <Suspense fallback={null}>
          <EspecialNavidad enInicio sinFondo={juntas} />
        </Suspense>
      )}
    </div>
  );
}

export default function Home() {
  usePageTitle(null);
  const resto = useResto();
  return (
    <>
      <Hero />
      <Especiales />
      <Categorias />
      {resto ? (
        <Suspense fallback={ESPACIO_RESTO}>
          <HomeResto />
        </Suspense>
      ) : (
        ESPACIO_RESTO
      )}
    </>
  );
}

/* ═════════ HERO full-screen: mesh animado, título gigante, foto blob + mini-cards flotantes ═════════ */
// La frase de Mar: "El cabello es el espejo de tu amor propio"
const TITULO_TEXTO = 'El cabello es el espejo de tu';
const TITULO_EM = 'amor propio';
const PARALLAX_PX = 60;
// Foto del hero. index.html la precarga con el mismo srcset (vite.config.js lo saca de src/data/imagenes.json)
// y los mismos sizes: si cambian HERO_FOTO o HERO_SIZES, cambiar también HERO en vite.config.js
const HERO_FOTO = '/img/mar/inicio.webp';
const HERO_SIZES = '(min-width: 768px) min(30rem, 42vw), 84vw';
const HERO_ENCUADRE = 'object-[50%_30%]';
const BLOB = 'rounded-[46%_54%_40%_60%/56%_44%_56%_44%]';

function Hero() {
  const reducido = useReducedMotion();
  // Fuera de pantalla, sus loops (brillo dorado, manchas, mini-cards, destellos) quedan en pausa
  const seccion = useRef(null);
  usePausaFueraDePantalla(seccion);
  const { scrollY } = useScroll();
  const { data: productos } = useProducts();
  // Foto al 70% de la velocidad del scroll; mini-cards a distintas velocidades.
  const yFoto = useTransform(scrollY, [0, PARALLAX_PX / 0.3], [0, PARALLAX_PX], { clamp: true });
  const yCard1 = useTransform(scrollY, [0, 600], [0, -70], { clamp: true });
  const yCard2 = useTransform(scrollY, [0, 600], [0, -140], { clamp: true });

  // Mini-cards: contenido en src/config/hero.js; acá solo dónde va cada una
  const cards = HERO_CARDS.map((c) => {
    const producto = productos?.find((p) => p.id === c.producto);
    const variante = c.variante ? producto?.variantes.find((v) => v.nombre === c.variante) : null;
    return producto ? { ...c, producto, variante } : null;
  });
  const POSICIONES = [
    // junto al pote de Skala que sostiene Mar (abajo, a su derecha), sin taparlo
    { y: yCard2, delay: 1.05, flotarDesfase: true, evitarMiniMar: true, className: '-right-[10%] bottom-[9%] md:-right-[14%]' },
    { y: yCard1, delay: 0.9, className: '-left-[14%] -top-[3%] md:-left-[18%] md:top-[4%]' },
  ];

  // data-hero: mini Mar entra recién cuando el hero salió de pantalla
  return (
    <section ref={seccion} aria-labelledby="hero-titulo" data-hero className="grano -mt-px overflow-hidden">
      <MeshFondo />
      <Rulos variante="hero" />
      {/* El hero termina donde termina su contenido (+ indicador de scroll), sin aire vacío abajo */}
      <div className="contenedor grid items-center gap-8 pt-6 pb-10 md:grid-cols-[1.08fr_0.92fr] md:gap-10 md:pt-10 md:pb-6">
        {/* Título (arriba en mobile, izquierda en desktop): revelado por línea al cargar.
            Con intro de marca, entra cuando la intro se abre. */}
        <div className="flex flex-col items-start gap-8">
          <div className="relative">
            <RevealText as="h1" id="hero-titulo" alCargar delay={0.15 + DEMORA_INTRO} className="text-[clamp(3rem,7.4vw,6.5rem)] leading-[0.98] tracking-[-0.02em]">
              {TITULO_TEXTO} <em className="texto-dorado brillo-dorado">{TITULO_EM}</em>
            </RevealText>
            {/* Subrayado en rulo (después de que entra el título) + destellos alrededor de "amor propio" */}
            <AdornoTitulo delay={1.25 + DEMORA_INTRO} />
          </div>
          <m.div
            initial={{ opacity: 0, y: reducido ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 + DEMORA_INTRO, ease: EASE }}
          >
            <Link to="/tienda" className="btn btn-primario px-8 py-4 text-base">
              <Roll>
                Ver productos <Icon name="flecha" size={18} />
              </Roll>
            </Link>
          </m.div>
        </div>

        {/* Foto con forma orgánica + mini-cards flotando */}
        <div className="relative mx-auto w-[84%] max-w-[30rem] md:w-full">
          {/* Entrada con CSS (no con motion): arranca con el primer pintado, sin esperar al chunk async
              de motion. Es la imagen del LCP: así no queda en opacity 0 mientras carga el JS. */}
          <div className={`hero-foto relative aspect-[4/5] overflow-hidden bg-salvia-media shadow-flotante ${BLOB}`}>
            <m.div className="absolute inset-x-0 bottom-0" style={{ top: -PARALLAX_PX, y: reducido ? 0 : yFoto }}>
              {/* Foto elegida por Mar (793×1064). Mismo srcset/sizes que el preload de index.html */}
              <SmartImg
                src={HERO_FOTO}
                sizes={HERO_SIZES}
                alt="Mar, de Dream Hair, con rulos definidos y una crema Skala Cachonados"
                width={793}
                height={1064}
                priority
                className={`size-full object-cover ${HERO_ENCUADRE}`}
              />
            </m.div>
          </div>

          {cards.map((c, i) => {
            const pos = POSICIONES[i];
            if (!c || !pos) return null;
            return <MiniCard key={i} producto={c.producto} variante={c.variante} etiqueta={c.etiqueta} {...pos} y={reducido ? 0 : pos.y} />;
          })}
        </div>
      </div>

      {/* Indicador de scroll: dentro del hero, abajo */}
      <div aria-hidden="true" className="hidden flex-col items-center gap-1.5 pb-8 text-texto-suave md:flex">
        <span className="flex h-10 w-6 justify-center rounded-full border border-tinta/25 pt-2">
          <span className="anim-rebote h-2 w-1 rounded-full bg-verde" style={{ animation: 'rebote 2s ease-in-out infinite' }} />
        </span>
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">Scroll</span>
      </div>
    </section>
  );
}

/**
 * `variante` (opcional): muestra esa variante (foto y nombre) y linkea directo a ella.
 * `etiqueta`: texto chico arriba de la card ("El que uso yo", "Favorito").
 * evitarMiniMar: el botón compacto de mini Mar se esconde mientras se superpone con esta card.
 */
function MiniCard({ producto, variante, etiqueta, y, delay, className, flotarDesfase = false, evitarMiniMar = false }) {
  const reducido = useReducedMotion();
  const imagen = variante?.imagen ?? producto.imagen;
  const nombre = variante ? `${producto.nombreCorto} · ${variante.nombre}` : producto.nombreCorto;
  return (
    <m.div style={{ y }} className={`absolute z-10 ${className}`} data-evitar-mini-mar={evitarMiniMar || undefined}>
      <m.div
        initial={{ opacity: 0, y: reducido ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease: EASE }}
      >
        <Link
          to={`/producto/${producto.id}${variante ? `?v=${encodeURIComponent(variante.nombre)}` : ''}`}
          className="anim-flotar relative flex w-[10.5rem] items-center gap-2.5 rounded-2xl border border-linea bg-crema-card/90 p-2 pr-3 shadow-flotante backdrop-blur-md transition hover:bg-crema-card md:w-[13rem] md:p-2.5"
          style={{ animation: `flotar ${flotarDesfase ? 5 : 4.5}s ease-in-out ${flotarDesfase ? '-2.2s' : '0s'} infinite` }}
        >
          {etiqueta && (
            <span className="absolute -top-2.5 left-3 rounded-full bg-dorado px-2 py-0.5 text-[10px] leading-none font-bold tracking-wide text-crema-card shadow-suave">
              {etiqueta}
            </span>
          )}
          <span className="size-11 shrink-0 overflow-hidden rounded-xl md:size-14">
            <FotoProducto src={imgSm(imagen)} zoom={false} compacta />
          </span>
          <span className="min-w-0">
            <span className="line-clamp-2 block text-xs leading-tight font-semibold text-tinta md:text-[13px]">{nombre}</span>
            <Precio valor={precioDe(producto, variante)} desde={esDesde(producto, variante)} className="mt-0.5 block text-xs text-verde md:text-sm" />
          </span>
        </Link>
      </m.div>
    </m.div>
  );
}

/* ═════════ CATEGORÍAS: paneles expandibles (desktop) / carrusel centrado (mobile) ═════════ */
const MAX_PANELES = 5; // + 1 panel "Ver todas"

function Categorias() {
  const { data: categorias, loading } = useCategories();
  const desktop = useMediaQuery('(min-width: 1024px)');
  return (
    <section aria-labelledby="cat-titulo" className="pt-4 pb-10 md:pt-8 md:pb-12">
      <SectionHeader id="cat-titulo" titulo="Categorías" />
      {loading || !categorias ? (
        <div className="contenedor flex gap-3">
          {Array.from({ length: desktop ? 6 : 2 }, (_, i) => (
            <Skeleton key={i} className="h-[420px] flex-1 rounded-3xl lg:h-[480px]" />
          ))}
        </div>
      ) : desktop ? (
        <PanelesCategorias categorias={categorias} />
      ) : (
        <Carrusel label="Categorías" anchoMobile="68%">
          {categorias.map((c) => (
            <Link
              key={c.id}
              to={`/tienda?cat=${c.id}`}
              style={{ '--color-producto': colorDe(c.imagen) }}
              className="borde-producto group relative block aspect-[3/4] overflow-hidden rounded-3xl border-2 border-transparent shadow-suave"
            >
              <FotoProducto src={c.imagen} srcSm={imgSm(c.imagen)} sizes="68vw" placeholderTitulo={c.nombre} cover zoom={false} />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16241C]/80 via-[#16241C]/10 to-transparent" />
              <span className="absolute inset-x-5 bottom-5 font-serif text-2xl leading-tight text-crema-card">{c.nombre}</span>
            </Link>
          ))}
        </Carrusel>
      )}
    </section>
  );
}

function PanelesCategorias({ categorias }) {
  const [activo, setActivo] = useState(0);
  const paneles = [...categorias.slice(0, MAX_PANELES).map((c) => ({ ...c, to: `/tienda?cat=${c.id}` })), { id: 'todas', nombre: 'Ver todas', to: '/tienda' }];
  return (
    <div className="contenedor">
      <ul className="flex h-[480px] gap-3">
        {paneles.map((p, i) => {
          const on = i === activo;
          const todas = p.id === 'todas';
          return (
            <li
              key={p.id}
              className="min-w-0 basis-0 transition-[flex-grow] duration-[600ms] ease-[ease]"
              style={{ flexGrow: on ? 4 : 1 }}
              onMouseEnter={() => setActivo(i)}
            >
              <Link
                to={p.to}
                onFocus={() => setActivo(i)}
                aria-label={todas ? 'Ver todas las categorías' : `${p.nombre}: ver productos`}
                  style={todas ? undefined : { '--color-producto': colorDe(p.imagen) }}
                className={`borde-producto group relative block size-full overflow-hidden rounded-3xl border-2 border-transparent shadow-suave ${todas ? 'bg-salvia' : ''}`}
              >
                {!todas && (
                  <>
                    <RevealImagen delay={i * 0.08}>
                      <FotoProducto src={p.imagen} srcSm={imgSm(p.imagen)} sizes="(min-width: 1024px) 640px" placeholderTitulo={p.nombre} cover zoom={false} />
                    </RevealImagen>
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16241C]/80 via-[#16241C]/15 to-transparent" />
                  </>
                )}
                {/* Angosto: nombre en vertical */}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-7 left-1/2 -translate-x-1/2 rotate-180 font-serif text-2xl whitespace-nowrap [writing-mode:vertical-rl] transition-opacity duration-500 ${
                    todas ? 'text-tinta' : 'text-crema-card'
                  } ${on ? 'opacity-0' : 'opacity-100'}`}
                >
                  {todas ? 'Ver todas →' : p.nombre}
                </span>
                {/* Expandido: nombre grande + "Ver productos →" que entra desde abajo */}
                <span className={`absolute inset-x-8 bottom-8 transition-opacity duration-500 ${on ? 'opacity-100 delay-150' : 'opacity-0'}`}>
                  <span className={`block font-serif text-5xl leading-none whitespace-nowrap ${todas ? 'text-tinta' : 'text-crema-card'}`}>
                    {todas ? 'Ver todas' : p.nombre}
                  </span>
                  <span
                    className={`mt-3 inline-flex items-center gap-2 text-sm font-bold transition duration-500 ease-out ${todas ? 'text-verde' : 'text-crema-card'} ${
                      on ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-0'
                    }`}
                  >
                    {todas ? 'Todas las categorías' : 'Ver productos'} <Icon name="flecha" size={16} />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

