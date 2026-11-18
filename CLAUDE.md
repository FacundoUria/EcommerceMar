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
- Hero del home: foto `mar-con-productos-1` (los cuadros del video no quedan nítidos recortados a 4:5).
- Videos: el único es el del proceso en /servicios (con audio, sin autoplay: play al tocar, `preload="none"` + poster). El home ya no tiene sección Resultados ni video.
- Banners de Mar (`assets/banners/`, traen su texto): carrusel `<Banners>` al final del home (después de "Hola, soy Mar"). Autoplay 6 s, pausa con hover/toque, puntos; sin autoplay con movimiento reducido. Tienen versión `-lg` (1504px).
- Producto sin foto → placeholder elegante (crema + marca + nombre en Playfair), nunca imagen rota.
- **Fotos de producto siempre con `<FotoProducto>`** (cards, carruseles, quick view, producto, rutina, carrito): mismo fondo `fondo-foto` (salvia-media → arena). Fotos de fondo blanco → `mix-blend-mode: multiply` + padding; de escena → cover en marco con overlay salvia 10%. La clasificación la genera `scripts/optimizar-assets.mjs` en `src/data/fondos.json`.
- Datos reales del negocio: `src/config/negocio.js`. Dato que falta = string vacío y la UI NO lo muestra (pendientes: dirección y horarios).

## Comandos
- `npm run dev` (localhost:5173) · `npm run dev -- --host` (ver desde el celu en la misma red) · `npm run build` · `npm run preview`
- `npm run fotos:importar` (baja de Tiendanube las fotos de productos con `tn`) · `npm run assets:optimizar` (sharp) · `npm run videos:optimizar` (ffmpeg)

## Performance (Lighthouse mobile Performance ≥ 80 / a11y ≥ 90)
- LCP del home = foto del hero. Preload desde `index.html` (solo en "/", con fetchpriority high), Playfair normal + cursiva con preload (lo agrega `vite.config.js` con el nombre hasheado), entrada de la foto con CSS (`.hero-foto`, no motion: no espera al chunk async).
- Fotos no prioritarias: `SmartImg` pone el `src` recién a 300px de la pantalla (IntersectionObserver); banners igual. Con conexión lenta/desconocida Chrome agranda el margen de `loading="lazy"` y bajaba casi todo el home antes del LCP (946 KB → 439 KB, LCP simulado 4.7 → 3.6 s).
- motion vía `LazyMotion` + componente `m` (nunca `motion.div`: `strict` tira error). Features async en `src/lib/motionFeatures.js`.
- Fuentes self-hosted en `src/assets/fonts` (un solo archivo de Playfair 500 para todos los pesos).
- Home sin lazy; el resto de las páginas con `lazy()`. `vite.config.js` precarga el chunk de la ruta de entrada.
- Imágenes arriba de todo: `priority` en `SmartImg` (eager, sin fade).
- Blur-up: `scripts/optimizar-assets.mjs` genera `src/data/lqip.json` (miniaturas de 20px); se carga en un chunk aparte después del `load` (`src/lib/lqip.js`). `SmartImg` las usa de fondo y hace fade a la foto.

## Animaciones (motion)
- Solo `transform` y `opacity` (nada de width/height/top). Excepción pedida: los paneles de categorías en desktop animan `flex-grow` (0.6s). Duraciones 0.5–0.8s, ease-out suave `[0.22, 1, 0.36, 1]`.
- Entradas UNA vez: `<Reveal>` (`src/components/ui/Reveal.jsx`, fade + translateY 24px→0) y `cascada(i)` para stagger de 0.06s.
- `prefers-reduced-motion` = **menos movimiento, no cero** (muchas lo tienen activado sin saber: Windows, ahorro de batería). Se mantienen: fades, reveal de títulos (12px + fade en vez de 100%), cortina de fotos → fade, hovers, roll de texto, carruseles con autoplay a 8 s. Se apagan: parallax, cursor propio, 3D, botones magnéticos, flotación de mini-cards, manchas del mesh, brillo dorado, conteo de precios, Lenis, cortina de página (queda fade rápido), cinta de marcas (quieta y centrada). El header no se oculta. `MotionConfig reducedMotion="user"` anula los transform de motion; `RevealText` usa su propio `MotionConfig never` para el desplazamiento de 12px. Nada de reglas CSS globales que maten transiciones.
- Letras: brillo dorado en "amor propio" del hero (`.brillo-dorado`, 5 s, tono claro #a8823f = 3.09:1); en `RevealText` la palabra en cursiva dorada entra con +0.14 s y 14px horizontales; links del nav y `.btn` con `<Roll>` (roll del texto en hover, 0.3 s); precios de producto con `<Precio>` (cuenta desde 0 en 0.6 s, una vez; carrito sin conteo); cinta de marcas acelera con la velocidad del scroll (playbackRate hasta 4x).
- Scroll: hero (parallax de la foto al 70%), header (compacto > 40px, se oculta al bajar; estado en `<html data-header>`), parallax de capas en "Hola, soy Mar", línea de pasos con `LineaProgreso` (scaleX ligado a scrollYProgress). Carrusel con `hint` (WAAPI, una vez).

- Títulos h1/h2: `<RevealText>` (por línea con máscara, stagger 0.08s). Fotos destacadas: `<RevealImagen>` (cortina clip-path + escala 1.15→1).
- Smooth scroll: Lenis (`src/lib/smooth.js`), solo desktop con mouse y sin movimiento reducido; se pausa con overlays. Para scrollear por código usar `scrollA()`.
- Desktop con mouse: cursor propio (`Cursor.jsx`, `data-cursor="ver"` en cards), cards de producto 3D (hasta 6°), botones magnéticos.
- Transición entre rutas: cortina salvia con el logo (≈0.68s, no en la primera carga). Grano: utilidad `grano`. Reveal se dispara 10% antes de entrar.
- Excepciones pedidas a "solo transform/opacity": clip-path de la cortina de fotos y flex-grow de los paneles de categorías.
- **"Rulos y brillo"** (identidad de marca, todo SVG + CSS/WAAPI, sin librerías; `src/components/marca/`, `src/lib/rulos.js`, `src/lib/destellos.js`):
  - `<Rulos variante>` (hero, rutina del home, footer): espirales SVG al 25% que se dibujan con el scroll de su sección (stroke-dashoffset escrito directo en el DOM; NO `useScroll`/`pathLength` de motion: no pinta el valor inicial hasta el primer scroll). Miden su propia capa, no la ref del padre (todavía no está conectada al montar el hijo).
  - `<AdornoTitulo>`: subrayado en rulo bajo "amor propio" (CSS, 0.9 s) + destellos alrededor. `<Destellos>`: estrellitas que titilan (también junto al logo del header).
  - `explotarDestellos(boton)` al agregar al carrito (card, quick view, producto, rutina); `lluviaDestellos()` al elegir el 4.º paso de /rutina + "¡Tu rutina está lista!" con el total junto al botón de agregar. En WAAPI el easing va por keyframe (en la animación entera aplasta la fase visible).
  - `<IntroMarca>`: primera visita de la sesión (sessionStorage `dh-intro`, con try/catch), ≈ 1.2 s, tap para saltar, CSS puro. El hero atrasa su título con `DEMORA_INTRO`. La capa va con `opacity: 0.97`: con una capa 100% opaca Chrome no cuenta la foto del hero como pintada y el LCP esperaba a que se abriera la intro (0.99 no alcanza).
  - `<ProgresoScroll>`: línea ondulada verde arriba de todo (sigue funcionando con movimiento reducido: es información).
  - Movimiento reducido: rulos ya dibujados, sin destellos/explosión/lluvia, intro con fade.
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
  - **Sin cajas**: las secciones van de borde a borde; los cambios de fondo son degradés (`fondo-salvia`: arena → salvia → arena; `fondo-salvia-abajo` para el footer). Nada de bloques redondeados con margen. Las cards siguen siendo cards (`card`).
  - Ancho: `contenedor` (máx 84rem, px-4 / md:px-8). En desktop 1440 nada debe verse como "celu estirado" (tienda en 4 columnas, hero en 2).
  - Hero y rutina del home: `<MeshFondo>` (manchas radial-gradient que derivan 20–30 s con transform; quietas con movimiento reducido).
  - Botón primario: degradé verde #3E6450 → #2F5240 con brillo en hover. Botones con efecto magnético (máx 6px, `useBotonesMagneticos`, solo mouse).
  - Cursivas destacadas: `texto-dorado` (degradé con background-clip; solo en títulos grandes, el tono claro da 3.38:1).
  - Header, bottom nav y barras fijas: `glass-arena` (arena translúcido con blur), íconos tinta, activo con píldora salvia y texto verde. Modales: `velo`.
  - Botón secundario `btn-borde`: borde verde 1px, texto verde, fondo transparente.
  - Precios: utilidad `precio` (Manrope 600, tabular-nums), nunca Playfair. Formato "$ 15.000" vía `formatPrecio`.
- **Poco texto**: sin eyebrows, sin subtítulos ni párrafos bajo títulos de sección, títulos de 1–3 palabras, botones de 1–2 palabras. Cards de producto: marca, nombre y precio, nada más. Excepción: "Hola, soy Mar" del home queda como está.
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
