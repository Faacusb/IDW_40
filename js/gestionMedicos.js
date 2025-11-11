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


  const medicos = [...medicosBase];
  medicosLocales.forEach((m) => {
    if (!medicos.some((x) => x.id === m.id)) medicos.push(m);
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
        ? m.obrasSociales.map((id) => mapObras[Number(id)] || id).join(", ")
        : mapObras[Number(m.obraSocial)] || m.obraSocial || "N/A";

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
          <button class="btn btn-info btn-sm">Mostrar</button>
          <button class="btn btn-warning btn-sm">Editar</button>
          <button class="btn btn-danger btn-sm">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  renderTabla(medicosFiltrados);
});
