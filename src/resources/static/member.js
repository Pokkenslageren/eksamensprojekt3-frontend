document.addEventListener("DOMContentLoaded", function () {
    console.log("member.js er indlæst");

    const addMemberBtn = document.getElementById("addMemberBtn");
    const cancelMemberBtn = document.getElementById("cancelMemberBtn");
    const memberForm = document.getElementById("memberForm");
    const membersTableBody = document.querySelector("#membersTable tbody");
    const modalTitle = document.getElementById("memberModalTitle");
    const memberModal = document.getElementById("memberModal");
    const closeButtons = document.querySelectorAll(".modal .close");
    closeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.closest(".modal").style.display = "none";
        });
    });


    let members = [];
    let editingMemberId = null;

    const API_BASE = "http://localhost:8080/api/members";

    // Vis modal til oprettelse
    if (addMemberBtn) {
        addMemberBtn.addEventListener("click", () => {
            editingMemberId = null;
            memberForm.reset();
            modalTitle.textContent = "Tilføj nyt medlem";
            memberModal.style.display = "block";
        });
    }

    // Luk modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => memberModal.style.display = "none");
    }

    if (cancelMemberBtn) {
        cancelMemberBtn.addEventListener("click", () => memberModal.style.display = "none");
    }

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

    // Vis medlemmer i tabel
    function renderMemberTable(membersList) {
        membersTableBody.innerHTML = "";
        membersList.forEach(member => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${member.name}</td>
                <td>${member.membershipType || '-'}</td>
                <td>${member.paymentStatus || '-'}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="editMember(${member.id})">Rediger</button>
                    <button class="btn btn-small btn-danger" onclick="deleteMember(${member.id})">Slet</button>
                </td>
            `;
            membersTableBody.appendChild(row);
        });
    }

    // Hent alle medlemmer
    async function fetchMembers() {
        try {
            const res = await fetch(API_BASE);
            members = await res.json();
            renderMemberTable(members);
        } catch (err) {
            console.error("Fejl ved hentning af medlemmer:", err);
        }
    }

    // Gem eller opdater medlem
    if (memberForm) {
        memberForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const data = getFormData();
            const method = editingMemberId ? "PUT" : "POST";
            const url = editingMemberId
                ? `${API_BASE}/${editingMemberId}`
                : API_BASE;

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
    }

    // Rediger medlem
    window.editMember = async function(id) {
        try {
            const res = await fetch(`${API_BASE}/${id}`);
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
    };

    // Slet medlem
    window.deleteMember = async function(id) {
        if (!confirm("Er du sikker på, at du vil slette dette medlem?")) return;

        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Fejl ved sletning");

            fetchMembers();
        } catch (err) {
            console.error(err);
        }
    };

    // Indlæs medlemmer ved start
    fetchMembers();
});
