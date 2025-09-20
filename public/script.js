// Utility function to validate age (18 or older)
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

// Function to capitalize words with Turkish locale
function capitalizeWords(str) {
    // Capitalize only after spaces, not special characters
    return str.replace(/(?:^|\s)\w/g, char => char.toLocaleUpperCase('tr-TR'));
}

// Function to sanitize input values
function sanitizeInput(value) {
    return value.trim().replace(/[<>]/g, ''); // Remove basic HTML injection vectors
}

// Enhanced Feedback System (this function should be available from form.ejs)
// If not available, we'll define a fallback
if (typeof showFeedback === 'undefined') {
    function showFeedback(type, title, message) {
        alert(`${title}: ${message}`); // Fallback to alert if showFeedback not available
    }
}

// Sync TC number input with all tcnoimza divs
document.addEventListener('DOMContentLoaded', function () {
    const tcnoInput = document.getElementById('tcno');
    if (tcnoInput) {
        tcnoInput.addEventListener('input', function () {
            const value = this.value;
            const imzaDivler = document.querySelectorAll('.tcnoimza');
            imzaDivler.forEach(div => {
                div.textContent = value;
            });
        });
    }
});

// Sync all 'terms' checkboxes when any one is clicked
document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="terms"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const isChecked = this.checked;
            checkboxes.forEach(cb => cb.checked = isChecked);
        });
    });
});

// Username capitalization
document.addEventListener('DOMContentLoaded', function () {
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', function () {
            // Use Turkish locale for proper lowercase conversion
            this.value = capitalizeWords(this.value.toLocaleLowerCase('tr-TR'));
        });
    }
});

// Birth date validation and age restriction
document.addEventListener('DOMContentLoaded', function () {
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

// Image preview for kimlik front
document.addEventListener('DOMContentLoaded', function () {
    const kimlikInput = document.getElementById("kimlik");
    if (kimlikInput) {
        kimlikInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const img = document.getElementById("imagePreviewkimlik");
                    if (img) {
                        img.onload = function () {
                            if (img.naturalHeight > img.naturalWidth) {
                                img.style.transform = "none";
                            } else {
                                img.style.transform = "none";
                            }
                        };
                        img.src = e.target.result;
                        img.style.display = "block";
                    }
                };

                reader.readAsDataURL(file);
            }
        });
    }
});

// Image preview for kimlik back
document.addEventListener('DOMContentLoaded', function () {
    const kimlik2Input = document.getElementById("kimlik2");
    if (kimlik2Input) {
        kimlik2Input.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const img = document.getElementById("imagePreviewkimlik2");
                    if (img) {
                        img.onload = function () {
                            if (img.naturalHeight > img.naturalWidth) {
                                img.style.transform = "none";
                            } else {
                                img.style.transform = "none";
                            }
                        };
                        img.src = e.target.result;
                        img.style.display = "block";
                    }
                };

                reader.readAsDataURL(file);
            }
        });
    }
});

// Main form submission handler
document.addEventListener('DOMContentLoaded', function () {
    const dataForm = document.getElementById('dataForm');
    if (dataForm) {
        dataForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission

            console.log('🚀 Form submission started');

            const username = document.getElementById("username").value;
            const tcno = document.getElementById("tcno").value;
            const email = document.getElementById("email").value;
            const birthdate = document.getElementById("birthdate").value;
            const adres = document.getElementById("adres").value;
            const phone = document.getElementById("phone").value;

            console.log('📋 Form data collected:', {
                username,
                tcno,
                email,
                birthdate,
                adres,
                phone,
                agreementNumber: window.agreementNumber
            });

            // Validate age
            const ageValidation = validateAge(birthdate);
            if (!ageValidation.isValid) {
                showFeedback('error', 'Yaş Hatası!', ageValidation.message);
                return;
            }

            // File inputs
            const originalKimlikFront = document.getElementById("kimlik").files[0];
            const originalKimlikBack = document.getElementById("kimlik2").files[0];

            console.log('📁 File inputs:', {
                kimlikFront: originalKimlikFront ? `${originalKimlikFront.name} (${originalKimlikFront.size} bytes)` : 'No file',
                kimlikBack: originalKimlikBack ? `${originalKimlikBack.name} (${originalKimlikBack.size} bytes)` : 'No file'
            });

            let kimlikFront = originalKimlikFront;
            let kimlikBack = originalKimlikBack;

            // Compress images if they're larger than 1MB
            if (originalKimlikFront && originalKimlikFront.size > 1024 * 1024) {
                try {
                    const progressElement = document.getElementById("compressionProgressFront");
                    if (progressElement) {
                        progressElement.innerHTML = '<div style="color: #666; font-size: 12px;">Kimlik ön yüz sıkıştırılıyor...</div>';
                    }

                    if (window.imageCompressor && window.imageCompressor.compressImage) {
                        kimlikFront = await window.imageCompressor.compressImage(originalKimlikFront, (progress) => {
                            if (progressElement && window.imageCompressor.showProgress) {
                                window.imageCompressor.showProgress("compressionProgressFront", progress);
                            }
                        });

                        if (progressElement && window.imageCompressor.showResult) {
                            const success = kimlikFront.size <= 1024 * 1024;
                            window.imageCompressor.showResult("compressionProgressFront", originalKimlikFront.size, kimlikFront.size, success);
                        }
                    } else {
                        console.warn('Image compressor not available, using original image');
                    }
                } catch (error) {
                    console.error('Front ID compression failed:', error);
                    showFeedback('error', 'Resim Sıkıştırma Hatası!', 'Kimlik ön yüz sıkıştırılırken hata oluştu: ' + error.message + '. Lütfen daha küçük bir resim seçin.');
                    return;
                }
            }

            if (originalKimlikBack && originalKimlikBack.size > 1024 * 1024) {
                try {
                    const progressElement = document.getElementById("compressionProgressBack");
                    if (progressElement) {
                        progressElement.innerHTML = '<div style="color: #666; font-size: 12px;">Kimlik arka yüz sıkıştırılıyor...</div>';
                    }

                    if (window.imageCompressor && window.imageCompressor.compressImage) {
                        kimlikBack = await window.imageCompressor.compressImage(originalKimlikBack, (progress) => {
                            if (progressElement && window.imageCompressor.showProgress) {
                                window.imageCompressor.showProgress("compressionProgressBack", progress);
                            }
                        });

                        if (progressElement && window.imageCompressor.showResult) {
                            const success = kimlikBack.size <= 1024 * 1024;
                            window.imageCompressor.showResult("compressionProgressBack", originalKimlikBack.size, kimlikBack.size, success);
                        }
                    } else {
                        console.warn('Image compressor not available, using original image');
                    }
                } catch (error) {
                    console.error('Back ID compression failed:', error);
                    showFeedback('error', 'Resim Sıkıştırma Hatası!', 'Kimlik arka yüz sıkıştırılırken hata oluştu: ' + error.message + '. Lütfen daha küçük bir resim seçin.');
                    return;
                }
            }

            const formData = new FormData();
            formData.append("username", sanitizeInput(username));
            formData.append("agreementNumber", window.agreementNumber);
            formData.append("tcno", sanitizeInput(tcno));
            formData.append("email", sanitizeInput(email));
            formData.append("adres", sanitizeInput(adres));
            formData.append("birthdate", sanitizeInput(birthdate));
            formData.append("phone", sanitizeInput(phone));
            formData.append("kimlikFront", kimlikFront);
            formData.append("kimlikBack", kimlikBack);

            console.log('📤 FormData prepared for submission');
            console.log('🔑 Agreement Number:', window.agreementNumber);

            const gonderButonu = document.getElementById("sign");
            const originalButtonText = gonderButonu.textContent;
            gonderButonu.disabled = true;
            gonderButonu.textContent = "İmzalanıyor...";

            // Show loading feedback
            showFeedback('info', 'İşlem Devam Ediyor', 'Belgeniz imzalanıyor, lütfen bekleyin...');

            try {
                console.log('🌐 Sending request to /api/sign...');
                const response = await fetch('/api/sign', {
                    method: 'POST',
                    body: formData
                });

                console.log('📡 Response received:', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                    headers: Object.fromEntries(response.headers.entries())
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Server returned non-JSON response:', text);
                    showFeedback('error', 'Sunucu Hatası!', 'Sunucu hatası: Geçersiz yanıt formatı. Lütfen daha sonra tekrar deneyin.');
                    return;
                }

                const data = await response.json();
                console.log('📄 Response data:', data);

                if (data.success) {
                    console.log('✅ Signing successful!');
                    showFeedback('success', 'Başarılı!', 'Belge başarıyla imzalandı! Sözleşmeniz onaylandı.');
                    // Clear form data from localStorage after successful submission
                    localStorage.clear();
                } else {
                    console.log('❌ Signing failed:', data.message);
                    showFeedback('error', 'Hata!', 'Hata: ' + (data.message || 'Bilinmeyen hata oluştu. Lütfen tekrar deneyin.'));
                }

            } catch (error) {
                console.error('Form submission error:', error);
                showFeedback('error', 'Bağlantı Hatası!', 'Bir hata oluştu: ' + error.message + '. İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
            } finally {
                gonderButonu.disabled = false;
                gonderButonu.textContent = originalButtonText;
            }
        });
    }
});