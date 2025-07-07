npm init -y
npm install express mongodb helmet 
npm install express jsonwebtoken cookie-parser


node server.js
nodemon app.js to have live refresh

# Form Submission System

## Overview
This is a client-side JavaScript application that handles form submissions with various input types, including text fields, file uploads, and special input handling. The system includes input sanitization, validation, and proper form data handling.

## API Endpoints

### Authentication Endpoints

#### POST `/api/login`
- **Purpose**: Authenticate admin users
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Giriş başarılı",
    "token": "JWT_TOKEN"
  }
  ```
- **Security**: Uses JWT for authentication
- **Token Storage**: JWT token is stored in localStorage

### Form Management Endpoints

#### POST `/api/paymentplan`
- **Purpose**: Create a new payment plan with form
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `kayitadi`: Student name
  - `course`: Course name
  - `payPlan`: Payment plan image file
- **Response**:
  ```json
  {
    "message": "Ödeme planı başarıyla alındı!",
    "link": "form_url"
  }
  ```
- **Features**:
  - Generates unique form ID
  - Stores payment plan image
  - Creates form link

#### POST `/api/sign`
- **Purpose**: Submit signed form with ID card images
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `username`: Full name
  - `agreementNumber`: Form ID
  - `tcno`: Turkish ID number
  - `email`: Email address
  - `adres`: Address
  - `birthdate`: Birth date
  - `phone`: Phone number
  - `kimlikFront`: Front ID card image
  - `kimlikBack`: Back ID card image
- **Features**:
  - Stores personal information
  - Handles ID card images
  - Records signing timestamp

#### GET `/api/signed-documents`
- **Purpose**: Retrieve list of signed documents
- **Headers**: 
  - `Authorization: Bearer JWT_TOKEN`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "personName": "string",
        "personTC": "string",
        "course": "string",
        "signedAt": "date"
      }
    ]
  }
  ```
- **Security**: Protected by JWT authentication
- **Features**:
  - Returns only signed documents
  - Includes signing timestamp
  - Formatted dates in Turkish locale

### Page Routes

#### GET `/form/:formid`
- **Purpose**: Display form for signing
- **Parameters**: 
  - `formid`: Unique form identifier
- **Features**:
  - Renders form template
  - Displays payment plan
  - Pre-fills available data

#### GET `/login`
- **Purpose**: Display admin login page
- **Features**:
  - Login form
  - Error handling
  - Token management

#### GET `/`
- **Purpose**: Admin dashboard
- **Security**: Protected by JWT
- **Features**:
  - Payment plan creation
  - Signed documents list
  - Form management

## Key Features

### Input Sanitization
- `sanitizeInput()` function removes potential HTML injection vectors by stripping `<` and `>` characters
- Input trimming to remove unnecessary whitespace

### Form Data Handling
The system supports two main form submission methods:

1. **Primary Form Submission**
   - Handles various input types:
     - Text inputs (username, email, address, etc.)
     - Radio buttons (gender)
     - Checkboxes (interests)
     - File uploads (profile image)
   - Implements file validation:
     - Restricts to PNG files only
     - Enforces 2MB file size limit
   - Uses FormData API for multipart/form-data submission

2. **Secondary Form Submission**
   - Handles identity verification form
   - Processes:
     - Personal information (username, TC number, email, etc.)
     - ID card images (front and back)
     - Agreement number
   - Implements button state management during submission

### Special Input Handling

#### Username Input
- Automatic capitalization of words
- Converts input to lowercase before capitalizing

#### TC Number Input
- Real-time synchronization with signature display elements
- Updates all elements with class 'tcnoimza' when input changes

#### ID Card Image Handling
- Supports both front and back ID card images
- Implements image preview functionality
- Handles image orientation automatically
- Uses FileReader API for base64 image conversion

#### Terms and Conditions
- Synchronized checkbox behavior
- All terms checkboxes are linked together

## Security Features
1. Input sanitization to prevent XSS attacks
2. File type validation
3. File size restrictions
4. Form submission prevention during processing
5. JWT-based authentication
6. Protected API endpoints

## Error Handling
- Network error handling
- File validation error messages
- Form submission error feedback
- Button state management during submission
- Authentication error handling
- API error responses

## Browser Compatibility
- Uses modern JavaScript features
- Requires FileReader API support
- Requires FormData API support

## Usage Notes
1. Ensure all required form fields are present in the HTML
2. File uploads are restricted to PNG format
3. Maximum file size is 2MB
4. Form submission is prevented during processing
5. All inputs are sanitized before submission
6. JWT token must be present for protected routes

## Dependencies
- Modern web browser with JavaScript support
- No external libraries required

## Implementation Notes
- The code uses event listeners for real-time input handling
- Implements proper async/await pattern for API calls
- Uses modern JavaScript features for DOM manipulation
- Implements proper error handling and user feedback mechanisms
- JWT token management for authentication
- Secure file upload handling

### LLM Code Agent Guide

This section provides a detailed breakdown of the project's structure, logic, and key components to facilitate understanding and modification by AI code agents.

#### 1. Project Goal

The application is a web-based form submission and management system. It allows an administrator to create "payment plan" forms, which include uploading a document. A unique link is generated for each form. A user (student) can then access this link to fill in their personal details, upload identity documents, and digitally sign the form. The administrator has a dashboard to create these forms and view all the completed, signed submissions.

#### 2. Core Technologies

*   **Backend:** Node.js
*   **Web Framework:** Express.js for routing and middleware.
*   **Database:** MongoDB for storing user data, form data, and file metadata. The native `mongodb` driver is used.
*   **File Uploads:** `multer` middleware for handling `multipart/form-data` submissions, specifically for payment plan images and ID card images.
*   **Authentication:** JSON Web Tokens (JWT) for securing admin-only API endpoints.
*   **Security:** `helmet` for setting various security-related HTTP headers.
*   **Environment Variables:** `dotenv` for managing configuration from a `.env` file.
*   **Templating (likely):** An Express-compatible view engine like EJS is likely used to render the HTML pages, given the presence of `ejs` in the dependencies.

#### 3. Inferred File Structure & Purpose

Based on the project's dependencies and functionality, the file structure is likely organized as follows:

*   `server.js` (or `app.js`): The main application entry point.
    *   Initializes the Express app.
    *   Connects to the MongoDB database.
    *   Configures middleware (e.g., `express.json()`, `helmet()`, `cookieParser()`, `express.static()`).
    *   Sets up `multer` for file storage.
    *   Defines and mounts the application's routers.
    *   Starts the HTTP server.

*   `/routes`: Contains the route handlers for different parts of the application.
    *   `api.js`: Defines API endpoints like `/api/login`, `/api/paymentplan`, `/api/sign`, and `/api/signed-documents`.
    *   `pages.js`: Defines page-rendering routes like `/`, `/login`, and `/form/:formid`.

*   `/middleware`: Contains custom middleware functions.
    *   `auth.js`: A middleware function that verifies the JWT from the `Authorization` header. It's used to protect admin-only routes (e.g., `/`, `/api/signed-documents`).

*   `/models`: Contains the MongoDB data schemas (likely using Mongoose, or plain objects with the native driver).
    *   `paymentPlan.js`: Schema for the `paymentplans` collection. Fields would include `_id` (auto-generated), `formId` (the unique ID for the URL), `kayitadi`, `course`, and `payPlanImagePath`.
    *   `signedDocument.js`: Schema for the `signeddocuments` collection. Fields would include `_id`, `agreementNumber` (linking to `formId`), `username`, `tcno`, `email`, `adres`, `birthdate`, `phone`, `kimlikFrontPath`, `kimlikBackPath`, and `signedAt`.
    *   `admin.js`: Schema for admin users. Fields would include `username` and `password` (hashed).

*   `/public`: Contains all static assets served to the client.
    *   `/js/main.js`: Client-side JavaScript for the admin dashboard. Handles creating payment plans and fetching/displaying signed documents.
    *   `/js/form.js`: Client-side JavaScript for the `/form/:formid` page. Handles input validation, image previews, and form submission via `fetch` to `/api/sign`.
    *   `/js/login.js`: Client-side JavaScript for the login page. Handles submitting credentials and storing the returned JWT in `localStorage`.
    *   `/css/style.css`: Stylesheets for the application.

*   `/views`: Contains the EJS (or other templating engine) files.
    *   `index.ejs`: The admin dashboard.
    *   `login.ejs`: The admin login page.
    *   `form.ejs`: The user-facing form for signing.

*   `/uploads`: The directory where `multer` saves all uploaded files. This directory should be configured to be accessible if the images need to be served directly (e.g., `/uploads/payment-plans/` and `/uploads/id-cards/`).

*   `.env`: Stores sensitive configuration data.
    *   `MONGO_URI`: The connection string for the MongoDB database.
    *   `JWT_SECRET`: The secret key for signing and verifying JSON Web Tokens.
    *   `ADMIN_USERNAME`: The administrator's username.
    *   `ADMIN_PASSWORD`: The administrator's password.
    *   `PORT`: The port on which the server runs.

#### 4. Key Logic Flows

1.  **Admin Authentication Flow (`/api/login`)**
    *   **Trigger:** Admin submits login form.
    *   **Process:**
        1.  The route handler for `POST /api/login` receives `username` and `password`.
        2.  It queries the database for an admin matching the `username`.
        3.  It compares the submitted `password` with the stored (hashed) password.
        4.  If credentials are valid, it creates a JWT containing the admin's ID or username, signed with `JWT_SECRET`.
        5.  It returns the token to the client.
    *   **Client-side:** The client receives the token and stores it in `localStorage`. For subsequent protected requests, it adds an `Authorization: Bearer <token>` header.

2.  **Payment Plan Creation Flow (`/api/paymentplan`)**
    *   **Trigger:** Admin submits the "Create Payment Plan" form from the dashboard.
    *   **Process:**
        1.  The request is `multipart/form-data`. The `multer` middleware is executed first.
        2.  `multer` parses the form fields (`kayitadi`, `course`) and the file (`payPlan`). It saves the file to the configured `uploads` directory with a unique name to prevent collisions.
        3.  The file's path and other form data are attached to the `req` object (e.g., `req.file`, `req.body`).
        4.  The route handler generates a unique `formid` (e.g., using `crypto` or a UUID library).
        5.  It saves a new document to the `paymentplans` collection with the data and the generated `formid`.
        6.  It constructs the full URL (`/form/<formid>`) and sends it back to the admin in the JSON response.

3.  **Form Signing Flow (`/api/sign`)**
    *   **Trigger:** A user fills out and submits the form at a `/form/:formid` URL.
    *   **Process:**
        1.  This is also a `multipart/form-data` request. `multer` is configured to handle two files: `kimlikFront` and `kimlikBack`.
        2.  `multer` saves the ID card images to the `uploads` directory. The file information is attached to `req.files`.
        3.  The route handler receives the text fields in `req.body` and the file info in `req.files`.
        4.  It creates a new document in the `signeddocuments` collection, storing all the personal information, the `agreementNumber` (which is the `formid` from the URL), the paths to the two ID images, and the current timestamp for `signedAt`.
        5.  It returns a success message to the user.

4.  **Data Retrieval Flow (`/api/signed-documents`)**
    *   **Trigger:** The admin dashboard page loads and needs to display the list of signed documents.
    *   **Process:**
        1.  The client sends a `GET` request to `/api/signed-documents`.
        2.  The `auth.js` middleware runs first. It extracts the token from the `Authorization` header, verifies its signature and validity using `jsonwebtoken.verify()`. If the token is invalid or missing, it sends a `401 Unauthorized` or `403 Forbidden` response. If valid, it calls `next()`.
        3.  The route handler queries the `signeddocuments` collection in the database.
        4.  It formats the data as needed (e.g., formatting the `signedAt` date) and sends the array of documents back to the client as a JSON response.
