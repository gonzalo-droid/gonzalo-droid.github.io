const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Servir archivos estáticos desde la raíz
app.use(express.static(__dirname));

// Manejar la ruta /articles
app.get('/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'articles.html'));
});

// Manejar la ruta /article/[slug]
app.get('/article/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'article.html'));
});

// Manejar la ruta /privacy-policy
app.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'privacy-policy.html'));
});

// Manejar todas las demás rutas con 404.html
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'src', '404.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 