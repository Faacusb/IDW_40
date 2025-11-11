const medicosTablaCuerpo = document.getElementById("medicosTablaCuerpo");

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

  const mapEspecialidades = {};
  const mapObras = {};
   
  function cargarMedicos() {
    const medicosLocales = JSON.parse(localStorage.getItem("medicos")) || [];

    const medicos = [...medicosBase];
    medicosLocales.forEach((m) => {
      if (!medicos.some((x) => x.id === m.id)) medicos.push(m);
    });

    especialidades.forEach((e) => (mapEspecialidades[e.id] = e.nombre));
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

    if (medicos.length === 0) {
      medicosTablaCuerpo.innerHTML = '<tr><td colspan="7" class="text-center">No hay médicos registrados.</td></tr>';
      return;
    }

    renderTabla(medicosFiltrados);
  }

  function renderTabla(medicos) {
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

      const fila = medicosTablaCuerpo.insertRow();

      fila.insertCell().textContent = m.id;
      fila.insertCell().textContent = nombreCompleto;
      fila.insertCell().textContent = especialidadNombre;
      fila.insertCell().textContent = obrasNombres;
      fila.insertCell().textContent = telefono;
      fila.insertCell().textContent = email;

      // Crea la celda de acciones (botones)
      const celdaAcciones = fila.insertCell();
      celdaAcciones.classList.add('text-center');

      // Botón Mostrar para ver detalles 
      const botonMostrar = document.createElement('button');
      botonMostrar.textContent = 'Mostrar';
      botonMostrar.classList.add('btn', 'btn-sm', 'btn-info', 'me-2');
      botonMostrar.addEventListener('click', () => mostrarDetalles(m));
      celdaAcciones.appendChild(botonMostrar);

      // Botón Editar: abre la página de edición
      const botonEditar = document.createElement('button');
      botonEditar.textContent = 'Editar';
      botonEditar.classList.add('btn', 'btn-sm', 'btn-warning', 'me-2');
      botonEditar.addEventListener('click', () => { window.location.href = `editarMedico.html?id=${encodeURIComponent(m.id)}`; });
      celdaAcciones.appendChild(botonEditar);

      // Botón Eliminar
      const botonEliminar = document.createElement('button');
      botonEliminar.textContent = 'Eliminar';
      botonEliminar.classList.add('btn', 'btn-sm', 'btn-danger');
      botonEliminar.addEventListener('click', () => eliminarMedico(m.id));
      celdaAcciones.appendChild(botonEliminar);
    });
  }

  function eliminarMedico(id) {
    if (confirm(`¿Estás seguro de que quieres eliminar al médico con ID ${id}?`)) {
      let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
      medicos = medicos.filter(medico => m.id !== id);
      localStorage.setItem("medicos", JSON.stringify(medicos));
      cargarMedicos();

      detallesMedicoDiv.style.display = 'none';
      alert(`Médico con ID ${id} eliminado correctamente.`);
    }
  }

  cargarMedicos();
});
