const altaMedicoFormulario = document.getElementById("altaMedicoFormulario");
const inputNombre = document.getElementById("nombre");
const inputEspecialidad = document.getElementById("especialidad");
const inputObraSocial = document.getElementById("obrasocial");

function obtenerProximoId() {
  let ultimoId = parseInt(localStorage.getItem("ultimoIdMedico")) || 0;
  ultimoId++;
  localStorage.setItem("ultimoIdMedico", ultimoId);
  return ultimoId;
}

let medicos = JSON.parse(localStorage.getItem("medicos")) || [];

function altaMedicos(event) {
  event.preventDefault();

  let nombreMed = inputNombre.value.trim();
  let especialidad = inputEspecialidad.value.trim();
  let obrasocial = inputObraSocial.value.trim();

  if (!nombreMed || !especialidad || !obrasocial) {
    alert("Por favor completa los campos!");
    return;
  }
  const nuevoMed = {
    id: obtenerProximoId(),
    nombre: nombreMed,
    especialidad: especialidad,
    obrasocial: obrasocial,
  };

  
  medicos.push(nuevoMed);
  localStorage.setItem("medicos", JSON.stringify(medicos));

  alert(
    `Medico registrado:\n\n` +
      `Nombre: ${nombreMed}\n` +
      `Especialidad: ${especialidad}\n` +
      `Obra Social: ${obrasocial}\n`
  );
  altaMedicoFormulario.reset();
}
altaMedicoFormulario.addEventListener("submit", altaMedicos);
