document.addEventListener('DOMContentLoaded', async () => {
    const API = "https://dummyjson.com/users";
    const SAFE_FIELDS = ["id", "firstName", "lastName", "username", "age", "gender", "company"];
    let users = [];
    let filtered = [];
    let page = 1;
    let perPage = parseInt(document.getElementById("perPage").value, 10);

    const $tbody = document.querySelector("#usersTable tbody");
    const $search = document.getElementById("search");
    const $perPage = document.getElementById("perPage");
    const $prev = document.getElementById("prev");
    const $next = document.getElementById("next");
    const $pageInfo = document.getElementById("pageInfo");
    const $refresh = document.getElementById("refresh");
    const $exportCsv = document.getElementById("exportCsv");
    const $status = document.getElementById("status");

    async function loadUsers() {
        $status.textContent = "Cargando usuarios...";
        try {
            const res = await fetch(API + "?limit=100");
            if (!res.ok) throw new Error("Error al obtener datos");
            const data = await res.json();
            users = (data.users || []).map(u => sanitizeUser(u));
            filtered = users.slice();
            page = 1;
            render();
            $status.textContent = `Cargados ${users.length} usuarios (solo datos no sensibles).`;
        } catch (err) {
            console.error(err);
            $status.textContent = "Error al cargar usuarios: " + err.message;
        }
    }

    function sanitizeUser(u) {
        const out = {};
        SAFE_FIELDS.forEach(k => {
            if (k === "company") out.company = u.company?.name || "";
            else out[k] = u[k] ?? "";
        });
        return out;
    }

    function render() {
        const q = $search.value.trim().toLowerCase();
        filtered = users.filter(u =>
            (u.firstName + " " + u.lastName + " " + u.username).toLowerCase().includes(q)
        );

        perPage = parseInt($perPage.value, 10);
        const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
        if (page > totalPages) page = totalPages;
        const start = (page - 1) * perPage;
        const pageItems = filtered.slice(start, start + perPage);

        $tbody.innerHTML = "";
        if (pageItems.length === 0) {
            $tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No se encontraron usuarios.</td></tr>';
        } else {
            for (const u of pageItems) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.firstName} ${u.lastName}</td>
                <td>${u.username}</td>
                <td>${u.age}</td>
                <td>${u.gender === 'female' ? 'Mujer': 'Hombre'}</td>
                <td>${u.company}</td>
              `;
                $tbody.appendChild(tr);
            }
        }
        $pageInfo.textContent = `Página ${page} / ${totalPages} — ${pageItems.length} de ${filtered.length}`;
    }

    function debounce(fn, ms = 250) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), ms);
        };
    }

    function exportCsv() {
        const rows = [["id", "firstName", "lastName", "username", "age", "gender", "company"]];
        for (const u of filtered)
            rows.push([u.id, u.firstName, u.lastName, u.username, u.age, u.gender, u.company]);
        const csv = rows.map(r => r.map(c => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `medicalassistance_usuarios_${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    $search.addEventListener("input", debounce(() => { page = 1; render(); }));
    $perPage.addEventListener("change", () => { page = 1; render(); });
    $prev.addEventListener("click", () => { if (page > 1) { page--; render(); } });
    $next.addEventListener("click", () => {
        const total = Math.max(1, Math.ceil(filtered.length / perPage));
        if (page < total) { page++; render(); }
    });
    $refresh.addEventListener("click", loadUsers);
    $exportCsv.addEventListener("click", exportCsv);

    loadUsers();
})