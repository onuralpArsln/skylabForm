const { MongoClient } = require('mongodb');
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const helmet = require('helmet');

const multer = require('multer');
// Multer memory storage with size limits to avoid memory pressure
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024, files: 5 } });

require('dotenv').config();
const mongo_uri = process.env.MONGO_URI
const userName = process.env.WEBAPPUSER
const passWord = process.env.PASS
const secretKey = process.env.KEY

// Validate critical environment variables early
function validateEnv() {
    const missing = [];
    if (!mongo_uri) missing.push('MONGO_URI');
    if (!secretKey) missing.push('KEY');
    if (missing.length) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }
}
validateEnv();

// create mongo client (single, long-lived connection)
const client = new MongoClient(mongo_uri, {
    // Connection pool and keep-alive tuning to reduce idle disconnects
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 0,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 0,
});

let db; // shared DB handle

// create api
const app = express();

// Behind reverse proxy (Nginx) so trust X-Forwarded-* headers
app.set('trust proxy', 1);

// Hide Express internals
app.disable('x-powered-by');

// Security headers with CSS-friendly configuration
app.use(helmet({
    contentSecurityPolicy: false, // Temporarily disable CSP to test CSS
}));

// Middleware to parse JSON/body with sensible limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files (JS, images, CSS)
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Debug middleware to log static file requests
app.use((req, res, next) => {
    if (req.path.startsWith('/style/') || req.path.startsWith('/images/') || req.path.startsWith('/public/')) {
        console.log(`Static file request: ${req.path}`);
    }
    next();
});

// Do NOT expose view templates publicly

// Test route to verify static files are working
app.get('/test-css', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CSS Test</title>
            <link rel="stylesheet" href="/style/form.css">
            <style>
                .inline-test { color: blue; font-size: 20px; }
            </style>
        </head>
        <body>
            <h1 style="color: red;">This should be red if CSS is working</h1>
            <p class="inline-test">This should be blue if inline CSS works</p>
            <p>If you see this text in default black, CSS is not loading.</p>
            <div id="css-status">Checking CSS status...</div>
            <div id="debug-info"></div>
            <script>
                // Debug CSS loading
                const debugInfo = document.getElementById('debug-info');
                debugInfo.innerHTML = '<h3>Debug Information:</h3>';
                
                // Check if CSS link exists
                const cssLink = document.querySelector('link[href="/style/form.css"]');
                debugInfo.innerHTML += '<p>CSS Link found: ' + (cssLink ? 'YES' : 'NO') + '</p>';
                
                // Check CSS file accessibility
                fetch('/style/form.css')
                    .then(response => {
                        debugInfo.innerHTML += '<p>CSS file accessible: ' + response.status + '</p>';
                        return response.text();
                    })
                    .then(css => {
                        debugInfo.innerHTML += '<p>CSS content length: ' + css.length + '</p>';
                        debugInfo.innerHTML += '<p>CSS first line: ' + css.split('\\n')[0] + '</p>';
                    })
                    .catch(error => {
                        debugInfo.innerHTML += '<p>CSS fetch error: ' + error.message + '</p>';
                    });
                
                // Check computed styles
                setTimeout(() => {
                    const body = document.body;
                    const computedStyle = window.getComputedStyle(body);
                    const bgColor = computedStyle.backgroundColor;
                    const status = document.getElementById('css-status');
                    status.innerHTML = 'Background color: ' + bgColor + '<br>CSS loaded: ' + (bgColor !== 'rgba(0, 0, 0, 0)');
                    status.style.color = 'green';
                    
                    debugInfo.innerHTML += '<p>Computed background color: ' + bgColor + '</p>';
                }, 100);
            </script>
        </body>
        </html>
    `);
});

// Simple CSS test route
app.get('/css-test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Simple CSS Test</title>
        </head>
        <body style="background-color: #f0f0f0;">
            <h1 style="color: red;">Red Heading</h1>
            <p style="color: blue; font-size: 18px;">Blue paragraph with larger font</p>
            <div style="background-color: yellow; padding: 20px; margin: 10px;">
                <p>This div should have yellow background</p>
            </div>
            <p>If you see colors and styling above, inline CSS works.</p>
            <p>If everything looks plain, there's a browser issue.</p>
        </body>
        </html>
    `);
});

// Serve HTML page
app.get('/form/:formid', async (req, res) => {
    const formid = req.params.formid;

    try {
        const users = db.collection("users");

        const record = await users.findOne({ formid });

        if (!record) {
            return res.status(404).send('Form not found');
        }

        let imageSrc = null;
        if (record.paymentPlan && record.paymentPlan.data) {
            const base64Image = record.paymentPlan.data.toString('base64');
            imageSrc = `data:${record.paymentPlan.contentType};base64,${base64Image}`;

            const agreementNumber = formid;
            const isim = titleCase(record.kayitadi);
            const course = record.course;

        }

        res.render('form', { user: record, imageSrc, agreementNumber: formid, isim: titleCase(record.kayitadi), course: record.course });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'adminLogin.html'));
});

app.get('/', (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendFile(path.join(__dirname, 'views', 'adminLogin.html'));
        res.sendFile(path.join(__dirname, 'views', 'adminDash.html'));
    });

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
    if (username === userName && password === passWord) {
        // Generate token or set session cookie here
        const payload = { username };
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        // Example: send back success response
        return res.status(200).json({ message: "Giriş başarılı", token });
    } else {
        return res.status(401).json({ message: "Giriş başarısız. Bilgileri kontrol edin." });
    }
});

app.post('/api/paymentplan', upload.single('payPlan'), async (req, res) => {
    const { kayitadi, course } = req.body;
    const file = req.file;

    console.log('Body content:', req.body);


    // Generate unique payment ID using timestamp
    const now = new Date();
    const paymentId = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const link = `${baseUrl}/form/${paymentId}`;

    try {
        const users = db.collection("users");

        // Store image buffer and mimetype in DB document
        const imageData = file ? {
            data: file.buffer,
            contentType: file.mimetype,
            originalName: file.originalname
        } : null;

        const result = await users.insertOne({
            kayitadi: kayitadi,
            formid: paymentId,
            paymentPlan: imageData,
            course: course,
            createdAt: new Date()
        });

        console.log(`1 document inserted.`);
    } catch (err) {
        console.error(err);
    }

    res.json({
        message: 'Ödeme planı başarıyla alındı!',
        link: link
    });
});


app.post('/api/sign', upload.fields([
    { name: 'kimlikFront', maxCount: 1 },
    { name: 'kimlikBack', maxCount: 1 }
]), async (req, res) => {
    console.log('📝 Form Fields:', req.body);
    console.log('📎 Uploaded Files:', req.files);

    const kimlikFront = req.files['kimlikFront'] ? req.files['kimlikFront'][0] : null;
    const kimlikBack = req.files['kimlikBack'] ? req.files['kimlikBack'][0] : null;

    const kimlikFrontImage = kimlikFront ? {
        data: kimlikFront.buffer,
        contentType: kimlikFront.mimetype,
        originalName: kimlikFront.originalname
    } : null;

    const kimlikBackImage = kimlikBack ? {
        data: kimlikBack.buffer,
        contentType: kimlikBack.mimetype,
        originalName: kimlikBack.originalname
    } : null;



    try {
        const users = db.collection("users");




        const result = await users.updateOne(
            { formid: req.body.agreementNumber }, // Filter condition
            {
                $set: {
                    personName: req.body.username,
                    personMail: req.body.email,
                    personTC: req.body.tcno,
                    personAdres: req.body.adres,
                    personBirthDate: req.body.birthdate,
                    personPhone: req.body.phone,
                    kimlikFront: kimlikFrontImage,
                    kimlikBack: kimlikBackImage,
                    signedAt: new Date()
                }
            },
            { upsert: true } // optional: creates a new doc if none found
        );

        console.log("Update result:", result);
        return res.status(200).json({ success: true, message: 'Document signed successfully' });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, message: 'Failed to sign document' });
    }





});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication token required" });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

// Protected endpoint to get signed documents
app.get('/api/signed-documents', authenticateToken, async (req, res) => {
    try {
        const users = db.collection("users");

        // Find all documents that have been signed (have signedAt field)
        const signedDocuments = await users.find(
            { signedAt: { $exists: true } },
            {
                projection: {
                    formid: 1,
                    personName: 1,
                    personTC: 1,
                    course: 1,
                    signedAt: 1,
                    _id: 0
                }
            }
        ).toArray();

        res.json({
            success: true,
            data: signedDocuments
        });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching signed documents"
        });
    }
});

// Add new route for document details
app.get('/document/:formid', async (req, res) => {
    const formid = req.params.formid;

    try {
        const users = db.collection("users");

        const document = await users.findOne({ formid });

        if (!document) {
            return res.status(404).send('Document not found');
        }

        // Map the document fields to match the template variables
        const mappedDocument = {
            agreementNumber: document.formid,
            username: document.personName,
            tcno: document.personTC,
            email: document.personMail,
            birthdate: document.personBirthDate,
            adres: document.personAdres,
            phone: document.personPhone,
            course: document.course,
            signedAt: document.signedAt,
            kimlikFront: document.kimlikFront,
            kimlikBack: document.kimlikBack,
            paymentPlan: document.paymentPlan
        };

        // Convert binary image data to base64 for display
        if (mappedDocument.kimlikFront && mappedDocument.kimlikFront.data) {
            mappedDocument.kimlikFront = `data:${mappedDocument.kimlikFront.contentType};base64,${mappedDocument.kimlikFront.data.toString('base64')}`;
        }
        if (mappedDocument.kimlikBack && mappedDocument.kimlikBack.data) {
            mappedDocument.kimlikBack = `data:${mappedDocument.kimlikBack.contentType};base64,${mappedDocument.kimlikBack.data.toString('base64')}`;
        }
        if (mappedDocument.paymentPlan && mappedDocument.paymentPlan.data) {
            mappedDocument.paymentPlan = `data:${mappedDocument.paymentPlan.contentType};base64,${mappedDocument.paymentPlan.data.toString('base64')}`;
        }

        res.render('documentDetails', { document: mappedDocument });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

function titleCase(str) {
    return str
        .toLocaleLowerCase('tr-TR') // Use Turkish locale for proper lowercase
        .split(' ')
        .filter(Boolean) // boşlukları temizler
        .map(word => word[0].toLocaleUpperCase('tr-TR') + word.slice(1))
        .join(' ');
}

// Connect once at startup, keep the connection alive, and start the server
async function startServer() {
    try {
        await client.connect();
        db = client.db("testDB");
        // Warm-up ping and periodic keep-alive
        await db.command({ ping: 1 });
        setInterval(async () => {
            try {
                await db.command({ ping: 1 });
            } catch (pingError) {
                console.error('MongoDB ping failed:', pingError);
            }
        }, 5 * 60 * 1000); // every 5 minutes

        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || '0.0.0.0';
        httpServer = app.listen(PORT, HOST, () => {
            console.log(`Server listening on http://${HOST}:${PORT}`);
        });

        httpServer.on('error', (err) => {
            console.error('HTTP server error:', err);
        });
    } catch (startupError) {
        console.error('Failed to initialize MongoDB connection:', startupError);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
let httpServer; // keep reference for graceful shutdown
async function shutdown(signal) {
    try {
        console.log(`Received ${signal}, shutting down...`);
        if (httpServer) {
            await new Promise((resolve) => httpServer.close(resolve));
        }
        await client.close();
    } catch (err) {
        console.error('Error during shutdown:', err);
    } finally {
        process.exit(0);
    }
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Liveness/Readiness probe
app.get('/healthz', (req, res) => {
    res.status(200).send('ok');
});

// Simple readiness check (DB connected)
app.get('/readyz', (req, res) => {
    if (db) return res.status(200).send('ready');
    return res.status(503).send('not ready');
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const status = err.status || 500;
    res.status(status).json({ message: 'Internal Server Error' });
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
