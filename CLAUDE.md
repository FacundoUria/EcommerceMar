# EcommerceMar — Dream Hair (The Curly Studio)

Tienda online de productos para pelo con rulos (método curly) de **Mar**, dueña de la peluquería Dream Hair (Mendoza, Argentina).
Desarrollador: Facu (FacundoUria). Repo: https://github.com/FacundoUria/EcommerceMar (público).

## Estado actual
**Fase 0 — Definición.** Todavía NO se programa. No crear código de la app, no instalar dependencias ni hacer scaffolding hasta que Facu lo pida explícitamente.

## Qué es (y qué NO es)
- La gente navega el catálogo, ve productos y precios, y arma un carrito.
- **No hay pago online.** El carrito es solo visual. El cobro lo maneja Mar por fuera de la web.
- No hay pasarela de pago (ni Mercado Pago, ni tarjetas), ni cuentas de usuario, ni stock en tiempo real, salvo que Facu lo pida.

## Decisiones pendientes (preguntar antes de asumir)
1. **Cierre del carrito:** ¿qué pasa cuando el cliente termina? (ej. botón que arma un mensaje de WhatsApp a Mar con el pedido y el total, o solo mostrar el resumen).
2. **Carga de productos y precios:** ¿quién los actualiza y cómo? (JSON en el repo que edita Facu / Google Sheet que edita Mar / panel admin). Los precios cambian seguido: es la decisión más importante.
3. **Turnos de peluquería:** ¿entra en esta web o solo un link a WhatsApp?
4. **Stack y hosting:** propuesta por defecto = React + Vite + Tailwind, deploy en Netlify desde `main` (mismo flujo que otros proyectos de Facu). Confirmar antes de usar.

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
