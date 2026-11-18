# EcommerceMar — Dream Hair (The Curly Studio)

Tienda online de productos para pelo con rulos (método curly) de **Mar**, dueña de la peluquería Dream Hair (Mendoza, Argentina).
Desarrollador: Facu (FacundoUria). Repo: https://github.com/FacundoUria/EcommerceMar (público).

## Estado actual
**Fase 1 — MVP de diseño.** Demo para mostrarle a Mar cómo se vería su tienda (reemplaza a su Tiendanube: https://dreamhairarg.mitiendanube.com). NO es la versión final: prioridad = diseño moderno, muy interactivo, centrado en los productos, mobile-first (la mayoría de sus clientas entra desde el celular).

## Qué es (y qué NO es)
- La gente navega el catálogo, ve productos y precios, y arma un carrito.
- **No hay pago online.** El carrito es solo visual. El cobro lo maneja Mar por fuera de la web. "Finalizar pedido" queda deshabilitado ("Próximamente").
- No hay pasarela de pago (ni Mercado Pago, ni tarjetas), ni cuentas de usuario, ni stock en tiempo real, salvo que Facu lo pida.
- Servicios de peluquería: solo se muestran, precio "Consultar", botón "Reservar por WhatsApp" (https://wa.me/message/G7IS2KBVGNF4E1, link real de su Tiendanube). No van al carrito.

## Stack (confirmado)
React + Vite + Tailwind CSS v4 + React Router + motion (framer-motion), JavaScript, sin backend. Deploy en Netlify desde `main` (`netlify.toml`: build `npm run build`, publish `dist`, redirect SPA).

## Datos: preparado para un panel futuro
- Catálogo en `src/data/products.js` (precios de su Tiendanube, nov 2026).
- **Los componentes NUNCA importan `products.js` directo.** Todo pasa por `src/services/productsService.js` (`getProducts`, `getProductById`, `getCategories`, `getServices`, todas async).
- Más adelante el service va a leer de una base de datos donde Mar carga productos y precios (panel admin), sin tocar la UI. Mantener esa frontera. Hoy importa `products.js` estático (2 KB, mejor LCP); el lugar del futuro `fetch` está comentado en `cargar()`.
- Los hooks de `src/hooks/useCatalog.js` cachean lo resuelto: el skeleton se ve solo mientras algo realmente carga. `precargarCatalogo()` arranca en `main.jsx`.
- El carrito re-sincroniza precio/nombre contra el catálogo al abrir la app (los precios cambian seguido).

## Assets
- Originales en `assets/` (no se sirven). Versiones web generadas en `public/img/` (`<nombre>.webp` 900px + `<nombre>-sm.webp` 400px) y `public/video/` con los scripts de `scripts/`. Los archivos `VERIFICAR-*` y `personita*` se ignoran. Los videos originales (`assets/videos/`) no se commitean.
- Producto sin foto → placeholder elegante (crema + marca + nombre en Playfair), nunca imagen rota.
- Datos reales del negocio y textos de la franja: `src/config/negocio.js` (lo que falta dice `[A CONFIRMAR CON MAR]`).

## Comandos
- `npm run dev` (localhost:5173) · `npm run dev -- --host` (ver desde el celu en la misma red) · `npm run build` · `npm run preview`
- `npm run fotos:importar` (baja de Tiendanube las fotos de productos con `tn`) · `npm run assets:optimizar` (sharp) · `npm run videos:optimizar` (ffmpeg)

## Performance (Lighthouse mobile ≥ 85 / a11y ≥ 90)
- motion vía `LazyMotion` + componente `m` (nunca `motion.div`: `strict` tira error). Features async en `src/lib/motionFeatures.js`.
- Fuentes self-hosted en `src/assets/fonts` (un solo archivo de Playfair 500 para todos los pesos).
- Home sin lazy; el resto de las páginas con `lazy()`. `vite.config.js` precarga el chunk de la ruta de entrada.
- Imágenes arriba de todo: `priority` en `SmartImg` (eager, sin fade).

## Decisiones pendientes (preguntar antes de asumir)
1. **Cierre del carrito:** ¿mensaje de WhatsApp a Mar con el pedido y el total, u otra cosa? (en Fase 1 queda "Próximamente").
2. **Carga de productos y precios:** cómo carga Mar (panel admin / Google Sheet / otra). Los precios cambian seguido.
3. **Turnos:** por ahora solo link a WhatsApp.

## Diseño
- Referencia visual: `docs/referencia-stitch/modelo-stitch.html` (generado con Stitch). Es una **noción** del estilo, NO una especificación: no copiarlo literal ni sus funciones.
- Estilo a tomar: mobile-first, verde muy oscuro `#0b291b` + crema `#FAF9F4` + amarillo `#fed65b`, tipografías Playfair Display (títulos) + Manrope (texto), tarjetas redondeadas con efecto vidrio.
- Imágenes de la marca en `assets/marca/` (logo y fotos).

## Datos: nada inventado
El modelo de Stitch tiene datos de relleno. **No usar como reales**: reseñas ("4.9, 142 reseñas"), testimonios, nombres de asesoras, dirección, horarios, número de WhatsApp, "estudio certificado", precios, cuotas, envíos gratis. Todo dato real lo da Mar; si falta, dejar un placeholder visible tipo `[A CONFIRMAR CON MAR]`.
Las fotos de personas (`personita*.jpg`) solo se publican si Mar confirma que tiene permiso de esas personas.

## Forma de trabajo
- Facu escribe en español rioplatense; responder en español, corto y concreto.
- Antes de cambios grandes: proponer plan breve y esperar OK.
- Commits chicos, en español, descriptivos. Rama `main`.
- No commitear `.env` ni claves. No hacer `git push` sin que Facu lo confirme.
- Facu prueba en localhost antes de dar por terminado algo.
