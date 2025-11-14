document.addEventListener("DOMContentLoaded", () => {
    const selectEspecialidad = document.getElementById("especialidad");
    const contenedorObras = document.getElementById("obrasSocialesChecks");
    const form = document.getElementById("altaMedicoFormulario");

    // ------------------------
    // FUNCIONES GENERALES
    // ------------------------

    function cargarLS(clave) {
        try {
            const data = JSON.parse(localStorage.getItem(clave));
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function cargarJSON(ruta) {
        return fetch(ruta).then(r => r.ok ? r.json() : []);
    }

    // ------------------------
    // CARGA DE ESPECIALIDADES
    // ------------------------

    async function cargarEspecialidades() {
        let especialidades = cargarLS("especialidades");

        if (!especialidades.length) {
            const data = await cargarJSON("data/especialidades.json");
            if (Array.isArray(data)) {
                especialidades = data.map(e => ({
                    id: Number(e.id),
                    nombre: String(e.nombre)
                }));
                localStorage.setItem("especialidades", JSON.stringify(especialidades));
            }
        }

        selectEspecialidad.innerHTML =
            '<option value="">Seleccione Especialidad</option>' +
            especialidades
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map(e => `<option value="${e.id}">${e.nombre}</option>`)
                .join("");

        return especialidades;
    }

    // ------------------------
    // CARGA DE OBRAS SOCIALES
    // ------------------------

    async function cargarObrasSociales() {
        let obras = cargarLS("obrasSociales");

        if (!obras.length) {
            const data = await cargarJSON("data/obrasSociales.json");
            if (Array.isArray(data)) {
                obras = data.map(o => ({
                    id: Number(o.id),
                    nombre: String(o.nombre)
                }));
                localStorage.setItem("obrasSociales", JSON.stringify(obras));
            }
        }

        contenedorObras.innerHTML = obras
            .map(o => `
                <div class="form-check">
                    <input class="form-check-input obraCheck" type="checkbox" value="${o.id}" id="obra_${o.id}">
                    <label class="form-check-label" for="obra_${o.id}">
                        ${o.nombre}
                    </label>
                </div>
            `)
            .join("");

        return obras;
    }

    // ------------------------
    // GUARDAR MÉDICO
    // ------------------------

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        const medicos = cargarLS("medicos");

        const obrasSeleccionadas = [...document.querySelectorAll(".obraCheck:checked")].map(c => Number(c.value));

        const nuevoMedico = {
            id: Date.now(),
            nombre: document.getElementById("nombre").value.trim(),
            apellido: document.getElementById("apellido").value.trim(),
            especialidad: Number(selectEspecialidad.value),
            telefono: document.getElementById("telefono").value.trim(),
            obrasSociales: obrasSeleccionadas,
            email: document.getElementById("email").value.trim(),
            matriculaProfesional: Number(document.getElementById("matriculaProfesional").value),
            descripcion: document.getElementById("descripcion").value.trim(),
            valorConsulta: Number(document.getElementById("valorConsulta").value)
        };

        medicos.push(nuevoMedico);
        localStorage.setItem("medicos", JSON.stringify(medicos));

        alert("Médico registrado correctamente.");
        form.reset();
        form.classList.remove("was-validated");
    });

    // ------------------------
    // CARGAR TODO AL ENTRAR
    // ------------------------

    cargarEspecialidades();
    cargarObrasSociales();
});
