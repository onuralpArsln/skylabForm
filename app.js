const express = require('express');
const path = require('path');
const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for form data

// Serve static files (like script.js)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'style')));

// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'formBasic.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'adminPanel.html'));
});

// API route
app.post('/api/data', (req, res) => {
    console.log('Received:', req.body);
    res.json({ message: 'Data received!', data: req.body });
});
app.post('/api/login', (req, res) => {
    console.log('Received:', req.body);

});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
