// Si no hay turnos guardados, inicializamos un arreglo vacío
if (!localStorage.getItem('turnos')) {
    localStorage.setItem('turnos', JSON.stringify([]));
}

const form = document.getElementById('turnoForm');
const tabla = document.getElementById('tablaTurnos');

// Mostrar todos los turnos en la tabla
function mostrarTurnos() {
    const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
    tabla.innerHTML = '';

    if (turnos.length === 0) {
    tabla.innerHTML = `
        <tr>
        <td colspan="6">No hay turnos registrados.</td>
        </tr>
    `;
    return;
    }

    turnos.forEach((turno, index) => {
    tabla.innerHTML += `
        <tr>
        <td>${index + 1}</td>
        <td>${turno.nombre}</td>
        <td>${turno.fecha}</td>
        <td>${turno.hora}</td>
        <td>${turno.especialidad}</td>
        <td>
            <button class="editar" onclick="editarTurno(${index})">Editar</button>
            <button class="eliminar" onclick="eliminarTurno(${index})">Eliminar</button>
        </td>
        </tr>
    `;
    });
}

// Guardar o actualizar turno
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const especialidad = document.getElementById('especialidad').value.trim();
    const id = document.getElementById('turnoId').value;

    if (!nombre || !fecha || !hora || !especialidad) {
    alert('Por favor, completá todos los campos.');
    return;
    }

    const turnos = JSON.parse(localStorage.getItem('turnos')) || [];

    const nuevoTurno = { nombre, fecha, hora, especialidad };

    if (id) {
    //  Editar turno existente
    turnos[id] = nuevoTurno;
    document.getElementById('turnoId').value = '';
    } else {
    // ➕ Agregar nuevo turno
    turnos.push(nuevoTurno);
    }

    localStorage.setItem('turnos', JSON.stringify(turnos));
    form.reset();
    mostrarTurnos();
});

//  Cargar turno en el formulario para editar
function editarTurno(index) {
    const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
    const turno = turnos[index];

    document.getElementById('turnoId').value = index;
    document.getElementById('nombre').value = turno.nombre;
    document.getElementById('fecha').value = turno.fecha;
    document.getElementById('hora').value = turno.hora;
    document.getElementById('especialidad').value = turno.especialidad;
}

// Eliminar turno
function eliminarTurno(index) {
    const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
    if (confirm('¿Seguro que querés eliminar este turno?')) {
    turnos.splice(index, 1);
    localStorage.setItem('turnos', JSON.stringify(turnos));
    mostrarTurnos();
    }
}

//  Mostrar los turnos al cargar la página
document.addEventListener('DOMContentLoaded', mostrarTurnos);

