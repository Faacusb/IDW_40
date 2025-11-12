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

// 🟢 Esperar al DOM antes de ejecutar todo
document.addEventListener("DOMContentLoaded", async () => {
  await cargarEspecialidades();
  await cargarObrasSociales();
  cargarMedicoEditar(); // 👈 modo edición si aplica
});

async function cargarEspecialidades() {
  try {
    // 🚫 Evitar cache del navegador (clave en GitHub Pages o al hacer F5)
    const res = await fetch("data/especialidades.json?v=" + Date.now(), {
      cache: "no-store",
    });
    const base = res.ok ? await res.json() : [];

    const locales = JSON.parse(localStorage.getItem("especialidades")) || [];
    const eliminadas = (
      JSON.parse(localStorage.getItem("especialidadesEliminadas")) || []
    ).map(Number);

    // 🔹 Combinar JSON base + locales, filtrando eliminadas y duplicados
    let combinadas = base.filter((e) => !eliminadas.includes(Number(e.id)));
    locales.forEach((esp) => {
      if (!combinadas.some((e) => Number(e.id) === Number(esp.id))) {
        combinadas.push(esp);
      }
    });

    // 🔹 Renderizar el select
    const select = document.getElementById("especialidad");
    if (!select) return;
    select.innerHTML = `<option value="">Seleccione Especialidad</option>`;

    combinadas
      .sort((a, b) => a.id - b.id)
      .forEach((esp) => {
        const opt = document.createElement("option");
        opt.value = String(esp.id);
        opt.textContent = esp.nombre;
        select.appendChild(opt);
      });

    // 🔄 🔹 REFRESCAR el estilo visual del select (Material Style)
    if (window.mdc && mdc.autoInit) {
      mdc.autoInit();
    }
  } catch (err) {
    console.error("❌ Error general al cargar especialidades:", err);
  }
}

// 🔹 Cargar obras sociales (filtrando eliminadas)
async function cargarObrasSociales() {
  try {
    const res = await fetch("data/obrasSociales.json?v=" + Date.now(), {
      cache: "no-store",
    });
    const base = res.ok ? await res.json() : [];

    // ✅ Locales y eliminadas desde localStorage
    const locales = JSON.parse(localStorage.getItem("obrasSociales")) || [];
    const eliminadas =
      JSON.parse(localStorage.getItem("obrasSocialesEliminadas")) || [];

    // 🧠 Asegurar que siempre sean números, incluso si se guardaron como objetos
    const eliminadasIds = eliminadas.map((e) =>
      typeof e === "object" ? Number(e.id) : Number(e)
    );

    // 🔹 Combinar JSON base + locales filtrando eliminadas y duplicados
    let combinadas = base.filter((o) => !eliminadasIds.includes(Number(o.id)));
    locales.forEach((o) => {
      if (
        !eliminadasIds.includes(Number(o.id)) &&
        !combinadas.some((x) => Number(x.id) === Number(o.id))
      ) {
        combinadas.push(o);
      }
    });

    // 🔹 Renderizar
    const contenedor = document.getElementById("obrasSocialesChecks");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    combinadas.forEach((obra) => {
      const div = document.createElement("div");
      div.classList.add("form-check");
      div.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${obra.id}" id="obra_${obra.id}">
        <label class="form-check-label" for="obra_${obra.id}">${obra.nombre}</label>
      `;
      contenedor.appendChild(div);
    });
  } catch (err) {
    console.error("Error al cargar obras sociales:", err);
  }
}

function cargarMedicoEditar() {
  const medicoEditar = JSON.parse(localStorage.getItem("medicoAEditar"));
  if (!medicoEditar) return;

  inputNombre.value = medicoEditar.nombre || "";
  inputApellido.value = medicoEditar.apellido || "";
  inputEspecialidad.value = medicoEditar.especialidad || "";
  inputTelefono.value = medicoEditar.telefono || "";
  inputEmail.value = medicoEditar.email || "";
  inputMatricula.value = medicoEditar.matriculaProfesional || "";
  inputDescripcion.value = medicoEditar.descripcion || "";
  inputValorConsulta.value = medicoEditar.valorConsulta || "";
  imagenBase64 = medicoEditar.fotografia || "";

  if (Array.isArray(medicoEditar.obrasSociales)) {
    medicoEditar.obrasSociales.forEach((id) => {
      const checkbox = document.querySelector(
        `#obrasSocialesChecks input[value="${id}"]`
      );
      if (checkbox) checkbox.checked = true;
    });
  }

  if (imagenBase64) {
    muestraImagen.innerHTML = `
      <li class="list-group-item d-flex align-items-center gap-3 preview-list">
        <img src="${imagenBase64}" alt="Foto médico" class="preview-thumb rounded" 
        style="width:64px; height:64px; object-fit:cover;">
      </li>`;
    muestraImagen.style.display = "block";
  }

  const btnSubmit = altaMedicoFormulario.querySelector('button[type="submit"]');
  if (btnSubmit)
    btnSubmit.innerHTML = `<i class="bi bi-pencil-square m-1"></i> Actualizar Médico`;

  altaMedicoFormulario.addEventListener("submit", (e) => {
    e.preventDefault();

    let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
    const index = medicos.findIndex((m) => m.id === medicoEditar.id);

    if (index !== -1) {
      medicos[index] = {
        ...medicoEditar,
        nombre: inputNombre.value.trim(),
        apellido: inputApellido.value.trim(),
        especialidad: inputEspecialidad.value.trim(),
        telefono: inputTelefono.value.trim(),
        email: inputEmail.value.trim(),
        matriculaProfesional: parseInt(inputMatricula.value) || 0,
        descripcion: inputDescripcion.value.trim(),
        valorConsulta: parseFloat(inputValorConsulta.value) || 0,
        obrasSociales: Array.from(
          document.querySelectorAll(
            '#obrasSocialesChecks input[type="checkbox"]:checked'
          )
        ).map((cb) => parseInt(cb.value)),
        fotografia: imagenBase64 || "",
      };

      localStorage.setItem("medicos", JSON.stringify(medicos));
      localStorage.removeItem("medicoAEditar");
      alert("Médico actualizado correctamente.");
      window.location.href = "gestionMedicos.html";
    } else {
      alert("No se encontró el médico a editar.");
    }
  });
}

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
      img.className = "preview-thumb rounded";
      img.alt = archivo.name;
      img.style.width = "64px";
      img.style.height = "64px";
      img.style.objectFit = "cover";

      const infoDiv = document.createElement("div");
      infoDiv.className = "flex-grow-1 preview-info";
      infoDiv.innerHTML = `
        <p class="fw-light mb-0">${archivo.name}</p>
        <p class="text-muted small mb-0">${(archivo.size / 1024).toFixed(
          1
        )} KB</p>
      `;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-close";
      btn.addEventListener("click", () => {
        inputImagen.value = "";
        imagenBase64 = "";
        muestraImagen.innerHTML = "";
        muestraImagen.style.display = "none";
      });

      img.addEventListener("click", () => {
        if (!imagenBase64) return;
        const backdrop = document.createElement("div");
        backdrop.className = "img-popover-backdrop";
        const card = document.createElement("div");
        card.className = "img-popover-card";

        const bigImg = document.createElement("img");
        bigImg.src = imagenBase64;
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Cerrar";
        closeBtn.className = "btn btn-sm btn-outline-secondary";
        closeBtn.addEventListener("click", () => backdrop.remove());

        card.appendChild(bigImg);
        card.appendChild(closeBtn);
        backdrop.appendChild(card);
        backdrop.addEventListener("click", (ev) => {
          if (ev.target === backdrop) backdrop.remove();
        });
        document.body.appendChild(backdrop);
      });

      li.appendChild(img);
      li.appendChild(infoDiv);
      li.appendChild(btn);
      muestraImagen.appendChild(li);
    };

    lector.readAsDataURL(archivo);
  }
});

function obtenerProximoId() {
  let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  if (medicos.length === 0) return 1;
  return Math.max(...medicos.map((m) => m.id)) + 1;
}

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

  const contenedor = document.getElementById("obrasSocialesChecks");
  let obrasSeleccionadas = [];

  if (contenedor) {
    const checks = contenedor.querySelectorAll("input[type='checkbox']");
    checks.forEach((cb) => {
      if (cb.checked) obrasSeleccionadas.push(parseInt(cb.value));
    });
  }

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

  let medicos = JSON.parse(localStorage.getItem("medicos")) || [];

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

  alert("Médico registrado correctamente.");

  altaMedicoFormulario.reset();
  muestraImagen.innerHTML = "";
  muestraImagen.style.display = "none";
  imagenBase64 = "";
}

altaMedicoFormulario.addEventListener("submit", altaMedicos);
