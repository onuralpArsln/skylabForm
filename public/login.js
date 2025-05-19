document.getElementById("loginBtn").addEventListener("click", async () => {
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
            credentials: "include", // For cookie/session-based auth
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

        // Store token if needed (e.g., JWT)
        // localStorage.setItem("token", data.token);

        // Redirect on success
        window.location.href = "/adminDash.html";

    } catch (error) {
        console.error("Login error:", error);
        errorElem.textContent = "Sunucu hatası. Lütfen tekrar deneyin.";
    } finally {
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
});

// Support Enter key in password input to trigger login
document.getElementById("pass").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("loginBtn").click();
    }
});
