document.getElementById("loginBtn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("pass").value;
    const errorElem = document.getElementById("error");
    errorElem.textContent = "";

    if (!username || !password) {
        errorElem.textContent = "Kullanıcı adı ve şifre gereklidir.";
        return;
    }

    try {
        const response = await fetch("https://your.api/endpoint/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include", // optional: for cookies/session tokens
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            errorElem.textContent = "Giriş başarısız. Bilgileri kontrol edin.";
            return;
        }

        const data = await response.json();

        // You can use sessionStorage, localStorage, or cookies to store auth token
        // Example: localStorage.setItem("token", data.token);

        // Redirect on success
        window.location.href = "/admin/dashboard.html";
    } catch (error) {
        console.error("Login error:", error);
        errorElem.textContent = "Sunucu hatası. Lütfen tekrar deneyin.";
    }
});
