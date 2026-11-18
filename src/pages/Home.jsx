import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import Icon from '../components/ui/Icon.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import Carousel from '../components/ui/Carousel.jsx';
import SmartImg from '../components/ui/SmartImg.jsx';
import AutoVideo from '../components/ui/AutoVideo.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import { useBrands, useCategories, useProducts, useServices } from '../hooks/useCatalog.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { BENEFICIOS, NEGOCIO, PASOS_RUTINA } from '../config/negocio.js';
import { imgSm } from '../lib/format.js';

export default function Home() {
  usePageTitle(null);
  return (
    <>
      <Hero />
      <Beneficios />
      <Categorias />
      <Destacados />
      <RutinaTeaser />
      <Marcas />
      <ServiciosPreview />
      <HolaSoyMar />
      <Resultados />
    </>
  );
}

/* ───────── Hero tipo reel ───────── */
function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="relative px-3 pt-1 md:px-4 md:pt-4">
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-5xl bg-verde md:grid-cols-[1.1fr_0.9fr] md:items-center">
        {/* Video: fondo completo en mobile, "teléfono" a la derecha en desktop */}
        <div className="absolute inset-0 md:relative md:order-2 md:m-8 md:aspect-[9/14] md:overflow-hidden md:rounded-4xl md:shadow-flotante">
          <AutoVideo
            src="/video/hero.mp4"
            poster="/video/hero.webp"
            alt="Pelo con rulos definidos de una clienta de Dream Hair"
            priority
            className="size-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-verde from-35% via-verde/85 via-60% to-verde/0 md:hidden" />

        <div className="relative flex min-h-[78svh] flex-col justify-end gap-6 p-6 pt-32 pb-8 md:min-h-0 md:p-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-oscuro inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.2em] text-amarillo uppercase ring-1 ring-amarillo/30"
          >
            <span className="pulso size-1.5 rounded-full bg-amarillo" /> Método curly · {NEGOCIO.ciudad}
          </motion.p>
          <motion.h1
            id="hero-titulo"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.6rem] leading-[1.05] text-crema md:text-6xl"
          >
            El cabello es el espejo de tu <em className="text-amarillo">amor propio</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="max-w-md text-crema/80"
          >
            Productos para cuidar, hidratar y definir tus rulos, con envíos a todo Mendoza.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/tienda" className="btn btn-amarillo">
              Ver productos <Icon name="flecha" size={18} />
            </Link>
            <Link to="/rutina" className="btn border border-crema/30 bg-crema/10 text-crema backdrop-blur hover:bg-crema/20">
              Armá tu rutina
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Franja de beneficios (datos de sus banners) ───────── */
function Beneficios() {
  return (
    <section aria-label="Beneficios" className="mx-auto mt-4 max-w-6xl">
      <ul className="no-scrollbar flex snap-x gap-2.5 overflow-x-auto px-4 md:justify-center">
        {BENEFICIOS.map((b, i) => (
          <Reveal as="li" key={b.texto} delay={i * 0.06} y={10} className="snap-start">
            <span className="flex items-center gap-2.5 rounded-full border border-verde/10 bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-verde shadow-suave">
              <span className="flex size-7 items-center justify-center rounded-full bg-amarillo/50">
                <Icon name={b.icono} size={16} />
              </span>
              {b.texto}
            </span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ───────── Categorías ───────── */
function Categorias() {
  const { data: categorias, loading } = useCategories();
  return (
    <section aria-labelledby="cat-titulo" className="mt-14">
      <SectionHeader id="cat-titulo" eyebrow="Explorá" titulo="Categorías" link="/tienda" />
      <Carousel label="Categorías" itemsClassName="gap-3 md:gap-4">
        {loading || !categorias
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] w-[46%] shrink-0 rounded-4xl md:w-60" />)
          : categorias.map((c) => (
              <Link
                key={c.id}
                to={`/tienda?cat=${c.id}`}
                className="group relative aspect-[4/5] w-[46%] shrink-0 snap-start overflow-hidden rounded-4xl bg-white shadow-suave transition duration-300 hover:-translate-y-1 hover:shadow-flotante active:scale-[0.98] md:w-60"
              >
                <SmartImg
                  src={c.imagen}
                  srcSm={imgSm(c.imagen)}
                  sizes="(min-width: 768px) 240px, 46vw"
                  alt=""
                  placeholderTitulo={c.nombre}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="glass absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-3xl py-2.5 pr-2.5 pl-3.5">
                  <span className="font-serif text-[15px] leading-tight text-verde md:text-lg">{c.nombre}</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-verde text-amarillo transition group-hover:rotate-[-45deg]">
                    <Icon name="flecha" size={16} />
                  </span>
                </div>
                {c.paso && (
                  <span className="absolute top-3 left-3 rounded-full bg-verde px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amarillo uppercase">
                    Paso {c.paso}
                  </span>
                )}
              </Link>
            ))}
      </Carousel>
    </section>
  );
}

/* ───────── Destacados ───────── */
function Destacados() {
  const { data: productos, loading } = useProducts();
  const destacados = useMemo(() => (productos ?? []).filter((p) => p.destacado), [productos]);
  return (
    <section aria-labelledby="dest-titulo" className="mt-14">
      <SectionHeader id="dest-titulo" eyebrow="Los favoritos" titulo="Destacados" link="/tienda" />
      <Carousel label="Productos destacados" itemsClassName="gap-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="w-[58%] shrink-0 sm:w-64">
                <ProductCardSkeleton />
              </div>
            ))
          : destacados.map((p) => <ProductCard key={p.id} producto={p} className="w-[58%] shrink-0 snap-start sm:w-64" />)}
      </Carousel>
    </section>
  );
}

/* ───────── Armá tu rutina ───────── */
function RutinaTeaser() {
  return (
    <section aria-labelledby="rutina-titulo" className="mx-auto mt-16 max-w-6xl px-3 md:px-4">
      <Reveal className="relative overflow-hidden rounded-5xl bg-verde p-7 text-crema md:p-12">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-amarillo/15 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-amarillo uppercase">En 4 pasos</p>
            <h2 id="rutina-titulo" className="mt-2 text-4xl leading-tight text-crema md:text-5xl">
              Armá tu rutina <em className="text-amarillo">curly</em>
            </h2>
            <p className="mt-3 max-w-md text-crema/75">Elegí un producto para cada paso, mirá el total en vivo y sumá toda la rutina al carrito de una.</p>
            <Link to="/rutina" className="btn btn-amarillo mt-6">
              Empezar mi rutina <Icon name="flecha" size={18} />
            </Link>
          </div>
          <ol className="grid grid-cols-2 gap-3">
            {PASOS_RUTINA.map((p, i) => (
              <Reveal
                as="li"
                key={p.paso}
                delay={0.1 + i * 0.08}
                className="rounded-4xl border border-crema/10 bg-crema/5 p-4 backdrop-blur transition hover:bg-crema/10"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-amarillo font-serif text-lg font-semibold text-verde">{p.paso}</span>
                <p className="mt-3 font-serif text-xl">{p.titulo}</p>
                <p className="mt-0.5 text-xs text-crema/65">{p.bajada}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────── Marcas ───────── */
function Marcas() {
  const { data: marcas } = useBrands();
  return (
    <section aria-labelledby="marcas-titulo" className="mt-16">
      <SectionHeader id="marcas-titulo" eyebrow="Marcas líderes" titulo="Comprá por marca" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:mx-auto md:max-w-6xl md:flex-wrap">
        {(marcas ?? Array(7).fill(null)).map((m, i) =>
          m ? (
            <Reveal key={m} delay={i * 0.03} y={8} className="shrink-0">
              <Link
                to={`/tienda?marca=${encodeURIComponent(m)}`}
                className="chip border-verde/15 bg-white px-5 py-3 font-serif text-base text-verde shadow-suave hover:border-verde hover:bg-verde hover:text-amarillo"
              >
                {m}
              </Link>
            </Reveal>
          ) : (
            <Skeleton key={i} className="h-11 w-24 shrink-0 rounded-full" />
          ),
        )}
      </div>
    </section>
  );
}

/* ───────── Servicios (preview) ───────── */
function ServiciosPreview() {
  const { data: servicios, loading } = useServices();
  const preview = (servicios ?? []).filter((s) => s.imagen.startsWith('/img/estudio/')).slice(0, 4);
  return (
    <section aria-labelledby="serv-titulo" className="mt-16">
      <SectionHeader
        id="serv-titulo"
        eyebrow="En el estudio"
        titulo="Servicios para tus rulos"
        bajada="Cortes, asesoramientos y tratamientos en Dream Hair."
        link="/servicios"
      />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 md:grid-cols-4 md:gap-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-4xl" />)
          : preview.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.07}>
                <Link
                  to="/servicios"
                  className="group relative block aspect-[3/4] overflow-hidden rounded-4xl bg-verde shadow-suave transition hover:-translate-y-1 hover:shadow-flotante"
                >
                  <SmartImg
                    src={s.imagen}
                    srcSm={imgSm(s.imagen)}
                    sizes="(min-width: 768px) 270px, 50vw"
                    alt=""
                    width={900}
                    height={1200}
                    placeholderTitulo={s.nombre}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-verde/90 via-verde/10 to-transparent" />
                  <p className="absolute inset-x-4 bottom-4 font-serif text-lg leading-tight text-crema">{s.nombre}</p>
                </Link>
              </Reveal>
            ))}
      </div>
    </section>
  );
}

/* ───────── Hola, soy Mar ───────── */
function HolaSoyMar() {
  return (
    <section aria-labelledby="mar-titulo" className="mx-auto mt-16 max-w-6xl px-4">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <Reveal className="relative mx-auto w-full max-w-sm">
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
