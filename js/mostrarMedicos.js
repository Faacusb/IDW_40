document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("listaMedicos");

  // Intentamos cargar desde localStorage
  let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  let especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
  let obrasSociales = JSON.parse(localStorage.getItem("obrasSociales")) || [];

  // Si falta alguno de los 3 conjuntos de datos, los traemos por fetch
  if (
    medicos.length === 0 ||
    especialidades.length === 0 ||
    obrasSociales.length === 0
  ) {
    Promise.all([
      fetch("data/medicos.json").then((res) => res.json()),
      fetch("data/especialidades.json").then((res) => res.json()),
      fetch("data/obrasSociales.json").then((res) => res.json()),
    ])
      .then(([datosMedicos, datosEspecialidades, datosObras]) => {
        medicos = datosMedicos;
        especialidades = datosEspecialidades;
        obrasSociales = datosObras;

        // Guardamos en localStorage
        localStorage.setItem("medicos", JSON.stringify(medicos));
        localStorage.setItem("especialidades", JSON.stringify(especialidades));
        localStorage.setItem("obrasSociales", JSON.stringify(obrasSociales));

        mostrarMedicos(medicos, especialidades, obrasSociales);
      })
      .catch((err) => {
        console.error("Error al cargar los archivos JSON:", err);
        contenedor.innerHTML =
          "<p class='text-center text-danger'>Error al cargar los datos.</p>";
      });
  } else {
    // Si ya estaban en localStorage
    mostrarMedicos(medicos, especialidades, obrasSociales);
  }

  // Función para renderizar las cards de médicos
  function mostrarMedicos(medicos, especialidades, obrasSociales) {
    contenedor.innerHTML = "";

    if (!medicos || medicos.length === 0) {
      contenedor.innerHTML =
        "<p class='text-center text-muted'>No hay médicos registrados todavía.</p>";
      return;
    }

    medicos.forEach((medico) => {
      const especialidad = especialidades.find(
        (e) => e.id === medico.especialidad
      );
      const obras = obrasSociales
        .filter((o) => medico.obrasSociales.includes(o.id))
        .map((o) => o.nombre)
        .join(", ");

      let imagenSrc = "img/default-doctor.png";
      if (medico.fotografia && medico.fotografia.trim() !== "") {
        if (medico.fotografia.startsWith("data:image")) {
          // Imagen en base64 (del alta)
          imagenSrc = medico.fotografia;
        } else {
          // Imagen de archivo (del JSON)
          imagenSrc = medico.fotografia.replace("../", ""); // quita ../ si quedó
        }
      }

      const card = document.createElement("div");
      card.classList.add("col-12", "col-md-6", "col-lg-4");

      card.innerHTML = `
        <div class="card h-100 text-center shadow-sm border-0">
          <img src="${imagenSrc}" class="card-img-top" alt="${
        medico.nombre
      }" style="height:250px; object-fit:cover;">
          <div class="card-body">
            <h5 class="card-title">${medico.nombre} ${
        medico.apellido || ""
      }</h5>
            <p><strong>Especialidad:</strong> ${
              especialidad ? especialidad.nombre : "Sin asignar"
            }</p>
            <p><strong>Obras Sociales:</strong> ${obras || "Sin cobertura"}</p>
          </div>
        </div>
      `;
      contenedor.appendChild(card);
    });
  }
});
