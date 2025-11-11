const detallesMedicoDiv = document.getElementById("detallesMedico");
const drawer = document.getElementById('drawerDetalles');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const drawerContenido = document.getElementById('drawerContenido');
const drawerCerrar = document.getElementById('drawerCerrar');

// --- Drawer ---
function openDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawerBackdrop.style.display = 'block';
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawerBackdrop.style.display = 'none';
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function mostrarDetalles(medico) {
    if (detallesMedicoDiv) detallesMedicoDiv.style.display = 'none';
    // Construir contenido: foto arriba, luego info con iconos
    const fotoHtml = medico.imagen ? `<img src="${medico.imagen}" alt="Foto de ${medico.nombre}" class="foto-medico">` : `<div class="foto-medico" style="background:#eee;display:block"></div>`;

    const infoHtml = `
            <div class="info-list">
                <div class="info-row">
                    <div class="info-icon"><i class="bi bi-person-fill"></i></div>
                    <div class="info-text"><strong>${medico.nombre}</strong><div class="text-muted">ID: ${medico.id}</div></div>
                </div>

                <div class="info-row">
                    <div class="info-icon"><i class="bi bi-briefcase-fill"></i></div>
                    <div class="info-text">${medico.especialidad || 'N/A'}</div>
                </div>

                <div class="info-row">
                    <div class="info-icon"><i class="bi bi-building"></i></div>
                    <div class="info-text">${medico.obrasocial || 'N/A'}</div>
                </div>

                <div class="info-row">
                    <div class="info-icon"><i class="bi bi-telephone-fill"></i></div>
                    <div class="info-text">${medico.telefono || 'N/A'}</div>
                    <div class="info-action"><a class="btn-action-link" href="tel:${medico.telefono}" title="Llamar"><i class="bi bi-telephone"></i></a></div>
                </div>

                <div class="info-row">
                    <div class="info-icon"><i class="bi bi-envelope-fill"></i></div>
                    <div class="info-text">${medico.email || 'N/A'}</div>
                    <div class="info-action"><a class="btn-action-link" href="mailto:${medico.email}" title="Enviar correo"><i class="bi bi-envelope"></i></a></div>
                </div>
            </div>
        `;

    const html = `
            ${fotoHtml}
            ${infoHtml}
            <hr>
        `;

    if (drawerContenido) drawerContenido.innerHTML = html;
    // establecer acciones para los botones de pie de página (abrir en una nueva pestaña, cerrar en otra parte)
    const openBtn = document.getElementById('drawerOpenNew');
    if (openBtn) {
        openBtn.onclick = () => {
            const url = `medico.html?id=${encodeURIComponent(medico.id)}`;
            window.open(url, '_blank');
        };
    }

    const editDrawerBtn = document.getElementById('drawerEdit');
    if (editDrawerBtn) {
        editDrawerBtn.onclick = () => {
            window.location.href = `editarMedico.html?id=${encodeURIComponent(medico.id)}`;
        };
    }

    const delBtn = document.getElementById('drawerEliminar');
    if (delBtn) {
        delBtn.onclick = () => {
            if (confirm(`¿Eliminar al médico ${medico.nombre} (ID ${medico.id})?`)) {
                let medicos = JSON.parse(localStorage.getItem('medicos')) || [];
                medicos = medicos.filter(m => m.id !== medico.id);
                localStorage.setItem('medicos', JSON.stringify(medicos));
                closeDrawer();
                cargarMedicos();
                alert('Médico eliminado');
            }
        };
    }

    const closeFooter = document.getElementById('drawerCloseFooter');
    if (closeFooter) closeFooter.onclick = closeDrawer;

    openDrawer();
}

if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
if (drawerCerrar) drawerCerrar.addEventListener('click', closeDrawer);

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
