document.addEventListener("DOMContentLoaded", async () => {
  async function loadJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error("No encontrado");
      return await res.json();
    } catch (err) {
      console.warn("Error al cargar", path, err);
      return [];
    }
  }


  const [medicosBase, especialidades, obrasSociales] = await Promise.all([
    loadJSON("data/medicos.json"),
    loadJSON("data/especialidades.json"),
    loadJSON("data/obrasSociales.json"),
  ]);

  const medicosLocales = JSON.parse(localStorage.getItem("medicos")) || [];

  const medicos = medicosBase.map((m) => {
    const local = medicosLocales.find((ml) => ml.id === m.id);
    return local ? local : m;
  });

  medicosLocales.forEach((ml) => {
    if (!medicos.some((m) => m.id === ml.id)) {
      medicos.push(ml);
    }
  });

  const mapEspecialidades = {};
  especialidades.forEach((e) => (mapEspecialidades[e.id] = e.nombre));

  const mapObras = {};
  obrasSociales.forEach((o) => (mapObras[o.id] = o.nombre));

  const params = new URLSearchParams(window.location.search);
  const filtroEspecialidad = params.get("filtrar.especialidad");
  const filtroObraSocial = params.get("filtrar.obrasocial");

  let medicosFiltrados = [...medicos];

  if (filtroEspecialidad) {
    medicosFiltrados = medicosFiltrados.filter((m) => {
      const nombreEsp = mapEspecialidades[Number(m.especialidad)] || "";
      return (
        nombreEsp.toLowerCase() === filtroEspecialidad.toLowerCase() ||
        m.especialidad == filtroEspecialidad
      );
    });
  }

  if (filtroObraSocial) {
    medicosFiltrados = medicosFiltrados.filter((m) => {
      const obras = Array.isArray(m.obrasSociales)
        ? m.obrasSociales.map((id) => mapObras[Number(id)])
        : [mapObras[Number(m.obraSocial)] || m.obraSocial];
      return obras.some(
        (o) => o && o.toLowerCase() === filtroObraSocial.toLowerCase()
      );
    });
  }

  const eliminados = JSON.parse(localStorage.getItem("medicosEliminados")) || [];
  const medicosFiltradosFinal = medicosFiltrados.filter(
    (m) => !eliminados.includes(m.id)
  );

  function renderTabla(medicos) {
    const tbody =
      document.querySelector("#tablaMedicos tbody") ||
      document.getElementById("medicosTablaCuerpo");
    if (!tbody) return;
    tbody.innerHTML = "";

    medicos.forEach((m) => {
      const nombreCompleto =
        m.nombreCompleto ||
        `${m.nombre || ""} ${m.apellido || ""}`.trim() ||
        "Sin nombre";

      const especialidadNombre =
        mapEspecialidades[Number(m.especialidad)] || m.especialidad || "N/A";

      const obrasNombres = Array.isArray(m.obrasSociales)
        ? m.obrasSociales
            .map((id) => mapObras[Number(id)] || mapObras[id] || id)
            .join(", ")
        : mapObras[Number(m.obraSocial)] ||
          mapObras[m.obraSocial] ||
          m.obraSocial ||
          "N/A";

      const telefono = m.telefono || m.tel || "N/A";
      const email = m.email || m.correo || "N/A";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${m.id || "-"}</td>
        <td>${nombreCompleto}</td>
        <td>${especialidadNombre}</td>
        <td>${obrasNombres}</td>
        <td>${telefono}</td>
        <td>${email}</td>
        <td class="text-center">
          <button class="btn btn-warning btn-sm editar-btn" data-id="${m.id}">
            <i class="bi bi-pencil-square"></i> Editar
          </button>
          <button class="btn btn-danger btn-sm eliminar-btn" data-id="${m.id}">
            <i class="bi bi-trash3"></i> Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  setTimeout(() => renderTabla(medicosFiltradosFinal), 50);

  document.addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".editar-btn");
    const btnEliminar = e.target.closest(".eliminar-btn");

    if (btnEliminar) {
      const id = parseInt(btnEliminar.dataset.id);
      eliminarMedico(id);
    }

    if (btnEditar) {
      const id = parseInt(btnEditar.dataset.id);
      editarMedico(id);
    }
  });

  function eliminarMedico(id) {
    if (!confirm("¿Seguro que querés eliminar este médico?")) return;

    const eliminados = JSON.parse(localStorage.getItem("medicosEliminados")) || [];
    if (!eliminados.includes(id)) eliminados.push(id);
    localStorage.setItem("medicosEliminados", JSON.stringify(eliminados));

    let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
    medicos = medicos.filter((m) => m.id !== id);
    localStorage.setItem("medicos", JSON.stringify(medicos));

    const fila = document.querySelector(`button[data-id="${id}"]`)?.closest("tr");
    if (fila) fila.remove();

    alert("✅ Médico eliminado correctamente.");
  }

  function editarMedico(id) {

    const medicosLS = JSON.parse(localStorage.getItem("medicos")) || [];
    const medico =
      medicosLS.find((m) => m.id === id) ||
      medicos.find((m) => m.id === id);

    if (!medico) {
      alert("No se encontró el médico.");
      return;
    }

    localStorage.setItem("medicoAEditar", JSON.stringify(medico));

    window.location.href = "altaMedicos.html";
  }
});