import Carousel from './Carousel.jsx';
import Reveal, { cascada } from './Reveal.jsx';
import RevealText from './RevealText.jsx';
import Expandible from './Expandible.jsx';
import SmartImg from './SmartImg.jsx';
import Icon from './Icon.jsx';
import Destellos, { ConDestellos } from '../marca/Destellos.jsx';
import { useReviews } from '../../hooks/useCatalog.js';

const DESTELLO_ESTRELLAS = [{ x: '104%', y: '-35%', tam: 10 }];

function Estrellas({ n = 5 }) {
  return (
    <span className="relative mt-0.5 flex gap-0.5 text-dorado" role="img" aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="estrella" size={15} filled className={i < n ? '' : 'opacity-25'} />
      ))}
      <Destellos puntos={DESTELLO_ESTRELLAS} />
    </span>
  );
}

function CardResena({ resena: r }) {
  return (
    <figure className="card relative flex h-full flex-col rounded-4xl p-6 md:p-7">
      {/* Comilla grande de adorno */}
      <span aria-hidden="true" className="pointer-events-none absolute right-6 -bottom-6 font-serif text-9xl leading-none text-dorado/12 select-none">
        ”
      </span>
      <figcaption className="flex items-center gap-3.5">
        <span className="size-14 shrink-0 overflow-hidden rounded-full shadow-suave ring-2 ring-arena">
          <SmartImg src={r.foto} alt="" width={192} height={192} className="size-full object-cover" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-tinta">{r.nombre}</span>
          <Estrellas n={r.estrellas} />
        </span>
      </figcaption>
      <blockquote className="mt-4">
        <Expandible lineas={5} soloMobile textoAbrir="Leer más" textoCerrar="Leer menos" className="text-[15px] leading-relaxed text-tinta">
          <p>“{r.texto}”</p>
        </Expandible>
      </blockquote>
    </figure>
  );
}

/**
 * Reseñas de clientas (home, entre "Hola, soy Mar" y los banners). Carrusel: en mobile 1 card con la
 * siguiente asomando, md 2, lg 3. Autoplay lento (7 s) que se pausa con hover, foco o al tocar.
 * Textos largos: 5 líneas + "Leer más" en mobile; completos desde md.
 */
export default function Resenas() {
  const { data: resenas } = useReviews();
  if (!resenas?.length) return null;
  return (
    <section aria-labelledby="resenas-titulo" className="fondo-salvia grano py-16 md:py-24">
      <Carousel
        label="Reseñas"
        autoplay={7000}
        puntos
        itemsClassName="gap-4 md:gap-6"
        cabecera={
          <Reveal>
            <ConDestellos>
              <RevealText id="resenas-titulo" className="text-3xl leading-tight md:text-4xl">
                Reseñas
              </RevealText>
            </ConDestellos>
          </Reveal>
        }
      >
        {resenas.map((r, i) => (
          <Reveal
            key={r.id}
            delay={cascada(i, 3)}
            className="w-[86%] shrink-0 snap-start md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            <CardResena resena={r} />
          </Reveal>
        ))}
      </Carousel>
    </section>
  );
}
