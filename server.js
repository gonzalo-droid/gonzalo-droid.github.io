const express = require('express');
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

app.get('/article/:slug', (req, res) => {
    res.sendFile('article/index.html', { root: __dirname });
});

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