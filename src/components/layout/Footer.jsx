import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import { NEGOCIO } from '../../config/negocio.js';

const LINKS = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/rutina', label: 'Rutina' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/carrito', label: 'Carrito' },
];

/** Footer: bloque salvia dentro del contenedor. */
export default function Footer() {
  return (
    <footer className="mx-auto mt-16 max-w-6xl px-3 pb-28 md:px-4 md:pb-6">
      <div className="bloque-salvia px-6 pt-10 pb-6 text-tinta md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-3xl">{NEGOCIO.nombre}</p>
            <p className="text-xs font-bold tracking-[0.28em] text-dorado uppercase">{NEGOCIO.bajada}</p>
          </div>
          <nav aria-label="Pie de página">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link className="text-tinta hover:text-verde" to={l.to}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm text-texto-suave">
            <p>{NEGOCIO.direccion}</p>
            <p>{NEGOCIO.horarios}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primario">
                <Icon name="whatsapp" size={18} /> WhatsApp
              </a>
              <a href={NEGOCIO.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-borde">
                <Icon name="instagram" size={18} /> Instagram
              </a>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-linea pt-5 text-xs text-texto-suave">
          © {new Date().getFullYear()} {NEGOCIO.nombre} · {NEGOCIO.ciudad}
        </p>
      </div>
    </footer>
  );
}
