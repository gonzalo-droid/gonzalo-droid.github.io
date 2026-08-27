# Rediseño del portafolio — diseño

Fecha: 2026-08-27
Estado: aprobado, pendiente de plan de implementación

## Objetivo

Convertir el portafolio en una herramienta para conseguir empleo remoto/internacional
como Android/Mobile Developer.

Todo lo que sigue se subordina a ese objetivo: si una decisión de diseño no ayuda a que
un recruiter entienda quién es Gonzalo, qué sabe hacer y cómo contactarlo, no entra.

## Punto de partida

El sitio actual es el template *iPortfolio* de BootstrapMade con contenido propio encima.
Los problemas que motivan este trabajo, en orden de gravedad:

1. **`[data-animate] { opacity: 0 }` sin fallback.** Media página depende de que el
   IntersectionObserver dispare. Si el JS falla, el visitante ve un hero y nada más.
   Reproducido con scroll programático.
2. **Los 11 artículos son URLs muertas para Google.** `sitemap.xml` las declara; GitHub
   Pages responde `404` real y el redirect ocurre después en el navegador.
3. **`content/articles/clean-architecture.md` está vacío** (1 byte) y aun así figura
   publicado y en el sitemap.
4. **No hay sistema de diseño.** 2.307 líneas de CSS con valores mágicos, tres familias
   tipográficas sin roles, y dos temas que son paletas sin relación entre sí.
5. **El hero no comunica nada** más que un nombre sobre un wallpaper.
6. **Los proyectos no tienen página propia**; todo se apila dentro de la tarjeta.
7. **La sección de contacto no permite contactar**: cuatro links sociales, sin email.
8. **Código y clases muertas**: `initStatsCounter()` anima un markup que no existe;
   `class="instagram"` en el botón de CV y `class="google-plus"` en el link de GitHub.

## Decisiones

| Decisión | Elección |
|---|---|
| Objetivo | Empleo remoto/internacional |
| Dirección visual | Mecha — negro, naranja, morado, grilla técnica, formas angulares |
| Estructura de la home | Showcase — capturas de apps en el hero, proyectos protagonistas |
| Hero | Sin métricas · con badge "Disponible para remoto" |
| Idioma | ES/EN en UI, home y proyectos; artículos solo en español |
| Stack | Sin build step obligatorio · fuera Bootstrap, se quedan Bootstrap Icons |
| Proyectos | Agrupados por producto (11 → 7) · tarjeta compacta + `/project/<slug>` |
| Blog | Curado · HTML generado por script manual para el SEO |
| Contacto | Email visible + botón copiar · CV en PDF servido desde el sitio, uno por idioma |
| Tema | Sigue la preferencia del sistema; ambos temas diseñados con el mismo cuidado |
| Imágenes | Recortar las capturas de los gráficos de Play Store y montarlas en marcos CSS |

Se dejó constancia de que la estructura Showcase retrasa el momento en que el visitante
sabe quién es Gonzalo, lo cual está en tensión con el objetivo de empleo. Gonzalo lo
confirmó tras plantearle el riesgo. Se compensa metiendo nombre, rol y badge de
disponibilidad **dentro** del hero de capturas, no debajo.

---

## 1. Sistema de diseño

Reemplaza los valores mágicos por tokens en `assets/css/tokens.css`.

### Color

Un solo sistema con dos temas. Cada token cumple el mismo rol en ambos.

**Oscuro**

| Token | Valor | Contraste sobre `--bg` |
|---|---|---|
| `--bg` | `#0E1013` | — |
| `--surface` | `#16191E` | — |
| `--border` | `#262A32` | — |
| `--border-strong` | `#3A3E48` | — |
| `--text` | `#E8E9EC` | 15.69:1 |
| `--text-muted` | `#8A8E99` | 5.82:1 |
| `--accent` | `#FF6B35` | 6.72:1 |
| `--accent-2` | `#8570FF` | 5.23:1 |

**Claro**

| Token | Valor | Contraste sobre `--bg` |
|---|---|---|
| `--bg` | `#F5F5F3` | — |
| `--surface` | `#FFFFFF` | — |
| `--border` | `#E3E2DE` | — |
| `--text` | `#0E1013` | 17.45:1 |
| `--text-muted` | `#5C616C` | 5.69:1 |
| `--accent` | `#BE4517` | 4.75:1 |
| `--accent-2` | `#5A3FD6` | 6.17:1 |

El acento cambia de tono entre temas por contraste: `#FF6B35` sobre el fondo claro da
2.84:1, que no cumple AA. `#BE4517` conserva la lectura "naranja Mecha" y cumple.

Todos los ratios de estas tablas están calculados con la fórmula WCAG 2.1, no estimados.
El mínimo del sistema es 4.5:1 (AA texto normal) para cualquier token que llegue a
pintar texto. Dos valores se ajustaron respecto al primer borrador precisamente por esto:
el naranja claro pasó de `#C4491A` (4.46, fallaba por poco) a `#BE4517`, y el morado
oscuro de `#7B61FF` (4.53, al límite) a `#8570FF`. El texto de los botones primarios es
`#0E1013` sobre `--accent`: 6.72:1.

### Tipografía

Dos familias con roles, en lugar de las tres actuales sin criterio:

- **Archivo** (variable, con eje de ancho) — titulares e interfaz.
- **JetBrains Mono** — exclusivamente etiquetas técnicas, metadatos y chips.

Se retiran Open Sans, Raleway y Poppins.

Escala fluida con `clamp()`, lo que elimina los `@media` por titular:

| Rol | Tamaño |
|---|---|
| display | `clamp(2.75rem, 8vw, 5.5rem)` |
| h1 | `clamp(2rem, 5vw, 3.25rem)` |
| h2 | `clamp(1.5rem, 3vw, 2.25rem)` |
| h3 | `1.25rem` |
| body | `1rem` / `1.65` |
| small | `0.875rem` |
| label (mono) | `0.6875rem`, `letter-spacing: .16em`, mayúsculas |

Los titulares de display y h1 van en mayúsculas con `letter-spacing` negativo.
Esto corrige de paso el `font-size: 64px / line-height: 56px` actual.

### Espaciado y forma

- Escala base 4: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128` como `--sp-1 … --sp-10`.
  Reemplaza el `padding: 60px 0` idéntico en todas las secciones; el ritmo vertical pasa
  a variar según la sección.
- Radios: solo `0` y `4px`. Mecha es angular; desaparece el `border-radius: 50px`.
- Botón primario: esquina inferior derecha cortada a 9px vía `clip-path`.
- Fondo de grilla técnica de 26px en el hero, y cortes a 45° en `--accent-2`.
- Sin degradados salvo los velos de la grilla.

### Movimiento

- Transiciones de 150–250ms `ease-out`.
- **Las animaciones de scroll van dentro de `@media (prefers-reduced-motion: no-preference)`.**
  El estado por defecto de cualquier elemento es visible. Esto cierra el problema 1.

---

## 2. La home

Orden de arriba a abajo: **hero → proyectos → sobre mí → experiencia → blog → contacto**.

### Hero

Dentro del propio hero, sobre fondo de grilla:

- Badge "Disponible para remoto" (verde, con punto).
- Nombre en display, mayúsculas, dos líneas.
- Línea de rol y stack: *Android Developer · Kotlin · Compose · KMM*.
- Una frase de contexto: 5 años, producción, banca.
- CTAs: **Ver proyectos** (primario) y **CV.pdf** (secundario).
- Tira de 4 teléfonos con capturas de las apps, el central más grande.

Sin métricas numéricas.

### Proyectos

Los 11 proyectos actuales se agrupan por producto y quedan **7**:

| Proyecto | Plataformas | Imágenes disponibles |
|---|---|---|
| Quote Anime | Android, iOS | `app_quote_anime` |
| AutoTest Licencia | Android | `app_autotest` |
| CixCash App | KMM | `app_cixcash` |
| Note.AI | Android | `app_noteai` |
| U-Learning | Android, iOS, Web | `app_ulearning`, `app_ulearning_ios`, `web_ulearning` |
| Solti-CRM | Android, Web | `app_crm`, `web_crm` |
| Admin Lotes | Android, Web | `app_erp`, `web_erp` |

La tarjeta pasa de muro de texto a: imagen + badge de plataforma + título + una línea +
tres chips. Todo lo demás se mueve a la página de detalle.

Los filtros actuales (Todos / Android / iOS / KMM / Web) se conservan.

### Sobre mí

Foto, dos párrafos (el profesional y el personal, incluido Neko Manga Cix) y la nube de
tecnologías. Se mantiene el contenido actual.

### Experiencia

El timeline actual, redibujado en lenguaje Mecha: línea vertical, marcadores en rombo
naranja, año en mono a la izquierda.

### Blog

Las tres entradas más recientes, con fecha y tiempo de lectura, y enlace a `/articles`.

### Contacto

Bloque con barra de acento a la izquierda: `gonzalo.lozg@gmail.com` con botón **Copiar**,
y **Descargar CV** como acción primaria. Las redes bajan a una línea discreta en mono.
Se elimina la duplicación de LinkedIn/GitHub entre hero y contacto.

---

## 3. Páginas internas

### `/project/<slug>` — nueva

Migas de pan · título · metadatos (plataformas, años, empresa, rol) · tira de capturas
móvil y web · y luego:

1. **El problema** — qué necesitaba resolver el producto.
2. **Qué hice** — lista de lo construido.
3. **Decisiones técnicas** — por qué esta arquitectura, qué salió mal, qué haría distinto.
4. Chips de stack.
5. Links a stores y web.

**Reparto de la escritura.** Los bloques 1 y 2 los redacta esta implementación,
reordenando y ampliando el contenido que ya existe en las tarjetas actuales: es material
de Gonzalo, solo mal presentado.

El bloque 3 **no se inventa**. Nadie salvo Gonzalo sabe por qué eligió MVVM en U-Learning
o qué se complicó en CixCash, y un texto inventado lo dejaría defendiendo en una
entrevista una decisión que nunca tomó. Por eso el campo `decisiones` de
`content/projects.json` es **opcional**: si viene vacío, la página no renderiza la
sección y se ve completa igual. Se rellena cuando Gonzalo tenga material, empezando por
Quote Anime y U-Learning, que son los que un recruiter abrirá primero.

### `/articles` — lista

Hereda el aire de la home: grilla de tarjetas con portada, filtros por tag (ya existen
en `articles.js`), fecha y tiempo de lectura.

### `/article/<slug>` — rediseñada

Añade índice lateral generado desde los `h2` del Markdown, tiempo de lectura calculado,
bloques de código con barra en `--accent-2`, y **artículos relacionados** al final por
tags compartidos. Hoy el lector llega al pie y no tiene a dónde ir.

---

## 4. SEO del blog y de los proyectos

`npm run build:pages` — script Node, sin dependencias nuevas, que se corre a mano al
publicar contenido.

Lee `content/articles.json` y el nuevo `content/projects.json`, y genera un `index.html`
real en `article/<slug>/` y `project/<slug>/`, cada uno con `<title>`, meta description,
Open Graph y Twitter Card escritos en el HTML.

El cuerpo se sigue renderizando en cliente con marked.js igual que ahora. El script solo
garantiza que la URL exista y responda `200`.

Propiedades:

- No se toca el workflow de deploy.
- Si el script no se corre, el sitio se comporta exactamente como hoy (el `404.html`
  sigue haciendo su redirect). Es una mejora aditiva, no un punto de fallo.
- El `404.html` deja de ser la ruta normal para artículos y vuelve a ser solo un 404.

## 5. Internacionalización

Dos idiomas, ES por defecto.

- Todo el copy de UI, home y páginas de proyecto sale a `content/i18n/{es,en}.json`.
- Selector ES/EN en la navbar; la elección persiste en `localStorage` junto al tema.
- Los artículos quedan en español y se marcan con su idioma en la ficha.
- `<html lang>` se actualiza al cambiar de idioma.

## 6. Limpieza técnica

- Se retira Bootstrap 5 (CDN). La grilla pasa a CSS Grid/Flexbox nativo; hay que
  reescribir las clases `col-lg-*` del HTML. Bootstrap Icons se mantiene.
- Se borra `initStatsCounter()` de `home.js`: anima `.stat-number[data-count]`, markup
  que no existe en ninguna página.
- Se eliminan las clases heredadas del template usadas como semántica: `.instagram` en
  el botón de CV, `.google-plus` en el link de GitHub.
- El enlace de política de privacidad del footer está vacío:
  `<a href="/privacy-policy" target="_blank"></a>`, sin texto dentro
  (`assets/js/components/footer.js:16`). Es invisible e inaccesible en todo el sitio.
  Se le pone texto.
- `CLAUDE.md` afirma que `generateSlug()` está duplicada en `home.js`, `articles.js` y
  `article.js`. **Es falso**: la función vive solo en `utils.js:5` y las tres páginas la
  consumen desde ahí. Ese apunte se corrige en `CLAUDE.md` en lugar de "arreglar" un
  problema inexistente.
- El CV pasa de ser un enlace a una carpeta de Drive a PDFs servidos desde el sitio.

### CV

Dos archivos en la raíz: `cv-es.pdf` y `cv-en.pdf`. El botón sigue al idioma activo, y
**cae al que exista si falta el otro**, de modo que se puede publicar uno solo sin
provocar un 404.

Dos acciones, que es lo que se pidió (previsualizar y descargar) sin iframe ni terceros:

```html
<a href="/cv-en.pdf" target="_blank">Ver CV</a>
<a href="/cv-en.pdf" download="Gonzalo-Lopez-CV.pdf">Descargar</a>
```

Motivo de no seguir con Drive: su endpoint de descarga devuelve `application/octet-stream`,
así que el navegador no previsualiza y el archivo baja con el nombre que Drive decida;
además el enlace deja de funcionar en silencio si cambian los permisos o se mueve el
archivo. El enlace actual se verificó y responde `200`, así que la alternativa era viable
— se descarta por esos dos costes, no por no funcionar.

El de inglés es la fuente de verdad; el español se actualiza a partir de él.

**Pendiente de Gonzalo:** aportar los PDFs, o autorizar su descarga desde Drive.

## 7. Curación del blog

Estado actual: 11 artículos, todos con la misma portada (`app_noteai.webp`), fechas
mezcladas entre 2024 y 2026, y duplicados temáticos.

- **Se despublica** `clean-architecture.md` (archivo vacío, 1 byte).
- **Duplicados a resolver**, quedándose con la versión más extensa de cada par:
  - *Introducción a Jetpack Compose* (1.670 car.) vs *Jetpack Compose: El futuro de la UI* (4.478 car.)
  - *Coroutines y Flow en Android* (2.183 car.) vs *Coroutines: Programación asíncrona moderna* (4.185 car.)
- **Se despublica** `welcome.md` (565 car., sin valor para un recruiter).
- Los despublicados salen de `articles.json` y del `sitemap.xml`, pero **se conservan en
  el repositorio** para poder retomarlos.
- Los que quedan necesitan portada propia. Se genera una portada tipográfica por artículo
  en lenguaje Mecha, para no depender de imágenes de stock.

Quedan **7 artículos**, confirmados:

| Se queda | Archivo | Tamaño |
|---|---|---|
| Testing en Android | `android-testing.md` | 4.748 |
| Jetpack Compose: El futuro de la UI | `android-jetpack-compose.md` | 4.478 |
| Inyección de Dependencias con Hilt | `android-dependency-injection.md` | 4.252 |
| Coroutines: Programación asíncrona moderna | `android-coroutines.md` | 4.185 |
| Integración de IA en Apps Android | `android-ai.md` | 3.418 |
| Arquitectura MVVM en Android | `android-mvvm.md` | 3.353 |
| Kotlin Multiplatform | `kotlin-multiplatform.md` | 2.931 |

Salen: `clean-architecture.md`, `welcome.md`, `jetpack-compose.md`, `coroutines-flow.md`.

Nota para Gonzalo: el artículo que se cae por estar vacío es precisamente el de Clean
Architecture, que su propia bio declara como especialidad. Es el hueco más caro del blog
y el mejor candidato para el próximo que escriba. Fuera del alcance de este trabajo.

## Fuera de alcance

- Migrar a Astro/11ty o cualquier framework.
- Traducir los artículos al inglés.
- Formulario de contacto y agendamiento de llamadas.
- Escribir el bloque de *decisiones técnicas* de cada proyecto: es material que solo
  Gonzalo tiene. El diseño lo deja opcional y lo oculta si viene vacío.
- Capturas nuevas de emulador. Se trabaja con las imágenes existentes; si más adelante
  llegan capturas limpias, se sustituyen sin tocar el diseño.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Quitar Bootstrap toca todo el HTML de golpe | Se hace por página, empezando por la home, con el sitio publicado intacto hasta el final |
| Las capturas recortadas pueden quedar de baja resolución | Se revisa cada una al recortar; las que no den la talla se muestran en tarjeta en vez de en marco de teléfono |
| El i18n duplica el mantenimiento del copy | Se limita a UI, home y proyectos; los artículos quedan fuera |
| `build:pages` se olvida al publicar | El sitio no se rompe: sin correrlo, se comporta como hoy |
