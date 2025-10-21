document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("listaMedicosAdmin");

  function cargarMedicos() {
    let medicosGuardados = localStorage.getItem("medicos");
    let medicos;

    if (medicosGuardados) {
      medicos = JSON.parse(medicosGuardados);
      mostrarMedicos(medicos);
    } else {
      fetch("data/medicos.json")
        .then(function (respuesta) {
          return respuesta.json();
        })
        .then(function (datos) {
          localStorage.setItem("medicos", JSON.stringify(datos));
          mostrarMedicos(datos);
        })
        .catch(function (error) {
          console.log("Error al cargar médicos:", error);
        });
    }
  }

  function mostrarMedicos(lista) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
      contenedor.innerHTML = "<p>No hay médicos registrados.</p>";
      return;
    }

    for (let i = 0; i < lista.length; i++) {
      let medico = lista[i];

      let imagenMedico = "img/default-doctor.png";
      if (medico.imagen && medico.imagen.trim() !== "") {
        imagenMedico = medico.imagen;
      }

      // Crear estructura de la card
      let tarjeta = document.createElement("div");
      tarjeta.classList.add("col-12", "col-md-6", "col-lg-4");

      tarjeta.innerHTML =
        '<div class="card h-100 text-center shadow-sm border-0">' +
        '<img src="' +
        imagenMedico +
        '" class="card-img-top" style="height:250px; object-fit:cover;" alt="' +
        medico.nombre +
        '">' +
        '<div class="card-body">' +
        '<h5 class="card-title">' +
        medico.nombre +
        "</h5>" +
        "<p><strong>Especialidad:</strong> " +
        medico.especialidad +
        "</p>" +
        "<p><strong>Obra Social:</strong> " +
        medico.obrasocial +
        "</p>" +
        '<div class="d-flex justify-content-center gap-2 mt-3">' +
        '<button class="btn btn-warning modificar-btn" data-id="' +
        medico.id +
        '">Modificar</button>' +
        '<button class="btn btn-danger eliminar-btn" data-id="' +
        medico.id +
        '">Eliminar</button>' +
        "</div>" +
        "</div>" +
        "</div>";

      contenedor.appendChild(tarjeta);
    }

    limpiarEventosDuplicados();

    agregarEventos();
  }

  function limpiarEventosDuplicados() {
    let botonesEliminar = document.querySelectorAll(".eliminar-btn");
    let botonesModificar = document.querySelectorAll(".modificar-btn");

    botonesEliminar.forEach(function (boton) {
      boton.replaceWith(boton.cloneNode(true));
    });

    botonesModificar.forEach(function (boton) {
      boton.replaceWith(boton.cloneNode(true));
    });
  }

  function agregarEventos() {
    // Botones de eliminar
    let botonesEliminar = document.querySelectorAll(".eliminar-btn");
    for (let i = 0; i < botonesEliminar.length; i++) {
      botonesEliminar[i].addEventListener("click", function () {
        let id = parseInt(this.getAttribute("data-id"));
        eliminarMedico(id);
      });
    }

    let botonesModificar = document.querySelectorAll(".modificar-btn");
    for (let i = 0; i < botonesModificar.length; i++) {
      botonesModificar[i].addEventListener("click", function () {
        let id = parseInt(this.getAttribute("data-id"));
        modificarMedico(id);
      });
    }
  }

  function eliminarMedico(id) {
    let confirmar = confirm("¿Querés eliminar este médico?");
    if (confirmar) {
      let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
      let nuevosMedicos = [];

      for (let i = 0; i < medicos.length; i++) {
        if (medicos[i].id !== id) {
          nuevosMedicos.push(medicos[i]);
        }
      }

      localStorage.setItem("medicos", JSON.stringify(nuevosMedicos));
      mostrarMedicos(nuevosMedicos);
    }
  }

  function modificarMedico(id) {
    let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
    let medico = medicos.find(function (m) {
      return m.id === id;
    });

    if (!medico) return;

    let formularioExistente = document.getElementById("editNombre");
    if (formularioExistente) {
      alert("Ya hay un formulario de edición abierto.");
      return;
    }

 
        let formularioHTML =
      '<div class="mt-3 p-3 border rounded bg-light text-start">' +
      "<h6>Editar datos del médico</h6>" +
      '<label class="form-label mt-2">Nombre:</label>' +
      '<input type="text" id="editNombre" class="form-control" value="' + medico.nombre + '">' +

      '<label class="form-label mt-2">Especialidad:</label>' +
      '<select id="editEspecialidad" class="form-select">' +
        '<option value="Cardiología"' + (medico.especialidad === "Cardiología" ? " selected" : "") + '>Cardiología</option>' +
        '<option value="Pediatría"' + (medico.especialidad === "Pediatría" ? " selected" : "") + '>Pediatría</option>' +
        '<option value="Neurología"' + (medico.especialidad === "Neurología" ? " selected" : "") + '>Neurología</option>' +
        '<option value="Dermatología"' + (medico.especialidad === "Dermatología" ? " selected" : "") + '>Dermatología</option>' +
        '<option value="Ginecología"' + (medico.especialidad === "Ginecología" ? " selected" : "") + '>Ginecología</option>' +
        '<option value="Traumatología"' + (medico.especialidad === "Traumatología" ? " selected" : "") + '>Traumatología</option>' +
        '<option value="Clínica Médica"' + (medico.especialidad === "Medico Clinico" ? " selected" : "") + '>Clínica Médica</option>' +
        '<option value="Oftalmología"' + (medico.especialidad === "Oftalmología" ? " selected" : "") + '>Oftalmología</option>' +
        '<option value="Otorrinolaringología"' + (medico.especialidad === "Otorrinolaringología" ? " selected" : "") + '>Otorrinolaringología</option>' +
      '</select>' +

      '<label class="form-label mt-2">Obra Social:</label>' +
      '<select id="editObraSocial" class="form-select">' +
        '<option value="OSDE"' + (medico.obrasocial === "OSDE" ? " selected" : "") + '>OSDE</option>' +
        '<option value="PAMI"' + (medico.obrasocial === "PAMI" ? " selected" : "") + '>PAMI</option>' +
        '<option value="SanCor Salud"' + (medico.obrasocial === "SanCor Salud" ? " selected" : "") + '>SanCor Salud</option>' +
      '</select>' +

      '<div class="d-flex justify-content-end gap-2 mt-3">' +
      '<button id="guardarCambios" class="btn btn-success btn-sm">Guardar</button>' +
      '<button id="cancelarEdicion" class="btn btn-secondary btn-sm">Cancelar</button>' +
      "</div>" +
      "</div>";


    let card = document.querySelector('[data-id="' + id + '"]').closest(".card-body");
    card.insertAdjacentHTML("beforeend", formularioHTML);


    document.getElementById("guardarCambios").addEventListener("click", function () {
        let nuevoNombre = document.getElementById("editNombre").value.trim();
        let nuevaEspecialidad = document.getElementById("editEspecialidad").value.trim();
        let nuevaObraSocial = document.getElementById("editObraSocial").value.trim();

        if (!nuevoNombre || !nuevaEspecialidad || !nuevaObraSocial) {
          alert("Por favor completa todos los campos.");
          return;
        }

        medico.nombre = nuevoNombre;
        medico.especialidad = nuevaEspecialidad;
        medico.obrasocial = nuevaObraSocial;

        localStorage.setItem("medicos", JSON.stringify(medicos));
        alert("Médico actualizado correctamente.");
        mostrarMedicos(medicos);
      });

    document.getElementById("cancelarEdicion").addEventListener("click", function () {
        mostrarMedicos(medicos);
      });
  }

  cargarMedicos();
});
