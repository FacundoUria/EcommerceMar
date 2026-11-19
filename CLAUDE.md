# EcommerceMar — Dream Hair (The Curly Studio)

Tienda online de productos para pelo con rulos (método curly) de **Mar**, dueña de la peluquería Dream Hair (Mendoza, Argentina).
Desarrollador: Facu (FacundoUria). Repo: https://github.com/FacundoUria/EcommerceMar (público).
Dominio final de Mar: **dreamhair.ar** (en `NEGOCIO.dominio`; "dreamhair.com" que aparece en un banner viejo es incorrecto).
WhatsApp del estudio: +54 9 2616 95-1803 → `https://wa.me/5492616951803` (`NEGOCIO.whatsapp`). Links siempre con `whatsappCon(texto)` (`src/config/negocio.js`, por defecto "¡Hola Mar!"). **Sin redundancia**: el WhatsApp está SOLO en mini Mar (desktop), el botón central del bottom nav (mobile), los "¡Reservar!" de cada servicio, la consulta de /producto ("¡Hola Mar! Tengo una consulta sobre: <producto> (<variante>)": botón redondo en la barra fija mobile / "¿Dudas? Consultale a Mar" en desktop) y un link de texto en el footer.

## Estado actual
**Fase 1 — MVP de diseño.** Demo para mostrarle a Mar cómo se vería su tienda (reemplaza a su Tiendanube: https://dreamhairarg.mitiendanube.com). NO es la versión final: prioridad = diseño moderno, muy interactivo, centrado en los productos, mobile-first (la mayoría de sus clientas entra desde el celular).

## Qué es (y qué NO es)
- La gente navega el catálogo, ve productos y precios, y arma un carrito.
- **No hay pago online.** El carrito es solo visual. El cobro lo maneja Mar por fuera de la web. "Finalizar pedido" queda deshabilitado ("Próximamente").
- No hay pasarela de pago (ni Mercado Pago, ni tarjetas), ni cuentas de usuario, ni stock en tiempo real, salvo que Facu lo pida.
- Servicios de peluquería: solo se muestran, **sin precio** (ni "Consultar"). Card: foto, nombre, chip de duración con reloj, descripción de Mar (mobile 3 líneas + "Ver más"; desktop completa) y "¡Reservar!" → WhatsApp con "¡Hola Mar! Quiero reservar: <servicio>". Agrupados en Asesoramientos / Cortes y clases / Tratamientos (`serviceGroups` en products.js, `getServiceGroups()`). No van al carrito.

## Stack (confirmado)
React + Vite + Tailwind CSS v4 + React Router + motion (framer-motion), JavaScript, sin backend. Deploy en Netlify desde `main` (`netlify.toml`: build `npm run build`, publish `dist`, redirect SPA).

## Datos: preparado para un panel futuro
- Catálogo en `src/data/products.js` (precios de su Tiendanube, nov 2026).
- **Los componentes NUNCA importan `products.js` ni `resenas.js` directo.** Todo pasa por `src/services/productsService.js` (`getProducts`, `getProductById`, `getCategories`, `getServices`, `getServiceGroups`, `getReviews`, todas async).
- Textos de Mar (servicios, reseñas, "Hola, soy Mar"): **tal cual**, sin corregir ni reescribir.
- Más adelante el service va a leer de una base de datos donde Mar carga productos y precios (panel admin), sin tocar la UI. Mantener esa frontera. Hoy importa `products.js` estático (2 KB, mejor LCP); el lugar del futuro `fetch` está comentado en `cargar()`.
- Los hooks de `src/hooks/useCatalog.js` cachean lo resuelto: el skeleton se ve solo mientras algo realmente carga. `precargarCatalogo()` arranca en `main.jsx`.
- El carrito re-sincroniza precio/nombre contra el catálogo al abrir la app (los precios cambian seguido).

## Assets
- Originales en `assets/` (no se sirven). **Calidad de imagen** (`npm run assets:optimizar`):
  - Los webp salen SIEMPRE del original de mayor resolución (`scripts/fuentes-imagenes.mjs`: originales de Mar en `assets/<carpeta>/originales/`, ignorada, con su recorte), nunca de un webp/jpg ya achicado.
  - Escalera de anchos por imagen `<nombre>-<ancho>.webp` (fotos 400/640/960/1280, banners 480…1600, marca 96…480), nunca más ancha que el original. Fotos q82, banners y marca q88; al achicar, sharpen sigma 0.5. Productos de fondo "blanco" que en realidad es gris: se blanquean las luces (sobre 170) para que el multiply no deje recuadro.
  - `src/data/imagenes.json` (anchos + tamaño del original) → `src/lib/imagenes.js`. En los datos las fotos siguen nombradas `/img/<carpeta>/<nombre>.webp` (identificador).
  - `SmartImg` arma `srcset` con toda la escalera y `sizes` = ancho medido de su caja (según object-fit): el navegador elige 1x/2x/3x. `sizes` explícito solo en las prioritarias (hero; `vite.config.js` inyecta el mismo srcset en el preload de `index.html`). Miniaturas fijas: `imgFija(src, px)`.
  - Fotos con poca resolución: se muestran como máximo a la mitad de los px del original (contain: la foto; escena: su marco), nunca estiradas. `npm run imagenes:auditar` (con `dist/` armado) mide el sitio real y deja la tabla en `docs/auditoria-imagenes.md` (sí / justo / no).
- `public/video/` con `npm run videos:optimizar`. Los archivos `VERIFICAR-*` y `personita*` se ignoran. Los videos originales (`assets/videos/`) no se commitean.
- Hero del home: foto `assets/mar/inicio.jpeg` (793×1064, la eligió Mar), srcset 400/640/793; preload en `index.html` con el mismo srcset (lo inyecta `vite.config.js` desde imagenes.json) y los mismos sizes (`HERO_*` en Home.jsx). No agrandarla ni usar versiones de IA (Real-ESRGAN descartado: piel artificial). Mini-cards del hero: contenido en `src/config/hero.js` (único lugar a editar): 1.ª junto al pote = Skala Cachonados "El que uso yo"; 2.ª arriba = Shampoo HAN "Favorito" (reemplazar por el más vendido real cuando haya datos).
- Fotos del estudio: `assets/estudio/` (jpg máx 1200px, las eligió Mar; también las que muestran clientas). Originales en `assets/estudio/originales/` (ignorada).
- Reseñas: `src/data/resenas.js` (vía el service). Fotos de las clientas: recorte cuadrado centrado en la cara en `assets/resenas/` → webp 96/192px (originales en `assets/resenas/originales/`, ignorada).
- Videos: el único es el del proceso, en /servicios dentro del grupo "Asesoramientos": card tipo story protagonista (`HistoriaVideo.jsx`: 160px mobile / 220px desktop, poster, play grande, anillo dorado que gira lento como historia sin ver, "Mirá cómo es un asesoramiento" debajo; mobile centrada bajo el título, desktop en una columna fija a la izquierda de las cards) que abre un modal a pantalla completa (portal en body; con audio; sin controles nativos: tocar pausa/sigue, progreso arriba, botón de sonido; se cierra con X, swipe down o Esc). El video mide 576px de ancho. El home ya no tiene sección Resultados ni video.
- Banners de Mar (`assets/banners/`, traen su texto; originales tal como los mandó en `assets/banners/originales/`, ignorada): `<Banners>` al final del home (después de las reseñas). Mobile: mazo de cartas apiladas (2 detrás asomando, ±3°); swipe = la carta sale volando con rotación y sube la siguiente; autoplay 6 s, pausa 10 s al tocar. Desktop: bento 1 grande + 3 chicas en columna (3fr/1fr: todas con la proporción del banner, nunca se recortan porque traen texto), hover con zoom y elevación, cascada con cortina. `marcas-lideres` va recortado abajo (sin "www.dreamhair.com"). En el home van solo 4: asesoramiento-corte-en-seco, dream-hair-studio, promos-rulos y promociones-mensuales (envíos y medios de pago ya están en la barra de anuncio; marcas líderes, en la cinta de marcas; `hola-soy-mar` tiene un typo).
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
- Scroll: hero (parallax de la foto al 70%), header (compacto > 40px, se oculta al bajar; estado en `<html data-header>`), parallax de capas en "Hola, soy Mar", línea de pasos con `LineaProgreso` (scaleX ligado a scrollYProgress).

- Títulos h1/h2: `<RevealText>` (por línea con máscara, stagger 0.08s). Fotos destacadas: `<RevealImagen>` (cortina clip-path + escala 1.15→1).
- Smooth scroll: Lenis (`src/lib/smooth.js`), solo desktop con mouse y sin movimiento reducido; se pausa con overlays. Para scrollear por código usar `scrollA()`.
- Desktop con mouse: cursor propio (`Cursor.jsx`, `data-cursor="ver"` en cards), cards de producto 3D (hasta 6°), botones magnéticos.
- Transición entre rutas: cortina salvia con el logo (≈0.68s, no en la primera carga). Grano: utilidad `grano`. Reveal se dispara 10% antes de entrar.
- Excepciones pedidas a "solo transform/opacity": clip-path de la cortina de fotos y flex-grow de los paneles de categorías.
- **"Rulos y brillo"** (identidad de marca, todo SVG + CSS/WAAPI, sin librerías; `src/components/marca/`, `src/lib/rulos.js`, `src/lib/destellos.js`):
  - `<Rulos variante>` (hero, rutina del home, footer): espirales SVG al 25% que se dibujan con el scroll de su sección (stroke-dashoffset escrito directo en el DOM; NO `useScroll`/`pathLength` de motion: no pinta el valor inicial hasta el primer scroll). Miden su propia capa, no la ref del padre (todavía no está conectada al montar el hijo).
  - `<AdornoTitulo>`: subrayado en rulo bajo "amor propio" (CSS, 0.9 s) + destellos alrededor. `<Destellos>`: estrellitas que titilan (también junto al logo del header).
  - `explotarDestellos(boton)` al agregar al carrito (card, quick view, producto, rutina); `lluviaDestellos()` + "¡Tu rutina está lista!" con el total cuando hay al menos un producto en el paso 4 de /rutina o se llega al último paso con algo elegido. En WAAPI el easing va por keyframe (en la animación entera aplasta la fase visible).
  - `<IntroMarca>`: primera visita de la sesión (sessionStorage `dh-intro`, con try/catch), ≈ 1.2 s, tap para saltar, CSS puro. El hero atrasa su título con `DEMORA_INTRO`. La capa va con `opacity: 0.97`: con una capa 100% opaca Chrome no cuenta la foto del hero como pintada y el LCP esperaba a que se abriera la intro (0.99 no alcanza).
  - `<ProgresoScroll>`: línea ondulada verde arriba de todo (sigue funcionando con movimiento reducido: es información).
  - Movimiento reducido: rulos ya dibujados, sin destellos/explosión/lluvia, intro con fade.
- **Color desde los productos** (sin tocar la paleta base): `scripts/optimizar-assets.mjs` guarda el color dominante de cada foto de producto en `src/data/colores.json` (ignora blancos, grises y casi negros; las categorías usan la foto de un producto). `colorDe(src)` (`src/lib/colores.js`) → `--color-producto`: halo `.halo-producto` (radial al 35%, en hover se intensifica y se expande) dentro de `FotoProducto`, borde en hover `.borde-producto` (cards de producto y categoría), fondo de la foto en /producto `.fondo-color-producto`, destellos de la explosión (color del producto + dorado). Fotos blancas con bordes esfumados (`.foto-bordes-suaves`). `MeshFondo` suma rosa #F4B6C2 y turquesa #9ED8D2 al 20%.
- Rulos en todas las páginas: el home tiene los suyos (hero, rutina); el resto los monta `App` dentro de `<main>` según la ruta. Títulos principales con `<ConDestellos>`.

## Secciones (Fase 2, feedback de Mar)
- **Barra de anuncio** (`BarraAnuncio.jsx`, mensajes e íconos en `ANUNCIO` de negocio.js): franja verde de 34px arriba del header en todas las páginas. Un mensaje a la vez, centrado, con ícono fino (Lucide) en dorado claro; cambia cada 4 s (sale hacia arriba, entra desde abajo, blur sutil). Brillo diagonal lento (`.barra-brillo`). Se pausa con hover/foco; con movimiento reducido cambia con fade y sin brillo. Lectores de pantalla: lista oculta con los 3 mensajes. Está en el flujo (el header sticky queda debajo sin CLS) y en el shell de `index.html`.
- **Home**: Hero → Categorías → **Favoritos de Mar** (los `destacado`: NO son más vendidos, no hay datos de ventas todavía) → Cinta de marcas → Rutina → "Hola, soy Mar" (texto de Mar + "Leer más" que despliega el resto) → **Reseñas** (`Resenas.jsx`: autoplay 7 s, mobile 5 líneas + "Leer más") → Banners.
- **Un solo carrusel**: `<Carrusel>` (`src/components/ui/Carrusel.jsx`, embla-carousel-react) para Favoritos, Categorías (mobile), Reseñas y "Completá tu rutina". Drag con inercia + snap al centro (`skipSnaps`), loop si hay cards de sobra; card centrada a escala 1 y laterales a 0.94; barra de progreso fina abajo; flechas solo con hover/foco en desktop sobre un degradé del color de fondo (`fondo`); mobile una card (`anchoMobile`) con las vecinas asomando, desktop 4 en el ancho del contenedor; `autoplay` con pausa. Sin contador "01/07". Si todas entran, quedan centradas y sin controles. **Reglas que evitan cards encimadas**: espaciado con padding en el slide + margen negativo en el contenedor (con `gap` CSS Embla no cuenta el espacio de la última card y el loop las encimaba); nada que cambie la posición de los slides después de iniciar (Embla solo vuelve a medir cuando cambia el tamaño: un `justify-center` condicional dejaba los snaps corridos) → `justify-content: safe center` fijo; escala ≤ 1 y 3D sobre el contenido, no sobre el slide; el slide en hover/foco sube a z-10 solo por la sombra; ancho de slide fijo por flex-basis (no cambia cuando cargan las fotos); `select-none` (arrastrar con mouse no selecciona texto).
- **/rutina con varios productos por paso**: `eleccion = { [paso]: [{ producto, variante }] }`. Cards con check de selección múltiple animado (tilde que se dibuja); con variantes, al marcarlo aparece para elegir cuál (si falta, "Agregar rutina" avisa y lleva a ese paso). Resumen agrupado por paso (desktop) / una foto por paso con la cantidad (barra mobile), total en vivo; "Agregar rutina" agrega todos. `?paso=N` abre ese paso (links del home) y la URL acompaña al paso actual. En el home, cada paso muestra hasta 3 opciones apiladas.
- `<Expandible>` (`src/components/ui/Expandible.jsx`): texto recortado a N líneas con despliegue animado del alto (excepción pedida a "solo transform/opacity"); `soloMobile` lo deja completo desde md; `lineas={0}` arranca oculto. El esfumado de la última línea se abre junto con el alto (`@property --corte`).
- **Mismo vocabulario en las secciones nuevas** que en el resto: cards `card rounded-3xl` que se elevan en hover, 3D en desktop (`useTarjeta3D`, `src/hooks/useTarjeta3D.jsx`, el mismo de las cards de producto), borde y halo con el color de su foto (`colores.json` también tiene estudio y reseñas), cortina (`RevealImagen`) en las fotos, cascada al entrar, títulos con `RevealText` + `ConDestellos` y palabra en cursiva dorada ("Nuestros *servicios*", "Lo que dicen *ellas*"), rulos que se dibujan con el scroll (`resenas`, `serviciosGrupo`).
  - Reseñas: comillas grandes doradas al 20% detrás del texto; las 5 estrellas se encienden una por una al entrar (`.estrella-resena`).
  - Servicios: el reloj del chip de duración gira una vez al entrar.
  - Mini Mar: destello en el globito.
- **Mini Mar en mobile = botón central del bottom nav** (`src/components/marca/MiniMarMobile.jsx`): Inicio, Tienda, [mini Mar], Rutina, Carrito, mismo espaciado y centrado exacto (mismo centro vertical que los otros ítems). Tocarlo NO abre WhatsApp: la figura (`mini-mar`) sube desde el botón con rebote suave y queda parada sobre la barra, a la derecha (recortada en el borde de la barra), señalando el botón "Escribile a Mar" (WhatsApp "¡Hola Mar! Tengo una consulta.") con el globito "¿Te ayudo a elegir?"; overlay arena 40% + blur. Se cierra tocando afuera, deslizando hacia abajo, con el botón central (muestra una X) o Esc. La primera vez de la sesión (sessionStorage `dh-asomo`), al bajar del hero o a los 8 s, asoma sola ~3 s hasta la cintura, sin overlay. Movimiento reducido: solo fades. La geometría se calcula con el ancho real (entra en 360px). En /producto no hay bottom nav (está la barra de "Agregar" con su botón de WhatsApp).
- **Mini Mar** (`src/components/marca/MiniMar.jsx`, SOLO DESKTOP ≥ 768px; en mobile la reemplaza el botón central): ilustración de Mar señalando el botón de WhatsApp ("¡Hola Mar! Tengo una consulta."), abajo a la derecha, pegada a los bordes (la imagen está cortada a la derecha y abajo). NO entra al cargar: en el home cuando el hero (`data-hero`) salió de pantalla (scroll > 70% de su alto); en páginas sin hero a los 300px de scroll o a los 8 s, lo que pase primero. Entra desde abajo con rebote, globito "¿Te ayudo a elegir?"; a los 6 s se achica al botón con su carita; hover o tocar la carita la vuelven a mostrar. Compacta, se esconde mientras se superpone con algo marcado `data-evitar-mini-mar` (mini-card de Skala del hero). Con el footer en pantalla se achica sola (no tapa sus links). Oculta con `data-overlay="abierto"` (carrito, quick view, filtros). Va dibujada en un `<canvas>`: como `<img>` pasaba a ser el elemento LCP de /carrito. Recorte: `assets/marca/mini-mar.png` (isnet-general-use de rembg, corrido con onnxruntime en Node, + limpieza del halo beige); `mini-mar-cara.png` (con transparencia) para el modo compacto y el botón central; original en `assets/marca/originales/` (ignorada).
- `main` tiene `min-h-svh`: mientras carga el chunk de una página el footer queda abajo del pliegue (si no, saltaba: CLS).
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
El modelo de Stitch tiene datos de relleno. **No usar como reales**: reseñas ("4.9, 142 reseñas"), testimonios, nombres de asesoras, dirección, horarios, número de WhatsApp, "estudio certificado", precios, cuotas, envíos gratis. Todo dato real lo da Mar; si falta, no se muestra (nada de placeholders visibles en el sitio). Las reseñas reales están en `src/data/resenas.js` (las mandó Mar).
Las fotos de personas (`personita*.jpg`) solo se publican si Mar confirma que tiene permiso de esas personas.

## Forma de trabajo
- Facu escribe en español rioplatense; responder en español, corto y concreto.
- Antes de cambios grandes: proponer plan breve y esperar OK.
- Commits chicos, en español, descriptivos. Rama `main`.
- No commitear `.env` ni claves. No hacer `git push` sin que Facu lo confirme.
- Facu prueba en localhost antes de dar por terminado algo.
