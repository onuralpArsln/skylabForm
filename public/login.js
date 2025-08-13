document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("pass").value;
            const errorElem = document.getElementById("error");
            const loginBtn = document.getElementById("loginBtn");

            errorElem.textContent = "";

            if (!username || !password) {
                errorElem.textContent = "Kullanıcı adı ve şifre gereklidir.";
                return;
            }

            // Disable button and show loading text
            loginBtn.disabled = true;
            const originalText = loginBtn.textContent;
            loginBtn.textContent = "Giriş yapılıyor...";

            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    errorElem.textContent = "Giriş başarısız. Bilgileri kontrol edin.";
                    return;
                }

                let data;
                try {
                    data = await response.json();
                } catch (jsonErr) {
                    errorElem.textContent = "Beklenmeyen sunucu yanıtı.";
                    return;
                }

                // Store token in localStorage
                if (data.token) {
                    console.log('Storing token in localStorage:', data.token.substring(0, 20) + '...');
                    localStorage.setItem('token', data.token);
                    console.log('Token stored, redirecting to admin dashboard...');
                    window.location.href = "/adminDash.html";
                } else {
                    errorElem.textContent = "Token alınamadı. Lütfen tekrar deneyin.";
                }

            } catch (error) {
                console.error("Login error:", error);
                errorElem.textContent = "Sunucu hatası. Lütfen tekrar deneyin.";
            } finally {
                // Re-enable button
                loginBtn.disabled = false;
                loginBtn.textContent = originalText;
            }
        });
    }
});

// Support Enter key in password input to trigger login
document.addEventListener('DOMContentLoaded', function () {
    const passInput = document.getElementById("pass");
    if (passInput) {
        passInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                document.getElementById("loginBtn").click();
            }
        });
    }
});
