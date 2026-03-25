const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Rutas específicas ANTES de archivos estáticos
app.get('/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'articles.html'));
});

app.get('/article/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'article.html'));
});

app.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'privacy-policy.html'));
});

// Servir archivos estáticos desde la raíz
app.use(express.static(__dirname));

// 404 para rutas no encontradas
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'src', '404.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 