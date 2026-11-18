import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { getProducts } from '../services/productsService.js';

const STORAGE_KEY = 'dreamhair:carrito:v1';
const MAX_CANTIDAD = 99;

const CartContext = createContext(null);

// Cada línea = producto + variante. La clave las distingue.
export const claveLinea = (id, variante) => `${id}::${variante ?? ''}`;

function leerStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter((l) => l && l.id && l.cantidad > 0) : [];
  } catch {
    return [];
  }
}

const limitar = (n) => Math.max(1, Math.min(MAX_CANTIDAD, Math.floor(n) || 1));

function reducer(lineas, accion) {
  switch (accion.type) {
    case 'agregar': {
      const { producto, variante, cantidad = 1 } = accion;
      const clave = claveLinea(producto.id, variante?.nombre);
      const existente = lineas.find((l) => l.clave === clave);
      if (existente) {
        return lineas.map((l) => (l.clave === clave ? { ...l, cantidad: limitar(l.cantidad + cantidad) } : l));
      }
      return [
        ...lineas,
        {
          clave,
          id: producto.id,
          nombre: producto.nombre,
          marca: producto.marca ?? null,
          variante: variante?.nombre ?? null,
          imagen: variante?.imagen ?? producto.imagen,
          precio: producto.precio,
          cantidad: limitar(cantidad),
        },
      ];
    }
    case 'cantidad':
      return lineas.map((l) => (l.clave === accion.clave ? { ...l, cantidad: limitar(accion.cantidad) } : l));
    case 'quitar':
      return lineas.filter((l) => l.clave !== accion.clave);
    case 'vaciar':
      return [];
    case 'sincronizar': {
      // Los precios cambian seguido: al cargar el catálogo, actualizamos precio/nombre
      // de lo guardado y sacamos productos que ya no existen.
      const porId = new Map(accion.productos.map((p) => [p.id, p]));
      return lineas
        .filter((l) => porId.has(l.id))
        .map((l) => {
          const p = porId.get(l.id);
          return { ...l, nombre: p.nombre, marca: p.marca ?? null, precio: p.precio };
        });
    }
    default:
      return lineas;
  }
}

export function CartProvider({ children }) {
  const [lineas, dispatch] = useReducer(reducer, undefined, leerStorage);
  const [abierto, setAbierto] = useState(false);
  // contador que sube en cada "agregar": lo usan el badge (pop) y el toast
  const [ultimoAgregado, setUltimoAgregado] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lineas));
    } catch {
      /* modo privado o storage lleno: el carrito sigue andando en memoria */
    }
  }, [lineas]);

  useEffect(() => {
    let vivo = true;
    getProducts()
      .then((productos) => vivo && dispatch({ type: 'sincronizar', productos }))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const agregar = useCallback((producto, variante = null, cantidad = 1, { abrir = true } = {}) => {
    dispatch({ type: 'agregar', producto, variante, cantidad });
    setUltimoAgregado({ n: Date.now(), producto, variante, cantidad });
    if (abrir) setAbierto(true);
  }, []);

  const agregarVarios = useCallback((items) => {
    for (const { producto, variante, cantidad } of items) dispatch({ type: 'agregar', producto, variante, cantidad });
    setUltimoAgregado({ n: Date.now(), multiple: items.length });
    setAbierto(true);
  }, []);

  const value = useMemo(() => {
    const cantidadTotal = lineas.reduce((s, l) => s + l.cantidad, 0);
    const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
    return {
      lineas,
      cantidadTotal,
      total,
      abierto,
      ultimoAgregado,
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
      agregar,
      agregarVarios,
      setCantidad: (clave, cantidad) => dispatch({ type: 'cantidad', clave, cantidad }),
      quitar: (clave) => dispatch({ type: 'quitar', clave }),
      vaciar: () => dispatch({ type: 'vaciar' }),
    };
  }, [lineas, abierto, ultimoAgregado, agregar, agregarVarios]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart tiene que usarse dentro de <CartProvider>');
  return ctx;
}
