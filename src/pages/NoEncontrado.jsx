import { Link } from 'react-router';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NoEncontrado() {
  usePageTitle('Página no encontrada');
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <h1 className="text-4xl">Página no encontrada</h1>
      <Link to="/tienda" className="btn btn-primario mt-8">
        Ver tienda
      </Link>
    </section>
  );
}
