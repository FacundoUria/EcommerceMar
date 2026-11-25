// Sección de promos del inicio (Black Friday): las ofertas vigentes en cards grandes, con el precio tachado y el
// nuevo, "Termina en X días" y el botón para agregar (o elegir, si es un kit con opciones o tiene variantes).
// Chunk aparte: Home.jsx lo pide solo si hay alguna promo vigente (el resto del año no se baja).
import { Link } from 'react-router';
import Icon from '../components/ui/Icon.jsx';
import Reveal, { cascada } from '../components/ui/Reveal.jsx';
import RevealText from '../components/ui/RevealText.jsx';
import { ConDestellos } from '../components/marca/Destellos.jsx';
import FotoProducto from '../components/product/FotoProducto.jsx';
import CartelPromo from '../components/product/CartelPromo.jsx';
import Precio from '../components/ui/Precio.jsx';
import Roll from '../components/ui/Roll.jsx';
import { useCartAcciones } from '../context/CartContext.jsx';
import { useUIAcciones } from '../context/UIContext.jsx';
import { explotarDestellos } from '../lib/destellos.js';
import { colorDe } from '../lib/colores.js';
import { imgSm } from '../lib/format.js';
import { terminaEn } from '../lib/promo.js';

/** `sinFondo`: va junto con el Especial de Navidad, que comparte el fondo (lo pone Home.jsx). */
export default function PromoInicio({ productos, titulo, hasta, sinFondo = false }) {
  const [primera, ...resto] = titulo.split(' ');
  return (
    <section aria-labelledby="promo-titulo" className={sinFondo ? 'pt-6 pb-12 md:pt-10 md:pb-16' : 'fondo-salvia pt-6 pb-12 md:pt-10 md:pb-16'}>
      <Reveal className="contenedor mb-6 flex flex-wrap items-end justify-between gap-3">
        <ConDestellos>
          <RevealText as="h2" id="promo-titulo" className="text-4xl leading-tight md:text-5xl">
            {primera} {resto.length > 0 && <em className="texto-dorado">{resto.join(' ')}</em>}
          </RevealText>
        </ConDestellos>
        <p className="inline-flex items-center gap-2 rounded-full bg-tinta px-4 py-2 text-sm font-bold text-arena">
          <Icon name="reloj" size={16} strokeWidth={2} />
          {terminaEn(hasta)}
        </p>
      </Reveal>
      <ul className="contenedor grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {productos.map((p, i) => (
          <Reveal as="li" key={p.id} delay={cascada(i)} className="min-w-0">
            <Oferta producto={p} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Oferta({ producto }) {
  const { agregar } = useCartAcciones();
  const { mostrarToast } = useUIAcciones();
  const url = `/producto/${producto.id}`;
  const color = colorDe(producto.imagen);
  // Kit con opciones o producto con variantes: se elige en su página
  const elegir = producto.elecciones || producto.variantes.length > 0;

  const alAgregar = (e) => {
    explotarDestellos(e.currentTarget, color);
    agregar(producto, null, 1, { abrir: false });
    mostrarToast({ tipo: 'carrito', titulo: 'Agregado', texto: producto.nombreCorto, imagen: imgSm(producto.imagen) });
  };

  return (
    <article
      style={{ '--color-producto': color }}
      className="card borde-producto group flex h-full w-full min-w-0 overflow-hidden rounded-3xl transition duration-500 ease-out sm:flex-col md:hover:-translate-y-1.5 md:hover:shadow-flotante"
    >
      <Link to={url} className="relative block w-[42%] min-w-0 shrink-0 sm:w-auto" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <FotoProducto src={producto.imagen} srcSm={imgSm(producto.imagen)} sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 42vw" alt="" placeholderTitulo={producto.nombreCorto} />
          <CartelPromo promo={producto.promo} className="absolute top-2.5 left-2.5 scale-90 origin-top-left sm:scale-100" />
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4 sm:p-5">
        {producto.marca && <p className="text-[11px] font-bold tracking-[0.14em] text-dorado uppercase">{producto.marca}</p>}
        <h3 className="font-sans text-[17px] leading-snug font-bold text-tinta">
          <Link to={url} className="hover:text-verde">
            {producto.nombreCorto}
          </Link>
        </h3>
        {producto.incluye && <p className="line-clamp-3 text-sm leading-snug text-texto-suave">{producto.incluye.join(' + ')}</p>}
        <Precio as="p" valor={producto.precio} desde={producto.desde} antes={producto.precioAntes} className="mt-auto pt-2 text-2xl text-tinta" />
        {elegir ? (
          <Link to={url} className="btn btn-primario mt-2 w-full py-3 text-[15px]">
            <Roll>Elegir</Roll>
          </Link>
        ) : (
          <button type="button" onClick={alAgregar} className="btn btn-primario mt-2 w-full py-3 text-[15px]">
            <Roll>
              <Icon name="carrito" size={17} /> Agregar
            </Roll>
          </button>
        )}
      </div>
    </article>
  );
}
