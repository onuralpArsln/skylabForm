const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');

const multer = require('multer');
const upload = multer();  // Multer memory storage (no disk storage)

require('dotenv').config();
const mongo_uri = process.env.MONGO_URI
const userName = process.env.WEBAPPUSER
const passWord = process.env.PASS
const secretKey = process.env.KEY

// create mongo client (single, long-lived connection)
const client = new MongoClient(mongo_uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
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

// Middleware to parse JSON body with UTF-8 encoding
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files (like script.js)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'style')));
app.use(express.static(path.join(__dirname, 'views')));

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

            agreementNumber = formid;
            isim = titleCase(record.kayitadi);
            course = record.course

        }

        res.render('form', { user: record, imageSrc, agreementNumber, isim, course });
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
    const token = authHeader?.split(' ')[1];
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
    } catch (err) {
        console.error("Database error:", err);
    }





});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

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
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (startupError) {
        console.error('Failed to initialize MongoDB connection:', startupError);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await client.close();
    } finally {
        process.exit(0);
    }
});
