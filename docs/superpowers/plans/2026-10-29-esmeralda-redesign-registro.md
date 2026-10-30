# Rediseño Esmeralda nítida: registro de ejecución

Fecha: 2026-10-29 · Rama: `feat/esmeralda` · Plan: `2026-10-29-esmeralda-redesign.md`

Este documento reúne las decisiones que tomé durante la construcción donde el plan no alcanzaba o
estaba mal, y lo que el revisor final señaló sin que lo corrigiera. Cada decisión dice qué cuesta si
me equivoqué.

## Revisión final

Un revisor independiente leyó la rama entera. Veredicto: **listo con correcciones**. No encontró nada
crítico y marcó 3 problemas importantes. Corregí esos 3 y un cuarto que subí de categoría; cada
corrección empezó con un test que fallaba:

1. **XSS en el error de artículo.** Un enlace armado, como `/article/<img onerror=…>`, metía HTML en la
   página porque el slug llegaba por `innerHTML`. Ahora se pinta como texto. El fallo venía de antes del
   rediseño, pero se podía explotar en tu dominio.
2. **El sitemap cambiaba cada día.** Cada build fechaba todo con el día de hoy, en UTC, así que correr
   `npm test` otro día ensuciaba `sitemap.xml`. Ahora `lastmod` cambia solo cuando cambia la página
   (`content/lastmod.json`).
3. **Caso a medio traducir.** Si el inglés de un caso tenía una parte incompleta, se mostraba cortado.
   Ahora cae al español parte por parte.
4. **El artículo saltaba arriba.** Si ya estabas leyendo el artículo, te devolvía al principio al
   terminar de cargar. Lo subí de menor a importante porque pasaba en cada visita y lo causaba una
   decisión mía de la Tarea 9.

## Decisiones que tomé

**Preparación**
- Trabajé en la rama `feat/esmeralda` dentro de esta misma carpeta, sin una copia aparte, porque el plan
  nombraba la rama. Coste si me equivoqué: ninguno; la rama aísla `master`.

**Tarea 2: datos de proyectos**
- El plan esperaba 1 test pendiente y fueron 5, todos por la misma página de Agrosalas que llegó en la
  Tarea 7.
- `result` se omite en vez de dejarlo como lista vacía, porque el spec lo hace opcional.

**Tarea 4: carrusel y vista de proyecto**
- Las miniaturas van fuera del marco 16:10. Dentro, el `overflow` las recortaba.
- Las miniaturas usan la imagen de 600px, no la de 1440.
- Las flechas dan la vuelta al llegar al final, para que nunca quede una flecha que no hace nada.
- Las etiquetas de la ficha lateral son `<p>`, no títulos. `<h2>` estaba prohibido y `<h3>` saltaba un
  nivel.

**Tarea 5: base, barra y pie**
- Clave nueva `footer.top`, "Volver arriba", porque antes estaba solo en inglés.
- Se conservó la clase `animate-visible` que ya usaba `home.js`.
- Quité de `tokens.css` la frase "px de tipografía": los tamaños vienen de la maqueta y no hay escala
  tipográfica en tokens.

**Tarea 6: inicio**
- "WhatsApp · +51 924 262 747" no tiene clave i18n porque es igual en los dos idiomas.
- La etiqueta de sección dice "01 — Proyectos", como el spec, aunque la maqueta decía "Trabajo".
- `#navbar-container` lleva `display: contents`. Sin eso, la barra no quedaba fija al hacer scroll; lo
  vi en el navegador.
- En el `<noscript>`, cada título enlaza a la página de su proyecto.

**Tarea 7: página de proyecto**
- El contenedor mide 1108px y no 1060. Con 1060, la columna principal medía 632px en vez de los 680 del
  spec.
- `I18n.whenReady()`: el inicio y la página de proyecto esperan al diccionario antes de pintar. Antes
  aparecían claves como `project.back` durante un instante.
- El contador y las miniaturas del carrusel se actualizan al instante con flechas y miniaturas, y
  respetan el gesto si deslizas a mano.

**Tarea 8: experiencia**
- Los cargos de la línea de tiempo son `h2`, para mantener el orden de los títulos.
- `exp.cv.url` es la misma en los dos idiomas: es tu único CV en Drive.

**Tarea 9: blog**
- El artículo prerenderizado ya no se borra para mostrar "Cargando…" mientras carga.
- Las URLs de artículo llevan barra final también en el JS, como el canonical.
- Se oculta el primer `# Título` del markdown, porque todos repiten el título de la cabecera.
- La imagen para compartir el blog pasa a `profile.webp`. La anterior se borraba en la Tarea 10.
- Se quitó una `description` duplicada de la plantilla del blog.

**Tarea 10: limpieza**
- Borré 16 claves sin uso, las 4 capturas verticales de `shots/` y 11 JPG/PNG de respaldo que nada
  referenciaba. Siguen en el historial de git.
- La página de proyecto prerenderizada ya no se repinta en español, porque la galería parpadeaba al
  cargar.

## Lo que señaló el revisor y no corregí (menores)

**Contenido para ti**
- La captura de Quote Anime (`web_quote_anime.webp`) salió a mitad de una animación de entrada: la frase
  se ve muy tenue. Hay que volver a tomarla.
- Los años no coinciden: el banner dice "más de 6", Sobre mí dice "+5" y Experiencia dice "Seis años".
- Dos capturas de Neko Manga Cix (catálogo y producto) miden 1200px, un poco menos de lo ideal para
  pantallas retina.

**Técnicos**
- Si `en.json` no carga, se ven claves sueltas, y en una página de proyecto en inglés pueden reemplazar
  el español prerenderizado.
- El carrusel no desactiva el desplazamiento suave para quien pidió menos movimiento.
- El build se rompería con un artículo que contenga `$1` o `$&`. Hoy no hay ninguno.
- Sin JavaScript, los filtros de plataforma se ven pero no hacen nada.
- En inglés, el título de la pestaña del proyecto sigue en español.
- El botón Copiar puede quedarse en "Copiado" con un doble clic (venía de antes).
- La etiqueta accesible del botón de tema está fija en español (venía de antes).

## Lo que el revisor dejó fuera, y mi decisión

- **Sin JavaScript no hay barra ni pie.** Se queda así: es la arquitectura de antes, y los buscadores
  tienen el sitemap y los enlaces de cada página.
- **`?lang=en` entrega HTML en español a los buscadores.** Se queda así: es el diseño de i18n de antes y
  el spec dice no rehacerlo.
- **Se publican `docs/superpowers/`, `content/review.json` y la lista `_review`.** Es la configuración de
  despliegue de antes: cualquiera puede leer esos borradores y notas por URL. **Te lo señalo por si
  prefieres excluirlos.**
- **`marked` se carga desde la CDN sin versión fija.** Se queda así: viene de antes y no lo toqué.
- **El lector de pantalla no anuncia qué imagen de la galería se ve.** Se queda así: el spec pide botones
  con nombre y teclado, y ambos funcionan.
- **La lista de revisión vive en `content/review.json` y no dentro de `en.json`.** Se queda así: el spec
  permitía un campo equivalente.
- **Tu texto de Sobre mí (en Experiencia) menciona el anime como afición.** No lo cambié porque es tu
  voz, pero choca con la regla de "nada de anime visible".
