// Function to format date
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Function to create document row
function createDocumentRow(document) {
    return `
        <tr onclick="window.open('/document/${document.formid}', '_blank', 'noopener')" style="cursor: pointer;">
            <td>${document.personName || 'N/A'}</td>
            <td>${document.personTC || 'N/A'}</td>
            <td>${document.course || 'N/A'}</td>
            <td>${formatDate(document.signedAt)}</td>
        </tr>
    `;
}

// Function to fetch and display signed documents
async function fetchSignedDocuments() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/signed-documents', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }

        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const tableHTML = `
                <div class="signed-documents-container">
                    <h2>İmzalanan Belgeler</h2>
                    <table class="signed-documents-table">
                        <thead>
                            <tr>
                                <th>İsim</th>
                                <th>TC No</th>
                                <th>Kurs</th>
                                <th>İmzalama Tarihi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.data.map(doc => createDocumentRow(doc)).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            document.getElementById('signedDocumentsList').innerHTML = tableHTML;
        } else {
            document.getElementById('signedDocumentsList').innerHTML = `
                <div class="signed-documents-container">
                    <h2>İmzalanan Belgeler</h2>
                    <p>Henüz imzalanmış belge bulunmamaktadır.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching signed documents:', error);
        document.getElementById('signedDocumentsList').innerHTML = `
            <div class="signed-documents-container">
                <h2>İmzalanan Belgeler</h2>
                <p class="error">Belgeler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.</p>
            </div>
        `;
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchSignedDocuments); 