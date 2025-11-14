import { Turno } from "./turno.js";

document.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tablaTurnos");
  const filtroMedico = document.getElementById("filtroMedico");
  const btnLimpiar = document.getElementById("btnLimpiarTurnos");

  const CLAVE_TURNOS = "turnosReservados";
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  let turnos = JSON.parse(localStorage.getItem(CLAVE_TURNOS));

  async function cargarTurnosDesdeJSON() {
    const res = await fetch("data/turnos.json");
    const datos = await res.json();
    localStorage.setItem(CLAVE_TURNOS, JSON.stringify(datos));
    return datos;
  }

  async function inicializarTurnos() {
    if (!turnos) {
      turnos = await cargarTurnosDesdeJSON();
    }
  }

  function cargarMedicos() {
    const selectFiltro = document.getElementById("filtroMedico");
    const selectNuevo = document.getElementById("nuevoMedico");

    selectFiltro.innerHTML = `<option value="">Todos los médicos</option>`;
    selectNuevo.innerHTML = `<option value="">Seleccione un médico...</option>`;

    medicos.forEach((m) => {
      const texto = `${m.nombre} ${m.apellido} - ${obtenerEspecialidad(
        m.especialidad
      )}`;

      const optFiltro = document.createElement("option");
      optFiltro.value = m.id;
      optFiltro.textContent = texto;
      selectFiltro.appendChild(optFiltro);

      const optNuevo = document.createElement("option");
      optNuevo.value = m.id;
      optNuevo.textContent = texto;
      selectNuevo.appendChild(optNuevo);
    });
  }

  function obtenerEspecialidad(id) {
    const especialidades =
      JSON.parse(localStorage.getItem("especialidades")) || [];
    const esp = especialidades.find((e) => e.id == id);
    return esp ? esp.nombre : "Sin especialidad";
  }

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
        <td>${t.medicoNombre} ${t.medicoApellido}</td>
        <td>${t.especialidad}</td>
        <td>${t.usuario ?? ""}</td>
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

  function eliminarTurno(id) {
    if (!confirm("¿Eliminar este turno?")) return;
    turnos = turnos.filter((t) => t.id !== id);
    guardarTurnos();
    mostrarTurnos();
  }

  btnLimpiar.addEventListener("click", () => {
    if (!turnos.length) return alert("No hay turnos para eliminar.");
    if (!confirm("¿Eliminar TODOS los turnos?")) return;
    turnos = [];
    guardarTurnos();
    mostrarTurnos();
  });

  function guardarTurnos() {
    localStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnos));
  }

  filtroMedico.addEventListener("change", mostrarTurnos);

  document.getElementById("btnGuardarTurno").addEventListener("click", () => {
    const medicoId = parseInt(document.getElementById("nuevoMedico").value);
    const fecha = document.getElementById("nuevaFecha").value;
    const hora = document.getElementById("nuevaHora").value;

    if (!medicoId || !fecha || !hora) {
      alert("Por favor complete todos los campos.");
      return;
    }

    const medico = medicos.find((m) => m.id === medicoId);
    if (!medico) return alert("Médico no encontrado.");

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

    const duplicado = turnos.some(
      (t) => t.medicoId === medico.id && t.fecha === fecha && t.horario === hora
    );
    if (duplicado) {
      alert("⚠️ Ya existe un turno para ese médico en la misma fecha y hora.");
      return;
    }

    turnos.push(nuevoTurno);
    guardarTurnos();
    mostrarTurnos();

    alert("✅ Turno creado correctamente.");

    document.getElementById("nuevaFecha").value = "";
    document.getElementById("nuevaHora").value = "";
    document.getElementById("nuevoMedico").value = "";
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalTurno"));
    modal.hide();
  });

  await inicializarTurnos();
  cargarMedicos();
  mostrarTurnos();
});
