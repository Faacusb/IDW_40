const altaMedicoFormulario = document.getElementById("altaMedicoFormulario");
const inputNombre = document.getElementById("nombre");
const inputEspecialidad = document.getElementById("especialidad");
const inputObraSocial = document.getElementById("obrasocial");
const inputImagen = document.getElementById('imagenMedico');
const muestraImagen = document.getElementById('muestraImagen');

let imagenBase64 = '';

inputImagen.addEventListener('change', function(e){
    const archivo = e.target.files[0];
    if (archivo){
        const lector = new FileReader();

        lector.onload = function(e){
            imagenBase64 = e.target.result;
            muestraImagen.src = imagenBase64;
            muestraImagen.style.display = 'block';
        };
        lector.readAsDataURL(archivo);
    }
})

function obtenerProximoId() {
  let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  if (medicos.length === 0){
    return 1;
  }
  let ultimoId = 0;
  for (let i = 0; i< medicos.length; i++){
    if (medicos[i].id > ultimoId){
      ultimoId = medicos[i].id;
    }
  }
  return ultimoId + 1
  
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
    imagen:imagenBase64 || ''
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
  muestraImagen.style.display = 'none';
  imagenBase64 = '';
}
altaMedicoFormulario.addEventListener("submit", altaMedicos);
