// perfilCliente.js
document.addEventListener("DOMContentLoaded", () => {
    // Verificar si el usuario está logueado
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.rol !== 'cliente') {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyB5oGPbt9KLa--5l9OIeGisggYV33if2Xg",
        authDomain: "tiendahuertohogar-2ce3a.firebaseapp.com",
        projectId: "tiendahuertohogar-2ce3a",
        storageBucket: "tiendahuertohogar-2ce3a.appspot.com",
        messagingSenderId: "857983411223",
        appId: "1:857983411223:web:a1c200cd07b7fd63b36852",
        measurementId: "G-TX342PY82Y"
    };

    if (!firebase.apps?.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    // Elementos del DOM
    const welcomeMessage = document.getElementById('welcome-message');
    const userEmail = document.getElementById('user-email');
    const profileAvatar = document.getElementById('profile-avatar');
    const logoutLink = document.getElementById('logout-link');
    const cartCount = document.getElementById('cart-count');

    // Actualizar información del usuario
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${usuario.nombre}`;
    }

    if (userEmail) {
        userEmail.textContent = usuario.correo || '';
    }

    // Cargar carrito del localStorage
    const updateCartCount = () => {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (cartCount) {
            cartCount.textContent = carrito.length;
        }
    };

    updateCartCount();

    // Cargar datos adicionales del usuario desde Firestore
    const loadUserData = async () => {
        try {
            const userDoc = await db.collection('usuarios').doc(usuario.id).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                // Actualizar campos del formulario si existen
                const fullNameInput = document.getElementById('fullName');
                const phoneInput = document.getElementById('phone');
                const emailInput = document.getElementById('email');
                const aboutInput = document.getElementById('about');

                if (fullNameInput && userData.nombre) {
                    fullNameInput.value = userData.nombre;
                }
                if (phoneInput && userData.telefono) {
                    phoneInput.value = userData.telefono;
                }
                if (emailInput && userData.email) {
                    emailInput.value = userData.email;
                }
                if (aboutInput && userData.sobreMi) {
                    aboutInput.value = userData.sobreMi;
                }

                // Calcular y mostrar progreso del perfil
                updateProfileCompletion();
            }
        } catch (error) {
            console.error("Error cargando datos del usuario:", error);
        }
    };

    // Calcular completitud del perfil
    const updateProfileCompletion = () => {
        const fields = [
            document.getElementById('fullName'),
            document.getElementById('phone'),
            document.getElementById('about')
        ];

        let completed = 0;
        fields.forEach(field => {
            if (field && field.value.trim() !== '') {
                completed++;
            }
        });

        const percentage = Math.round((completed / fields.length) * 100);
        const progressBar = document.getElementById('profile-progress');
        const percentageSpan = document.getElementById('completion-percentage');

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (percentageSpan) {
            percentageSpan.textContent = `${percentage}%`;
        }
    };

    // Cargar pedidos del usuario
    const loadUserOrders = async () => {
        try {
            const ordersQuery = await db.collection('pedidos')
                .where('usuarioId', '==', usuario.id)
                .orderBy('fecha', 'desc')
                .get();

            const ordersBody = document.getElementById('orders-body');
            const noOrders = document.getElementById('no-orders');
            const ordersTable = document.getElementById('orders-table');

            if (ordersQuery.empty) {
                if (noOrders) noOrders.style.display = 'block';
                if (ordersTable) ordersTable.style.display = 'none';
                updateOrderStats(0, 0, 0, 0);
                return;
            }

            let totalOrders = 0;
            let completedOrders = 0;
            let pendingOrders = 0;
            let totalSpent = 0;

            ordersQuery.forEach(doc => {
                const order = doc.data();
                totalOrders++;

                if (order.estado === 'entregado') {
                    completedOrders++;
                    totalSpent += order.total || 0;
                } else if (order.estado === 'pendiente') {
                    pendingOrders++;
                }

                if (ordersBody) {
                    const row = ordersBody.insertRow();
                    row.innerHTML = `
                        <td>#${doc.id.substring(0, 8)}</td>
                        <td>${order.fecha?.toDate().toLocaleDateString()}</td>
                        <td>${order.productos?.length || 0} productos</td>
                        <td>$${(order.total || 0).toLocaleString()}</td>
                        <td><span class="badge-status ${getStatusClass(order.estado)}">${order.estado}</span></td>
                        <td>
                            <button class="btn-outline-primary btn-sm" onclick="viewOrder('${doc.id}')">
                                Ver Detalles
                            </button>
                        </td>
                    `;
                }
            });

            updateOrderStats(totalOrders, completedOrders, pendingOrders, totalSpent);
        } catch (error) {
            console.error("Error cargando pedidos:", error);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'entregado': return 'bg-success';
            case 'pendiente': return 'bg-warning';
            case 'procesando': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

    const updateOrderStats = (total, completed, pending, spent) => {
        document.getElementById('total-orders').textContent = total;
        document.getElementById('completed-orders').textContent = completed;
        document.getElementById('pending-orders').textContent = pending;
        document.getElementById('total-spent').textContent = `$${spent.toLocaleString()}`;
    };

    // Guardar perfil
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const saveButton = profileForm.querySelector('button[type="submit"]');
            const originalText = saveButton.innerHTML;

            try {
                saveButton.disabled = true;
                saveButton.innerHTML = '<span class="loading-spinner"></span> Guardando...';

                const profileData = {
                    nombre: document.getElementById('fullName').value,
                    telefono: document.getElementById('phone').value,
                    sobreMi: document.getElementById('about').value,
                    ultimaActualizacion: new Date()
                };

                await db.collection('usuarios').doc(usuario.id).set(profileData, { merge: true });

                // Actualizar localStorage
                usuario.nombre = profileData.nombre;
                localStorage.setItem('usuario', JSON.stringify(usuario));

                // Actualizar mensaje de bienvenida
                if (welcomeMessage) {
                    welcomeMessage.textContent = `Bienvenido, ${profileData.nombre}`;
                }

                // Mostrar mensaje de éxito
                showAlert('Perfil actualizado correctamente', 'success');
                updateProfileCompletion();
            } catch (error) {
                console.error("Error guardando perfil:", error);
                showAlert('Error al guardar el perfil', 'error');
            } finally {
                saveButton.disabled = false;
                saveButton.innerHTML = originalText;
            }
        });

        // Actualizar progreso al cambiar campos
        ['fullName', 'phone', 'about'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', updateProfileCompletion);
            }
        });
    }

    // Guardar preferencias
    const preferencesForm = document.getElementById('save-preferences');
    if (preferencesForm) {
        preferencesForm.addEventListener('click', async () => {
            try {
                const preferences = {
                    emailNotifications: document.getElementById('emailNotifications').checked,
                    favVegetables: document.getElementById('favVegetables').checked,
                    favFruits: document.getElementById('favFruits').checked,
                    favOrganic: document.getElementById('favOrganic').checked
                };

                await db.collection('usuarios').doc(usuario.id).set({
                    preferencias: preferences
                }, { merge: true });

                showAlert('Preferencias actualizadas', 'success');
            } catch (error) {
                console.error("Error guardando preferencias:", error);
                showAlert('Error al guardar preferencias', 'error');
            }
        });
    }

    // Filtrar pedidos
    const orderFilter = document.getElementById('order-filter');
    if (orderFilter) {
        orderFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            const rows = document.querySelectorAll('#orders-body tr');

            rows.forEach(row => {
                const statusCell = row.querySelector('.badge-status');
                if (status === 'all' || statusCell.textContent === status) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Cerrar sesión
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await auth.signOut();
                localStorage.removeItem('usuario');
                window.location.href = 'login.html';
            } catch (error) {
                console.error("Error cerrando sesión:", error);
            }
        });
    }

    // Mostrar alerta
    const showAlert = (message, type) => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'}`;
        alertDiv.textContent = message;

        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);

            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }
    };

    // Cargar datos iniciales
    loadUserData();
    loadUserOrders();
    updateProfileCompletion();
});