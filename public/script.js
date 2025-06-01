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
    formData.append('password', sanitizeInput(document.getElementById('password').value));
    formData.append('description', sanitizeInput(document.getElementById('description').value));
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
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

document.getElementById('username').addEventListener('input', function () {
    this.value = capitalizeWords(this.value.toLowerCase());
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
                    img.style.transform = "rotate(90deg)";
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
                    img.style.transform = "rotate(90deg)";
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
});