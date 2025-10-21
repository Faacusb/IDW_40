document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("listaMedicos");
  let medicos = JSON.parse(localStorage.getItem("medicos")) || [];

  
  if (medicos.length === 0) {
    fetch("data/medicos.json")
      .then(function (res) { return res.json(); })
      .then(function (datos) {
        medicos = datos;
        localStorage.setItem("medicos", JSON.stringify(medicos));
        mostrarMedicos(medicos);
      })
      .catch(function (err) {
        console.error("Error al cargar medicos.json:", err);
      });
  } else {
    mostrarMedicos(medicos);
  }

  
  function mostrarMedicos(lista) {
    contenedor.innerHTML = ""; 

    if (lista.length === 0) {
      contenedor.innerHTML = "<p class='text-center text-muted'>No hay médicos registrados todavía.</p>";
      return;
    }

    lista.forEach(function (medico) {
      const card = document.createElement("div");
      card.classList.add("col-12", "col-md-6", "col-lg-4");

      const imagenSrc = medico.imagen && medico.imagen.trim() !== ""
        ? medico.imagen
        : "img/default-doctor.png";

      card.innerHTML = `
        <div class="card h-100 text-center shadow-sm border-0">
          <img src="${imagenSrc}" class="card-img-top" alt="${medico.nombre}" style="height:250px; object-fit:cover;">
          <div class="card-body">
            <h5 class="card-title">${medico.nombre}</h5>
            <p><strong>Especialidad:</strong> ${medico.especialidad}</p>
            <p><strong>Obra Social:</strong> ${medico.obrasocial}</p>
          </div>
        </div>
      `;
      contenedor.appendChild(card);
    });
  }
});
