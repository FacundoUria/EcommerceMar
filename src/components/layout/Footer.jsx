import { Link } from 'react-router';
import Icon from '../ui/Icon.jsx';
import { NEGOCIO } from '../../config/negocio.js';

const LINKS = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/rutina', label: 'Rutina' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/carrito', label: 'Carrito' },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-linea bg-crema-200 px-6 pt-12 pb-32 text-verde md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-serif text-3xl">{NEGOCIO.nombre}</p>
          <p className="text-xs font-bold tracking-[0.28em] text-dorado uppercase">{NEGOCIO.bajada}</p>
        </div>
        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-semibold text-verde">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link className="hover:text-dorado" to={l.to}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-sm text-gris">
          <p>{NEGOCIO.direccion}</p>
          <p>{NEGOCIO.horarios}</p>
          <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primario mt-4">
            <Icon name="whatsapp" size={18} /> WhatsApp
          </a>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-linea pt-6 text-xs text-gris">
        © {new Date().getFullYear()} {NEGOCIO.nombre} · {NEGOCIO.ciudad}
      </p>
    </footer>
  );
}
