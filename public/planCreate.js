document.getElementById("odemeForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Sayfanın yenilenmesini önler

    const gonderButonu = document.getElementById("gonderButonu");
    const yukleniyorAnimasyon = document.getElementById("yukleniyorAnimasyon");

    // Butonu devre dışı bırak ve animasyonu göster
    gonderButonu.disabled = true;
    yukleniyorAnimasyon.style.display = "inline-block";

    // get data
    const kayitadi = document.getElementById("kayitadi").value;
    const imageFile = document.getElementById("payPlan").files[0];
    const formData = new FormData();
    formData.append("kayitadi", kayitadi);
    formData.append("payPlan", imageFile);

    try {
        const response = await fetch('/api/paymentplan', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data && data.link) {
            document.getElementById("linkSonucu").innerHTML =
                `Oluşturulan Link: <a href="${data.link}" target="_blank">${data.link}</a>`;
        } else {
            document.getElementById("linkSonucu").textContent = "Bir link cevabı alınamadı.";
        }
    } catch (error) {
        document.getElementById("linkSonucu").textContent = "Bir hata oluştu: " + error.message;
    } finally {
        gonderButonu.disabled = false;
        yukleniyorAnimasyon.style.display = "none";
    }
});

document.getElementById("hidePayment").onclick = function () {

    document.getElementById("odemeForm").classList.toggle("collapse");
};

document.getElementById("payPlan").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.getElementById("imagePreview");
            img.src = e.target.result;
            img.style.display = "block";
        };

        reader.readAsDataURL(file); // Read image as base64 URL
    }
});