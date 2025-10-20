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
          '<img src="' + imagenMedico + '" class="card-img-top" style="height:250px; object-fit:cover;" alt="' + medico.nombre + '">' +
          '<div class="card-body">' +
            '<h5 class="card-title">' + medico.nombre + '</h5>' +
            '<p><strong>Especialidad:</strong> ' + medico.especialidad + '</p>' +
            '<p><strong>Obra Social:</strong> ' + medico.obrasocial + '</p>' +
            '<div class="d-flex justify-content-center gap-2 mt-3">' +
              '<button class="btn btn-warning modificar-btn" data-id="' + medico.id + '">Modificar</button>' +
              '<button class="btn btn-danger eliminar-btn" data-id="' + medico.id + '">Eliminar</button>' +
            '</div>' +
          '</div>' +
        '</div>';

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

  cargarMedicos();

});
