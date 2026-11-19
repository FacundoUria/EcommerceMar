import { useEffect, useState } from 'react';
import * as service from '../services/productsService.js';

// Resultados ya resueltos: si el dato está, se devuelve sincrónico y no hay skeleton.
const resueltos = new Map();

function useServicio(clave, fn) {
  const [estado, setEstado] = useState(() =>
    resueltos.has(clave) ? { data: resueltos.get(clave), loading: false, error: null } : { data: null, loading: true, error: null },
  );

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
  return Promise.all([service.getProducts(), service.getCategories(), service.getServiceGroups(), service.getBrands()])
    .then(([products, categories, serviceGroups, brands]) => {
      resueltos.set('products', products);
      resueltos.set('categories', categories);
      resueltos.set('serviceGroups', serviceGroups);
      resueltos.set('brands', brands);
      for (const p of products) resueltos.set(`product:${p.id}`, p);
    })
    .catch(() => {}); // si falla, cada hook lo reintenta y muestra su error/skeleton
}

export const useProducts = () => useServicio('products', service.getProducts);
export const useCategories = () => useServicio('categories', service.getCategories);
export const useServiceGroups = () => useServicio('serviceGroups', service.getServiceGroups);
export const useBrands = () => useServicio('brands', service.getBrands);
export const useProduct = (id) => useServicio(`product:${id}`, () => service.getProductById(id));
