## Skylab Form

Lightweight Node.js/Express app to create, share, and sign course agreements. Admins generate a unique link with an uploaded payment plan; students complete the form, upload ID images, and submit. Admins can list signed documents and view details.

### Tech Stack
- Backend: Node.js, Express 5
- Views: EJS templates
- Database: MongoDB (native `mongodb` driver)
- Uploads: `multer` (memory storage; images stored as binary in MongoDB)
- Auth: JWT (`jsonwebtoken`)
- Env: `dotenv`

### Project Structure
- `app.js`: Server, routes, MongoDB access, JWT auth
- `views/`: `form.ejs`, `adminLogin.html`, `adminDash.html`, `documentDetails.ejs`
- `public/`: Client scripts
  - `login.js` (admin auth)
  - `planCreate.js` (create payment plan + link)
  - `signedDocuments.js` (list signed docs)
  - `script.js` (form page logic)
- `style/`: `form.css`, `login.css`
- `images/`: static assets

### Prerequisites
- Node.js 18+
- MongoDB connection string

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root:
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
   WEBAPPUSER=<admin_username>
   PASS=<admin_password>
   KEY=<jwt_secret>
   ```
3. Start the server:
   ```bash
   node app.js
   ```
   The app runs on http://localhost:3000.

### How to Use
- Admin login: open `http://localhost:3000/login`, sign in with `WEBAPPUSER` / `PASS`.
- Create payment plan: use the dashboard to upload a plan and generate a link.
- Share link: send the generated URL (e.g., `/form/<formid>`) to the student.
- Student signs: the form shows the plan; student fills details, uploads ID images, and submits.
- View submissions: dashboard lists signed documents; click a row to view details.

### Routes & API
- Pages
  - `GET /login` → Admin login page
  - `GET /` → Admin dashboard gate (JWT in `Authorization` header)
  - `GET /adminDash.html` → Static dashboard page
  - `GET /form/:formid` → Render signing form for a specific agreement
  - `GET /document/:formid` → Render details of a signed document

- Auth
  - `POST /api/login`
    - Body: `{ username, password }`
    - Response: `{ message, token }`

- Form management
  - `POST /api/paymentplan` (multipart/form-data)
    - Fields: `kayitadi` (string), `course` (string), `payPlan` (file)
    - Response: `{ message, link }` where `link` is `/form/<formid>`

  - `POST /api/sign` (multipart/form-data)
    - Fields: `username`, `agreementNumber`, `tcno`, `email`, `adres`, `birthdate`, `phone`, `kimlikFront` (file), `kimlikBack` (file)
    - Updates the record for the given `agreementNumber` and stores images and `signedAt`

- Admin data (JWT required via `Authorization: Bearer <token>`)
  - `GET /api/signed-documents`
    - Response: `{ success: true, data: [{ formid, personName, personTC, course, signedAt }] }`

### Data Model (collection: `users`)
- `formid` (string)
- `kayitadi` (string)
- `course` (string)
- `paymentPlan` { data: Buffer, contentType, originalName }
- After signing:
  - `personName`, `personMail`, `personTC`, `personAdres`, `personBirthDate`, `personPhone`
  - `kimlikFront` / `kimlikBack` { data: Buffer, contentType, originalName }
  - `signedAt` (Date)

### Notes
- Static assets are served from `public/`, `images/`, `style/`, and `views/`.
- JWT is stored client-side in `localStorage` and attached to protected requests.

### Known Issues / TODO
- `POST /api/sign` does not send a response yet; clients may hang awaiting JSON. Add a success response.
- `public/script.js` contains an early, generic form submit handler targeting `YOUR_API_ENDPOINT_HERE`. It conflicts with the real handler. Remove the obsolete block or guard it.
- In `GET /form/:formid`, variables `agreementNumber`, `isim`, `course` are assigned without declaration. Declare them with `const/let` before use.
- `package.json`:
  - `main` points to `index.js` (actual entry is `app.js`).
  - No `start` script. Consider adding: `"start": "node app.js"`.
  - `mongoose`, `helmet`, `cookie-parser` are listed but not used in code (helmet imported but not applied). Consider removing or wiring up.
- Consider not serving `views/` statically in production to avoid exposing templates directly.

---

For development and deployment hardening, enable `helmet`, add proper error responses, and write minimal tests.
