import { Turno } from "./turno.js";

document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("tablaTurnos");
  const filtroMedico = document.getElementById("filtroMedico");
  const btnLimpiar = document.getElementById("btnLimpiarTurnos");

  const CLAVE_TURNOS = "turnosReservados";
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  let turnos = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];

  // 🟢 Cargar lista de médicos
  function cargarMedicos() {
  const selectFiltro = document.getElementById("filtroMedico");
  const selectNuevo = document.getElementById("nuevoMedico"); // select del modal

  // Limpiar ambos selects
  selectFiltro.innerHTML = `<option value="">Todos los médicos</option>`;
  if (selectNuevo) selectNuevo.innerHTML = `<option value="">Seleccione un médico...</option>`;

  medicos.forEach((m) => {
    const texto = `${m.nombre} ${m.apellido} - ${obtenerEspecialidad(m.especialidad)}`;
    
    const optFiltro = document.createElement("option");
    optFiltro.value = m.id;
    optFiltro.textContent = texto;
    selectFiltro.appendChild(optFiltro);

    if (selectNuevo) {
      const optNuevo = document.createElement("option");
      optNuevo.value = m.id;
      optNuevo.textContent = texto;
      selectNuevo.appendChild(optNuevo);
    }
  });
}


  // 🩺 Obtener nombre de especialidad
  function obtenerEspecialidad(id) {
    const especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
    const esp = especialidades.find((e) => e.id == id);
    return esp ? esp.nombre : "Sin especialidad";
  }

  // 🧾 Mostrar turnos
  function mostrarTurnos() {
    tabla.innerHTML = "";

    const filtro = filtroMedico.value ? parseInt(filtroMedico.value) : null;
    const listaFiltrada = filtro
      ? turnos.filter((t) => t.medicoId === filtro)
      : turnos;

    if (!listaFiltrada.length) {
      tabla.innerHTML = `<tr><td colspan="7" class="text-muted">No hay turnos registrados.</td></tr>`;
      return;
    }

    listaFiltrada.forEach((t, i) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${i + 1}</td>
        <td>${t.medicoNombre}${t.medicoApellido}</td>
        <td>${t.especialidad}</td>
        <td>${t.usuario}</td>
        <td>${t.fecha}</td>
        <td>${t.horario}</td>
        <td>
          <button class="btn btn-sm btn-danger">Eliminar</button>
        </td>
      `;

      fila.querySelector("button").addEventListener("click", () => eliminarTurno(t.id));
      tabla.appendChild(fila);
    });
  }

  // ❌ Eliminar un turno individual
  function eliminarTurno(id) {
    if (!confirm("¿Eliminar este turno?")) return;
    turnos = turnos.filter((t) => t.id !== id);
    guardarTurnos();
    mostrarTurnos();
  }

  // 🧹 Eliminar todos los turnos
  btnLimpiar.addEventListener("click", () => {
    if (!turnos.length) return alert("No hay turnos para eliminar.");
    if (!confirm("¿Eliminar TODOS los turnos?")) return;
    turnos = [];
    guardarTurnos();
    mostrarTurnos();
  });

  // 💾 Guardar cambios
  function guardarTurnos() {
    localStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnos));
  }

  // 🔄 Actualizar al cambiar filtro
  filtroMedico.addEventListener("change", mostrarTurnos);

  // 🟢 Crear nuevo turno desde el modal
document.getElementById("btnGuardarTurno").addEventListener("click", () => {
  const medicoId = parseInt(document.getElementById("nuevoMedico").value);
  const fecha = document.getElementById("nuevaFecha").value;
  const hora = document.getElementById("nuevaHora").value;

  if (!medicoId || !fecha || !hora) {
    alert("Por favor complete todos los campos.");
    return;
  }

  const medico = medicos.find(m => m.id === medicoId);
  if (!medico) {
    alert("Médico no encontrado.");
    return;
  }

  // Crear objeto Turno
  const nuevoTurno = new Turno(
    Date.now(),
    medico.id,
    medico.nombre,
    medico.apellido,
    obtenerEspecialidad(medico.especialidad),
    fecha,
    hora,
    false
  );

  // 🔹 Recuperar turnos existentes guardados
let turnosExistentes = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];

// 🔹 Verificar que no exista un turno duplicado (mismo médico, fecha y hora)
const duplicado = turnosExistentes.some(
  t => t.medicoId === medico.id && t.fecha === fecha && t.hora === hora
);
if (duplicado) {
  alert("⚠️ Ya existe un turno para ese médico en la misma fecha y hora.");
  return;
}

// 🔹 Agregar el nuevo turno
turnosExistentes.push(nuevoTurno);

// 🔹 Guardar en localStorage
localStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnosExistentes));

// 🔹 Actualizar variable local y recargar tabla
turnos = turnosExistentes;
mostrarTurnos();

alert("✅ Turno creado correctamente.");


  // Limpiar modal
  document.getElementById("nuevaFecha").value = "";
  document.getElementById("nuevaHora").value = "";
  document.getElementById("nuevoMedico").value = "";
  const modal = bootstrap.Modal.getInstance(document.getElementById("modalTurno"));
  modal.hide();
});


  // 🟠 Inicializar
  cargarMedicos();
  mostrarTurnos();
});
