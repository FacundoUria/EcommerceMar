import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { AnimatePresence, LazyMotion, MotionConfig, m, useReducedMotion } from 'motion/react';
import { CartProvider } from './context/CartContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import Header from './components/layout/Header.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import Footer from './components/layout/Footer.jsx';
import Toaster from './components/layout/Toaster.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import QuickView from './components/product/QuickView.jsx';
import { PageSkeleton } from './components/ui/Skeleton.jsx';
import { useBotonesMagneticos } from './hooks/useBotonesMagneticos.js';
import Cursor from './components/ui/Cursor.jsx';
import { scrollA } from './lib/smooth.js';
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
      <img src="/img/marca/LOGO-sm.webp" alt="" width="96" height="96" className="size-24 rounded-full mix-blend-multiply" />
    </m.div>
  );
}

function Paginas() {
  const location = useLocation();
  const reducido = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => scrollA(0, { inmediato: true })}>
      <m.main id="contenido" key={location.pathname} className="min-h-[70vh]">
        {!reducido && <Cortina />}
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
              <Header />
              <Paginas />
              <Footer />
              <BottomNav />
              <CartDrawer />
              <QuickView />
              <Toaster />
              <Cursor />
            </UIProvider>
          </CartProvider>
        </MotionConfig>
      </LazyMotion>
    </BrowserRouter>
  );
}
