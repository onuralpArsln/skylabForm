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
