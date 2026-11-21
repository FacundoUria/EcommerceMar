# Performance: resultado

Optimización para celulares de gama baja **sin cambios visuales** (2026-11-19/20). Línea base, método y
herramientas en [performance-base.md](performance-base.md). Después de **cada** cambio: build, las mismas
capturas (390 y 1440 px, todas las páginas) comparadas píxel a píxel con la base (pixelmatch, umbral 0,05) y
métricas; si había diferencia visible o empeoraban las métricas, se revirtió.

## Resumen

- **Inicio** (la página más pesada): Lighthouse mobile **85 → 89**; en el perfil duro (CPU 6x + Fast 3G)
  **55 → 61**. La **tarea más larga al cargar** con CPU 6x + Fast 3G bajó de **980 a 526 ms** y el LCP real
  de 4,92 a 4,52 s.
- **Interacciones** con CPU 6x: "Agregar" 224 → 184 ms; abrir el chat 112 → 104 ms; abrir el carrito
  128 → 120 ms. El trabajo de JS al agregar (con el toast) bajó 22 %.
- **Scroll y arrastres** (trace con CPU 6x, mediana de 3): al scrollear el inicio, recálculo de estilos
  643 → 555 ms (−14 %); al arrastrar el carrusel, JS 874 → 717 ms (−18 %) y estilos 637 → 499 ms (−22 %). El
  pintado subió un poco (+8 % al scrollear, +4 % al arrastrar: pausar y reanudar los destellos repinta su
  SVG); el balance del hilo principal sigue siendo favorable (−55 ms en el scroll). En esta PC ya iban a 60
  fps antes y siguen igual: sin frames de más de 50 ms.
- **Visual**: 11 de 12 capturas idénticas píxel a píxel a la base. La otra (inicio 390) difiere en el
  **rasterizado del logo del header** (ver más abajo).
- **Accesibilidad**: 100 en todas las páginas (igual que antes).

## Antes y después

### Lighthouse mobile (perfil estándar: CPU 4x, 4G lento simulado; mediana de 3)

| Página | Performance | Accesibilidad | FCP | LCP | TBT | CLS | Speed Index | Peso |
|---|---|---|---|---|---|---|---|---|
| Inicio | 85 → **89** ✅ | 100 → **100** | 2071 ms → **1803 ms** ✅ | 3898 ms → **3572 ms** ✅ | 109 ms → **74 ms** ✅ | 0 → **0** | 2784 ms → **2714 ms** ✅ | 558 KB → **560 KB** 🔺 |
| Productos | 88 → **88** | 100 → **100** | 1802 ms → **1803 ms** 🔺 | 3680 ms → **3680 ms** | 86 ms → **85 ms** ✅ | 0 → **0** | 1973 ms → **1973 ms** | 475 KB → **469 KB** ✅ |
| Producto | 87 → **88** ✅ | 100 → **100** | 1878 ms → **1878 ms** | 3829 ms → **3754 ms** ✅ | 30 ms → **31 ms** 🔺 | 0 → **0** | 2257 ms → **2205 ms** ✅ | 523 KB → **516 KB** ✅ |
| Rutina | 93 → **92** 🔺 | 100 → **100** | 1802 ms → **1802 ms** | 3079 ms → **3153 ms** 🔺 | 25 ms → **26 ms** 🔺 | 0.01 → **0.01** | 1802 ms → **1802 ms** | 378 KB → **371 KB** ✅ |
| Servicios | 92 → **91** 🔺 | 100 → **100** | 1802 ms → **1802 ms** | 3229 ms → **3377 ms** 🔺 | 16 ms → **27 ms** 🔺 | 0 → **0** | 1925 ms → **1917 ms** ✅ | 432 KB → **426 KB** ✅ |
| Carrito | 94 → **94** | 100 → **100** | 1802 ms → **1803 ms** 🔺 | 2854 ms → **2854 ms** | 27 ms → **24 ms** ✅ | 0 → **0** | 1802 ms → **1803 ms** 🔺 | 344 KB → **338 KB** ✅ |

### Lighthouse mobile — perfil duro (CPU 6x + Fast 3G simulado)

| Página | Performance | Accesibilidad | FCP | LCP | TBT | CLS | Speed Index | Peso |
|---|---|---|---|---|---|---|---|---|
| Inicio | 55 → **61** ✅ | 100 → **100** | 4503 ms → **4784 ms** 🔺 | 7273 ms → **6763 ms** ✅ | 396 ms → **215 ms** ✅ | 0 → **0** | 4503 ms → **4784 ms** 🔺 | 558 KB → **560 KB** 🔺 |
| Productos | 61 → **61** | 100 → **100** | 4503 ms → **4784 ms** 🔺 | 7600 ms → **7599 ms** ✅ | 211 ms → **204 ms** ✅ | 0 → **0** | 4503 ms → **4784 ms** 🔺 | 475 KB → **469 KB** ✅ |
| Producto | 62 → **62** | 100 → **100** | 4784 ms → **4785 ms** 🔺 | 7599 ms → **7319 ms** ✅ | 142 ms → **139 ms** ✅ | 0 → **0** | 4784 ms → **4785 ms** 🔺 | 523 KB → **516 KB** ✅ |
| Rutina | 65 → **64** 🔺 | 100 → **100** | 4503 ms → **4783 ms** 🔺 | 6754 ms → **6754 ms** | 79 ms → **83 ms** 🔺 | 0.01 → **0.01** | 4503 ms → **4783 ms** 🔺 | 378 KB → **371 KB** ✅ |
| Servicios | 65 → **64** 🔺 | 100 → **100** | 4502 ms → **4783 ms** 🔺 | 6753 ms → **6754 ms** 🔺 | 100 ms → **91 ms** ✅ | 0 → **0** | 4502 ms → **4783 ms** 🔺 | 432 KB → **426 KB** ✅ |
| Carrito | 65 → **65** | 100 → **100** | 4502 ms → **4784 ms** 🔺 | 6753 ms → **6754 ms** 🔺 | 64 ms → **60 ms** ✅ | 0 → **0** | 4502 ms → **4784 ms** 🔺 | 344 KB → **338 KB** ✅ |

### Carga real (Chrome, CPU 6x + Fast 3G, 390 px; mediana de 3)

| Página | LCP | Tareas largas (> 50 ms) | TBT real | Tarea más larga |
|---|---|---|---|---|
| Inicio | 4920 ms → **4524 ms** ✅ | 5 → **4** ✅ | 1160 ms → **1109 ms** ✅ | 980 ms → **526 ms** ✅ |
| Productos | 4892 ms → **4832 ms** ✅ | 6 → **6** | 901 ms → **831 ms** ✅ | 499 ms → **465 ms** ✅ |

### INP aproximado (CPU 6x; duración del evento más lento de la interacción; mediana de 3)

| Interacción | Duración |
|---|---|
| Tocar "Agregar" en una card (/tienda) | 224 ms → **184 ms** ✅ |
| Abrir el chat (botón central) | 112 ms → **104 ms** ✅ |
| Abrir el carrito (header) | 128 ms → **120 ms** ✅ |

### Frames (Chrome con ventana, CPU 6x, 390 px; monitor de 179 Hz)

| Gesto | FPS | Frame p95 | Frames > 33 ms | Frames > 50 ms | Long animation frames > 50 ms |
|---|---|---|---|---|---|
| Scroll del inicio (4500 px) | 156.3 → **170.6** ✅ | 11.2 ms → **11.1 ms** ✅ | 0 → **0** | 0 → **0** | 0 → **0** |
| Arrastrar el carrusel de favoritos (3 veces) | 89.6 → **84.9** 🔺 | 16.7 ms → **16.8 ms** 🔺 | 0 → **0** | 0 → **0** | 0 → **0** |
| Arrastrar el mazo de banners (3 swipes) | 162 → **168.7** ✅ | 11.1 ms → **11.1 ms** | 0 → **0** | 0 → **0** | 0 → **0** |


### Dos lecturas de la tabla

- **FCP del perfil duro (+281 ms en casi todas las páginas)**: es un artefacto del modelo de red *simulado*
  de Lighthouse, no algo que pase en el navegador. Antes del primer pintado se piden exactamente los mismos
  archivos, en el mismo orden y con la misma prioridad; lo único que cambia es que `comun` pasó de 50,8 a
  53,3 KB comprimido (ahora incluye componentes que comparten las secciones diferidas del inicio y las demás
  páginas) y en el modelo de arranque lento de TCP cruzó un umbral: suma justo media latencia (562,5 / 2).
  Medido en Chrome con CPU 6x + Fast 3G **aplicados** (no simulados), mediana de 5:

  | Página | FCP real | LCP real |
  |---|---|---|
  | Carrito | 1660 → 1656 ms | 3464 → **3408 ms** |
  | Rutina | 1656 → 1656 ms | 4508 → **4468 ms** |
  | Servicios | 1648 → 1652 ms | 4948 → **4904 ms** |

- **Rutina y servicios −1 punto en el perfil estándar**: dentro de la variación de Lighthouse entre
  corridas (no se tocaron esas páginas; su LCP real mejoró, tabla de arriba).

## Cambios, uno por uno

| # | Cambio | Resultado | Decisión |
|---|---|---|---|
| O1 | Rulos: escuchar el scroll solo cerca de la pantalla (IntersectionObserver) | Diferencia en capturas: los rulos de la rutina quedaban dibujados al volver arriba de golpe (la capa ya estaba fuera de pantalla y no se enteraba del salto). Métricas sin cambio | **Revertido** |
| O1b | Rulos: un solo listener de scroll y un solo rAF para todas las instancias; primero se leen todas las cajas y después se escriben los trazos | Capturas idénticas. Trabajo de scroll igual dentro del ruido (JS 154 → 144 ms) | Aplicado (neutro en la PC de prueba) |
| O2 | Carrusel: leer todas las posiciones y después escribir las escalas (sin lecturas intercaladas con escrituras) | Capturas idénticas. Arrastre del carrusel: JS 907 → 855 ms, estilos 657 → 618 ms, rAF 850 → 803 ms | Aplicado |
| O3 | Contextos de acciones (`useCartAcciones`, `useUIAcciones`): las cards, /producto, /rutina, el toaster y las líneas del carrito ya no se re-renderizan cuando cambia el carrito o aparece un toast | Capturas idénticas. JS al tocar "Agregar" en /tienda (con el toast): 374 → 292 ms (−22 %). La duración del primer evento (INP) no cambia: la domina el vuelo al carrito | Aplicado |
| O4 | Destellos en pausa fuera de pantalla (IntersectionObserver → `data-pausa`), salvo el del logo del header | Capturas idénticas (2 corridas). Scroll: estilos 645 → 556 ms. Arrastre del carrusel: JS 855 → 723 ms, estilos 618 → 493 ms | Aplicado |
| O4b | Manchas del mesh sin `will-change` mientras están en pausa (liberar capas de GPU) | Cambiaba el rasterizado del logo del header (Chrome reagrupa las capas): 212 px distintos | **Revertido** |
| O5 | Slides de los carruseles sin `will-change` fuera de pantalla (liberar ~25 capas de GPU) | Cambiaba el rasterizado del carrusel "Completá tu rutina" en /producto (5353 px) y el del logo; el trabajo no mejoró | **Revertido** |
| O6 | Mini Mar desktop en un chunk aparte, pedido después del `load` y solo en desktop | Capturas idénticas. JS principal 337 → 331 KB (sin comprimir); en mobile ya no se parsea. Lighthouse inicio 85 → 86, abrir carrito 128 → 112 ms (ruido). Verificado que entra y abre el chat | Aplicado |
| O7 | Imágenes: `fetchpriority="high"` solo en la foto del LCP (en /tienda la tenían las 4 primeras cards); las otras 3 siguen `eager` | Capturas idénticas. LCP real de /tienda (CPU 6x + Fast 3G) 4892 → 4832 ms (al borde del ruido; Lighthouse simulado no modela fetchpriority). Revisados también `sizes`/`decoding`: SmartImg ya mide el ancho real de su caja y usa `decoding=async` salvo en las prioritarias | Aplicado |
| O8 | Gama baja (≤ 4 núcleos o ≤ 4 GB): mesh con `steps()` (saltitos de ~2 px, ~3 por segundo) y destellos más espaciados | Capturas idénticas, pero sin ganancia: con gama baja forzada el compositor dibuja igual 540 frames en 3 s (uno por vsync); Chrome redibuja cada frame mientras haya una animación corriendo, aunque avance de a saltos. Cambiaba el movimiento sin ahorrar trabajo | **Revertido** |
| O9 | Inicio: lo de abajo del pliegue (favoritos, cinta, rutina, "Hola, soy Mar", reseñas, banners) en un chunk aparte (`HomeResto`), pedido apenas se monta el hero y con `modulepreload` en "/" | Tarea más larga de la carga 980 → 509 ms; LCP real 4920 → 4532 ms; Lighthouse inicio 85 → 89 (LCP 3898 → 3573, TBT 109 → 75). Capturas: iguales salvo el **rasterizado del logo del header** (mismo archivo LOGO-96.webp, mismo tamaño y lugar; Chrome lo dibuja por otro camino de capas en algunas corridas: 168/212 px con remuestreo distinto, no se distingue a tamaño real; ver recorte). Efecto secundario: con Fast 3G + CPU 6x las secciones de abajo están ~0,5 s más tarde (4,0 → 4,6 s), debajo del pliegue | Aplicado (con la nota del logo para que decidas) |
| O10 | `content-visibility: auto` (+ `contain-intrinsic-size`) en las secciones de abajo del pliegue del inicio | 8–10 % de los píxeles del inicio distintos (la contención de pintado recorta decoraciones que salen de cada sección y cambia el layout entre secciones) y sin mejora de trabajo (los rulos miden su caja en cada scroll y eso obliga a renderizar las secciones salteadas) | **Revertido** |

### Lo que ya estaba bien (revisado, sin cambios)

- **Listeners de scroll**: todos pasivos. Ninguno hace `preventDefault`.
- **Pestaña oculta**: las animaciones CSS y los `requestAnimationFrame` los pausa el navegador; los tres
  autoplay con `setInterval` (barra de anuncio, mazo de banners, carruseles) ya miraban `document.hidden`.
- **Loops fuera de pantalla**: el hero, las manchas del mesh, la barra de anuncio y la cinta de marcas ya se
  pausaban fuera de pantalla (`usePausaFueraDePantalla`, del arreglo del mazo); ahora también los destellos.
- **Mazo de banners**: ya arrastraba con pointer events + rAF (transform directo en el DOM, sin setState),
  vuelo con WAAPI, `will-change` solo durante el arrastre y las cartas de atrás quietas. Los carruseles
  (Embla) mueven con `transform` y no hacen setState por movimiento.
- **Imágenes**: `SmartImg` mide el ancho real de su caja para `sizes`, usa `decoding="async"` y
  carga diferida salvo en las prioritarias.

### Ideas que no se aplicaron (y por qué)

- **Brillo dorado de "amor propio"** (hero): anima `background-position` y obliga a repintar en cada frame
  mientras el hero se ve. No hay forma compuesta (solo transform/opacity) de mover un brillo recortado a las
  letras sin cambiar cómo se ve. Ya está en pausa fuera de pantalla.
- **`backdrop-filter` de las mini-cards del hero** (flotan con blur detrás): sacarlo o pre-renderizarlo
  cambia el aspecto.
- **`will-change` "solo mientras animan"** en capas que hoy lo tienen fijo (manchas, slides): se probó dos
  veces (O4b, O5) y en las dos Chrome reagrupó las capas y cambió el rasterizado de otros elementos.

## La diferencia que queda: el logo del header (inicio, 390 px)

Con las secciones del inicio diferidas (O9), en algunas corridas Chrome dibuja el **logo del header** por
otro camino de capas: es el mismo archivo (`LOGO-96.webp`), del mismo tamaño y en el mismo lugar, pero el
remuestreo de algunos píxeles del borde queda apenas distinto (168 px en 390, 212 px en 1440; en la última
corrida, solo en 390). A tamaño real no se distingue; ampliado 8x se ve así (izquierda base, derecha final):

![Logo del header, base vs. final](performance/logo-header-base-vs-final.webp)

Se dejó porque O9 es el cambio que más mejora la carga (la tarea más larga pasa de ~1 s a ~0,5 s). Si
preferís cero diferencias, alcanza con revertir el commit `4ba88b2` (todo lo demás no depende de él).

## Comparación píxel a píxel final

| Captura | Píxeles distintos vs. la base |
|---|---|
| inicio 390 | 168 (0,009 %) — logo del header, ver arriba |
| inicio 1440 | 0 |
| productos 390 / 1440 | 0 / 0 |
| producto 390 / 1440 | 0 / 0 |
| rutina 390 / 1440 | 0 / 0 |
| servicios 390 / 1440 | 0 / 0 |
| carrito 390 / 1440 | 0 / 0 |

Capturas finales (webp a la mitad del tamaño) en `docs/performance/final/`; las de la base, en
`docs/performance/base/`:

- [carrito-1440.webp](performance/final/carrito-1440.webp) · [base](performance/base/carrito-1440.webp)
- [carrito-390.webp](performance/final/carrito-390.webp) · [base](performance/base/carrito-390.webp)
- [inicio-1440.webp](performance/final/inicio-1440.webp) · [base](performance/base/inicio-1440.webp)
- [inicio-390.webp](performance/final/inicio-390.webp) · [base](performance/base/inicio-390.webp)
- [producto-1440.webp](performance/final/producto-1440.webp) · [base](performance/base/producto-1440.webp)
- [producto-390.webp](performance/final/producto-390.webp) · [base](performance/base/producto-390.webp)
- [productos-1440.webp](performance/final/productos-1440.webp) · [base](performance/base/productos-1440.webp)
- [productos-390.webp](performance/final/productos-390.webp) · [base](performance/base/productos-390.webp)
- [rutina-1440.webp](performance/final/rutina-1440.webp) · [base](performance/base/rutina-1440.webp)
- [rutina-390.webp](performance/final/rutina-390.webp) · [base](performance/base/rutina-390.webp)
- [servicios-1440.webp](performance/final/servicios-1440.webp) · [base](performance/base/servicios-1440.webp)
- [servicios-390.webp](performance/final/servicios-390.webp) · [base](performance/base/servicios-390.webp)

## Para más adelante

- Probar en un celular de gama baja real (el throttling de DevTools frena la CPU pero no la GPU).
- Si se agregan secciones al inicio debajo del pliegue, que vayan en `HomeResto.jsx`.

## Fase 2: catálogo desde Supabase (2026-11-21)

Mismo método que arriba (build servido con brotli, Lighthouse mobile estándar mediana de 3, capturas
390/1440 congeladas + pixelmatch). Base: commit `dffefd6` (catálogo estático en el bundle). Lighthouse mide
siempre una **primera visita** (sin copia en localStorage): la página espera a Supabase (hasta 3 s).

| Página | Base | supabase-js completo | **postgrest-js + preconnect (final)** |
|---|---|---|---|
| Inicio | 87 | 86 | **87** |
| Productos | 85 | 83 | **87** |
| Producto | 88 | 83 | **85** |
| Rutina | 92 | 86 | **90** |
| Carrito | 94 | 92 | **93** |
| Servicios | 92 | 87 | **88** |

- **supabase-js completo** (chunk de 56 KB gzip, precargado en la primera visita): FCP +150 ms en todas las
  páginas (compite con el JS principal) y /rutina −6. **Descartado**.
- **Final**: `@supabase/postgrest-js` (el cliente de consultas de supabase-js, chunk de 5 KB gzip) +
  `preconnect` a Supabase + `modulepreload` del chunk solo sin copia guardada. Peor caso: servicios −4.
  Accesibilidad 100 en todas. En visitas con copia el catálogo se pinta desde localStorage (~150 ms en la
  prueba), sin esperar la red.
- **Capturas**: 0 px en todas, comparando en igualdad de condiciones. La única diferencia es el **rasterizado
  del logo del header** en la primera visita al inicio (168 px en 390, 212 px en 1440, mismo artefacto que
  en O9); con el catálogo ya cargado da 0 px. /producto 390 varía su ancho de captura entre corridas
  (390–399 px, ya pasaba): con el mismo ancho, 0 px.
- **Comportamiento** (Playwright): primera visita desde Supabase y guarda la copia; segunda visita desde la
  copia + revalidación; Supabase caído → respaldo local en ~290 ms (con los reintentos de postgrest-js
  tardaba 3,5 s: se apagaron); Supabase lento (5 s) → respaldo a los 3 s y la copia se guarda cuando llega;
  copia vieja → precio y descripción viejos al instante y se corrigen solos (también el carrito); producto
  que no está en la copia → espera a Supabase sin mostrar "No encontrado"; producto oculto → "No encontrado".
- **Datos**: lo que devuelve el service es idéntico (comparación profunda) entre la versión vieja, el
  respaldo local nuevo y Supabase: 51 productos, 12 categorías, 8 servicios, 3 grupos, 16 marcas,
  47 descripciones.

## Fase 2, etapa 2: panel /admin (2026-11-21)

Mismo método. "Etapa 1" = lo que está en `main` antes del panel; "Original" = antes de Supabase.

| Página | Original | Etapa 1 | **Etapa 2** |
|---|---|---|---|
| Inicio | 87 | 87 | **88** |
| Productos | 85 | 87 | **85** |
| Producto | 88 | 85 | **85** |
| Rutina | 92 | 90 | **90** |
| Carrito | 94 | 93 | **93** |
| Servicios | 92 | 88 | **87** |

- **JS de la tienda igual**: `comun` + `index` = 150,56 KB gzip (antes 150,57). El respaldo JSON reemplazó a
  products.js en el bundle. El panel (68 KB gzip, con supabase-js completo) es un chunk que solo baja /admin.
- **Descartado**: react-router data router (`createBrowserRouter` + `useBlocker`) en el panel: como react-router
  es un módulo compartido, todo ese código cayó en `comun` (+19 KB gzip que bajaba el home). El panel usa un
  ruteo propio de 80 líneas (`src/admin/ruta.jsx`).
- CSS +0,7 KB gzip (clases del panel: Tailwind genera un solo CSS para todo el sitio).
- **Capturas**: 0 px en todas en igualdad de condiciones (mismo ancho de captura en /producto 390; catálogo ya
  cargado en el inicio). Diferencias restantes: el rasterizado del logo del header en la primera visita al inicio
  (168/212 px, igual que en la etapa 1) y en productos-1440 con el catálogo cargado (232 px en el logo y la
  miniatura de un chip; dos capturas de la misma base difieren en 12.857 px ahí).
- **Datos**: idénticos al catálogo original desde el respaldo JSON y desde Supabase (51 productos, 12 categorías,
  8 servicios, 3 grupos, 16 marcas, 47 descripciones) y los pasos de la rutina derivados del campo `paso` dan
  exactamente los de `PASOS_RUTINA`.
