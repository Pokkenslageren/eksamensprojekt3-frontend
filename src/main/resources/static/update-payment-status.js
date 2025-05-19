document.getElementById('updateBtn').addEventListener('click', async function () {
    const memberId = document.getElementById('memberId').value;
    const status = document.getElementById('paymentStatus').value;

    const response = await fetch(`http://localhost:8080/members/${memberId}/payment-status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(status)
    });

    const result = document.getElementById('result');
    if (response.ok) {
        result.textContent = 'Payment status updated successfully.';
    } else {
        result.textContent = 'Error updating payment status.';
    }
});
