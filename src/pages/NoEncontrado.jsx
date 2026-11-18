import { Link } from 'react-router';
import { usePageTitle } from '../hooks/usePageTitle.js';
import RevealText from '../components/ui/RevealText.jsx';
import { ConDestellos } from '../components/marca/Destellos.jsx';
import Roll from '../components/ui/Roll.jsx';

export default function NoEncontrado() {
  usePageTitle('Página no encontrada');
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <ConDestellos>
        <RevealText as="h1" className="text-4xl">Página no encontrada</RevealText>
      </ConDestellos>
      <Link to="/tienda" className="btn btn-primario mt-8">
        <Roll>
          Ver tienda
        </Roll>
      </Link>
    </section>
  );
}
