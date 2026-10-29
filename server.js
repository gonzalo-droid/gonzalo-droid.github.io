const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const app = express();
const port = process.env.PORT || 8080;

// Rutas específicas ANTES de archivos estáticos
// Estas rutas sirven los mismos archivos que GitHub Pages servirá
// Note: sendFile is called with a root-relative path + { root: __dirname }
// rather than an absolute path built with path.join - on some filesystems
// (e.g. network volumes) express/send fails to resolve an absolute path
// passed directly to sendFile and returns a false 404.
app.get('/articles', (req, res) => {
    res.sendFile('articles/index.html', { root: __dirname });
});

// Article page - client-side JS reads the slug from the path (or hash, legacy)
app.get('/article', (req, res) => {
    res.sendFile('article/index.html', { root: __dirname });
});

// Si build:pages ya generó la página, se sirve esa — así local y producción
// enseñan lo mismo. Si no existe, cae a la plantilla y el JS resuelve el slug.
function servePrerendered(section) {
    return (req, res) => {
        const slug = String(req.params.slug || '').replace(/[^a-z0-9-]/gi, '');
        const built = path.join(section, slug, 'index.html');
        if (slug && fs.existsSync(path.join(__dirname, built))) {
            return res.sendFile(built, { root: __dirname });
        }
        res.sendFile(`${section}/index.html`, { root: __dirname });
    };
}

app.get('/article/:slug', servePrerendered('article'));

// Project detail page - client-side JS reads the slug from the path
app.get('/project', (req, res) => {
    res.sendFile('project/index.html', { root: __dirname });
});

app.get('/project/:slug', servePrerendered('project'));

app.get('/privacy-policy', (req, res) => {
    res.sendFile('privacy-policy/index.html', { root: __dirname });
});

// Servir archivos estáticos desde la raíz
app.use(express.static(__dirname));

// 404 para rutas no encontradas
app.use((req, res) => {
    res.status(404).sendFile('404.html', { root: __dirname });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 