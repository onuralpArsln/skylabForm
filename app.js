const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const path = require('path');
require('dotenv').config();

const mongo_uri = process.env.MONGO_URI

// create mongo client
const client = new MongoClient(mongo_uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// create api
const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Serve static files (like script.js)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'style')));
app.use(express.static(path.join(__dirname, 'views')));

// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'formBasic.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'adminLogin.html'));
});

app.get('/dash', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'adminDash.html'));
});

// API route
app.post('/api/data', (req, res) => {
    console.log('Received:', req.body);
    res.json({ message: 'Data received!', data: req.body });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)

    if (!username || !password) {
        return res.status(400).json({ message: "Kullanıcı adı ve şifre gereklidir." });
    }

    // Check credentials (dummy example)
    if (username === "admin" && password === "test") {
        // Generate token or set session cookie here

        // Example: send back success response
        return res.status(200).json({ message: "Giriş başarılı", token: "your_jwt_token_here" });
    } else {
        return res.status(401).json({ message: "Giriş başarısız. Bilgileri kontrol edin." });
    }
});

app.post('/api/paymentplan', async (req, res) => {
    const { aySayisi, aylikOdeme, baslangicTarihi, kayitadi } = req.body;

    console.log('Received:', req.body);

    // get calur for currentdate
    const now = new Date();

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const paymentId = `${year}${month}${day}${hours}${minutes}${seconds}`;

    // Dynamically build full URL using the current request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const link = `${baseUrl}/payment/${paymentId}`;


    try {
        await client.connect();
        const db = client.db("testDB"); // creates if not exists
        const users = db.collection("users");

        const result = await users.insertMany([
            {
                kayitadi: kayitadi,
                aySayisi: aySayisi,
                aylikOdeme: aylikOdeme,
                baslangicTarihi: baslangicTarihi,
                formid: paymentId
            },

        ]);

        console.log(`${result.insertedCount} documents inserted.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }

    res.json({
        message: 'Ödeme planı başarıyla alındı!',
        link: link
    });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
