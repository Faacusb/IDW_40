(function(){
  function getQueryParam(key){
    return new URLSearchParams(location.search).get(key);
  }

  const id = getQueryParam('id');
  const form = document.getElementById('editarMedicoFormulario');
  const inputNombre = document.getElementById('nombre_edit');
  const inputEspecialidad = document.getElementById('especialidad_edit');
  const inputObra = document.getElementById('obrasocial_edit');
  const inputTelefono = document.getElementById('telefono_edit');
  const inputEmail = document.getElementById('email_edit');
  const inputImagen = document.getElementById('imagenMedico_edit');
  const muestraImagen = document.getElementById('muestraImagen_edit');

  let imagenBase64 = '';

  const medicos = JSON.parse(localStorage.getItem('medicos')) || [];
  const medico = medicos.find(m => String(m.id) === String(id));

  if (!medico) {
    alert('Médico no encontrado');
    window.location.href = 'gestionMedicos.html';
  }


  inputNombre.value = medico.nombre || '';

  function setSelectValue(selectEl, val) {
    if (!selectEl) return;
    if (!val) { selectEl.value = ''; return; }
    const exists = Array.from(selectEl.options).some(o => String(o.value) === String(val));
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      selectEl.appendChild(opt);
    }
    selectEl.value = val;
  }

  setSelectValue(inputEspecialidad, medico.especialidad || '');
  setSelectValue(inputObra, medico.obrasocial || medico.obraSocial || '');
  inputTelefono.value = medico.telefono || '';
  inputEmail.value = medico.email || '';

  if (medico.imagen) {
    muestraImagen.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center gap-3 preview-list';

    const img = document.createElement('img');
    img.src = medico.imagen;
    img.className = 'preview-thumb rounded';
    img.style.width = '64px'; img.style.height = '64px'; img.style.objectFit = 'cover';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex-grow-1 preview-info';
    const nombreP = document.createElement('p');
    nombreP.className = 'fw-light mb-0';

    try{
      const parts = String(medico.imagen).split('/');
      nombreP.textContent = parts[parts.length-1] || 'Imagen';
    } catch(e){ nombreP.textContent = 'Imagen'; }
    infoDiv.appendChild(nombreP);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-close';
    btn.addEventListener('click', function () {
      inputImagen.value = '';
      imagenBase64 = '';
      muestraImagen.innerHTML = '';
    });

    li.appendChild(img);
    li.appendChild(infoDiv);
    li.appendChild(btn);
    muestraImagen.appendChild(li);
    imagenBase64 = medico.imagen;
  }

  inputImagen?.addEventListener('change', function(e){
    if (!e.target.files || e.target.files.length === 0) return;
    const archivo = e.target.files[0];
    const fr = new FileReader();
    fr.onload = function(evt){
      imagenBase64 = evt.target.result;
      muestraImagen.innerHTML = '';
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center gap-3 preview-list';

      const img = document.createElement('img');
      img.src = imagenBase64;
      img.className = 'preview-thumb rounded';
      img.style.width = '64px'; img.style.height = '64px'; img.style.objectFit = 'cover';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'flex-grow-1 preview-info';
      const nombreP = document.createElement('p');
      nombreP.className = 'fw-light';
      nombreP.textContent = archivo.name || 'Imagen subida';

      const tamanoP = document.createElement('p');
      tamanoP.className = 'mb-0 text-muted small';
      const bytes = archivo.size || 0;
      let tamañoLegible = '';
      if (bytes < 1024) {
        tamañoLegible = bytes + ' B';
      } else if (bytes < 1024 * 1024) {
        tamañoLegible = (bytes / 1024).toFixed(1) + ' KB';
      } else {
        tamañoLegible = (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      }
      tamanoP.textContent = tamañoLegible;

      infoDiv.appendChild(nombreP);
      infoDiv.appendChild(tamanoP);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-close';
      btn.addEventListener('click', function () {
        inputImagen.value = '';
        imagenBase64 = '';
        muestraImagen.innerHTML = '';
      });

      li.appendChild(img);
      li.appendChild(infoDiv);
      li.appendChild(btn);
      muestraImagen.appendChild(li);
    };
    fr.readAsDataURL(archivo);
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    for (let i=0;i<medicos.length;i++){
      if (String(medicos[i].id) === String(id)){
        medicos[i].nombre = inputNombre.value.trim();
        medicos[i].especialidad = inputEspecialidad.value;
        medicos[i].obrasocial = inputObra.value;
        medicos[i].telefono = inputTelefono.value.trim();
        medicos[i].email = inputEmail.value.trim();
        medicos[i].imagen = imagenBase64 || medicos[i].imagen || '';
        break;
      }
    }

    localStorage.setItem('medicos', JSON.stringify(medicos));
    alert('Médico actualizado');
    window.location.href = 'gestionMedicos.html';
  });
})();

