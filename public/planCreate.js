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
    const courseName = document.getElementById("course").value;
    const formData = new FormData();
    formData.append("kayitadi", kayitadi);
    formData.append("payPlan", imageFile);
    formData.append("course", courseName);

    try {
        const response = await fetch('/api/paymentplan', {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error('Non-JSON response:', responseText);
            throw new Error(`Expected JSON but got: ${contentType}. Response: ${responseText.substring(0, 100)}...`);
        }

        const data = await response.json();

        if (data && data.link) {
            document.getElementById("linkSonucu").innerHTML =
                `Oluşturulan Link: <a href="${data.link}" target="_blank">${data.link}</a>`;
        } else {
            document.getElementById("linkSonucu").textContent = "Bir link cevabı alınamadı.";
        }
    } catch (error) {
        console.error('Full error:', error);
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

document.getElementById('kayitadi').addEventListener('input', function () {
    this.value = capitalizeWords(this.value.toLocaleLowerCase('tr-TR'));
});

document.getElementById('course').addEventListener('input', function () {
    this.value = capitalizeWords(this.value.toLocaleLowerCase('tr-TR'));
});


function capitalizeWords(str) {
    // Capitalize only after actual spaces, not after any characters
    return str.replace(/(?:^| )\w/g, char => char.toLocaleUpperCase('tr-TR'));
}