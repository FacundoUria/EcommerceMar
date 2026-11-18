import { Link } from 'react-router';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NoEncontrado() {
  usePageTitle('Página no encontrada');
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <p className="text-xs font-bold tracking-[0.25em] text-dorado uppercase">Error 404</p>
      <h1 className="mt-3 text-4xl">Esta página se nos enruló</h1>
      <p className="mt-3 text-gris">No encontramos lo que buscabas. Probá desde la tienda.</p>
      <Link to="/tienda" className="btn btn-primario mt-8">
        Ir a la tienda
      </Link>
    </section>
  );
}
