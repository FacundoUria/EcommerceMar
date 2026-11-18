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
- Hero del home: foto `mar-con-productos-1` (los cuadros del video no quedan nítidos recortados a 4:5). El video "amor propio" va en Resultados, rotado para arrancar en su cuadro más nítido (opción `inicio` en `scripts/optimizar-videos.mjs`).
- Producto sin foto → placeholder elegante (crema + marca + nombre en Playfair), nunca imagen rota.
- Datos reales del negocio: `src/config/negocio.js`. Dato que falta = string vacío y la UI NO lo muestra (pendientes: dirección y horarios).

## Comandos
- `npm run dev` (localhost:5173) · `npm run dev -- --host` (ver desde el celu en la misma red) · `npm run build` · `npm run preview`
- `npm run fotos:importar` (baja de Tiendanube las fotos de productos con `tn`) · `npm run assets:optimizar` (sharp) · `npm run videos:optimizar` (ffmpeg)

## Performance (Lighthouse mobile ≥ 85 / a11y ≥ 90)
- motion vía `LazyMotion` + componente `m` (nunca `motion.div`: `strict` tira error). Features async en `src/lib/motionFeatures.js`.
- Fuentes self-hosted en `src/assets/fonts` (un solo archivo de Playfair 500 para todos los pesos).
- Home sin lazy; el resto de las páginas con `lazy()`. `vite.config.js` precarga el chunk de la ruta de entrada.
- Imágenes arriba de todo: `priority` en `SmartImg` (eager, sin fade).
- Blur-up: `scripts/optimizar-assets.mjs` genera `src/data/lqip.json` (miniaturas de 20px); se carga en un chunk aparte después del `load` (`src/lib/lqip.js`). `SmartImg` las usa de fondo y hace fade a la foto.

## Animaciones (motion)
- Solo `transform` y `opacity` (nada de width/height/top). Duraciones 0.5–0.8s, ease-out suave `[0.22, 1, 0.36, 1]`.
- Entradas UNA vez: `<Reveal>` (`src/components/ui/Reveal.jsx`, fade + translateY 24px→0) y `cascada(i)` para stagger de 0.06s.
- Con `prefers-reduced-motion` todo queda estático: `Reveal` renderiza sin animar, el header no se oculta, sin parallax ni cinta.
- Scroll: hero (parallax de la foto al 70%), header (compacto > 40px, se oculta al bajar; estado en `<html data-header>`), parallax de capas en "Hola, soy Mar", línea de pasos con `LineaProgreso` (scaleX ligado a scrollYProgress). Carrusel con `hint` (WAAPI, una vez).

## Decisiones pendientes (preguntar antes de asumir)
1. **Cierre del carrito:** ¿mensaje de WhatsApp a Mar con el pedido y el total, u otra cosa? (en Fase 1 queda "Próximamente").
2. **Carga de productos y precios:** cómo carga Mar (panel admin / Google Sheet / otra). Los precios cambian seguido.
3. **Turnos:** por ahora solo link a WhatsApp.

## Diseño
- Referencia visual: `docs/referencia-stitch/modelo-stitch.html` (generado con Stitch). Es una **noción** del estilo, NO una especificación: no copiarlo literal ni sus funciones.
- Tipografías Playfair Display (títulos) + Manrope (texto). Mobile-first. Fotos de producto protagonistas.
- **Paleta "Salvia y arena"** (tokens en `src/index.css`, contraste AA verificado y anotado ahí):
  - `arena` #F4EFE6 fondo base · `salvia` #E3E8DA secciones destacadas · `salvia-media` #B9C6AE placeholders/fondo de fotos/hovers.
  - `verde` #3E6450 (hover `verde-700` #345543): botón primario, íconos activos, links. `tinta` #22382B títulos y texto. `texto-suave` #5B6B60 secundario.
  - `dorado` #7E602B cursivas destacadas (oscurecido desde #8A6A2F para llegar a AA sobre salvia). `crema-card` #FFFDF8 cards, drawer, quick view.
  - `amarillo` #fed65b SOLO en el badge del carrito. El verde casi negro #0b291b ya no existe en el sitio.
  - Secciones alternan arena / salvia; los bloques dentro del contenedor usan `bloque-salvia` (rounded-3xl). Cards: utilidad `card`.
  - Header, bottom nav y barras fijas: `glass-arena` (arena translúcido con blur), íconos tinta, activo con píldora salvia y texto verde. Modales: `velo`.
  - Botón secundario `btn-borde`: borde verde 1px, texto verde, fondo transparente.
  - Precios: utilidad `precio` (Manrope 600, tabular-nums), nunca Playfair. Formato "$ 15.000" vía `formatPrecio`.
- **Poco texto**: sin eyebrows, sin subtítulos ni párrafos bajo títulos de sección, títulos de 1–3 palabras, botones de 1–2 palabras. Cards de producto: marca, nombre y precio, nada más. Excepción: "Hola, soy Mar" y "Rulos que se ven y se sienten" del home quedan como están.
- El campo `paso` de las categorías se usa SOLO dentro de /rutina.
- Imágenes de la marca en `assets/marca/` (logo y fotos).

## Datos: nada inventado
El modelo de Stitch tiene datos de relleno. **No usar como reales**: reseñas ("4.9, 142 reseñas"), testimonios, nombres de asesoras, dirección, horarios, número de WhatsApp, "estudio certificado", precios, cuotas, envíos gratis. Todo dato real lo da Mar; si falta, no se muestra (nada de placeholders visibles en el sitio).
Las fotos de personas (`personita*.jpg`) solo se publican si Mar confirma que tiene permiso de esas personas.

## Forma de trabajo
- Facu escribe en español rioplatense; responder en español, corto y concreto.
- Antes de cambios grandes: proponer plan breve y esperar OK.
- Commits chicos, en español, descriptivos. Rama `main`.
- No commitear `.env` ni claves. No hacer `git push` sin que Facu lo confirme.
- Facu prueba en localhost antes de dar por terminado algo.
