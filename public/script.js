function sanitizeInput(value) {
    return value.trim().replace(/[<>]/g, ''); // Remove basic HTML injection vectors
}



// Method 1: Using FormData (recommended for file uploads)
document.getElementById('dataForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData();

    // Add all form fields to FormData
    formData.append('username', sanitizeInput(document.getElementById('username').value));
    formData.append('email', sanitizeInput(document.getElementById('email').value));
    formData.append('adres', sanitizeInput(document.getElementById('description').value));
    formData.append('category', sanitizeInput(document.getElementById('category').value));
    formData.append('age', sanitizeInput(document.getElementById('age').value));
    formData.append('birthdate', sanitizeInput(document.getElementById('birthdate').value));
    formData.append('phone', sanitizeInput(document.getElementById('phone').value));


    // Handle radio button (gender)
    const selectedGender = document.querySelector('input[name="gender"]:checked');
    if (selectedGender) {
        formData.append('gender', selectedGender.value);
    }

    // Handle checkboxes (interests)
    const selectedInterests = [];
    document.querySelectorAll('input[name="interests"]:checked').forEach(checkbox => {
        selectedInterests.push(checkbox.value);
    });
    formData.append('interests', JSON.stringify(selectedInterests));

    // Handle file upload
    // Handle file upload with validation
    const profileImageInput = document.getElementById('profileImage');
    const profileImage = profileImageInput.files[0];
    if (profileImage) {
        const allowedTypes = ['image/png'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!allowedTypes.includes(profileImage.type)) {
            alert('Only PNG images are allowed.');
            return;
        }

        if (profileImage.size > maxSize) {
            alert('File size must be less than 2MB.');
            return;
        }

        formData.append('profileImage', profileImage);
    }

    try {
        const response = await fetch('YOUR_API_ENDPOINT_HERE', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header manually when using FormData
            // The browser will set it automatically with the correct boundary
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Success:', result);
            alert('Form submitted successfully!');
        } else {
            console.error('Error:', response.statusText);
            alert('Error submitting form');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error occurred');
    }
});




function capitalizeWords(str) {
    // Capitalize only after spaces, not special characters
    return str.replace(/(?:^|\s)\w/g, char => char.toLocaleUpperCase('tr-TR'));
}

document.getElementById('username').addEventListener('input', function () {
    // Use Turkish locale for proper lowercase conversion
    this.value = capitalizeWords(this.value.toLocaleLowerCase('tr-TR'));
});


document.getElementById('tcno').addEventListener('input', function () {
    const value = this.value;
    const imzaDivler = document.querySelectorAll('.tcnoimza');
    imzaDivler.forEach(div => {
        div.textContent = value;
    });
});


document.getElementById("kimlik").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.getElementById("imagePreviewkimlik");
            img.onload = function () {
                if (img.naturalHeight > img.naturalWidth) {
                    // img.style.transform = "rotate(90deg)";
                    img.style.transform = "none";
                } else {
                    img.style.transform = "none"; // Reset if not needed
                }
            };
            img.src = e.target.result;
            img.style.display = "block";
        };

        reader.readAsDataURL(file); // Read image as base64 URL
    }
});




document.getElementById("kimlik2").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.getElementById("imagePreviewkimlik2");
            img.onload = function () {
                if (img.naturalHeight > img.naturalWidth) {
                    // img.style.transform = "rotate(90deg)";
                    img.style.transform = "none";
                } else {
                    img.style.transform = "none"; // Reset if not needed
                }
            };
            img.src = e.target.result;
            img.style.display = "block";
        };

        reader.readAsDataURL(file); // Read image as base64 URL
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="terms"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const isChecked = this.checked;
            checkboxes.forEach(cb => cb.checked = isChecked);
        });
    });

    // Add real-time age validation for birth date field
    const birthdateInput = document.getElementById('birthdate');
    if (birthdateInput) {
        // Set maximum date to 18 years ago from today
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        birthdateInput.max = maxDate.toISOString().split('T')[0];

        birthdateInput.addEventListener('change', function () {
            const validation = validateAge(this.value);
            const errorElement = this.parentElement.querySelector('.age-error') ||
                this.parentElement.querySelector('.error-message');

            // Remove existing error message
            if (errorElement) {
                errorElement.remove();
            }

            if (!validation.isValid) {
                // Create error message element
                const errorDiv = document.createElement('div');
                errorDiv.className = 'age-error';
                errorDiv.style.color = '#e74c3c';
                errorDiv.style.fontSize = '12px';
                errorDiv.style.marginTop = '5px';
                errorDiv.textContent = validation.message;

                // Insert error message after the input
                this.parentElement.appendChild(errorDiv);

                // Add red border to input
                this.style.borderColor = '#e74c3c';
            } else {
                // Remove red border
                this.style.borderColor = '';
            }
        });
    }
});




// Function to validate age (18 or older)
function validateAge(birthdate) {
    if (!birthdate) {
        return { isValid: false, message: "Doğum tarihi gereklidir." };
    }

    const today = new Date();
    const birthDate = new Date(birthdate);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Check if birthday has occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 18) {
        return { isValid: false, message: "18 yaşından küçük kullanıcılar kayıt olamaz." };
    }

    return { isValid: true, message: "" };
}

document.getElementById('dataForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById("username").value;
    const tcno = document.getElementById("tcno").value;
    const email = document.getElementById("email").value;
    const birthdate = document.getElementById("birthdate").value;
    const adres = document.getElementById("adres").value;
    const phone = document.getElementById("phone").value;



    // Validate age
    const ageValidation = validateAge(birthdate);
    if (!ageValidation.isValid) {
        alert(ageValidation.message);
        return;
    }

    // File inputs
    const kimlikFront = document.getElementById("kimlik").files[0];
    const kimlikBack = document.getElementById("kimlik2").files[0];

    const formData = new FormData();
    formData.append("username", username);
    formData.append("agreementNumber", window.agreementNumber);
    formData.append("tcno", tcno);
    formData.append("email", email);
    formData.append("adres", adres);
    formData.append("birthdate", birthdate);
    formData.append("phone", phone);
    formData.append("kimlikFront", kimlikFront);
    formData.append("kimlikBack", kimlikBack);

    const gonderButonu = document.getElementById("sign");
    gonderButonu.disabled = true;

    try {
        const response = await fetch('/api/sign', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Server returned non-JSON response:', text);
            alert('Sunucu hatası: Geçersiz yanıt formatı');
            return;
        }

        const data = await response.json();

        if (data.success) {
            alert('Belge başarıyla imzalandı!');
            // Optionally redirect or show success message
        } else {
            alert('Hata: ' + (data.message || 'Bilinmeyen hata'));
        }

    } catch (error) {
        console.error('Form submission error:', error);
        alert('Bir hata oluştu: ' + error.message);
    } finally {
        gonderButonu.disabled = false;
    }

});