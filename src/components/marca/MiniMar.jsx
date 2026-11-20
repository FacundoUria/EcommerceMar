import { lazy, Suspense, useEffect, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

// Mini Mar flotante (SOLO DESKTOP, ver MiniMarDesktop.jsx). Va en un chunk aparte que se pide recién
// después del load y en desktop: en mobile no se baja nunca (el chat se abre desde el bottom nav), y en
// desktop no compite con la carga (mini Mar igual entra recién al scrollear o a los 8 s).
const MiniMarDesktop = lazy(() => import('./MiniMarDesktop.jsx'));

function useDespuesDelLoad() {
  const [listo, setListo] = useState(() => typeof document !== 'undefined' && document.readyState === 'complete');
  useEffect(() => {
    if (listo) return;
    const on = () => setListo(true);
    window.addEventListener('load', on, { once: true });
    return () => window.removeEventListener('load', on);
  }, [listo]);
  return listo;
}

export default function MiniMar() {
  const desktop = useMediaQuery('(min-width: 768px)');
  const listo = useDespuesDelLoad();
  if (!desktop || !listo) return null;
  return (
    <Suspense fallback={null}>
      <MiniMarDesktop />
    </Suspense>
  );
}
