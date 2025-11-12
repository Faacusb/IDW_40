const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const STORAGE_KEY_TOKEN = 'accessToken';
const STORAGE_KEY_USER_DATA = 'userData';
const STORAGE_KEY_USER_EXP = 'userDataExp';
const STORAGE_KEY_ADMIN_FLAG = 'adminAutenticado';
const STORAGE_KEY_USERNAME = 'usuarioAutenticado';
const STORAGE_KEY_REDIRECT = 'redirectTo';

const BASE_PATH = window.location.hostname.includes('github.io') ? '/IDW_40/' : '/';

const PATHS = {
  [`${BASE_PATH}login.html`]: { public: true },
  [`${BASE_PATH}`]: { public: true },
  [`${BASE_PATH}index.html`]: { public: true },
  [`${BASE_PATH}contacto.html`]: { public: true },
  [`${BASE_PATH}institucional.html`]: { public: true },
  [`${BASE_PATH}turnos.html`]: { auth: true, roles: ['user'] },
  [`${BASE_PATH}usuarios.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}dashboard.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}medico.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}altaMedicos.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}gestionMedicos.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}editarMedico.html`]: { auth: true, roles: ['admin'] },
};

 function encodeBase64(obj) {
  return btoa(JSON.stringify(obj));
}

 function decodeBase64(str) {
  try {
    return JSON.parse(atob(str));
  } catch (e) {
    return null;
  }
}

function autenticar(usuario, password) {
  return fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usuario, password: password }),
  });
}

async function validateAndFetchUserData() {
  const token = sessionStorage.getItem(STORAGE_KEY_TOKEN);
  const storedDataB64 = sessionStorage.getItem(STORAGE_KEY_USER_DATA);
  const storedExp = sessionStorage.getItem(STORAGE_KEY_USER_EXP);

  if (!token) {
    clearSession();
    return null;
  }

  if (storedDataB64 && storedExp && (Date.now() < parseInt(storedExp, 10))) {
    return decodeBase64(storedDataB64);
  }

  try {
    const response = await fetch('https://dummyjson.com/user/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      clearSession();
      throw new Error('Sesión inválida o expirada.');
    }

    const userData = await response.json();

    sessionStorage.setItem(STORAGE_KEY_USER_DATA, encodeBase64(userData));
    sessionStorage.setItem(STORAGE_KEY_USER_EXP, (Date.now() + SESSION_TIMEOUT_MS).toString());
    sessionStorage.setItem(STORAGE_KEY_USERNAME, userData.username);

    if (userData.role === 'admin') {
      sessionStorage.setItem(STORAGE_KEY_ADMIN_FLAG, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_FLAG);
    }

    return userData;
  } catch (error) {
    console.error('Error al validar sesión:', error);
    clearSession();
    return null;
  }
}

function clearSession() {
  sessionStorage.clear();
}

function toggleLoadingState(form, isLoading) {
  const submitButton = form.querySelector('button[type="submit"]');
  const spinner = form.querySelector('.spinner-border');

  if (submitButton) {
    submitButton.disabled = isLoading;
    if (spinner) {
      spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
  }
}

function displayAlert(message, type = 'danger') {
  const alertId = 'customAlert-' + Date.now();
  const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show fixed-bottom-alert" role="alert" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1050; width: 90%; max-width: 500px;">
            <strong>Error de Login:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
  document.body.insertAdjacentHTML('beforeend', alertHtml);

  const alertElement = document.getElementById(alertId);
  if (alertElement && typeof materialstyle !== 'undefined' && materialstyle.Alert) {
    const bsAlert = new materialstyle.Alert(alertElement);
  }

  setTimeout(() => {
    if (alertElement) {
      const bsAlert = materialstyle.Alert.getOrCreateInstance(alertElement);
      bsAlert.close();
    }
  }, 5000);
}


function showAccessDeniedModal(message, redirectToLogin) {
  let modalElement = document.getElementById('authModal');
  if (!modalElement) {
    const modalHtml = `
            <div class="modal fade" id="authModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="authModalLabel">Acceso Denegado</h5>
                  </div>
                  <div class="modal-body"></div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="authModalConfirmBtn">Aceptar</button>
                  </div>
                </div>
              </div>
            </div>
        `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modalElement = document.getElementById('authModal');
  }

  document.querySelector('#authModal .modal-body').innerHTML = message;

  if (typeof materialstyle !== 'undefined' && materialstyle.Modal) {
    const modal = new materialstyle.Modal(modalElement);

    const confirmButton = document.getElementById('authModalConfirmBtn');
    confirmButton.onclick = () => {
      modal.hide();
      if (redirectToLogin) {
        sessionStorage.setItem(STORAGE_KEY_REDIRECT, window.location.pathname + window.location.search);
        window.location.href = 'login.html';
      }
    };

    modal.show();
  } else {
    window.alert(message);
    if (redirectToLogin) {
      sessionStorage.setItem(STORAGE_KEY_REDIRECT, window.location.pathname + window.location.search);
      window.location.href = `${BASE_PATH}login.html`;
    }
  }
}

async function handleLogin(e, form) {
  e.preventDefault();

  const username = form.querySelector('#usuario, #modalUsuario').value.trim();
  const password = form.querySelector('#password, #modalPassword').value;

  toggleLoadingState(form, true);
  clearSession();

  try {
    const response = await autenticar(username, password);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Usuario o contraseña incorrectos.');
    }

    const responseData = await response.json();
    sessionStorage.setItem(STORAGE_KEY_TOKEN, responseData.accessToken);

    const userData = await validateAndFetchUserData();

    if (userData) {
      const redirectPath = sessionStorage.getItem(STORAGE_KEY_REDIRECT);
      sessionStorage.removeItem(STORAGE_KEY_REDIRECT);

      const defaultPath = userData.role === 'admin'
        ? `${BASE_PATH}dashboard.html`
        : `${BASE_PATH}turnos.html`;

      let targetPath = defaultPath;

      if (redirectPath) {
        // Quita las barras iniciales (ej: "/dashboard.html" → "dashboard.html")
        let cleanPath = redirectPath.replace(/^\/+/, '');

        // Si estamos en GitHub Pages y la ruta no tiene el subpath, lo agregamos
        if (!cleanPath.startsWith('IDW_40/') && BASE_PATH.includes('IDW_40')) {
          cleanPath = `IDW_40/${cleanPath}`;
        }

        // Reconstruimos la ruta completa
        const fixedPath = `/${cleanPath}`;
        const url = new URL(fixedPath, window.location.origin);
        const pathConfig = PATHS[url.pathname];

        if (pathConfig && pathConfig.auth) {
          if (pathConfig.roles && !pathConfig.roles.includes(userData.role)) {
            targetPath = defaultPath;
          } else {
            targetPath = fixedPath;
          }
        } else {
          targetPath = fixedPath;
        }
      }

      location.href = targetPath;
    } else {
      throw new Error('Error al recuperar los datos completos del usuario después del login.');
    }

  } catch (error) {
    console.error('Error durante login:', error);
    displayAlert(error.message);
    clearSession();
  } finally {
    toggleLoadingState(form, false);
    form.reset();
  }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) loginForm.addEventListener('submit', e => handleLogin(e, loginForm));

const modalLoginForm = document.getElementById('modalLoginForm');
if (modalLoginForm) modalLoginForm.addEventListener('submit', e => handleLogin(e, modalLoginForm));

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  const pathConfig = PATHS[path] || { public: true };
  const isLoginPage = path.includes('login.html');

  if (!pathConfig.public) {
    const user = await validateAndFetchUserData();

    if (!user) {
      if (isLoginPage) return;

      showAccessDeniedModal('Su sesión ha expirado o no ha iniciado sesión.', true);
      return;
    }

    if (pathConfig.roles && !pathConfig.roles.includes(user.role)) {
      showAccessDeniedModal(`Acceso denegado. Solo ${pathConfig.roles.join(', ')} pueden acceder.`, false);
      window.location.href = `${BASE_PATH}turnos.html`;
      return;
    }
  }

  // Lógica de navegación dinámica (Login/Logout)
  const token = sessionStorage.getItem(STORAGE_KEY_TOKEN);
  const navList = document.querySelector('#navbarNav .navbar-nav');

  let user = null;
  if (token) {
    user = await validateAndFetchUserData();
  }

  const existingLogin = navList.querySelector('a[href="login.html"]');
  if (existingLogin) existingLogin.closest('li').remove();

  const existingLogout = document.getElementById('logoutLink');
  if (existingLogout) existingLogout.closest('li').remove();

  const liAuth = document.createElement('li');
  liAuth.classList.add('nav-item');

  if (user) {
    liAuth.innerHTML = `
        <a class="nav-link fw-bold text-dark" href="#" id="logoutLink">Cerrar sesión (${user.username})</a>
      `;
    navList.appendChild(liAuth);

    document.getElementById('logoutLink').addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = 'index.html';
    });
  } else {
    liAuth.innerHTML = `
        <a class="nav-link fw-bold text-dark ${window.location.pathname.includes("login.html") ? 'active' : ''}" href="login.html">Iniciar sesión</a>
      `;
    navList.appendChild(liAuth);
  }
});