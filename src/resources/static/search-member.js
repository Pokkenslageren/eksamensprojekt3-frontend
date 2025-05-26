
    async function searchMembers() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const status = document.getElementById("status").value;
    const resultList = document.getElementById("resultList");
    resultList.innerHTML = "";

    let url = "";

    if (name) {
    url = `/member/search/name?name=${encodeURIComponent(name)}`;
} else if (email) {
    url = `/member/search/email?email=${encodeURIComponent(email)}`;
} else if (status) {
    url = `/member/search/paymentstatus?paymentstatus=${encodeURIComponent(status)}`;
} else {
    url = `/members`;
}

    try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Netværksfejl");

    const members = await response.json();

    if (members.length === 0) {
    resultList.innerHTML = "<li>Ingen resultater fundet.</li>";
    return;
}

    members.forEach(member => {
    const li = document.createElement("li");
    li.textContent = `${member.name} - ${member.email} - ${member.paymentStatus}`;
    resultList.appendChild(li);
});
} catch (error) {
    resultList.innerHTML = `<li>Fejl ved søgning: ${error.message}</li>`;
}
}

