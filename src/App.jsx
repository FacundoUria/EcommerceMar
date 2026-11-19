import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { AnimatePresence, LazyMotion, MotionConfig, m, useReducedMotion } from 'motion/react';
import { CartProvider } from './context/CartContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import BarraAnuncio from './components/layout/BarraAnuncio.jsx';
import Header from './components/layout/Header.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import Footer from './components/layout/Footer.jsx';
import Toaster from './components/layout/Toaster.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import QuickView from './components/product/QuickView.jsx';
import { PageSkeleton } from './components/ui/Skeleton.jsx';
import { useBotonesMagneticos } from './hooks/useBotonesMagneticos.js';
import Cursor from './components/ui/Cursor.jsx';
import IntroMarca from './components/marca/IntroMarca.jsx';
import MiniMar from './components/marca/MiniMar.jsx';
import ProgresoScroll from './components/marca/ProgresoScroll.jsx';
import Rulos from './components/marca/Rulos.jsx';
import { scrollA } from './lib/smooth.js';
import { imgFija } from './lib/imagenes.js';
import Home from './pages/Home.jsx'; // página de entrada: sin lazy para no sumar una cascada al LCP

// Features de animación en un chunk aparte (no bloquean la primera pintura)
const cargarFeatures = () => import('./lib/motionFeatures.js').then((r) => r.default);

// Code-splitting por ruta
const Tienda = lazy(() => import('./pages/Tienda.jsx'));
const Producto = lazy(() => import('./pages/Producto.jsx'));
const Rutina = lazy(() => import('./pages/Rutina.jsx'));
const Servicios = lazy(() => import('./pages/Servicios.jsx'));
const Carrito = lazy(() => import('./pages/Carrito.jsx'));
const NoEncontrado = lazy(() => import('./pages/NoEncontrado.jsx'));

const EASE_CORTINA = [0.76, 0, 0.24, 1];

/**
 * Transición entre rutas: cortina salvia que sube cubriendo la pantalla (0.32s) con el logo,
 * se cambia la página (y el scroll vuelve arriba mientras está tapado) y la cortina se retira (0.36s).
 * Total ≈ 0.68s. No aparece en la primera carga (AnimatePresence initial={false}).
 * Con movimiento reducido no hay cortina: la página cambia con un fade rápido (0.15s + 0.2s).
 */
function Cortina() {
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-salvia"
      initial={{ y: '0%' }}
      animate={{ y: '-100%', transition: { duration: 0.36, ease: EASE_CORTINA } }}
      exit={{ y: ['100%', '0%'], transition: { duration: 0.32, ease: EASE_CORTINA } }}
    >
      <img {...imgFija('/img/marca/LOGO.webp', 96)} alt="" width="96" height="96" className="size-24 rounded-full mix-blend-multiply" />
    </m.div>
  );
}

// Variante de rulos por ruta (posiciones distintas en cada página)
const RULOS_POR_RUTA = [
  ['/tienda', 'tienda'],
  ['/producto/', 'producto'],
  ['/rutina', 'rutinaPagina'],
  ['/servicios', 'servicios'],
  ['/carrito', 'carrito'],
];
const rulosDe = (path) => RULOS_POR_RUTA.find(([r]) => path.startsWith(r))?.[1];

function Paginas() {
  const location = useLocation();
  const reducido = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => scrollA(0, { inmediato: true })}>
      <m.main
        id="contenido"
        key={location.pathname}
        // Alto mínimo = pantalla: mientras carga el chunk de la página, el footer queda abajo del pliegue
        // (con 70vh se veía en desktop y saltaba al llegar la página: CLS 0.12–0.16)
        className="relative min-h-svh"
        {...(reducido && {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.2 } },
          exit: { opacity: 0, transition: { duration: 0.15 } },
        })}
      >
        {!reducido && <Cortina />}
        {/* Rulos de cada página (el home tiene los suyos en el hero y en la rutina) */}
        {rulosDe(location.pathname) && <Rulos key={location.pathname} variante={rulosDe(location.pathname)} />}
        <Suspense fallback={<PageSkeleton />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/rutina" element={<Rutina />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="*" element={<NoEncontrado />} />
          </Routes>
        </Suspense>
      </m.main>
    </AnimatePresence>
  );
}

export default function App() {
  useBotonesMagneticos();
  return (
    <BrowserRouter>
      <LazyMotion features={cargarFeatures} strict>
        <MotionConfig reducedMotion="user">
          <CartProvider>
            <UIProvider>
              <BarraAnuncio />
              <Header />
              <Paginas />
              <Footer />
              <BottomNav />
              <CartDrawer />
              <QuickView />
              <Toaster />
              <Cursor />
              <ProgresoScroll />
              <MiniMar />
              <IntroMarca />
            </UIProvider>
          </CartProvider>
        </MotionConfig>
      </LazyMotion>
    </BrowserRouter>
  );
}
