import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { alActualizar, getProducts } from '../services/productsService.js';
import { precioDe } from '../lib/precios.js';
import { IDS_RENOMBRADOS, VARIANTES_RENOMBRADAS } from '../config/renombrados.js';

const STORAGE_KEY = 'dreamhair:carrito:v1';
const MAX_CANTIDAD = 99;

const CartContext = createContext(null);
// Solo las acciones (funciones estables): quien no muestra el carrito (cards, páginas) no se vuelve a
// renderizar cada vez que cambia el carrito.
const CartAccionesContext = createContext(null);

// Cada línea = producto + variante (+ lo elegido en un kit). La clave las distingue.
// `elecciones`: [[clave, opción], …] en el orden del kit ("Shampoo", "Skala").
export const claveLinea = (id, variante, elecciones) =>
  `${id}::${variante ?? ''}${elecciones?.length ? `::${elecciones.map(([k, v]) => `${k}=${v}`).join('|')}` : ''}`;

/** "Shampoo: X, Skala: Y" (lo elegido en un kit), o ''. */
export const textoElecciones = (elecciones) => (elecciones ?? []).map(([k, v]) => `${k}: ${v}`).join(', ');

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

// "Amarillo (limón)" y "Amarillo · limón" son la misma variante escrita de otra forma (Mar cambió el formato
// de los cepillos perfumados): un carrito guardado con el nombre viejo no pierde el color.
const formaVariante = (nombre) => nombre.toLowerCase().replace(/[()·]/g, ' ').replace(/\s+/g, ' ').trim();
const buscarVariante = (variantes = [], nombre) =>
  variantes.find((v) => v.nombre === nombre) ?? variantes.find((v) => formaVariante(v.nombre) === formaVariante(nombre));
// El mismo color con otro nombre (config/renombrados.js: "Fucsia · con llavero" → "Rosa · con llavero")
const nombreNuevo = (id, nombre) =>
  Object.entries(VARIANTES_RENOMBRADAS[id] ?? {}).find(([viejo]) => formaVariante(viejo) === formaVariante(nombre))?.[1] ?? nombre;

function reducer(lineas, accion) {
  switch (accion.type) {
    case 'agregar': {
      const { producto, variante, cantidad = 1, elecciones = null } = accion;
      if (variante?.agotado || producto.sinStock) return lineas; // agotada: no se agrega (la UI ya no deja)
      const clave = claveLinea(producto.id, variante?.nombre, elecciones);
      const existente = lineas.find((l) => l.clave === clave);
      if (existente) {
        return lineas.map((l) => (l.clave === clave ? { ...l, cantidad: limitar(l.cantidad + cantidad) } : l));
      }
      return [
        ...lineas,
        {
          clave,
          id: producto.id,
          nombre: producto.nombreCorto ?? producto.nombre,
          marca: producto.marca ?? null,
          variante: variante?.nombre ?? null,
          ...(variante?.color && { color: variante.color }), // cuadradito de color al lado de la variante
          ...(elecciones?.length && { elecciones }),
          // Sin selector de color (config/color.js): el pedido dice "(color a coordinar)"
          ...(producto.colorACoordinar && { colorACoordinar: true }),
          imagen: variante?.imagen ?? producto.imagen,
          precio: precioDe(producto, variante), // el de la variante si tiene uno propio
          ...(producto.promo && { promo: producto.promo.nombre }),
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
      // Los precios cambian seguido: al cargar el catálogo, actualizamos precio/nombre de lo guardado y
      // sacamos productos que ya no existen (o están ocultos). Si la variante guardada ya no existe (se
      // renombró o se sacó), la línea queda como el producto sin variante; si ya había una así, se suman.
      // Si solo cambió la forma de escribirla ("X (y)" → "X · y") o Mar la renombró (config/renombrados.js),
      // pasa al nombre nuevo; un producto con id nuevo, igual. La foto sigue a la del catálogo (las subidas
      // que se reemplazan se borran del bucket). Lo que se agotó (la variante o el producto) queda marcado
      // ("Agotado").
      const porId = new Map(accion.productos.map((p) => [p.id, p]));
      const resultado = [];
      for (const l of lineas) {
        const p = porId.get(IDS_RENOMBRADOS[l.id] ?? l.id);
        if (!p) continue;
        const variante = l.variante ? buscarVariante(p.variantes, nombreNuevo(p.id, l.variante)) : null;
        // Lo elegido en un kit que el kit ya no pide (Mar sacó ese selector) se descarta
        const claves = new Set((p.elecciones ?? []).map((e) => e.clave));
        const elecciones = (l.elecciones ?? []).filter(([k]) => claves.has(k));
        const {
          promo: _promoAnterior,
          elecciones: _eleccionesAnteriores,
          colorACoordinar: _colorAnterior,
          color: _colorVariante,
          agotado: _agotadoAntes,
          ...resto
        } = l;
        const linea = {
          ...resto,
          id: p.id,
          nombre: p.nombreCorto ?? p.nombre,
          marca: p.marca ?? null,
          variante: variante?.nombre ?? null,
          imagen: variante?.imagen ?? p.imagen,
          precio: precioDe(p, variante),
          // La promo se prende y se apaga sola: el precio y la marca de promo siguen al catálogo
          ...(p.promo && { promo: p.promo.nombre }),
          ...(elecciones.length && { elecciones }),
          ...(p.colorACoordinar && { colorACoordinar: true }),
          ...(variante?.color && { color: variante.color }),
          // Se agotó la variante o el producto entero (todas sus variantes, o lo marcó Mar)
          ...((variante?.agotado || p.sinStock) && { agotado: true }),
          clave: claveLinea(p.id, variante?.nombre ?? null, elecciones),
        };
        const igual = resultado.find((r) => r.clave === linea.clave);
        if (igual) igual.cantidad = limitar(igual.cantidad + linea.cantidad);
        else resultado.push(linea);
      }
      return resultado;
    }
    default:
      return lineas;
  }
}

export function CartProvider({ children }) {
  const [lineas, dispatch] = useReducer(reducer, undefined, leerStorage);
  const [abierto, setAbierto] = useState(false);
  // Paso de datos del pedido por WhatsApp (bottom-sheet en mobile, panel lateral en desktop)
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  // contador que sube en cada "agregar": lo usan el badge (pop) y el toast
  const [ultimoAgregado, setUltimoAgregado] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lineas));
    } catch {
      /* modo privado o storage lleno: el carrito sigue andando en memoria */
    }
  }, [lineas]);

  // Precios y nombres al día con el catálogo: al abrir la app y cada vez que llega una versión nueva de Supabase
  useEffect(() => {
    let vivo = true;
    const sincronizar = () =>
      getProducts()
        .then((productos) => vivo && dispatch({ type: 'sincronizar', productos }))
        .catch(() => {});
    sincronizar();
    const desuscribir = alActualizar((tipo) => tipo === 'catalogo' && sincronizar());
    return () => {
      vivo = false;
      desuscribir();
    };
  }, []);

  const agregar = useCallback((producto, variante = null, cantidad = 1, { abrir = true, elecciones = null } = {}) => {
    dispatch({ type: 'agregar', producto, variante, cantidad, elecciones });
    setUltimoAgregado({ n: Date.now(), producto, variante, cantidad });
    if (abrir) setAbierto(true);
  }, []);

  const agregarVarios = useCallback((items) => {
    for (const { producto, variante, cantidad } of items) dispatch({ type: 'agregar', producto, variante, cantidad });
    setUltimoAgregado({ n: Date.now(), multiple: items.length });
    setAbierto(true);
  }, []);

  const acciones = useMemo(
    () => ({
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
      // Desde el drawer: se cierra el drawer y entra el checkout
      abrirCheckout: () => {
        setAbierto(false);
        setCheckoutAbierto(true);
      },
      cerrarCheckout: () => setCheckoutAbierto(false),
      agregar,
      agregarVarios,
      setCantidad: (clave, cantidad) => dispatch({ type: 'cantidad', clave, cantidad }),
      quitar: (clave) => dispatch({ type: 'quitar', clave }),
      vaciar: () => dispatch({ type: 'vaciar' }),
    }),
    [agregar, agregarVarios],
  );

  const value = useMemo(() => {
    const cantidadTotal = lineas.reduce((s, l) => s + l.cantidad, 0);
    const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
    return { lineas, cantidadTotal, total, abierto, ultimoAgregado, checkoutAbierto, ...acciones };
  }, [lineas, abierto, checkoutAbierto, ultimoAgregado, acciones]);

  return (
    <CartAccionesContext.Provider value={acciones}>
      <CartContext.Provider value={value}>{children}</CartContext.Provider>
    </CartAccionesContext.Provider>
  );
}

/** Solo las acciones del carrito (estables): no re-renderiza cuando cambian las líneas. */
export function useCartAcciones() {
  const ctx = useContext(CartAccionesContext);
  if (!ctx) throw new Error('useCartAcciones tiene que usarse dentro de <CartProvider>');
  return ctx;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart tiene que usarse dentro de <CartProvider>');
  return ctx;
}
