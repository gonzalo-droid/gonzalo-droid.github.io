# Rediseño "Esmeralda nítida" — diseño

Fecha: 2026-10-29
Estado: aprobado por Gonzalo (2026-10-29)
Reemplaza la dirección visual de `2026-08-27-portfolio-redesign-design.md` (Mecha).

## Intención

El sitio deja de hablarle primero a un reclutador y pasa a hablarle a un **cliente**: alguien
con un negocio que necesita una web, una app o meter IA en su trabajo diario. El inicio se
centra en dos cosas: **los proyectos** (prueba de que Gonzalo sabe hacerlo) y **los
servicios** (qué puede hacer por ti), y termina en **contacto**.

El perfil de empleo no desaparece: la trayectoria, el CV y el blog técnico siguen en el
sitio, en sus propias páginas, para el reclutador que llega desde LinkedIn.

La dirección visual cambia porque Mecha (negro, naranja, morado, anime) se leía "muy
gamer/anime" para el público profesional. La nueva es **minimalista y elegante**: fondo
claro, un solo verde de acento, títulos con serif editorial.

## Metas

1. Que un cliente entienda en el primer pantallazo qué hace Gonzalo por él y cómo
   escribirle.
2. Que cada proyecto se lea como un caso: para quién, qué problema había, qué se
   construyó y qué se logró.
3. Que las capturas de los proyectos se vean grandes, nítidas y sin deformarse.
4. Que contactar sea inmediato: WhatsApp a un clic.

## No metas

- No se rehace el sistema de rutas, el prerenderizado ni el i18n: se reutilizan.
- No se agregan formularios con backend, CMS, analítica nueva ni framework.
- No se traducen los artículos del blog (siguen solo en español, como hoy).

## Anti-metas (sería un fracaso aunque "funcione")

- **Referencias a anime visibles** en la marca, los textos de sección o la decoración. Los
  proyectos que tratan de anime (Quote Anime, Neko Manga Cix) se muestran tal cual son;
  lo que se elimina es la estética anime del sitio, no los proyectos.
- **Imágenes estiradas o pixeladas.** Ninguna imagen puede definir su propio alto ni
  deformarse: el marco fija la proporción.
- **Huecos en blanco a media pantalla.** Gonzalo lo señaló dos veces (banner y detalle).
- **Ocultar contenido hasta que cargue el JS.** Se mantiene la regla del `.js` y la del
  flash de español.

## Restricciones (vienen del repo y siguen vigentes)

- Sitio estático en GitHub Pages, sin build step obligatorio. `npm run build:pages`
  regenera las páginas prerenderizadas, que se commitean.
- `npm test` debe pasar. El test de contraste exige ≥ 4.5:1 y **no se baja el umbral**.
- Regla de animación: `[data-animate]` solo se oculta bajo `.js` **y**
  `prefers-reduced-motion: no-preference`.
- ES es la fuente; EN es una capa de traducción en `content/i18n/en.json`.
- `/project/<slug>/` y `/article/<slug>/` están prerenderizadas y en el sitemap.
- Commits en español, Conventional Commits.

---

## 1. Sistema visual

### Paleta (decidida por Gonzalo: opción C "Esmeralda nítida")

Se reutilizan los **nombres** de token actuales de `tokens.css`; cambian los valores.

| Token | Claro (`:root`) | Oscuro (`[data-theme="dark"]`) |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0F1512` |
| `--surface` | `#F6F7F5` | `#161E1A` |
| `--border` | `#E3E7E4` | `#25302A` |
| `--text` | `#0F1A14` | `#E7ECE9` |
| `--text-muted` | `#56605A` | `#9BA6A0` |
| `--accent` | `#0B5D3B` | `#4CB383` |
| `--accent-fg` | `#FFFFFF` | `#0F1512` |

Contraste medido con `test/helpers/contrast.js`: texto 17.8 / 15.5, muted 6.5 / 7.4,
acento 7.9 / 7.1, texto del botón sobre acento 7.9 / 7.1 (claro / oscuro). Todo ≥ 4.5:1,
también sobre `--surface`.

- Hay **un solo acento**. `--accent-2` (el morado de Mecha) desaparece; se quita de
  `TEXT_ON_BG` en `test/tokens.test.js` porque el token deja de existir, no para esquivar
  el test.
- `--border-strong` y `--cut` (esquina cortada de Mecha) se eliminan si nada los usa.
- **Tema claro por defecto** (decisión de Gonzalo). Hoy `theme.js` sigue la preferencia del
  sistema; cambia a: claro salvo que el visitante haya elegido oscuro con el interruptor.
  El modo oscuro se mantiene y se diseña con el mismo cuidado.

### Tipografía (decidida por Gonzalo: "serif editorial + sans")

- **Newsreader** (400, 500): nombre, títulos de sección, títulos de tarjeta, títulos de
  página.
- **IBM Plex Sans** (400, 500, 600): texto, navegación, botones.
- **IBM Plex Mono** (400, 500): etiquetas pequeñas (plataformas, fechas, numeración de
  sección "01 — Trabajo", chips de tecnología).

Reemplazan a Archivo y JetBrains Mono en todas las páginas, también en el blog.

### Forma

La regla actual de CLAUDE.md ("solo 0 y 4px") se reemplaza por esta escala:

| Uso | Radio |
|---|---|
| Chips de tecnología | 3px |
| Botones | 4px |
| Tarjetas, galería, ficha lateral | 8px |
| Filtros de plataforma | píldora (999px) |
| Punto de disponibilidad | 50% |

### Detalle de identidad (decidido por Gonzalo: "un detalle sutil")

Monograma **"GL"** en Newsreader, blanco sobre un cuadrado verde de 26px, junto al nombre en
la barra de navegación. Es la única "marca". El punto verde de la etiqueta del banner es el
segundo detalle.

---

## 2. Páginas

Referencia visual: maqueta interactiva en
`.superpowers/brainstorm/67915-1793307092/content/home-esmeralda-v14.html` (local, no
versionada; las imágenes se sirven desde esa misma carpeta). Donde este documento y la
maqueta difieran, manda el documento. Las notas amarillas de la maqueta no van al sitio.

### 2.1 Navegación y pie (todas las páginas)

- Barra: monograma + "Gonzalo López" a la izquierda; a la derecha **Proyectos · Servicios ·
  Experiencia · Blog · Contacto**, más el cambio de idioma y el interruptor de tema que ya
  existen. "Proyectos", "Servicios" y "Contacto" son anclas del inicio (`/#proyectos`,
  `/#servicios`, `/#contacto`); "Experiencia" y "Blog" son páginas.
- El enlace activo se marca con un subrayado verde de 2px.
- Pie, igual en todas las páginas: "© 2026 Gonzalo López" a la izquierda; a la derecha los
  mismos cinco enlaces y ES · EN.

### 2.2 Inicio (`/`)

Orden: **Banner → 01 Proyectos → 02 Servicios → 03 Contacto → pie.**
Las secciones "Sobre mí", "Experiencia" y "Últimos artículos" **salen del inicio**.

**Banner** — una sola columna, **centrado**, sin imágenes y sin estadísticas (Gonzalo pidió
quitar ambas cosas).

- Etiqueta con punto verde: "Agenda abierta para nuevos proyectos".
- Título (h1): "Construyo la web, la app o la IA que tu negocio necesita."
- Texto: "Soy **Gonzalo López**, desarrollador web y móvil con más de 6 años lanzando
  productos a producción: de tiendas online a apps en Play Store y App Store."
- Botón principal "Cuéntame tu proyecto" → `#contacto`. Enlace secundario
  "Ver proyectos →" → `#proyectos`.

**01 — Proyectos**

- Título "Proyectos", frase: "Apps y sitios en producción. Haz clic en cualquiera para ver
  capturas, stack y lo que hice."
- Filtros por plataforma (Todos, Android, iOS, KMM, Web) con el número de proyectos de cada
  uno. Se reutiliza el filtrado de `projects.js`.
- **Los 9 proyectos**, en tarjetas medianas: 3 columnas en escritorio, 2 en tablet, 1 en
  móvil.
- Orden: Neko Manga Cix, **Agrosalas Perú**, Quote Anime, AutoTest Licencia, CixCash,
  Note.AI, U-Learning, Admin Lotes, Solti-CRM.
- Tarjeta: imagen arriba en marco **16:10**; debajo plataformas (mono, mayúsculas), título,
  resumen cortado a 2 líneas, 3 chips de tecnología más "+N" si hay más, y un pie con los
  nombres de las tiendas/enlaces a la izquierda y "Ver proyecto →" a la derecha.
- **Toda la tarjeta enlaza a `/project/<slug>/`.**
- **Carrusel** cuando el proyecto tiene más de una imagen: deslizable con el dedo
  (scroll-snap), flechas que aparecen al pasar el mouse (siempre visibles en pantallas
  táctiles), puntos abajo y contador "1/3" arriba a la derecha. Las flechas **no** abren el
  proyecto. Con una sola imagen no hay controles.

**02 — Servicios**

- Título: "Hagamos crecer tu negocio". Frase: "Llevo tu idea a producción: una web que
  vende, una app que tus clientes usan a diario o IA que le quita trabajo repetitivo a tu
  equipo."
- Tres tarjetas, cada una con ícono, título, párrafo, tres puntos y ejemplos:
  - **Desarrollo web** — "Sitios corporativos, catálogos y tiendas online rápidos,
    bilingües y preparados para aparecer en Google." · Diseño a medida · Catálogo o tienda
    con pagos · SEO y analítica · Ejemplos: Agrosalas Perú, Neko Manga Cix.
  - **Apps móviles** — "Apps Android e iOS publicadas en las tiendas, nativas o
    multiplataforma con Kotlin Multiplatform." · Android e iOS · Publicación en Play Store y
    App Store · Mantenimiento y nuevas versiones · Ejemplos: Quote Anime, AutoTest Licencia.
  - **IA en tus flujos** — "Automatiza tareas repetitivas conectando modelos de IA a las
    herramientas que tu equipo ya usa." · Atención por chat y WhatsApp · Lectura de
    documentos y transcripción · Reportes y tareas automáticas · Ejemplo: Note.AI.
- Los ejemplos enlazan a la página del proyecto.

**03 — Contacto** (centrado, como el banner)

- Título "Hablemos de tu proyecto". Frase: "Cuéntame qué necesitas —una web, una app o
  automatizar algo con IA— y te respondo con una propuesta."
- Botón principal **WhatsApp · +51 924 262 747** con ícono, que abre
  `https://wa.me/51924262747?text=Hola%20Gonzalo%2C%20vi%20tu%20portafolio%20y%20quiero%20contarte%20sobre%20un%20proyecto`
  en pestaña nueva. En inglés el mensaje va traducido.
- Al lado, el correo `gonzalo.lozg@gmail.com` (`mailto:`) con botón **Copiar** (se
  reutiliza el comportamiento de copiado de `home.js`).
- Debajo, LinkedIn y GitHub.

### 2.3 Página de proyecto (`/project/<slug>/`)

Contenedor centrado de ~1060px. **Sin huecos**: dos columnas en escritorio, una en móvil.

- Cabecera: "← Proyectos", plataformas, título (h1) y la frase corta (`summary`).
- **Columna principal (680px):**
  1. **Galería**: marco 16:10 del mismo ancho que el texto, flechas siempre visibles,
     contador y fila de miniaturas debajo que también cambian la imagen. Con una sola
     imagen, sin controles.
  2. **El caso, en párrafos seguidos y sin títulos intermedios** (Gonzalo pidió quitar
     "Resumen / Problema / Solución" y que se lea lineal). El orden hace el trabajo:
     quién es el cliente o qué es el producto → qué problema había → qué se construyó (uno
     o varios párrafos) → qué se logró. **Sin listas de viñetas.** Columna de lectura a
     17px, interlineado ~1.75.
- **Ficha lateral (300px)**, fija al hacer scroll en escritorio, al final en móvil:
  Cliente (solo si hay), Plataforma, Construido con (todos los chips), Enlaces (botones; el
  primero relleno, el resto con borde; "Proyecto privado, sin enlace público" si no hay) y
  un recuadro **"¿Necesitas algo parecido?"** con botón "Cuéntame tu proyecto" →
  `/#contacto`.
- Al final: "Todos los proyectos" y "Siguiente: <proyecto> →" (en el orden del inicio,
  volviendo al primero tras el último).
- La sección "Decisiones técnicas" (`decisions`) queda oculta mientras esté vacía, como hoy.
- El HTML prerenderizado por `build-pages.js` debe contener el caso completo en párrafos
  (es lo que indexa Google), no la lista "Qué incluye".

### 2.4 Experiencia (`/experience/`) — página nueva

- Etiqueta "TRAYECTORIA", título "Experiencia", frase "Seis años construyendo apps Android
  en producción, de startups peruanas a banca en Chile." y botón **Descargar CV (PDF)**.
  Hoy el sitio solo tiene un CV, en Google Drive
  (`https://drive.google.com/file/d/1aNYpEk3DXCDbyXXamSAKisFue7hUL8C6/view?usp=sharing`),
  el mismo para ES y EN. *Decisión de Claude:* el enlace sale de una clave i18n
  (`exp.cv.url`) que en ambos idiomas apunta a ese Drive; cuando Gonzalo entregue
  `cv-es.pdf`/`cv-en.pdf`, solo cambian los valores de la clave. El botón no se oculta: es
  la única vía al CV ahora que el inicio no lo tiene.
- Los dos párrafos de "Sobre mí" (`about.p1`, `about.p2`) van aquí, bajo la cabecera.
- Línea de tiempo con los 5 puestos actuales, **sin cambiar sus textos**: periodo (mono),
  cargo, empresa · país en verde, descripción y chips de stack. El puesto actual lleva el
  punto relleno.
- Prerenderizada (HTML completo sin JS), con canonical, hreflang y datos estructurados como
  el resto, y añadida al sitemap. El enlace "Experiencia" del menú apunta aquí.

### 2.5 Blog (`/articles/` y `/article/<slug>/`)

- Mismo sistema visual. **Se quita Bootstrap CSS** de ambas páginas y la pila de tres
  fuentes vieja.
- Listado: etiqueta "BLOG", título "Notas de desarrollo", frase "Lo que aprendo
  construyendo apps: arquitectura, Kotlin, Compose e IA."; lista de una columna (~860px)
  con fecha en mono a la izquierda y, a la derecha, título en Newsreader, resumen y chips
  de etiquetas; del más reciente al más antiguo.
- Artículo: columna de lectura de ~680px con la misma tipografía que el caso de proyecto.
  El diseño del artículo no se maquetó; lo resuelve el constructor con el sistema.

---

## 3. Contenido y datos

### 3.1 Agrosalas Perú (proyecto nuevo)

Entra en `content/projects.json`, en el `<noscript>` de `#portfolio`, en el sitemap y en
`en.json`.

- slug `agrosalas`, plataforma `web`, enlace "Web" → `https://www.agrosalasperu.com/`.
- Resumen: "Sitio corporativo bilingüe para una agroexportadora peruana de menestras en
  conserva, con catálogo, eventos y cotización por WhatsApp."
- Stack (detectado en el sitio publicado): Next.js, React, Tailwind CSS, Lucide, Vercel.
- Cliente: Agrosalas Peru S.R.L.
- Imágenes: capturas de escritorio a 2× (2880×1800) de inicio, catálogo y eventos, en
  `.superpowers/brainstorm/67915-1793307092/content/agro-{home,catalogo,eventos}.png`. La
  ficha de producto se descartó porque muestra un marcador de posición en vez de foto.
- Caso (problema y solución en palabras de Gonzalo, el resto tomado del sitio):

  > Agrosalas Peru es una empresa agroindustrial peruana que exporta menestras en conserva
  > —gandul, pallar y frijoles— a España, Estados Unidos y Panamá.
  >
  > No tenía presencia en internet: ni sitio web, ni posicionamiento en Google, ni en redes
  > sociales. Un comprador extranjero no tenía dónde ver sus productos ni cómo pedirle una
  > cotización.
  >
  > Desarrollé su sitio web con el catálogo de productos actualizado, en español e inglés,
  > preparado para aparecer en Google y para compartirse bien en redes.
  >
  > El catálogo reúne trece productos, con búsqueda y filtro por categoría, y cada producto
  > tiene su propia página. Si alguien llega desde otro país, el sitio le ofrece cambiar de
  > idioma.
  >
  > Cada página lleva a pedir una cotización, por formulario o por WhatsApp, y una sección
  > de eventos muestra las ferias donde participa la empresa, como Expoalimentaria y Expo
  > Perú Norte.
  >
  > Para que Google lo encuentre, las páginas se entregan ya generadas, con datos
  > estructurados y una imagen propia, en cada idioma, para cuando el enlace se comparte en
  > redes.

### 3.2 Modelo del caso

Cada proyecto gana en `projects.json` un campo con el caso en párrafos, agrupado en cuatro
partes que **solo ordenan el texto** (no se muestran como títulos): contexto, problema,
solución y resultado, cada una una lista de párrafos. `resultado` es opcional; si falta, el
texto termina en la solución. Se agrega `client` (opcional). `highlights` deja de mostrarse
en la página de detalle (su contenido pasa a los párrafos de la solución). La traducción
inglesa va en `en.json → projects[slug]`, con el mismo mecanismo de respaldo al español que
hoy.

### 3.3 Textos de casos de los otros 8 proyectos

Los escribió Claude a partir del resumen y los `highlights` de cada proyecto (Anexo A).
**Gonzalo decidió publicarlos tal cual y corregirlos después.** En el sitio no llevan
ninguna marca de borrador. Para que no se olviden, sus slugs se listan en un campo de
revisión (equivalente a `en.json._review`) y `npm run i18n:review` —o un script hermano—
los muestra; Gonzalo quita cada slug al revisarlo.

**Proyectos para clientes** (confirmado por Gonzalo): Agrosalas Perú, Neko Manga Cix,
U-Learning, Admin Lotes y Solti-CRM. Los propios son Quote Anime, AutoTest Licencia,
CixCash y Note.AI. Gonzalo autoriza mostrar el nombre de cada cliente en la ficha lateral;
solo se conoce el de Agrosalas (Agrosalas Peru S.R.L.). Mientras falte un nombre, el campo
`client` se omite y la ficha no muestra la fila "Cliente".

### 3.4 Imágenes

- Marco **16:10** en tarjetas y galería. Capturas de web: `object-fit: cover` anclado
  arriba. Gráficos de Play Store (~800px): `object-fit: contain` sobre `--surface`, enteros.
- Capturas nuevas a 2× para Neko Manga Cix (`nmc-desk.png`) y Quote Anime/animequote.app
  (`qa-desk.png`) en la misma carpeta que las de Agrosalas. Se usan como primera imagen de
  sus carruseles.
- Todo lo que entra al sitio va en WebP, en `assets/img/portfolio/`, con su variante de
  tarjeta en `assets/img/portfolio/cards/` (lo exige `test/seo.test.js`). Los tamaños de
  exportación los decide el constructor; la regla es que la galería (680px de ancho, 2× en
  pantallas retina) se vea nítida sin servir PNG de 2880px.
- Las 6 apps sin web siguen con su gráfico de Play Store hasta que Gonzalo aporte capturas
  del emulador. No bloquea.
- **Las capturas verticales de móvil no entran** en tarjetas ni galerías (*decisión de
  Claude*): los `shot` de `assets/img/portfolio/shots/` y las capturas `nmc-movil*.png` /
  `qa-movil.png` quedarían como una franja angosta dentro del marco 16:10, que es justo lo
  que Gonzalo rechazó ("muy pequeñas"). Solo se usan imágenes horizontales; AutoTest,
  CixCash y Note.AI quedan con una imagen y sin carrusel hasta que haya capturas del
  emulador. El campo `shot` deja de usarse.

### 3.5 Idioma

Todo texto nuevo (banner, servicios, contacto, casos, experiencia, blog, pie) entra en
`es.json`/`en.json` con su clave. Claude traduce al inglés; las traducciones del **banner,
servicios y casos** se agregan a `_review` porque son la voz comercial de Gonzalo. Las
claves que dejen de usarse (`hero.role`, `hero.stack`, `hero.badge`, `about.title`,
`articles.*` del inicio, etc.) se eliminan para que `i18n.test.js` siga limpio.

### 3.6 SEO del inicio

El inicio deja de presentarse como "Android Developer":

- `<title>`: "Gonzalo López — Desarrollo web, apps e IA para negocios" (o equivalente de
  30–60 caracteres, lo exige `seo.test.js`).
- `description`: orientada al cliente, ≤ 155 caracteres.
- JSON-LD: se mantiene `Person`; `jobTitle` pasa a "Desarrollador web y móvil". Se puede
  añadir un `ProfessionalService`/`Service` con los tres servicios (lo decide el
  constructor).
- Consecuencia aceptada: el inicio pierde algo de peso en búsquedas de reclutadores por
  "Android Developer". `/experience/` conserva ese enfoque en su `<title>` y descripción.

---

## 4. Decisiones de Gonzalo

| Tema | Decisión |
|---|---|
| Problema de Mecha | "Muy gamer/anime para recruiters" |
| Sensación | Minimalista y elegante |
| Tema | Claro por defecto |
| Acento | Verde bosque → opción C "Esmeralda nítida" |
| Tipografía | Serif editorial + sans |
| Decoración | Un detalle sutil de identidad |
| Anime | Eliminarlo de lo visible |
| Banner | Sin imágenes, sin estadísticas, centrado, hablándole al cliente |
| Proyectos | Todos en el inicio, tarjetas medianas, carrusel si hay más de una imagen, clic → detalle |
| Detalle | Imágenes más pequeñas con su proporción; caso en párrafos lineales sin títulos |
| Servicios | Web, apps e IA, "crecemos tu negocio" como idea |
| Experiencia | Fuera del inicio, en su propia página |
| Agrosalas | Agregarlo, con el problema y la solución que él describió |
| Contacto | WhatsApp +51 924 262 747 |

## 5. Decisiones de Claude (revisables)

- Título de servicios "Hagamos crecer tu negocio" en vez de "Crecemos…": el plural suena a
  agencia y Gonzalo trabaja solo.
- Textos del banner, servicios, contacto, cabecera de Experiencia y del Blog.
- Orden de proyectos con Agrosalas en segundo lugar.
- Ficha lateral con "¿Necesitas algo parecido?" para llenar el hueco del detalle.
- WhatsApp como botón principal de contacto y el mensaje pre-escrito.
- "Sobre mí" pasa a la página de Experiencia; "Últimos artículos" sale del inicio.
- Ruta `/experience/` (en inglés, como `/articles/` y `/project/`).
- Escala de radios 3/4/8/píldora.
- Quitar Bootstrap del blog dentro de este trabajo.
- El botón del CV usa el Drive actual en ambos idiomas hasta que existan los PDF.
- Fuera las capturas verticales de las galerías 16:10.

## 6. Lo que queda al constructor

- Estructura de CSS (migrar `style.css` o reescribir los bloques), siempre consumiendo
  `tokens.css`.
- Implementación del carrusel (sin librerías; scroll-snap + un poco de JS) y su
  accesibilidad (botones con `aria-label`, navegable con teclado).
- Cómo se genera `/experience/` (página escrita a mano o generada por `build-pages.js`).
- Diseño concreto de la página de artículo dentro del sistema.
- Tamaños de exportación de las imágenes.
- Si conviene borrar `index.html` de secciones o reconstruirlo.

## 7. Pendiente de Gonzalo (no bloquea)

- Nombre del cliente de Neko Manga Cix, U-Learning, Admin Lotes y Solti-CRM.
- Revisar los 8 casos del Anexo A (ya publicados).
- Dato de resultado de cada proyecto (cotizaciones, descargas, calificación, tiempo
  ahorrado).
- PDF del CV en español e inglés.
- Capturas del emulador de AutoTest, CixCash, Note.AI, U-Learning, Admin Lotes y Solti-CRM.
- Revisar las traducciones en `_review`.

## 8. Preguntas resueltas tras la revisión del constructor

1. Borradores de casos → se publican y Gonzalo los corrige después (§3.3).
2. Proyectos de cliente → los cinco de §3.3; nombres pendientes, se omiten hasta tenerlos.
3. Enlace del CV → Drive actual en ambos idiomas (§2.4).
4. Capturas verticales → fuera de las galerías 16:10 (§3.4).

## Anexo A — Casos escritos por Claude (se publican; Gonzalo los revisa después)
Basados en el `summary` y los `highlights` actuales de cada proyecto. El contexto y el problema son suposiciones razonables, no hechos confirmados.

### Neko Manga Cix (`nekomangacix`)
> Neko Manga Cix es una tienda peruana de manga y coleccionables con envíos a todo el país.
>
> Vender un catálogo de miles de títulos y manejar preventas por redes sociales y mensajes directos era lento y se prestaba a errores.
>
> Desarrollé un ecommerce que reúne más de 6.000 títulos. Se pueden filtrar por editorial, tipo, disponibilidad y precio, o buscar por título, editorial y autor, y cada ficha muestra el SKU, el género y una guía de formatos.
>
> Las preventas se reservan pagando el 50% y el resto al recibir el producto, con tarjeta, Yape o Plin, transferencia o efectivo al recoger. La tienda tiene modo claro y oscuro.

### Quote Anime (`quote-anime`)
> Quote Anime es una app propia de frases de anime para Android e iOS.
>
> Los fans guardan frases en capturas sueltas, sin poder ordenarlas, verlas sin conexión ni recibir una nueva cada día.
>
> Hice una app nativa para cada plataforma con las frases ordenadas por anime. Las favoritas se guardan para leerlas sin conexión, y un widget muestra una frase al azar en la pantalla de inicio.
>
> Cada día llega una notificación a la hora que elige el usuario, y cualquier frase se puede compartir como imagen con un diseño propio de la app.

### AutoTest Licencia (`autotest-licencia`)
> AutoTest Licencia es una app para preparar el examen de reglas de manejo de la licencia de conducir en Perú.
>
> Quien se prepara estudia con balotarios en PDF sueltos y no tiene forma de saber si ya está listo para el examen.
>
> La app ofrece simulacros parecidos a la evaluación real, separados por categoría de licencia, y estadísticas para ver el avance. Los balotarios de cada categoría se pueden descargar y compartir en PDF.

### CixCash App (`cixcash`)
> CixCash es una app multiplataforma para llevar saldos en divisas y criptomonedas.
>
> Controlar saldos en varias monedas y cripto obliga a usar varias apps y a calcular las conversiones a mano.
>
> La construí con Kotlin Multiplatform, así que Android e iOS comparten el mismo código. Muestra el balance de cada moneda, guarda las transacciones en una base de datos local y convierte entre ARS, USD, BTC y ETH.

### Note.AI (`note-ai`)
> Note.AI es una app Android de notas de voz con transcripción automática.
>
> Escribir notas en movimiento es lento, y las notas de voz no se pueden leer de un vistazo ni buscar.
>
> Cada nota tiene su grabación asociada, y la app la transcribe sola con OpenAI Whisper, así queda también como texto. Las notas se guardan y se listan en el propio teléfono.

### U-Learning (`u-learning`)
> U-Learning es una plataforma de cursos online para estudiantes, disponible en Android, iOS y navegador.
>
> La institución necesitaba llevar sus cursos al celular y al navegador de sus estudiantes, administrados desde un solo lugar.
>
> La app Android está construida con MVI y StateFlow, con pruebas en Mockito, y la de iOS en Swift con UIKit, distribuida por TestFlight.
>
> La plataforma web y el panel administrativo corren en AWS EC2, con despliegue continuo.

### Admin Lotes (`admin-lotes`)
> Admin Lotes es un sistema de gestión para empresas inmobiliarias que venden lotes.
>
> Los lotes, contratos y ventas se llevaban en hojas de cálculo, y los asesores en campo no conocían el estado actualizado de cada lote.
>
> Desde una app Android, los asesores siguen el estado de cada lote mientras están en campo. La plataforma web concentra los contratos, la facturación electrónica y las ventas.
>
> El sistema está organizado por capas, con principios SOLID e inyección de dependencias, para que crezca sin romperse.

### Solti-CRM (`solti-crm`)
> Solti-CRM es un CRM para el equipo comercial de una empresa.
>
> Los vendedores no tenían un registro común de clientes, llamadas y visitas, y el seguimiento después de la venta se perdía.
>
> La app Android registra a cada cliente con sus llamadas, correos y la ubicación de las visitas, usando los servicios de Google. Desde la web, el equipo sigue cada venta antes y después de cerrarla.
