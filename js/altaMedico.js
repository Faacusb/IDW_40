const altaMedicoFormulario = document.getElementById("altaMedicoFormulario");
const inputNombre = document.getElementById("nombre");
const inputApellido = document.getElementById("apellido");
const inputEspecialidad = document.getElementById("especialidad");
const inputTelefono = document.getElementById("telefono");
const inputEmail = document.getElementById("email");
const inputImagen = document.getElementById("imagenMedico");
const muestraImagen = document.getElementById("muestraImagen");
let imagenBase64 = "";
const inputMatricula = document.getElementById("matriculaProfesional");
const inputDescripcion = document.getElementById("descripcion");
const inputValorConsulta = document.getElementById("valorConsulta");

inputImagen.addEventListener("change", function (e) {
  if (!e.target.files || e.target.files.length === 0) {
    imagenBase64 = "";
    muestraImagen.innerHTML = "";
    muestraImagen.style.display = "none";
    return;
  }

  const archivo = e.target.files[0];
  if (archivo) {
    const lector = new FileReader();

    lector.onload = function (evt) {
      imagenBase64 = evt.target.result;

      muestraImagen.innerHTML = "";
      muestraImagen.style.display = "block";

      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex align-items-center gap-3 preview-list";

      const img = document.createElement("img");
      img.src = imagenBase64;
      img.className = "preview-thumb";
      img.alt = archivo.name;
      img.style.width = "64px";
      img.style.height = "64px";
      img.style.objectFit = "cover";
      img.classList.add("rounded");

      const infoDiv = document.createElement("div");
      infoDiv.className = "flex-grow-1 preview-info";

      const nombreP = document.createElement("p");
      nombreP.className = "fw-light";
      nombreP.textContent = archivo.name;

      const tamanoP = document.createElement("p");
      tamanoP.className = "mb-0 text-muted small";
      const bytes = archivo.size;
      let tamañoLegible = "";
      if (bytes < 1024) {
        tamañoLegible = bytes + " B";
      } else if (bytes < 1024 * 1024) {
        tamañoLegible = (bytes / 1024).toFixed(1) + " KB";
      } else {
        tamañoLegible = (bytes / (1024 * 1024)).toFixed(1) + " MB";
      }
      tamanoP.textContent = tamañoLegible;

      infoDiv.appendChild(nombreP);
      infoDiv.appendChild(tamanoP);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-close";
      btn.addEventListener("click", function () {
        inputImagen.value = "";
        imagenBase64 = "";
        muestraImagen.innerHTML = "";
        muestraImagen.style.display = "none";
        const backdrop = document.querySelector(".img-popover-backdrop");
        if (backdrop) backdrop.remove();
      });

      img.addEventListener("click", function () {
        if (!imagenBase64) return;

        if (document.querySelector(".img-popover-backdrop")) return;

        const backdrop = document.createElement("div");
        backdrop.className = "img-popover-backdrop";

        const card = document.createElement("div");
        card.className = "img-popover-card";

        const bigImg = document.createElement("img");
        bigImg.src = imagenBase64;
        bigImg.alt = archivo.name;

        const actions = document.createElement("div");
        actions.className = "img-popover-actions";

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "btn btn-sm btn-outline-secondary";
        closeBtn.textContent = "Cerrar";
        closeBtn.addEventListener("click", function () {
          backdrop.remove();
        });

        actions.appendChild(closeBtn);
        card.appendChild(bigImg);
        card.appendChild(actions);
        backdrop.appendChild(card);

        backdrop.addEventListener("click", function (ev) {
          if (ev.target === backdrop) backdrop.remove();
        });

        document.body.appendChild(backdrop);
      });

      li.appendChild(img);
      li.appendChild(infoDiv);
      li.appendChild(btn);

      muestraImagen.appendChild(li);
    };

    lector.onerror = function () {
      imagenBase64 = "";
      muestraImagen.innerHTML = "";
      muestraImagen.style.display = "none";
    };

    lector.readAsDataURL(archivo);
  }
});

function obtenerProximoId() {
  let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  if (medicos.length === 0) {
    return 1;
  }
  let ultimoId = 0;
  for (let i = 0; i < medicos.length; i++) {
    if (medicos[i].id > ultimoId) {
      ultimoId = medicos[i].id;
    }
  }
  return ultimoId + 1;
}

let medicos = JSON.parse(localStorage.getItem("medicos")) || [];

function altaMedicos(event) {
  event.preventDefault();

  let nombreMed = inputNombre.value.trim();
  let apellido = inputApellido.value.trim();
  let especialidad = inputEspecialidad.value.trim();
  let telefono = inputTelefono.value.trim();
  let email = inputEmail.value.trim();
  let matricula = parseInt(inputMatricula.value) || 0;
  let descripcion = inputDescripcion.value.trim();
  let valorConsulta = parseFloat(inputValorConsulta.value) || 0;

  const obrasSeleccionadas = Array.from(
    document.querySelectorAll(
      '#obrasSocialesChecks input[type="checkbox"]:checked'
    )
  ).map((cb) => parseInt(cb.value)); // convierte los valores "1","2","3" en números

  const obrasError = document.getElementById("obrasError");
  if (obrasSeleccionadas.length === 0) {
    obrasError.classList.remove("d-none");
    obrasError.classList.add("d-block");
  } else {
    obrasError.classList.add("d-none");
    obrasError.classList.remove("d-block");
  }

  if (!altaMedicoFormulario.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
  }

  altaMedicoFormulario.classList.add("was-validated");

  var formFloating = altaMedicoFormulario.querySelectorAll(
    ".form-floating-with-icon"
  );

  Array.prototype.slice.call(formFloating).forEach(function (formFloating) {
    var input = formFloating.querySelector(".form-control, .form-select");

    if (input) {
      toggleValidityClasses(input, formFloating);

      input.addEventListener("keyup", function () {
        toggleValidityClasses(input, formFloating);
      });
      input.addEventListener("change", function () {
        toggleValidityClasses(input, formFloating);
      });
    }
  });

  if (
    !nombreMed ||
    !apellido ||
    !especialidad ||
    obrasSeleccionadas.length === 0 ||
    !telefono ||
    !email
  ) {
    alert(
      "Por favor completa todos los campos y selecciona al menos una obra social."
    );
    return;
  }

  const nuevoMed = {
    id: obtenerProximoId(),
    nombre: nombreMed,
    apellido: apellido,
    especialidad: especialidad,
    obrasSociales: obrasSeleccionadas,
    telefono: telefono,
    email: email,
    fotografia: imagenBase64 || "",
    matriculaProfesional: matricula,
    descripcion: descripcion,
    valorConsulta: valorConsulta,
  };

  medicos.push(nuevoMed);
  localStorage.setItem("medicos", JSON.stringify(medicos));

  alert(
    `Medico registrado:\n\n` +
      `Nombre: ${nombreMed} ${apellido}\n` +
      `Especialidad: ${especialidad}\n` +
      `Obras Sociales: ${obrasSeleccionadas.join(", ")}\n` +
      `Teléfono: ${telefono}\n` +
      `Email: ${email}\n`
  );
  altaMedicoFormulario.reset();
  altaMedicoFormulario.classList.remove("was-validated");
  muestraImagen.innerHTML = "";
  muestraImagen.style.display = "none";
  imagenBase64 = "";
}

altaMedicoFormulario.addEventListener("reset", function () {
  setTimeout(function () {
    imagenBase64 = "";
    muestraImagen.innerHTML = "";
    muestraImagen.style.display = "none";
    document.getElementById("obrasError").classList.add("d-none");
    document.getElementById("obrasError").classList.remove("d-block");
  }, 0);
});


document
  .querySelectorAll('#obrasSocialesChecks input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const seleccionadas = document.querySelectorAll(
        '#obrasSocialesChecks input[type="checkbox"]:checked'
      );
      const mensajeError = document.getElementById("obrasError");

      if (seleccionadas.length > 0) {
        mensajeError.classList.add("d-none");
        mensajeError.classList.remove("d-block");
      } else {
        mensajeError.classList.remove("d-none");
        mensajeError.classList.add("d-block");
      }
    });
  });


altaMedicoFormulario.addEventListener("submit", altaMedicos);
