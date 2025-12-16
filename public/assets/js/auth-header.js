// Control de sesión en header (Firebase v8)
const firebaseConfigHeader = {
  apiKey: "AIzaSyB5oGPbt9KLa--5l9OIeGisggYV33if2Xg",
  authDomain: "tiendahuertohogar-2ce3a.firebaseapp.com",
  projectId: "tiendahuertohogar-2ce3a",
  storageBucket: "tiendahuertohogar-2ce3a.appspot.com",
  messagingSenderId: "857983411223",
  appId: "1:857983411223:web:a1c200cd07b7fd63b36852",
  measurementId: "G-TX342PY82Y"
};

(function initHeaderAuth() {
  if (!window.firebase) return;
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfigHeader);
  const auth = firebase.auth();
  const navLogin = document.getElementById('nav-login');
  const navLogout = document.getElementById('nav-logout');
  const navUser = document.getElementById('nav-username');
  const cartCount = document.getElementById('cart-count');

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});

  const updateCart = () => {
    try {
      const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      if (cartCount) cartCount.textContent = carrito.length;
    } catch (_) {
      if (cartCount) cartCount.textContent = '0';
    }
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      if (navLogin) navLogin.style.display = 'none';
      if (navLogout) navLogout.style.display = 'inline-flex';
      if (navUser) navUser.textContent = user.displayName || user.email || 'Cliente';
      localStorage.setItem('usuario', JSON.stringify({
        id: user.uid,
        correo: user.email || '',
        nombre: user.displayName || 'Cliente',
        rol: 'cliente'
      }));
    } else {
      if (navLogin) navLogin.style.display = 'inline-flex';
      if (navLogout) navLogout.style.display = 'none';
      if (navUser) navUser.textContent = '';
      localStorage.removeItem('usuario');
    }
    updateCart();
  });

  if (navLogout) {
    navLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await auth.signOut();
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
      } catch (err) {
        console.error('Error al cerrar sesión', err);
      }
    });
  }

  updateCart();
})();

