import { useRef } from 'react';
import { useInView } from 'motion/react';
import Carrusel from './Carrusel.jsx';
import Reveal, { cascada } from './Reveal.jsx';
import RevealText from './RevealText.jsx';
import RevealImagen from './RevealImagen.jsx';
import Expandible from './Expandible.jsx';
import SmartImg from './SmartImg.jsx';
import Icon from './Icon.jsx';
import Destellos, { ConDestellos } from '../marca/Destellos.jsx';
import Rulos from '../marca/Rulos.jsx';
import { useReviews } from '../../hooks/useCatalog.js';
import { useTarjeta3D } from '../../hooks/useTarjeta3D.jsx';
import { colorDe } from '../../lib/colores.js';

const DESTELLO_ESTRELLAS = [{ x: '104%', y: '-35%', tam: 10 }];

/** 5 estrellas doradas que se encienden una por una al entrar en pantalla (CSS, ver .estrella-resena). */
function Estrellas({ n = 5 }) {
  const ref = useRef(null);
  const encendidas = useInView(ref, { once: true, amount: 1 });
  return (
    <span
      ref={ref}
      className={`relative mt-0.5 flex gap-0.5 ${encendidas ? 'estrellas-encendidas' : ''}`}
      role="img"
      aria-label={`${n} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="estrella" size={15} filled className={i < n ? 'estrella-resena' : 'opacity-25'} style={{ '--i': i }} />
      ))}
      {encendidas && <Destellos puntos={DESTELLO_ESTRELLAS} />}
    </span>
  );
}

/**
 * Card de reseña con el vocabulario de las cards del sitio: 3D en desktop, borde y halo con el color de
 * la foto de la clienta, cortina en la foto, comillas grandes doradas (20%) detrás del texto.
 */
function CardResena({ resena: r }) {
  const tarjeta = useTarjeta3D();
  return (
    <figure
      ref={tarjeta.ref}
      {...tarjeta.eventos}
      style={{ '--color-producto': colorDe(r.foto) }}
      className="card borde-producto group relative isolate flex h-full flex-col overflow-hidden rounded-3xl p-5 transition duration-500 ease-out md:p-6 md:hover:-translate-y-1.5 md:hover:shadow-flotante"
    >
      {tarjeta.brillo}
      {/* Comillas de adorno, detrás del texto */}
      <span aria-hidden="true" className="pointer-events-none absolute top-16 left-3 -z-10 font-serif text-[7.5rem] leading-none text-dorado/20 select-none">
        “
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute right-4 -bottom-12 -z-10 font-serif text-[7.5rem] leading-none text-dorado/20 select-none">
        ”
      </span>
      <figcaption className="flex items-center gap-3.5">
        <span className="relative size-14 shrink-0">
          {/* halo del color de la foto detrás de la foto circular */}
          <span className="halo-producto rounded-full" aria-hidden="true" />
          <span className="relative block size-14 overflow-hidden rounded-full shadow-suave ring-2 ring-arena">
            <RevealImagen>
              <SmartImg src={r.foto} alt="" className="size-full object-cover" />
            </RevealImagen>
          </span>
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-tinta">{r.nombre}</span>
          <Estrellas n={r.estrellas} />
        </span>
      </figcaption>
      <blockquote className="relative mt-4">
        <Expandible lineas={5} soloMobile textoAbrir="Leer más" textoCerrar="Leer menos" className="text-[15px] leading-relaxed text-tinta">
          <p>“{r.texto}”</p>
        </Expandible>
      </blockquote>
    </figure>
  );
}

/**
 * Reseñas de clientas (home, entre "Hola, soy Mar" y los banners). <Carrusel>: en mobile 1 card con las
 * vecinas asomando, desktop 4. Autoplay lento (7 s) que se pausa con hover, foco o al tocar.
 * Textos largos: 5 líneas + "Leer más" en mobile; completos desde md. Rulo que se dibuja con el scroll.
 */
export default function Resenas() {
  const { data: resenas } = useReviews();
  if (!resenas?.length) return null;
  return (
    <section aria-labelledby="resenas-titulo" className="fondo-salvia grano relative overflow-hidden py-16 md:py-24">
      <Rulos variante="resenas" />
      <Reveal className="contenedor mb-1">
        <ConDestellos>
          <RevealText id="resenas-titulo" className="text-3xl leading-tight md:text-4xl">
            Lo que dicen <em className="texto-dorado">ellas</em>
          </RevealText>
        </ConDestellos>
      </Reveal>
      <Carrusel label="Reseñas" anchoMobile="80%" autoplay={7000} fondo="var(--color-salvia)">
        {resenas.map((r, i) => (
          <Reveal key={r.id} delay={cascada(i)} className="h-full">
            <CardResena resena={r} />
          </Reveal>
        ))}
      </Carrusel>
    </section>
  );
}
