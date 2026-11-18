import { Link } from 'react-router';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';

export default function SectionHeader({ eyebrow, titulo, bajada, link, linkTexto = 'Ver todo', id }) {
  return (
    <Reveal className="mx-auto mb-6 flex max-w-6xl items-end justify-between gap-4 px-4">
      <div>
        {eyebrow && <p className="text-xs font-bold tracking-[0.22em] text-dorado uppercase">{eyebrow}</p>}
        <h2 id={id} className="mt-1 text-3xl leading-tight md:text-4xl">
          {titulo}
        </h2>
        {bajada && <p className="mt-2 max-w-xl text-gris">{bajada}</p>}
      </div>
      {link && (
        <Link
          to={link}
          className="group/l inline-flex shrink-0 items-center gap-1 rounded-full px-1 py-2 text-sm font-bold text-verde"
        >
          {linkTexto}
          <Icon name="flecha" size={16} className="transition-transform group-hover/l:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}
