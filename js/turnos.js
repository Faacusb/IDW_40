import { Turno } from "./turno.js";

const CLAVE_TURNOS = "turnosReservados";
const STORAGE_KEY_USER_DATA = "userData";

async function cargarTurnosIniciales() {
  const existentes = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];
  if (existentes.length > 0) return;

  try {
    const res = await fetch("data/turnos.json");
    if (!res.ok) throw new Error("No se pudo cargar turnos.json");
    const datos = await res.json();

    localStorage.setItem(CLAVE_TURNOS, JSON.stringify(datos));
    console.log("🩺 Turnos de ejemplo cargados desde JSON.");
  } catch (error) {
    console.error("❌ Error al cargar los turnos iniciales:", error);
  }
}

const selectMedico = document.getElementById("medicoSelect");
const divCalendario = document.getElementById("calendario");
const divTurnos = document.getElementById("turnos");
const tituloTurnos = document.getElementById("tituloDia");
const tablaMisReservas = document.getElementById("tablaMisReservas");

let diaElegido = null;
let medicoElegido = null;

async function cargarMedicos() {
  const medicosLocal = JSON.parse(localStorage.getItem("medicos")) || [];
  let medicosJson = [];
  try {
    const res = await fetch("data/medicos.json");
    medicosJson = await res.json();
  } catch (error) {
    console.error("Error cargando JSON de médicos:", error);
  }

  const todos = [...medicosJson];
  medicosLocal.forEach((mLocal) => {
    if (!todos.some((mJson) => mJson.id === mLocal.id)) todos.push(mLocal);
  });

  localStorage.setItem("medicos", JSON.stringify(todos));
  return todos;
}

async function cargarEspecialidadesSiFaltan() {
  let especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
  if (especialidades.length === 0) {
    try {
      const res = await fetch("data/especialidades.json");
      const datos = await res.json();
      localStorage.setItem("especialidades", JSON.stringify(datos));
      especialidades = datos;
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
    }
  }
  return especialidades;
}

function mostrarMedicos() {
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  const especialidades =
    JSON.parse(localStorage.getItem("especialidades")) || [];

  selectMedico.innerHTML = '<option value="">Seleccione un médico...</option>';

  medicos.forEach((medico) => {
    const esp = especialidades.find((e) => e.id == medico.especialidad);
    const nombreEsp = esp ? esp.nombre : "Sin especialidad";
    const opcion = document.createElement("option");
    opcion.value = medico.id;
    opcion.textContent = `${medico.nombre} ${medico.apellido} - ${nombreEsp}`;
    selectMedico.appendChild(opcion);
  });
}

selectMedico.addEventListener("change", () => {
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  medicoElegido = medicos.find((m) => m.id == selectMedico.value) || null;
  diaElegido = null;
  divTurnos.innerHTML = "";
  tituloTurnos.textContent = "Seleccione un día disponible";
  document
    .querySelectorAll(".dia")
    .forEach((d) => d.classList.remove("activo"));
});

function crearCalendario() {
  const hoy = new Date();
  divCalendario.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const fecha = new Date();
    fecha.setDate(hoy.getDate() + i);

    const celda = document.createElement("div");
    celda.className = "col-6 col-md-2 dia";
    celda.textContent = fecha.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
    celda.dataset.fecha = fecha.toISOString().split("T")[0];

    celda.addEventListener("click", () => {
      if (!medicoElegido) {
        alert("⚠️ Primero seleccione un médico.");
        return;
      }

      document
        .querySelectorAll(".dia")
        .forEach((d) => d.classList.remove("activo"));
      celda.classList.add("activo");
      diaElegido = celda.dataset.fecha;
      mostrarTurnos();
    });

    divCalendario.appendChild(celda);
  }
}

function obtenerUsuarioActual() {
  const base64 = sessionStorage.getItem(STORAGE_KEY_USER_DATA);
  if (!base64) return null;

  try {
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function mostrarTurnos() {
  if (!diaElegido || !medicoElegido) return;
  const turnos = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];

  divTurnos.innerHTML = "";
  tituloTurnos.textContent = `Turnos disponibles para ${diaElegido}`;

  const turnosDisponibles = turnos.filter(
    (t) =>
      t.medicoId === medicoElegido.id && t.fecha === diaElegido && !t.reservado
  );

  if (!turnosDisponibles.length) {
    divTurnos.innerHTML = `<p class="text-muted text-center mt-3">No hay turnos disponibles para esta fecha.</p>`;
    return;
  }

  turnosDisponibles.forEach((t) => {
    const div = document.createElement("div");
    div.className = "col-6 col-md-3";

    const btn = document.createElement("button");
    btn.textContent = t.horario;
    btn.className = "btn btn-primary w-100";
    btn.onclick = () => reservarTurno(t);

    div.appendChild(btn);
    divTurnos.appendChild(div);
  });
}

function mostrarMisReservas() {
  const usuarioActual = obtenerUsuarioActual();
  if (!usuarioActual || !tablaMisReservas) return;

  const turnos = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];
  const misTurnos = turnos.filter(
    (t) => t.usuario === usuarioActual.username // nombre de usuario dummyjson
  );

  tablaMisReservas.innerHTML = "";

  if (misTurnos.length === 0) {
    tablaMisReservas.innerHTML = `<tr><td colspan="5" class="text-muted">No tienes reservas aún.</td></tr>`;
    return;
  }

  misTurnos.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.medicoNombre} ${t.medicoApellido}</td>
      <td>${t.especialidad}</td>
      <td>${t.fecha}</td>
      <td>${t.horario}</td>
      <td><button class="btn btn-danger btn-sm">Cancelar</button></td>
    `;
    tr.querySelector("button").addEventListener("click", () =>
      cancelarReserva(t.id)
    );
    tablaMisReservas.appendChild(tr);
  });
}

function cancelarReserva(idTurno) {
  const turnos = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];
  const index = turnos.findIndex((t) => t.id == idTurno);
  if (index === -1) return;
  if (!confirm("¿Seguro que desea cancelar este turno?")) return;

  turnos[index].reservado = false;
  turnos[index].usuario = null;
  localStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnos));

  alert("❌ Turno cancelado correctamente.");
  mostrarMisReservas();
  mostrarTurnos();
}

function reservarTurno(turno) {
  const usuarioActual = obtenerUsuarioActual();
  if (!usuarioActual) {
    alert("⚠️ Debes iniciar sesión para reservar un turno.");
    window.location.href = "login.html";
    return;
  }

  const turnos = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];
  const index = turnos.findIndex((t) => t.id === turno.id);

  if (index === -1) {
    alert("⚠️ El turno seleccionado no existe.");
    return;
  }
  if (turnos[index].reservado) {
    alert("⚠️ Este turno ya fue reservado por otro usuario.");
    return;
  }

  turnos[index].reservado = true;
  turnos[index].usuario = usuarioActual.username;
  localStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnos));

  alert("✅ Turno reservado correctamente.");
  mostrarTurnos();
  mostrarMisReservas();
}

(async () => {
  await cargarTurnosIniciales();
  await cargarEspecialidadesSiFaltan();
  await cargarMedicos();
  mostrarMedicos();
  crearCalendario();
  mostrarMisReservas();
})();
