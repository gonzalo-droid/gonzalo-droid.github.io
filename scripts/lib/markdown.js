// Conversor Markdown → HTML mínimo, solo para el prerenderizado de build-pages.
//
// Cubre exactamente la sintaxis que usan los artículos de este repo, verificada
// contándola sobre content/articles/*.md: encabezados, listas ordenadas y sin
// ordenar, bloques de código cercados, negrita e inline code. No hay tablas,
// citas ni enlaces en el contenido actual.
//
// En el navegador sigue mandando marked.js, que es más completo. Esto solo
// existe para que el crawler reciba texto en vez de "Cargando…", así que
// prefiere quedarse corto y escapar de más antes que inventar marcado.

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Negrita e inline code. Se aplica sobre texto YA escapado. */
function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function renderMarkdown(md) {
  const lines = String(md).replace(/\r\n/g, '\n').split('\n');
  const out = [];

  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let listType = null; // 'ul' | 'ol'
  let paraBuf = [];

  const closeParagraph = () => {
    if (paraBuf.length) {
      out.push(`<p>${inline(escapeHtml(paraBuf.join(' ')))}</p>`);
      paraBuf = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };
  const closeBlocks = () => {
    closeParagraph();
    closeList();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Bloques de código cercados: todo lo de dentro va escapado, sin tocar.
    const fence = line.match(/^```\s*([a-zA-Z0-9+#-]*)\s*$/);
    if (fence) {
      if (inCode) {
        const cls = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : '';
        out.push(`<pre><code${cls}>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        inCode = false;
        codeLang = '';
        codeBuf = [];
      } else {
        closeBlocks();
        inCode = true;
        codeLang = fence[1] || '';
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }

    if (line.trim() === '') {
      closeBlocks();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeBlocks();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(escapeHtml(heading[2].trim()))}</h${level}>`);
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      closeParagraph();
      if (listType !== 'ul') {
        closeList();
        out.push('<ul>');
        listType = 'ul';
      }
      out.push(`<li>${inline(escapeHtml(ul[1]))}</li>`);
      continue;
    }

    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      closeParagraph();
      if (listType !== 'ol') {
        closeList();
        out.push('<ol>');
        listType = 'ol';
      }
      out.push(`<li>${inline(escapeHtml(ol[1]))}</li>`);
      continue;
    }

    closeList();
    paraBuf.push(line.trim());
  }

  // Un bloque de código sin cerrar es un error del .md, no algo que tapar.
  if (inCode) {
    throw new Error(`Bloque de código sin cerrar (\`\`\`) en el Markdown`);
  }
  closeBlocks();

  return out.join('\n');
}

/** Texto plano, para meta description y para medir longitud. */
function toPlainText(md) {
  return String(md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { renderMarkdown, toPlainText, escapeHtml };
