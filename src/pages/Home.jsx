import { useMemo } from 'react';
import { Link } from 'react-router';
import { m } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import Carousel from '../components/ui/Carousel.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import AutoVideo from '../components/ui/AutoVideo.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import { useCategories, useProducts } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { NEGOCIO } from '../config/negocio.js';
import { imgSm } from '../lib/format.js';

export default function Home() {
  usePageTitle(null);
  return (
    <>
      <Hero />
      <Categorias />
      <MasVendidos />
      <RutinaCard />
      <HolaSoyMar />
      <Resultados />
    </>
  );
}

/* ───────── Hero: video 4:5 sin texto encima + frase y botón debajo ───────── */
function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="mx-auto max-w-6xl px-4 pt-2 md:pt-8">
      <div className="grid items-center gap-7 md:grid-cols-2 md:gap-14">
        <m.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="md:order-2"
        >
          <AutoVideo
            src="/video/hero.mp4"
            poster="/video/hero.webp"
            alt="Pelo con rulos definidos de una clienta de Dream Hair"
            priority
            className="aspect-[4/5] w-full rounded-5xl border border-linea shadow-suave md:mx-auto md:max-w-md"
          />
        </m.div>
        <div className="flex flex-col items-start gap-6 md:order-1">
          <m.h1
            id="hero-titulo"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.5rem] leading-[1.05] md:text-6xl"
          >
            El cabello es el espejo de tu <em className="text-dorado">amor propio</em>
          </m.h1>
          <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Link to="/tienda" className="btn btn-primario">
              Ver productos <Icon name="flecha" size={18} />
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Categorías: foto + nombre ───────── */
function Categorias() {
  const { data: categorias, loading } = useCategories();
  return (
    <section aria-labelledby="cat-titulo" className="mt-16">
      <SectionHeader id="cat-titulo" titulo="Categorías" link="/tienda" />
      <Carousel label="Categorías" itemsClassName="gap-3 md:gap-4">
        {loading || !categorias
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] w-[62%] shrink-0 rounded-4xl md:w-72" />)
          : categorias.map((c) => (
              <Link
                key={c.id}
                to={`/tienda?cat=${c.id}`}
                className="card group relative aspect-[4/5] w-[62%] shrink-0 snap-start overflow-hidden rounded-4xl transition duration-300 hover:-translate-y-1 hover:shadow-flotante active:scale-[0.98] md:w-72"
              >
                <SmartImg
                  src={c.imagen}
                  srcSm={imgSm(c.imagen)}
                  sizes="(min-width: 768px) 288px, 62vw"
                  alt=""
                  placeholderTitulo={c.nombre}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="glass absolute inset-x-3 bottom-3 rounded-full px-4 py-2.5 text-center font-serif text-lg leading-tight text-verde">
                  {c.nombre}
                </span>
              </Link>
            ))}
      </Carousel>
    </section>
  );
}

/* ───────── Más vendidos ───────── */
function MasVendidos() {
  const { data: productos, loading } = useProducts();
  const destacados = useMemo(() => (productos ?? []).filter((p) => p.destacado), [productos]);
  return (
    <section aria-labelledby="dest-titulo" className="mt-16">
      <SectionHeader id="dest-titulo" titulo="Más vendidos" link="/tienda" />
      <Carousel label="Más vendidos" itemsClassName="gap-4">
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="w-[66%] shrink-0 sm:w-72">
                <ProductCardSkeleton />
              </div>
            ))
          : destacados.map((p) => <ProductCard key={p.id} producto={p} className="w-[66%] shrink-0 snap-start sm:w-72" />)}
      </Carousel>
    </section>
  );
}

/* ───────── Rutina: card clara con los 4 pasos como chips ───────── */
const PASOS_CHIPS = ['Lavar', 'Hidratar', 'Definir', 'Proteger'];

function RutinaCard() {
  return (
    <section aria-labelledby="rutina-titulo" className="mx-auto mt-16 max-w-6xl px-4">
      <Reveal className="card flex flex-col gap-5 rounded-5xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <h2 id="rutina-titulo" className="text-3xl md:text-4xl">
            Armá tu rutina
          </h2>
          <ol className="mt-4 flex flex-wrap gap-2">
            {PASOS_CHIPS.map((p, i) => (
              <li key={p} className="flex items-center gap-1.5 rounded-full border border-linea bg-crema px-3 py-1.5 text-sm font-semibold text-verde">
                <span className="size-1.5 rounded-full bg-amarillo" aria-hidden="true" />
                <span className="sr-only">{i + 1}. </span>
                {p}
              </li>
            ))}
          </ol>
        </div>
        <Link to="/rutina" className="btn btn-primario self-start md:self-auto">
          Empezar<span className="sr-only"> la rutina</span> <Icon name="flecha" size={18} />
        </Link>
      </Reveal>
    </section>
  );
}

/* ───────── Hola, soy Mar ───────── */
function HolaSoyMar() {
  return (
    <section aria-labelledby="mar-titulo" className="mx-auto mt-16 max-w-6xl px-4">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <Reveal className="relative mx-auto w-[86%] max-w-sm">
          <div className="absolute -inset-3 rotate-[-4deg] rounded-5xl bg-amarillo" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-5xl shadow-flotante">
            <SmartImg
              src="/img/mar/mar-con-producto.webp"
              srcSm="/img/mar/mar-con-producto-sm.webp"
              sizes="(min-width: 768px) 384px, 90vw"
              alt="Mar, especialista en rizos de Dream Hair"
              width={900}
              height={1575}
              className="size-full object-cover object-top"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">Detrás de Dream Hair</p>
          <h2 id="mar-titulo" className="mt-2 text-5xl leading-none md:text-6xl">
            Hola, soy <em className="text-dorado">Mar</em>
          </h2>
          <p className="mt-5 font-serif text-2xl leading-snug text-verde">
            Especialista en rizos y apasionada por realzar la identidad de cada cabello.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/servicios" className="btn btn-primario">
              Conocé los servicios
            </Link>
            <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-borde">
              <Icon name="whatsapp" size={18} /> Escribime
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Resultados ───────── */
function Resultados() {
  return (
    <section aria-labelledby="res-titulo" className="mx-auto mt-16 max-w-6xl px-4">
      <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <Reveal className="md:order-2">
          <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">Resultados reales</p>
          <h2 id="res-titulo" className="mt-2 text-4xl leading-tight md:text-5xl">
            Rulos que se <em className="text-dorado">ven</em> y se <em className="text-dorado">sienten</em>
          </h2>
          <p className="mt-3 max-w-md text-gris">Así quedan los rulos después de pasar por el estudio.</p>
          <Link to="/servicios" className="btn btn-amarillo mt-6">
            Reservá tu turno <Icon name="flecha" size={18} />
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto w-full max-w-xs md:order-1">
          <AutoVideo
            src="/video/resultado.mp4"
            poster="/video/resultado.webp"
            alt="Video: resultado de rulos definidos en Dream Hair"
            className="aspect-[9/16] rounded-5xl shadow-flotante ring-8 ring-white"
          />
        </Reveal>
      </div>
    </section>
  );
}
