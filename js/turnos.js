// Bloquea el acceso si no hay usuario autenticado
if (!localStorage.getItem('usuarioAutenticado')) {
    alert('Debes iniciar sesión primero');
    window.location.href = 'login.html';
}

// --- Elementos del DOM ---
const form = document.getElementById("formTurno");
const tabla = document.querySelector("#tablaTurnos tbody");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

// --- Eventos ---
document.addEventListener("DOMContentLoaded", mostrarTurnos);

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("turnoId").value;
    const nombre = document.getElementById("nombre").value.trim();
    const especialidad = document.getElementById("especialidad").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    if (!nombre || !especialidad || !fecha || !hora) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

    if (id) {
        // Editar turno existente
        turnos = turnos.map(t => t.id == id ? { id, nombre, especialidad, fecha, hora } : t);
        alert("Turno actualizado correctamente");
        btnGuardar.textContent = "Guardar Turno";
        btnCancelar.classList.add("d-none");
    } else {
        // Crear nuevo turno
        const nuevoTurno = { id: Date.now(), nombre, especialidad, fecha, hora };
        turnos.push(nuevoTurno);
        alert("Turno guardado correctamente");
    }

    localStorage.setItem("turnos", JSON.stringify(turnos));
    form.reset();
    document.getElementById("turnoId").value = "";
    mostrarTurnos();
});

btnCancelar.addEventListener("click", () => {
    form.reset();
    document.getElementById("turnoId").value = "";
    btnGuardar.textContent = "Guardar Turno";
    btnCancelar.classList.add("d-none");
});

// --- Funciones ---
function mostrarTurnos() {
    const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    tabla.innerHTML = "";

    turnos.forEach(t => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${t.nombre}</td>
            <td>${t.especialidad}</td>
            <td>${t.fecha}</td>
            <td>${t.hora}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editarTurno(${t.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarTurno(${t.id})">Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

function eliminarTurno(id) {
    const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const nuevosTurnos = turnos.filter(t => t.id !== id);
    localStorage.setItem("turnos", JSON.stringify(nuevosTurnos));
    mostrarTurnos();
}

function editarTurno(id) {
    const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const turno = turnos.find(t => t.id === id);
    if (!turno) return;

    document.getElementById("turnoId").value = turno.id;
    document.getElementById("nombre").value = turno.nombre;
    document.getElementById("especialidad").value = turno.especialidad;
    document.getElementById("fecha").value = turno.fecha;
    document.getElementById("hora").value = turno.hora;

    btnGuardar.textContent = "Actualizar Turno";
    btnCancelar.classList.remove("d-none");
}

