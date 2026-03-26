const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Rutas específicas ANTES de archivos estáticos
// Estas rutas sirven los mismos archivos que GitHub Pages servirá
app.get('/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles', 'index.html'));
});

// Article page - hash routing handles the slug client-side
app.get('/article', (req, res) => {
    res.sendFile(path.join(__dirname, 'article', 'index.html'));
});

app.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy-policy', 'index.html'));
});

// Servir archivos estáticos desde la raíz
app.use(express.static(__dirname));

// 404 para rutas no encontradas
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 