const params = new URLSearchParams(window.location.search);
const memberIdFromUrl = params.get('memberId');
if (memberIdFromUrl) {
    document.getElementById('memberId').value = memberIdFromUrl;
}
document.getElementById('updateBtn').addEventListener('click', async function () {
    const memberId = document.getElementById('memberId').value;
    const status = document.getElementById('paymentStatus').value;
    const result = document.getElementById('result');

    if (!memberId || isNaN(memberId)) {
        result.textContent = 'Please enter a valid member ID.';
        return;
    }

    const payload = {
        status: status  // wraps it in a JSON object like { "status": "PAID" }
    };

    try {
        const API_BASE = 'http://localhost:8080/fodboldklub/members'
        const response = await fetch(`${API_BASE}/${memberId}/payment-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            result.textContent = 'Payment status updated successfully.';
            setTimeout(() => {
                window.history.back(); // or use location.href = 'index.html#betalinger';
            }, 1500);
        } else if (response.status === 404) {
            result.textContent = 'Member not found.';
        } else if (response.status === 400) {
            result.textContent = 'Invalid payment status.';
        } else {
            result.textContent = 'Error updating payment status.';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        result.textContent = 'Failed to connect to server.';
    }
});
