const selectMedico = document.getElementById("medicoSelect");
const divCalendario = document.getElementById("calendario");
const divTurnos = document.getElementById("turnos");
const tituloTurnos = document.getElementById("tituloDia");


const HORAS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const CLAVE_TURNOS = "turnosReservados";

let diaElegido = null;
let medicoElegido = null;


async function cargarMedicosSiFaltan() {
  let medicos = JSON.parse(localStorage.getItem("medicos")) || [];

  if (medicos.length === 0) {
    try {
      const res = await fetch("data/medicos.json");
      const datos = await res.json();
      localStorage.setItem("medicos", JSON.stringify(datos));
      medicos = datos;
    } catch (error) {
      console.error("Error al cargar médicos:", error);
    }
  }

  return medicos;
}


function mostrarMedicos() {
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  selectMedico.innerHTML = '<option value="">Seleccione un médico...</option>';

  medicos.forEach(medico => {
    const opcion = document.createElement("option");
    opcion.value = medico.nombre;
    opcion.textContent = `${medico.nombre} - ${medico.especialidad}`;
    selectMedico.appendChild(opcion);
  });
}

selectMedico.addEventListener("change", () => {
  medicoElegido = selectMedico.value;
  diaElegido = null;
  divTurnos.innerHTML = "";
  tituloTurnos.textContent = "Seleccione un día disponible";
  document.querySelectorAll(".dia").forEach(d => d.classList.remove("activo"));
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
        alert("Primero seleccione un médico.");
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

function obtenerTurnos() {
  return JSON.parse(sessionStorage.getItem(CLAVE_TURNOS)) || [];
}

function guardarTurnos(turnos) {
  sessionStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnos));
}


function mostrarTurnos() {
  if (!diaElegido || !medicoElegido) return;

  divTurnos.innerHTML = "";
  tituloTurnos.textContent = `Turnos disponibles para ${diaElegido}`;

  HORAS.forEach(hora => {
    const div = document.createElement("div");
    div.className = "col-6 col-md-3";

    const btn = document.createElement("button");
    btn.textContent = hora;
    btn.className = "btn btn-primary w-100";
    btn.onclick = () => reservarTurno(hora);

    div.appendChild(btn);
    divTurnos.appendChild(div);
  });
}


function reservarTurno(hora) {
  const turno = {
    medico: medicoElegido,
    fecha: diaElegido,
    hora: hora
  };

  let turnos = obtenerTurnos();


  const existe = turnos.some(
    t => t.medico === turno.medico && t.fecha === turno.fecha && t.hora === turno.hora
  );

  if (existe) {
    alert(" Ese turno ya fue reservado.");
    return;
  }

  turnos.push(turno);
  guardarTurnos(turnos);
  alert(` Turno reservado con ${turno.medico} el ${turno.fecha} a las ${turno.hora}`);
}


(async () => {
  await cargarMedicosSiFaltan();
  mostrarMedicos();
  crearCalendario();
})();
