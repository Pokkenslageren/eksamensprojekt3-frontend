document.addEventListener("DOMContentLoaded", () => {
    const membersTableBody = document.querySelector("#membersTable tbody");
    const addMemberBtn = document.getElementById("addMemberBtn");
    const memberModal = document.getElementById("memberModal");
    const memberForm = document.getElementById("memberForm");
    const closeModalBtn = document.querySelector(".close");
    const cancelMemberBtn = document.getElementById("cancelMemberBtn");
    const modalTitle = document.getElementById("memberModalTitle");

    let members = [];
    let editingMemberId = null;

    // Hent alle medlemmer (READ)
    async function fetchMembers() {
        try {
            const res = await fetch("/api/members");
            members = await res.json();
            renderMemberTable();
        } catch (err) {
            console.error("Fejl ved hentning af medlemmer:", err);
        }
    }

    // Vis medlemmer i tabel
    function renderMemberTable() {
        membersTableBody.innerHTML = "";
        members.forEach(member => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${member.name}</td>
                <td>${member.membershipType || '-'}</td>
                <td>${member.paymentStatus || '-'}</td>
                <td>
                    <button class="btn btn-small btn-primary" data-id="${member.id}" onclick="editMember(${member.id})">Rediger</button>
                    <button class="btn btn-small btn-danger" data-id="${member.id}" onclick="deleteMember(${member.id})">Slet</button>
                </td>
            `;
            membersTableBody.appendChild(row);
        });
    }

    // Åben modal til oprettelse
    addMemberBtn.addEventListener("click", () => {
        editingMemberId = null;
        memberForm.reset();
        modalTitle.textContent = "Tilføj nyt medlem";
        memberModal.style.display = "block";
    });

    // Luk modal
    closeModalBtn.addEventListener("click", () => memberModal.style.display = "none");
    cancelMemberBtn.addEventListener("click", () => memberModal.style.display = "none");

    // Hent data fra formular
    function getFormData() {
        return {
            name: document.getElementById("memberName").value,
            email: document.getElementById("memberEmail").value,
            address: document.getElementById("memberAddress").value,
            dateOfBirth: document.getElementById("memberDob").value,
            membershipType: document.getElementById("membershipType").value,
            teamId: document.getElementById("memberTeam").value || null
        };
    }

    // Udfyld modal med eksisterende data (UPDATE)
    window.editMember = async function(id) {
        try {
            const res = await fetch(`/api/members/${id}`);
            const member = await res.json();

            editingMemberId = id;
            modalTitle.textContent = "Rediger medlem";
            memberModal.style.display = "block";

            document.getElementById("memberName").value = member.name;
            document.getElementById("memberEmail").value = member.email || "";
            document.getElementById("memberAddress").value = member.address || "";
            document.getElementById("memberDob").value = member.dateOfBirth || "";
            document.getElementById("membershipType").value = member.membershipType || "";
            document.getElementById("memberTeam").value = member.teamId || "";
        } catch (err) {
            console.error("Fejl ved hentning af medlem:", err);
        }
    }

    // Gem nyt medlem eller opdater eksisterende
    memberForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = getFormData();
        const method = editingMemberId ? "PUT" : "POST";
        const url = editingMemberId ? `/api/members/${editingMemberId}` : "/api/members";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Fejl ved gemning");

            memberModal.style.display = "none";
            fetchMembers();
        } catch (err) {
            console.error(err);
        }
    });

    // Slet medlem
    window.deleteMember = async function(id) {
        if (!confirm("Er du sikker på, at du vil slette dette medlem?")) return;

        try {
            const res = await fetch(`/api/members/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Fejl ved sletning");

            fetchMembers();
        } catch (err) {
            console.error(err);
        }
    }

    // Indlæs medlemmer når siden loades
    fetchMembers();
});
