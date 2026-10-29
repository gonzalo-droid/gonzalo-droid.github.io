#!/usr/bin/env node
// Prerenderiza una página HTML real por artículo y por proyecto.
//
//   npm run build:pages
//
// Por qué existe: GitHub Pages no tiene enrutado de servidor, así que
// /article/<slug> y /project/<slug> devolvían un 404 real al crawler y solo
// funcionaban por el rebote en cliente de 404.html. Medido sobre producción:
// 11 de las 15 URLs del sitemap respondían 404, y /articles/ le enseñaba 12
// palabras ("Cargando…") a Google.
//
// Este script escribe article/<slug>/index.html y project/<slug>/index.html
// con las metaetiquetas resueltas y el contenido ya pintado. El JS de cliente
// sigue corriendo encima: marked.js vuelve a renderizar el artículo y project.js
// repinta el proyecto con el idioma activo. Si el script no se corre, el sitio
// se comporta exactamente como antes.
//
// Los archivos generados SE COMMITEAN: GitHub Pages sirve lo que hay en el repo.

const fs = require('node:fs');
const path = require('node:path');
const { renderMarkdown, toPlainText, escapeHtml } = require('./lib/markdown');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://gonzalo-lozg.me';
const AUTHOR = 'Gonzalo López';

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));

/** Misma lógica que generateSlug() en assets/js/utils.js. No cambiarla sin
 *  cambiarla allí: los enlaces de la home se generan en cliente con esa. */
const generateSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Recorta en el último espacio antes del límite, sin partir palabras. */
function clip(text, max = 155) {
  const t = String(text).trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:]$/, '') + '…';
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * Sustituye en la plantilla las metaetiquetas que llevan id, que es como las
 * tiene puestas el HTML para que el JS las actualice. Así el crawler recibe el
 * valor correcto y el cliente puede seguir tocándolas sin conflicto.
 */
function setMetaById(html, id, attr, value) {
  const re = new RegExp(`(<[^>]*\\bid="${id}"[^>]*\\b${attr}=")[^"]*(")`, 'i');
  if (!re.test(html)) throw new Error(`No encuentro #${id}[${attr}] en la plantilla`);
  return html.replace(re, `$1${escapeHtml(value)}$2`);
}

function setTitle(html, value) {
  return html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title id="pageTitle">${escapeHtml(value)}</title>`);
}

/** Enlaces alternativos para que el bilingüe cuente en buscadores. El JS los
 *  inyectaba en runtime, donde el crawler no los ve. */
function hreflangFor(url) {
  return ['es', 'en']
    .map((l) => `    <link rel="alternate" hreflang="${l}" href="${url}?lang=${l}">`)
    .concat([`    <link rel="alternate" hreflang="x-default" href="${url}">`])
    .join('\n');
}

const MARK_OPEN = '<!-- build:pages -->';
const MARK_CLOSE = '<!-- /build:pages -->';

function injectBeforeHeadEnd(html, block) {
  return html.replace('</head>', `${MARK_OPEN}\n${block}\n${MARK_CLOSE}\n</head>`);
}

/** Correr el script dos veces no debe duplicar metaetiquetas. */
function stripGenerated(html) {
  return html.replace(
    new RegExp(`${MARK_OPEN}[\\s\\S]*?${MARK_CLOSE}\\n?`, 'g'), ''
  );
}

function jsonLd(obj) {
  return `    <script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n    </script>`;
}

// ---------------------------------------------------------------- artículos

function buildArticles() {
  const template = read('article/index.html');
  const articles = readJson('content/articles.json');
  const written = [];

  for (const article of articles) {
    const slug = generateSlug(article.title);
    const url = `${SITE}/article/${slug}`;
    const md = read(path.join('content/articles', article.file));
    const body = renderMarkdown(md);
    const plain = toPlainText(md);

    // Una página indexada sin contenido es peor que no tenerla: Google la ve
    // como thin content y arrastra la reputación del resto del dominio.
    if (plain.split(/\s+/).filter(Boolean).length < 50) {
      throw new Error(
        `"${article.title}" (${article.file}) tiene ${plain.length} caracteres: ` +
        `despublícalo de content/articles.json o escríbelo antes de generar.`
      );
    }
    const description = clip(article.description || plain);
    const title = `${article.title} - ${AUTHOR} | Mobile Developer`;
    const image = article.image
      ? SITE + (article.image.startsWith('/') ? article.image : '/' + article.image)
      : `${SITE}/assets/img/background.svg`;

    let html = template;
    html = setTitle(html, title);
    html = setMetaById(html, 'metaDescription', 'content', description);
    html = setMetaById(html, 'canonicalLink', 'href', url);
    html = setMetaById(html, 'ogTitle', 'content', title);
    html = setMetaById(html, 'ogDescription', 'content', description);
    html = setMetaById(html, 'ogImage', 'content', image);
    html = setMetaById(html, 'ogUrl', 'content', url);
    html = setMetaById(html, 'twitterTitle', 'content', title);
    html = setMetaById(html, 'twitterDescription', 'content', description);
    html = setMetaById(html, 'twitterImage', 'content', image);

    html = injectBeforeHeadEnd(html, hreflangFor(url));

    // El JSON-LD de la plantilla lo rellena article.js en runtime; aquí se
    // escribe ya resuelto para que exista sin JavaScript.
    html = html.replace(
      /<script type="application\/ld\+json" id="articleJsonLd">[\s\S]*?<\/script>/,
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description,
        image,
        datePublished: article.date,
        dateModified: article.date,
        author: { '@type': 'Person', name: AUTHOR, url: SITE },
        publisher: { '@type': 'Person', name: AUTHOR, url: SITE },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        inLanguage: 'es',
        keywords: (article.tags || []).join(', '),
      }).trim()
    );

    // Contenido ya pintado. article.js lo reemplaza cuando el JS corre.
    html = html.replace(
      /(<h1 id="articleTitle">)[\s\S]*?(<\/h1>)/,
      `$1${escapeHtml(article.title)}$2`
    );
    html = html.replace(
      /(<span id="articleDate">)[\s\S]*?(<\/span>)/,
      `$1${escapeHtml(formatDate(article.date))}$2`
    );
    html = html.replace(
      /(<div class="article-body" id="articleContent">)[\s\S]*?(<\/div>\s*<\/article>)/,
      `$1\n${body}\n                        $2`
    );

    const dir = path.join(ROOT, 'article', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    written.push({ url: `/article/${slug}`, words: plain.split(/\s+/).length });
  }
  return written;
}

// ---------------------------------------------------------------- proyectos

const PLATFORM_LABELS = { android: 'Android', ios: 'iOS', kmm: 'KMM', web: 'Web' };

function buildProjects() {
  const template = read('project/index.html');
  const projects = readJson('content/projects.json');
  const written = [];

  for (const project of projects) {
    const url = `${SITE}/project/${project.slug}`;
    const title = `${project.title} - ${AUTHOR} | Mobile Developer`;
    const description = clip(project.summary);
    const image = SITE + project.image;
    const platforms = project.platforms.map((p) => PLATFORM_LABELS[p] || p).join(' · ');

    let html = template;
    html = setTitle(html, title);
    html = setMetaById(html, 'metaDescription', 'content', description);
    html = setMetaById(html, 'canonicalLink', 'href', url);
    html = setMetaById(html, 'ogTitle', 'content', title);
    html = setMetaById(html, 'ogDescription', 'content', description);
    html = setMetaById(html, 'ogImage', 'content', image);
    html = setMetaById(html, 'ogUrl', 'content', url);
    html = setMetaById(html, 'twitterTitle', 'content', title);
    html = setMetaById(html, 'twitterDescription', 'content', description);
    html = setMetaById(html, 'twitterImage', 'content', image);

    html = injectBeforeHeadEnd(html, hreflangFor(url));
    html = injectBeforeHeadEnd(
      html,
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description,
        image: [image, ...(project.gallery || []).map((g) => SITE + g)],
        url,
        creator: { '@type': 'Person', name: AUTHOR, url: SITE },
        keywords: project.tech.join(', '),
        inLanguage: 'es',
      })
    );

    const highlights = (project.highlights || []).length
      ? `<h2>Qué incluye</h2>\n<ul>${project.highlights
          .map((h) => `<li>${escapeHtml(h)}</li>`)
          .join('')}</ul>`
      : '';

    const links = (project.links || []).length
      ? `<ul>${project.links
          .map(
            (l) =>
              `<li><a href="${escapeHtml(l.url)}" rel="noopener">${escapeHtml(l.label)}</a></li>`
          )
          .join('')}</ul>`
      : '';

    // project.js sustituye este contenido en cuanto corre; sin JS, esto es lo
    // que queda, y es lo que indexa el crawler.
    const prerendered = `
                <header class="project-head">
                    <p class="t-label project-platforms">${escapeHtml(platforms)}</p>
                    <h1 class="t-h1">${escapeHtml(project.title)}</h1>
                    <p class="project-summary">${escapeHtml(project.summary)}</p>
                </header>
                ${highlights}
                <h2>Stack</h2>
                <p>${project.tech.map(escapeHtml).join(' · ')}</p>
                ${links}`;

    html = html.replace(
      /(<article id="projectDetail"[^>]*>)[\s\S]*?(<\/article>)/,
      `$1${prerendered}\n            $2`
    );
    html = html.replace(
      /(<span id="crumbCurrent">)[\s\S]*?(<\/span>)/,
      `$1${escapeHtml(project.title)}$2`
    );

    const dir = path.join(ROOT, 'project', project.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    written.push({ url: `/project/${project.slug}` });
  }
  return written;
}

// ------------------------------------------------------- listado del blog

/**
 * El listado se pinta con JS, así que el crawler solo veía "Cargando…".
 * Aquí se escribe la lista real dentro del contenedor; articles.js la
 * reemplaza con la versión interactiva (filtros por tag) cuando el JS corre.
 */
function buildArticlesIndex(articles) {
  const file = 'articles/index.html';
  let html = read(file);
  const meta = readJson('content/articles.json');

  const items = meta
    .map((a) => {
      const slug = generateSlug(a.title);
      return `                <article class="article-item">
                    <h2><a href="/article/${slug}">${escapeHtml(a.title)}</a></h2>
                    <p class="article-item-date">${escapeHtml(formatDate(a.date))}</p>
                    <p class="article-item-description">${escapeHtml(a.description || '')}</p>
                    <p class="article-item-tags">${(a.tags || []).map(escapeHtml).join(' · ')}</p>
                </article>`;
    })
    .join('\n');

  html = html.replace(
    /(<div class="articles-list" id="articlesContainer">)[\s\S]*?(<\/div>\s*<\/div>)/,
    `$1\n${items}\n            $2`
  );

  const url = `${SITE}/articles/`;
  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i,
    `<title>Artículos sobre desarrollo Android — ${AUTHOR}</title>`);

  const desc = `${meta.length} artículos sobre Android, Kotlin, Jetpack Compose y `
    + `arquitectura móvil, escritos por ${AUTHOR}.`;
  const image = `${SITE}/assets/img/portfolio/shots/quote-anime.webp`;

  html = stripGenerated(html);
  {
    html = injectBeforeHeadEnd(html,
      `    <link rel="canonical" href="${url}">\n`
      + `    <meta name="description" content="${escapeHtml(desc)}">\n`
      + `    <meta property="og:type" content="website">\n`
      + `    <meta property="og:title" content="Artículos sobre desarrollo Android — ${AUTHOR}">\n`
      + `    <meta property="og:description" content="${escapeHtml(desc)}">\n`
      + `    <meta property="og:image" content="${image}">\n`
      + `    <meta property="og:url" content="${url}">\n`
      + `    <meta name="twitter:card" content="summary_large_image">\n`
      + `    <meta name="twitter:title" content="Artículos sobre desarrollo Android — ${AUTHOR}">\n`
      + `    <meta name="twitter:description" content="${escapeHtml(desc)}">\n`
      + `    <meta name="twitter:image" content="${image}">\n`
      + hreflangFor(url));
  }
  {
    html = injectBeforeHeadEnd(html, jsonLd({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `Artículos de ${AUTHOR}`,
      url,
      inLanguage: 'es',
      author: { '@type': 'Person', name: AUTHOR, url: SITE },
      blogPost: meta.map((a) => ({
        '@type': 'BlogPosting',
        headline: a.title,
        datePublished: a.date,
        url: `${SITE}/article/${generateSlug(a.title)}`,
      })),
    }));
  }

  fs.writeFileSync(path.join(ROOT, file), html);
  return meta.length;
}

// ------------------------------------------------------------------ sitemap

function buildSitemap(articles, projects) {
  const today = new Date().toISOString().slice(0, 10);
  const articleMeta = Object.fromEntries(
    readJson('content/articles.json').map((a) => [generateSlug(a.title), a.date])
  );

  const entries = [
    { loc: `${SITE}/`, lastmod: today, priority: '1.0' },
    { loc: `${SITE}/articles/`, lastmod: today, priority: '0.8' },
    ...projects.map((p) => ({ loc: SITE + p.url, lastmod: today, priority: '0.8' })),
    ...articles.map((a) => ({
      loc: SITE + a.url,
      lastmod: articleMeta[a.url.replace('/article/', '')] || today,
      priority: '0.6',
    })),
    { loc: `${SITE}/privacy-policy/`, lastmod: '2025-04-08', priority: '0.2' },
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    entries
      .map(
        (e) =>
          `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n` +
          `    <priority>${e.priority}</priority>\n` +
          `    <xhtml:link rel="alternate" hreflang="es" href="${e.loc}?lang=es"/>\n` +
          `    <xhtml:link rel="alternate" hreflang="en" href="${e.loc}?lang=en"/>\n` +
          `  </url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  return entries.length;
}

// --------------------------------------------------------------------- main

const articles = buildArticles();
const projects = buildProjects();
const listed = buildArticlesIndex(articles);
const urls = buildSitemap(articles, projects);

console.log(`\n  ${articles.length} artículos prerenderizados`);
for (const a of articles) console.log(`    ${a.url}  (${a.words} palabras)`);
console.log(`\n  ${projects.length} proyectos prerenderizados`);
for (const p of projects) console.log(`    ${p.url}`);
console.log(`\n  /articles/ prerenderizado con ${listed} entradas`);
console.log(`  sitemap.xml regenerado con ${urls} URLs\n`);
