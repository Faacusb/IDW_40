// Simula que la autenticacion
localStorage.setItem('usuarioAutenticado', 'true');

// === Desactivar temporalmente la verificación de sesión (para pruebas) ===
// Si querés que la página permita el acceso sin login durante la demo,
// comentá la verificación así:

// if (!localStorage.getItem('usuarioAutenticado')) {
//     alert('Debes iniciar sesión primero');
//     window.location.href = 'login.html';
// }

// --- para simular que hay sesión activa se debe desmarcar esto: ---
// localStorage.setItem('usuarioAutenticado', 'true');


// Elementos del DOM
const form = document.getElementById("formTurno");
const tabla = document.getElementById("tablaTurnos");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const btnCancelarContainer = document.getElementById("btnCancelarContainer");

// Si no hay turnos, se cargan algunos iniciales
if (!localStorage.getItem("turnos")) {
    const turnosIniciales = [
    { id: 1, nombre: "María Gómez", especialidad: "Pediatría", fecha: "2025-11-06", hora: "10:00" },
    { id: 2, nombre: "Juan Pérez", especialidad: "Clínica Médica", fecha: "2025-11-06", hora: "11:30" },
    { id: 3, nombre: "Laura Díaz", especialidad: "Dermatología", fecha: "2025-11-07", hora: "14:00" },
    ];
    localStorage.setItem("turnos", JSON.stringify(turnosIniciales));
}

document.addEventListener("DOMContentLoaded", mostrarTurnos);

// Guardar turno
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("turnoId").value;
    const nombre = document.getElementById("nombre").value.trim();
    const especialidad = document.getElementById("especialidad").value.trim();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    if (!nombre || !especialidad || !fecha || !hora) {
    alert("Por favor, completá todos los campos.");
    return;
    }

    let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

    if (id) {
    // Editar turno
    turnos = turnos.map(t => t.id == id ? { id: Number(id), nombre, especialidad, fecha, hora } : t);
    alert("Turno actualizado correctamente");
    btnGuardar.textContent = "Guardar";
    btnCancelarContainer.classList.add("d-none");
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

// Cancelar edición
btnCancelar.addEventListener("click", () => {
    form.reset();
    document.getElementById("turnoId").value = "";
    btnGuardar.textContent = "Guardar";
    btnCancelarContainer.classList.add("d-none");
});

// Mostrar turnos
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

// Eliminar turno
function eliminarTurno(id) {
    const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const nuevosTurnos = turnos.filter(t => t.id !== id);
    localStorage.setItem("turnos", JSON.stringify(nuevosTurnos));
    mostrarTurnos();
}

// Editar turno
function editarTurno(id) {
    const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const turno = turnos.find(t => t.id === id);
    if (!turno) return;

    document.getElementById("turnoId").value = turno.id;
    document.getElementById("nombre").value = turno.nombre;
    document.getElementById("especialidad").value = turno.especialidad;
    document.getElementById("fecha").value = turno.fecha;
    document.getElementById("hora").value = turno.hora;

    btnGuardar.textContent = "Actualizar";
    btnCancelarContainer.classList.remove("d-none");
}

