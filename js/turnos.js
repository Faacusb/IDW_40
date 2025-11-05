
// Gestión de Turnos Médicos


// Cargar turnos desde localStorage o crear array vacío
let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

// las Referencias a elementos del DOM
const formTurno = document.getElementById("formTurno");
const tablaTurnos = document.getElementById("tablaTurnos");


// Mostrar turnos en la tabla

function mostrarTurnos() {
    tablaTurnos.innerHTML = "";

    turnos.forEach((turno, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${turno.nombre}</td>
        <td>${turno.medico}</td>
        <td>${turno.fecha}</td>
        <td>${turno.hora}</td>
        <td>
        <button class="btn btn-warning btn-sm" onclick="editarTurno(${index})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarTurno(${index})">Eliminar</button>
        </td>
    `;
    tablaTurnos.appendChild(fila);
    });
}


// Guardar un nuevo turno

formTurno.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const medico = document.getElementById("medico").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    if (nombre && medico && fecha && hora) {
    turnos.push({ nombre, medico, fecha, hora });
    localStorage.setItem("turnos", JSON.stringify(turnos));
    mostrarTurnos();
    formTurno.reset();
    } else {
    alert("Por favor, completá todos los campos");
    }
});


// Eliminar un turno

function eliminarTurno(index) {
    if (confirm("¿Seguro que querés eliminar este turno?")) {
    turnos.splice(index, 1);
    localStorage.setItem("turnos", JSON.stringify(turnos));
    mostrarTurnos();
    }
}


// Editar un turno

function editarTurno(index) {
    const turno = turnos[index];

    document.getElementById("nombre").value = turno.nombre;
    document.getElementById("medico").value = turno.medico;
    document.getElementById("fecha").value = turno.fecha;
    document.getElementById("hora").value = turno.hora;

  // Eliminar el turno antiguo antes de guardar el editado
    turnos.splice(index, 1);
    localStorage.setItem("turnos", JSON.stringify(turnos));
    mostrarTurnos();
}


// Mostrar turnos al cargar la página

document.addEventListener("DOMContentLoaded", mostrarTurnos);
