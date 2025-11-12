document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('dark-mode-toggle');
    const htmlElement = document.documentElement;
        
    function ponerTema(tema) {
        if (tema === 'dark') {
        htmlElement.setAttribute('data-bs-theme', 'dark');
        toggle.checked = true;
        } else {
        htmlElement.setAttribute('data-bs-theme', 'light');
        toggle.checked = false;
        }
    }

    /*carga inicial */
    const temaActual = localStorage.getItem('theme');
    if (temaActual) {
        ponerTema(temaActual);
    } else {
        const mejorNegro = window.matchMedia('(prefers-color-scheme: dark)').matches;
        ponerTema(mejorNegro ? 'dark' : 'light');
    }
    /* acción */
    toggle.addEventListener('change', () => {
        const nuevoTema = toggle.checked ? 'dark' : 'light';
        ponerTema(nuevoTema);
        localStorage.setItem('theme', nuevoTema);
    });
});