import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { AnimatePresence, LazyMotion, MotionConfig, m } from 'motion/react';
import { CartProvider } from './context/CartContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import Header from './components/layout/Header.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import Footer from './components/layout/Footer.jsx';
import Toaster from './components/layout/Toaster.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import QuickView from './components/product/QuickView.jsx';
import { PageSkeleton } from './components/ui/Skeleton.jsx';
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

function Paginas() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
      <m.main
        id="contenido"
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-[70vh]"
      >
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
            </UIProvider>
          </CartProvider>
        </MotionConfig>
      </LazyMotion>
    </BrowserRouter>
  );
}
