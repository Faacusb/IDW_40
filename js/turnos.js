import { Turno } from "./turno.js";

const selectMedico = document.getElementById("medicoSelect");
const divCalendario = document.getElementById("calendario");
const divTurnos = document.getElementById("turnos");
const tituloTurnos = document.getElementById("tituloDia");

const CLAVE_TURNOS = "turnosReservados";
let diaElegido = null;
let medicoElegido = null;

// 🩺 Cargar médicos combinando JSON + localStorage (sin duplicar)
async function cargarMedicos() {
  const medicosLocal = JSON.parse(localStorage.getItem("medicos")) || [];

  let medicosJson = [];
  try {
    const res = await fetch("data/medicos.json");
    medicosJson = await res.json();
  } catch (error) {
    console.error("Error cargando JSON de médicos:", error);
  }

  // Combinar médicos del JSON con los locales (sin duplicar)
  const todos = [...medicosJson];
  medicosLocal.forEach(mLocal => {
    const existe = todos.some(mJson => mJson.id === mLocal.id);
    if (!existe) todos.push(mLocal);
  });

  // Guardar la lista final combinada
  localStorage.setItem("medicos", JSON.stringify(todos));
  return todos;
}
// 🧠 Cargar especialidades si faltan
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
  const especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];

  selectMedico.innerHTML = '<option value="">Seleccione un médico...</option>';

  medicos.forEach(medico => {
    // Buscar el nombre de la especialidad según el id
    const esp = especialidades.find(e => e.id == medico.especialidad);
    const nombreEsp = esp ? esp.nombre : "Sin especialidad";

    const opcion = document.createElement("option");
    opcion.value = medico.id;
    opcion.textContent = `${medico.nombre} ${medico.apellido} - ${nombreEsp}`;
    selectMedico.appendChild(opcion);
  });
}


// 🟢 Al seleccionar un médico
selectMedico.addEventListener("change", () => {
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  medicoElegido = medicos.find(m => m.id == selectMedico.value) || null;
  diaElegido = null;
  divTurnos.innerHTML = "";
  tituloTurnos.textContent = "Seleccione un día disponible";
  document.querySelectorAll(".dia").forEach(d => d.classList.remove("activo"));
});

// 📅 Crear calendario para próximos 7 días
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

      document.querySelectorAll(".dia").forEach(d => d.classList.remove("activo"));
      celda.classList.add("activo");
      diaElegido = celda.dataset.fecha;
      mostrarTurnos();
    });

    divCalendario.appendChild(celda);
  }
}

// 🕒 Mostrar turnos disponibles
function mostrarTurnos() {
  if (!diaElegido || !medicoElegido) return;

  const turnos = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];

  divTurnos.innerHTML = "";
  tituloTurnos.textContent = `Turnos disponibles para ${diaElegido}`;

  const turnosDisponibles = turnos.filter(
    t => t.medicoId === medicoElegido.id && t.fecha === diaElegido && !t.reservado
  );

  if (!turnosDisponibles.length) {
    divTurnos.innerHTML = `<p class="text-muted text-center mt-3">No hay turnos disponibles para esta fecha.</p>`;
    return;
  }

  turnosDisponibles.forEach(t => {
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


function reservarTurno(turno) {
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActual) {
    alert("⚠️ Debes iniciar sesión para reservar un turno.");
    return;
  }

  const turnos = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];
  const index = turnos.findIndex(t => t.id === turno.id);

  if (index === -1) {
    alert("⚠️ El turno seleccionado no existe.");
    return;
  }

  // 🟠 Nueva validación: evitar doble reserva
  if (turnos[index].reservado) {
    alert("⚠️ Este turno ya fue reservado por otro usuario.");
    return;
  }

  // 🟢 Reservar turno
  turnos[index].reservado = true;
  turnos[index].usuario = `${usuarioActual.nombre} ${usuarioActual.apellido}`;
  localStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnos));

  alert("✅ Turno reservado correctamente.");
  mostrarTurnos();
}


(async () => {
  await cargarEspecialidadesSiFaltan(); // 👈 primero carga las especialidades
  await cargarMedicos();                // 👈 luego combina los médicos del JSON + localStorage
  mostrarMedicos();                     // 👈 ahora sí los muestra con sus especialidades
  crearCalendario();                    // 👈 y genera el calendario
})();


const turnosGuardados = JSON.parse(localStorage.getItem(CLAVE_TURNOS)) || [];
let listaTurnos = turnosGuardados;

console.log("📋 Todos los turnos cargados desde localStorage:");
console.table(listaTurnos);