const API_URL = "http://localhost:8080";

async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    const users = await response.json();
    renderUserList(users);
}

function renderUserList(users) {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";

    users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${user.userId}</td>
      <td>${user.username}</td>
      <td>${user.userRole}</td>
      <td>
        <button class="btn btn-primary" onclick="editUser(${user.userId})">Rediger</button>
        <button class="btn btn-danger" onclick="deleteUser(${user.userId})">Slet</button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

async function editUser(id) {
    const response = await fetch(`${API_URL}/users/${id}`);
    const user = await response.json();

    document.getElementById("userId").value = user.userId;
    document.getElementById("memberName").value = user.username;
    document.getElementById("memberRole").value = user.userRole;
    document.getElementById("memberModal").style.display = "block";
}

async function deleteUser(id) {
    if (confirm("Vil du slette denne bruger?")) {
        await fetch(`${API_URL}/users/delete/${id}`, { method: "DELETE" });
        fetchUsers();
    }
}

document.getElementById("addMemberBtn").addEventListener("click", () => {
    document.getElementById("memberForm").reset();
    document.getElementById("userId").value = "";
    document.getElementById("memberModal").style.display = "block";
});

document.getElementById("memberForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("userId").value;
    const username = document.getElementById("memberName").value;
    const userRole = document.getElementById("memberRole").value;
    const password = "default123"; // Du kan udvide til at spørge om password

    const userData = { username, password, userRole };

    if (id) {
        await fetch(`${API_URL}/users/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });
    } else {
        await fetch(`${API_URL}/users/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });
    }

    document.getElementById("memberModal").style.display = "none";
    fetchUsers();
});

window.addEventListener("DOMContentLoaded", fetchUsers);
