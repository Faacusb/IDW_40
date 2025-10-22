document.addEventListener("DOMContentLoaded", () => {
    const medicosTablaCuerpo = document.getElementById("medicosTablaCuerpo");
    const detallesMedicoDiv = document.getElementById("detallesMedico");

    
    function cargarMedicos() {
        
        let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
        medicosTablaCuerpo.innerHTML = ""; 

        if (medicos.length === 0) {
            medicosTablaCuerpo.innerHTML = '<tr><td colspan="7" class="text-center">No hay médicos registrados.</td></tr>';
            return;
        }

        medicos.forEach(medico => {
            
            const fila = medicosTablaCuerpo.insertRow();
            
            
            fila.insertCell().textContent = medico.id;
            fila.insertCell().textContent = medico.nombre;
            fila.insertCell().textContent = medico.especialidad;
            fila.insertCell().textContent = medico.obrasocial;
            
            fila.insertCell().textContent = medico.telefono || 'N/A';
            fila.insertCell().textContent = medico.email || 'N/A';

            // Crea la celda de acciones (botones)
            const celdaAcciones = fila.insertCell();
            celdaAcciones.classList.add('text-center');

            // Botón Mostrar para ver detalles 
            const botonMostrar = document.createElement('button');
            botonMostrar.textContent = 'Mostrar';
            botonMostrar.classList.add('btn', 'btn-sm', 'btn-info', 'me-2');
            botonMostrar.addEventListener('click', () => mostrarDetalles(medico));
            celdaAcciones.appendChild(botonMostrar);

            // Botón Eliminar
            const botonEliminar = document.createElement('button');
            botonEliminar.textContent = 'Eliminar';
            botonEliminar.classList.add('btn', 'btn-sm', 'btn-danger');
            botonEliminar.addEventListener('click', () => eliminarMedico(medico.id));
            celdaAcciones.appendChild(botonEliminar);
        });
    }

    
    function mostrarDetalles(medico) {
        detallesMedicoDiv.style.display = 'block';
        detallesMedicoDiv.innerHTML = `
            <h4>Detalles de ${medico.nombre} (ID: ${medico.id})</h4>
            <p><strong>Especialidad:</strong> ${medico.especialidad}</p>
            <p><strong>Obra Social:</strong> ${medico.obrasocial}</p>
            <p><strong>Teléfono:</strong> ${medico.telefono || 'N/A'}</p>
            <p><strong>Email:</strong> ${medico.email || 'N/A'}</p>
            ${medico.imagen ? `<img src="${medico.imagen}" alt="Foto" class="img-thumbnail" style="max-width: 100px;">` : ''}
            <hr>
            <p class="text-muted">Aquí podrías añadir la lógica para editar estos campos.</p>
        `;
    }

    
    function eliminarMedico(id) {
        if (confirm(`¿Estás seguro de que quieres eliminar al médico con ID ${id}?`)) {
            let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
            
            
            medicos = medicos.filter(medico => medico.id !== id);

            
            localStorage.setItem("medicos", JSON.stringify(medicos));

            
            cargarMedicos();
            
            
            detallesMedicoDiv.style.display = 'none';
            alert(`Médico con ID ${id} eliminado correctamente.`);
        }
    }

    
    cargarMedicos();
});
