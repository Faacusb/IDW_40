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
  [`${BASE_PATH}institucional.html`]: { public: true },
  [`${BASE_PATH}index.html`]: { public: true },
  [`${BASE_PATH}turnos.html`]: { auth: true },
  [`${BASE_PATH}gestionMedicos.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}altaMedicos.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}gestion_especialidades.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}gestion_obrasocial.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}administracion-turnos.html`]: { auth: true, roles: ['admin'] },
  [`${BASE_PATH}usuarios.html`]: { auth: true, roles: ['admin'] },
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

  if (storedDataB64 && storedExp && Date.now() < parseInt(storedExp, 10)) {
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
  const btn = form.querySelector('button[type="submit"]');
  const spinner = form.querySelector('.spinner-border');
  if (btn) {
    btn.disabled = isLoading;
    if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
  }
}

function displayAlert(message, type = 'danger') {
  const alertId = 'alert-' + Date.now();
  const html = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show fixed-bottom-alert"
         style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
         z-index:1050;width:90%;max-width:500px;">
      <strong>Error de Login:</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(() => {
    const el = document.getElementById(alertId);
    if (el) el.remove();
  }, 5000);
}

function showAccessDeniedModal(message, redirectToLogin) {
  alert(message);
  if (redirectToLogin) {
    sessionStorage.setItem(STORAGE_KEY_REDIRECT, window.location.pathname + window.location.search);
    window.location.href = `${BASE_PATH}login.html`;
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

    const data = await response.json();
    sessionStorage.setItem(STORAGE_KEY_TOKEN, data.accessToken);

    const userData = await validateAndFetchUserData();

    if (userData) {
      const redirectPath = sessionStorage.getItem(STORAGE_KEY_REDIRECT);
      sessionStorage.removeItem(STORAGE_KEY_REDIRECT);

    const defaultPath = userData.role === 'admin'
  ? `${BASE_PATH}gestionMedicos.html`
  : `${BASE_PATH}turnos.html`;

let targetPath = defaultPath;

if (redirectPath) {
  let cleanPath = redirectPath.replace(/^\/+/, '');

  if (!cleanPath.startsWith('IDW_40/') && BASE_PATH.includes('IDW_40')) {
    cleanPath = `IDW_40/${cleanPath}`;
  }

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
  throw new Error('Error al obtener datos del usuario.');
}

  } catch (err) {
    console.error('Error durante login:', err);
    displayAlert(err.message);
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

  if (pathConfig.public) return;

  const user = await validateAndFetchUserData();

  if (!user) {
    if (isLoginPage) return;
    showAccessDeniedModal('Su sesión ha expirado o no ha iniciado sesión.', true);
    return;
  }

  if (pathConfig.roles && !pathConfig.roles.includes(user.role)) {
    showAccessDeniedModal(`Acceso denegado. Solo ${pathConfig.roles.join(', ')} pueden acceder.`, false);
    window.location.href = `${BASE_PATH}turnos.html`;
  }
});
