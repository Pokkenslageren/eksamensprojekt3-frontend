let allMembers = [];
let currentSort = { key: '', ascending: true };

window.initMemberPage = async function () {
    if (window.memberPageInitialized) return;
    window.memberPageInitialized = true;

    const filterDropdown = document.getElementById('statusFilter');
    const tableBody = document.querySelector('#membersTable tbody');

    if (!filterDropdown || !tableBody) {
        console.error('Medlemssiden kunne ikke initialiseres – mangler DOM-elementer.');
        return;
    }

    try {
        const API_BASE = 'http://localhost:8080/fodboldklub/members';
        const response = await fetch(`${API_BASE}`);
        allMembers = await response.json();

        renderTable(allMembers);

        filterDropdown.addEventListener('change', () => {
            const selected = filterDropdown.value;
            const filtered = selected === 'ALL'
                ? allMembers
                : allMembers.filter(m => m.paymentStatus === selected);

            renderTable(filtered);
        });

    } catch (error) {
        console.error('Failed to load members:', error);
        tableBody.innerHTML =
            `<tr><td colspan="4">Error loading members</td></tr>`;
    }
};



function renderTable(members) {
    const tableBody = document.querySelector('#membersTable tbody');

    tableBody.innerHTML = '';

    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.memberId}</td>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td class="${getStatusClass(member.paymentStatus)}">${member.paymentStatus}</td>
            <td>
                <a href="update-payment-status.html?memberId=${member.memberId}" class="btn btn-primary btn-sm">Opdatér betaling</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusClass(status) {
    switch (status) {
        case 'PAID': return 'status-paid';
        case 'UNPAID': return 'status-unpaid';
        case 'PARTIALLY_PAID': return 'status-partial';
        default: return '';
    }
}

function sortTable(key) {
    const ascending = currentSort.key === key ? !currentSort.ascending : true;
    currentSort = { key, ascending };

    const sorted = [...allMembers].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (typeof valA === 'number') {
            return ascending ? valA - valB : valB - valA;
        }

        return ascending
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
    });

    const selected = document.getElementById('statusFilter').value;
    const filtered = selected === 'ALL'
        ? sorted
        : sorted.filter(m => m.paymentStatus === selected);

    renderTable(filtered);
}
