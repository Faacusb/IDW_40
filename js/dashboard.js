document.addEventListener("DOMContentLoaded", async () => {
  const BASE_PATH = window.location.hostname.includes("github.io")
    ? "/IDW_40/"
    : "/";

  async function loadMedicos() {
    let m = JSON.parse(localStorage.getItem("medicos")) || [];
    if (!m || m.length === 0) {
      try {
        const res = await fetch("data/medicos.json");
        m = await res.json();
        localStorage.setItem("medicos", JSON.stringify(m));
      } catch (e) {
        console.error("No se pudo cargar medicos.json", e);
        m = [];
      }
    }
    return m;
  }

  function goToListado(filters = {}) {
    const url = new URL(
      window.location.origin + BASE_PATH + "gestionMedicos.html"
    );
    Object.keys(filters).forEach((k) => {
      const param =
        k === "obrasocial"
          ? "filtrar.obrasocial"
          : k === "especialidad"
          ? "filtrar.especialidad"
          : k === "medico"
          ? "filtrar.medico"
          : k;
      url.searchParams.set(param, filters[k]);
    });
    window.location.href = url.pathname + url.search;
  }

  const medicos = await loadMedicos();

  const ALL_ESPECIALIDADES = [
    "Cardiología",
    "Pediatría",
    "Neurología",
    "Dermatología",
    "Ginecología",
    "Traumatología",
    "Medico",
    "Oftalmología",
    "Otorrinolaringología",
    "Osteopatía",
    "Nefrología",
  ];
  const ALL_OBRAS = ["OSDE", "PAMI", "SanCor Salud"];

  function renderMedicosPreview(med) {
    const totalEl = document.getElementById("cardTotalMedicos");
    const listEl = document.getElementById("listMedicosPreview");
    if (totalEl) totalEl.textContent = med.length;
    if (!listEl) return;

    listEl.innerHTML = "";
    med.slice(0, 8).forEach((m) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <div class="avatar-sm">
          <img src="${m.imagen || m.fotografia || "img/dr.jpg"}" alt="">
        </div>
        <div class="meta">
          <strong>${m.nombre || ""} ${m.apellido || ""}</strong>
          <small>${m.especialidad || ""}</small>
        </div>
        <div class="end-action">
          <i class="bi bi-arrow-up-right" title="Ver médico"></i>
        </div>
      `;

      li.querySelector(".end-action").addEventListener("click", () => {
        const url = `${BASE_PATH}medico.html?id=${encodeURIComponent(m.id)}`;
        window.location.href = url;
      });

      listEl.appendChild(li);
    });
  }

  function renderEspecialidades(med) {
    const counts = {};
    med.forEach((x) => {
      const k = x.especialidad || x.Especialidad || "Sin especificar";
      counts[k] = (counts[k] || 0) + 1;
    });

    const entries = ALL_ESPECIALIDADES.map((name) => ({
      nombre: name,
      count: counts[name] || 0,
    }));
    entries.sort((a, b) => b.count - a.count);

    const covered = entries.filter((e) => e.count > 0).length;
    const coveredEl = document.getElementById("cardEspecialidadesCovered");
    const totalEl = document.getElementById("cardEspecialidadesTotal");
    if (coveredEl) coveredEl.textContent = covered;
    if (totalEl) totalEl.textContent = `/ ${entries.length}`;

    const lista = document.getElementById("listaEspecialidades");
    if (!lista) return;

    lista.innerHTML = "";
    entries.forEach((e) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <i class="bi bi-person-lines-fill"></i>
        <div class="meta">
          <strong>${e.nombre}</strong>
          <small>${e.count} médico(s)</small>
        </div>
        <div class="end-action">
          <i class="bi bi-arrow-up-right" title="Ver médicos"></i>
        </div>
      `;
      li.querySelector(".end-action").addEventListener("click", () =>
        goToListado({ especialidad: e.nombre })
      );
      lista.appendChild(li);
    });
  }

  function renderObras(med) {
    const counts = {};
    med.forEach((x) => {
      const obras = x.obrasSociales || x.obraSocial || [];
      if (Array.isArray(obras)) {
        obras.forEach((o) => {
          counts[o] = (counts[o] || 0) + 1;
        });
      } else {
        const k = obras || "Sin especificar";
        counts[k] = (counts[k] || 0) + 1;
      }
    });

    const entries = ALL_OBRAS.map((name) => ({
      nombre: name,
      count: counts[name] || 0,
    }));
    entries.sort((a, b) => b.count - a.count);

    const covered = entries.filter((e) => e.count > 0).length;
    const coveredEl = document.getElementById("cardObrasCovered");
    const totalEl = document.getElementById("cardObrasTotal");
    if (coveredEl) coveredEl.textContent = covered;
    if (totalEl) totalEl.textContent = `/ ${entries.length}`;

    const lista = document.getElementById("listObras");
    if (!lista) return;

    lista.innerHTML = "";
    entries.forEach((e) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <i class="bi bi-building"></i>
        <div class="meta">
          <strong>${e.nombre}</strong>
          <small>${e.count} médico(s)</small>
        </div>
        <div class="end-action">
          <i class="bi bi-arrow-up-right" title="Ver médicos"></i>
        </div>
      `;
      li.querySelector(".end-action").addEventListener("click", () =>
        goToListado({ obrasocial: e.nombre })
      );
      lista.appendChild(li);
    });
  }

  renderMedicosPreview(medicos);
  renderEspecialidades(medicos);
  renderObras(medicos);

  // --- BOTONES ---
  const btnGoMed = document.getElementById("btnGoListadoFromMedicos");
  if (btnGoMed) btnGoMed.addEventListener("click", () => goToListado());

  const btnGoEsp = document.getElementById("btnGoListadoFromEspecialidades");
  if (btnGoEsp) btnGoEsp.addEventListener("click", () => goToListado());

  const btnGoOb = document.getElementById("btnGoListadoFromObras");
  if (btnGoOb) btnGoOb.addEventListener("click", () => goToListado());

  const btnRefreshM = document.getElementById("btnRefreshMedicos");
  if (btnRefreshM)
    btnRefreshM.addEventListener("click", async () => {
      const m = await loadMedicos();
      renderMedicosPreview(m);
    });

  const btnRefreshE = document.getElementById("btnRefreshEspecialidades");
  if (btnRefreshE)
    btnRefreshE.addEventListener("click", async () => {
      const m = await loadMedicos();
      renderEspecialidades(m);
    });

  const btnRefreshO = document.getElementById("btnRefreshObras");
  if (btnRefreshO)
    btnRefreshO.addEventListener("click", async () => {
      const m = await loadMedicos();
      renderObras(m);
    });

  const btnAdd = document.getElementById("btnAddMedicoWidget");
  if (btnAdd)
    btnAdd.addEventListener("click", () => {
      window.location.href = `${BASE_PATH}altaMedicos.html`;
    });
});
