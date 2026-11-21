import { useEffect, useMemo, useState } from 'react';
import * as service from '../services/productsService.js';
import { PASOS_RUTINA } from '../config/negocio.js';

// Resultados ya resueltos: si el dato está, se devuelve sincrónico y no hay skeleton.
const resueltos = new Map();

// Cuando el service avisa que llegó una versión distinta (stale-while-revalidate), se vuelve a armar todo lo
// resuelto y se avisa a cada hook montado: la página se actualiza sin skeleton.
const suscriptores = new Set();
const avisarHooks = () => suscriptores.forEach((fn) => fn());
service.alActualizar((tipo) => {
  if (tipo === 'descripciones') {
    precargarDescripciones().then(avisarHooks);
    return;
  }
  for (const k of [...resueltos.keys()]) if (k !== 'descripciones') resueltos.delete(k);
  precargarCatalogo().then(avisarHooks);
});

function useServicio(clave, fn) {
  const [estado, setEstado] = useState(() =>
    resueltos.has(clave) ? { data: resueltos.get(clave), loading: false, error: null } : { data: null, loading: true, error: null },
  );

  useEffect(() => {
    const refrescar = () => {
      if (resueltos.has(clave)) {
        setEstado({ data: resueltos.get(clave), loading: false, error: null });
        return;
      }
      fn()
        .then((data) => {
          resueltos.set(clave, data);
          setEstado({ data, loading: false, error: null });
        })
        .catch(() => {});
    };
    suscriptores.add(refrescar);
    return () => suscriptores.delete(refrescar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useEffect(() => {
    if (resueltos.has(clave)) {
      setEstado({ data: resueltos.get(clave), loading: false, error: null });
      return;
    }
    let vivo = true;
    setEstado((e) => ({ ...e, loading: true, error: null }));
    fn()
      .then((data) => {
        resueltos.set(clave, data);
        if (vivo) setEstado({ data, loading: false, error: null });
      })
      .catch((error) => vivo && setEstado({ data: null, loading: false, error }));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return estado;
}

/**
 * Pide el catálogo al arrancar la app (sin bloquear el render). Si llega antes de que
 * se monte una página, esa página arranca con los datos y no muestra skeleton.
 */
export function precargarCatalogo() {
  return Promise.all([service.getProducts(), service.getCategories(), service.getServiceGroups(), service.getBrands(), service.getReviews()])
    .then(([products, categories, serviceGroups, brands, reviews]) => {
      resueltos.set('reviews', reviews);
      resueltos.set('products', products);
      resueltos.set('categories', categories);
      resueltos.set('serviceGroups', serviceGroups);
      resueltos.set('brands', brands);
      for (const p of products) resueltos.set(`product:${p.id}`, p);
    })
    .catch(() => {}); // si falla, cada hook lo reintenta y muestra su error/skeleton
}

/** Pide las descripciones de Mar (archivo aparte) y las deja resueltas para useDescripciones. */
export const precargarDescripciones = () =>
  service
    .getDescripciones()
    .then((d) => resueltos.set('descripciones', d))
    .catch(() => {});

/**
 * Descripciones de Mar por id ({ [id]: texto }), o null mientras no estén. `activo`: recién ahí se piden
 * (el buscador de la tienda las pide al enfocarlo o si la URL ya trae una búsqueda).
 */
export function useDescripciones(activo = true) {
  const [data, setData] = useState(() => resueltos.get('descripciones') ?? null);
  useEffect(() => {
    const refrescar = () => setData((d) => (d ? (resueltos.get('descripciones') ?? d) : d));
    suscriptores.add(refrescar);
    return () => suscriptores.delete(refrescar);
  }, []);
  useEffect(() => {
    if (!activo || data) return;
    let vivo = true;
    precargarDescripciones().then(() => vivo && setData(resueltos.get('descripciones') ?? null));
    return () => {
      vivo = false;
    };
  }, [activo, data]);
  return data;
}

export const useProducts = () => useServicio('products', service.getProducts);
export const useCategories = () => useServicio('categories', service.getCategories);
export const useServiceGroups = () => useServicio('serviceGroups', service.getServiceGroups);
export const useReviews = () => useServicio('reviews', service.getReviews);
export const useBrands =() => useServicio('brands', service.getBrands);
export const useProduct = (id) => useServicio(`product:${id}`, () => service.getProductById(id));

/**
 * Pasos de /rutina (config/negocio.js) con sus categorías según el campo `paso` de cada categoría (lo elige
 * Mar en el panel). Mientras las categorías no están, las de negocio.js (son las mismas).
 */
export function usePasosRutina() {
  const { data: categorias } = useCategories();
  return useMemo(
    () =>
      categorias
        ? PASOS_RUTINA.map((p) => ({ ...p, categorias: categorias.filter((c) => c.paso === p.paso).map((c) => c.id) }))
        : PASOS_RUTINA,
    [categorias],
  );
}
