// "Especial de Navidad" (promo de servicios: se reserva por WhatsApp con un código, no va al carrito). Se usa en
// el inicio (entre el hero y las categorías; mientras dura el Black Friday, debajo de él) y arriba de /servicios.
// Chunk aparte:
// las dos páginas lo piden solo mientras la promo está vigente (el resto del año no se baja).
// Textos, precios, códigos y fechas: src/config/navidad.js.
import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import Reveal, { cascada } from '../ui/Reveal.jsx';
import RevealText from '../ui/RevealText.jsx';
import Precio from '../ui/Precio.jsx';
import Roll from '../ui/Roll.jsx';
import Destellos, { ConDestellos, Estrella } from '../marca/Destellos.jsx';
import { NAVIDAD, textoNavidad } from '../../config/navidad.js';
import { whatsappCon } from '../../config/negocio.js';
import { copiarTexto } from '../../lib/copiar.js';

// Destellos dorados sueltos en el fondo de la sección (toque navideño suave)
const DESTELLOS_FONDO = [
  { x: '6%', y: '10%', tam: 10 },
  { x: '92%', y: '8%', tam: 14 },
  { x: '84%', y: '46%', tam: 8 },
  { x: '3%', y: '62%', tam: 12 },
  { x: '48%', y: '94%', tam: 9 },
];

/**
 * `enInicio`: sección de borde a borde con su fondo (en /servicios va dentro de la página, sin fondo).
 * `sinFondo`: en el inicio debajo del Black Friday, que comparte el fondo con ella (lo pone Home.jsx).
 */
export default function EspecialNavidad({ enInicio = false, sinFondo = false }) {
  const palabras = NAVIDAD.titulo.split(' ');
  const ultima = palabras.pop();
  return (
    <section
      aria-labelledby="navidad-titulo"
      className={
        enInicio
          ? `${sinFondo ? '' : 'fondo-salvia '}relative isolate overflow-hidden pt-8 pb-12 md:pt-12 md:pb-16`
          : 'relative isolate mt-6 md:mt-8'
      }
    >
      {enInicio && <Destellos puntos={DESTELLOS_FONDO} className="-z-10" />}
      <div className={enInicio ? 'contenedor' : ''}>
        <Reveal>
          <ConDestellos>
            <RevealText as="h2" id="navidad-titulo" className="text-4xl leading-tight md:text-5xl">
              {palabras.join(' ')} <em className="texto-dorado">{ultima}</em>
            </RevealText>
          </ConDestellos>
          <p className="mt-2 font-serif text-xl text-tinta md:text-2xl">{NAVIDAD.bajada}</p>
          {NAVIDAD.incluye && (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-texto-suave">
              <span className="font-bold text-tinta">Incluye:</span> {NAVIDAD.incluye}
            </p>
          )}
        </Reveal>
        <ul className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
          {NAVIDAD.opciones.map((o, i) => (
            <Reveal as="li" key={o.codigo} delay={cascada(i)} className="min-w-0">
              <Opcion opcion={o} />
            </Reveal>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-texto-suave">{NAVIDAD.letraChica}</p>
      </div>
    </section>
  );
}

function Opcion({ opcion }) {
  const [copiado, setCopiado] = useState(null); // null | 'ok' | 'error'
  const copiar = async () => {
    setCopiado((await copiarTexto(opcion.codigo)) ? 'ok' : 'error');
    setTimeout(() => setCopiado(null), 2500);
  };
  return (
    <article className="card relative flex h-full flex-col overflow-hidden rounded-3xl p-5 md:p-7">
      {/* Toque navideño: filete dorado arriba y dos estrellitas en la esquina */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-dorado/70 to-transparent" />
      <span aria-hidden="true" className="absolute top-4 right-4 flex items-start gap-1 text-dorado">
        <Estrella className="size-3 opacity-60" />
        <Estrella className="size-5" />
      </span>
      <h3 className="pr-10 font-serif text-2xl leading-snug text-tinta md:text-[1.7rem]">{opcion.nombre}</h3>
      <Precio as="p" valor={NAVIDAD.precio} antes={NAVIDAD.antes} className="mt-2 text-3xl text-tinta" />

      {/* El código, bien visible: "ticket" con borde punteado dorado */}
      <div className="mt-5 rounded-2xl border-2 border-dashed border-dorado/50 bg-arena px-4 py-3.5">
        <p className="text-[11px] font-bold tracking-[0.18em] text-dorado uppercase">Tu código</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="min-w-0 text-xl font-extrabold tracking-[0.06em] break-all text-verde md:text-2xl">{opcion.codigo}</p>
          <button
            type="button"
            onClick={copiar}
            aria-label={`Copiar código ${opcion.codigo}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-verde/30 bg-crema-card px-3 py-1.5 text-sm font-semibold text-verde transition hover:bg-salvia active:scale-95"
          >
            <Icon name={copiado === 'ok' ? 'check' : 'copiar'} size={16} strokeWidth={2} />
            {copiado === 'ok' ? '¡Copiado!' : copiado === 'error' ? 'No se pudo' : 'Copiar código'}
          </button>
        </div>
        <span role="status" className="sr-only">
          {copiado === 'ok' ? `Código ${opcion.codigo} copiado` : ''}
        </span>
      </div>

      <a
        href={whatsappCon(textoNavidad(NAVIDAD.mensaje, opcion))}
        target="_blank"
        rel="noopener noreferrer"
        data-evitar-mini-mar // mini Mar compacta (desktop) no tapa el botón
        className="btn btn-primario mt-5 w-full py-3.5 text-[15px]"
      >
        <Roll>
          <Icon name="whatsapp" size={18} /> Reservar con este código
        </Roll>
      </a>
    </article>
  );
}
