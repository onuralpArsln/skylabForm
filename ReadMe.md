npm init -y
npm install express mongodb helmet 
npm install express jsonwebtoken cookie-parser


node server.js
nodemon app.js to have live refresh

# Form Submission System

## Overview
This is a client-side JavaScript application that handles form submissions with various input types, including text fields, file uploads, and special input handling. The system includes input sanitization, validation, and proper form data handling.

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

## API Integration
- Endpoint: `/api/sign`
- Method: POST
- Content-Type: multipart/form-data
- Handles both successful submissions and error cases
- Implements proper error handling and user feedback

## Security Features
1. Input sanitization to prevent XSS attacks
2. File type validation
3. File size restrictions
4. Form submission prevention during processing

## Error Handling
- Network error handling
- File validation error messages
- Form submission error feedback
- Button state management during submission

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

## Dependencies
- Modern web browser with JavaScript support
- No external libraries required

## Implementation Notes
- The code uses event listeners for real-time input handling
- Implements proper async/await pattern for API calls
- Uses modern JavaScript features for DOM manipulation
- Implements proper error handling and user feedback mechanisms
