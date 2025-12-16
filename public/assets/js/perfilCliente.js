// perfilCliente.js - versión renovada con Firebase v8
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.rol !== 'cliente') {
        window.location.href = 'login.html';
        return;
    }

    // Firebase v8
    const firebaseConfig = {
        apiKey: "AIzaSyB5oGPbt9KLa--5l9OIeGisggYV33if2Xg",
        authDomain: "tiendahuertohogar-2ce3a.firebaseapp.com",
        projectId: "tiendahuertohogar-2ce3a",
        storageBucket: "tiendahuertohogar-2ce3a.appspot.com",
        messagingSenderId: "857983411223",
        appId: "1:857983411223:web:a1c200cd07b7fd63b36852",
        measurementId: "G-TX342PY82Y"
    };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // DOM refs
    const avatar = document.getElementById('profile-avatar');
    const avatarInput = document.getElementById('avatar-input');
    const welcome = document.getElementById('welcome-message');
    const emailLbl = document.getElementById('user-email');
    const logoutLink = document.getElementById('logout-link');
    const cartCount = document.getElementById('cart-count');
    const completion = document.getElementById('completion-percentage');
    const progress = document.getElementById('profile-progress');
    const orderFilter = document.getElementById('order-filter');
    const ordersBody = document.getElementById('orders-body');
    const ordersTable = document.getElementById('orders-table');
    const noOrders = document.getElementById('no-orders');
    const addressesContainer = document.getElementById('addresses-container');
    const addAddressBtn = document.getElementById('add-address-btn');
    const wishlistContainer = document.getElementById('wishlist-container');
    const emptyWishlist = document.getElementById('empty-wishlist');

    // Inputs
    const fullName = document.getElementById('fullName');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const about = document.getElementById('about');
    const profileForm = document.getElementById('profile-form');
    const prefEmail = document.getElementById('emailNotifications');
    const prefVeg = document.getElementById('favVegetables');
    const prefFruit = document.getElementById('favFruits');
    const prefOrg = document.getElementById('favOrganic');
    const savePrefs = document.getElementById('save-preferences');

    const totalOrdersEl = document.getElementById('total-orders');
    const completedOrdersEl = document.getElementById('completed-orders');
    const pendingOrdersEl = document.getElementById('pending-orders');
    const totalSpentEl = document.getElementById('total-spent');

    const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
    const savedAvatar = localStorage.getItem('usuarioAvatar');
    if (avatar) avatar.src = savedAvatar || defaultAvatar;

    const setCartCount = () => {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (cartCount) cartCount.textContent = carrito.length;
    };
    setCartCount();

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add('active');
        });
    });

    // Avatar upload (local only)
    if (avatarInput && avatar) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                avatar.src = reader.result;
                localStorage.setItem('usuarioAvatar', reader.result);
                showAlert('Foto actualizada (solo local).', 'success');
            };
            reader.onerror = () => showAlert('No se pudo cargar la imagen.', 'error');
            reader.readAsDataURL(file);
        });
    }

    const showAlert = (msg, type = 'success') => {
        const container = document.querySelector('.container');
        if (!container) return;
        const div = document.createElement('div');
        const alertType = type === 'error' ? 'danger' : (type === 'info' ? 'info' : 'success');
        div.className = `alert alert-${alertType}`;
        div.textContent = msg;
        div.style.margin = '10px 0';
        container.prepend(div);
        setTimeout(() => div.remove(), 3000);
    };

    const formatDate = (fecha) => {
        try { return fecha?.toDate().toLocaleDateString('es-CL') || '-'; }
        catch { return '-'; }
    };
    const formatMoney = (val = 0) => {
        try { return (val || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }); }
        catch { return `$${(val || 0).toLocaleString()}`; }
    };
    const normalizeStatus = (status = '') => {
        const s = status.toLowerCase();
        if (['pending','pendiente'].includes(s)) return 'pendiente';
        if (['processing','procesando','en proceso'].includes(s)) return 'procesando';
        if (['delivered','entregado'].includes(s)) return 'entregado';
        if (['cancelled','cancelado'].includes(s)) return 'cancelado';
        return s || 'desconocido';
    };
    const statusLabel = (s) => {
        const map = { pendiente:'Pendiente', procesando:'En proceso', entregado:'Entregado', cancelado:'Cancelado' };
        return map[s] || s;
    };
    const statusClass = (s) => {
        const map = { pendiente:'bg-warning', procesando:'bg-info', entregado:'bg-success', cancelado:'bg-danger' };
        return map[s] || 'bg-secondary';
    };

    const updateCompletion = () => {
        const fields = [fullName, phone, about].filter(Boolean);
        const filled = fields.filter(f => f.value && f.value.trim() !== '').length;
        const pct = Math.round((filled / (fields.length || 1)) * 100);
        if (completion) completion.textContent = `${pct}%`;
        if (progress) progress.style.width = `${pct}%`;
    };

    const setUserBasics = () => {
        if (welcome) welcome.textContent = `Bienvenido, ${usuario.nombre || 'Cliente'}`;
        if (emailLbl) emailLbl.textContent = usuario.correo || '';
        if (email) email.value = usuario.correo || '';
    };
    setUserBasics();

    const loadProfile = async () => {
        try {
            const snap = await db.collection('usuarios').doc(usuario.id).get();
            if (!snap.exists) return;
            const data = snap.data();
            if (fullName && data.nombre) fullName.value = data.nombre;
            if (phone && data.telefono) phone.value = data.telefono;
            if (about && data.sobreMi) about.value = data.sobreMi;
            const prefs = data.preferencias || data.preferences || {};
            prefEmail.checked = prefs.emailNotifications ?? true;
            prefVeg.checked = prefs.favVegetables ?? true;
            prefFruit.checked = prefs.favFruits ?? true;
            prefOrg.checked = prefs.favOrganic ?? false;
            updateCompletion();
        } catch (e) {
            console.error(e);
            showAlert('No se pudo cargar tu perfil.', 'error');
        }
    };

    const loadOrders = async () => {
        if (ordersBody) ordersBody.innerHTML = '';
        if (noOrders) noOrders.style.display = 'none';
        if (ordersTable) ordersTable.style.display = 'table';
        try {
            const snap = await db.collection('pedidos')
                .where('usuarioId', '==', usuario.id)
                .orderBy('fecha', 'desc')
                .get();
            if (snap.empty) {
                if (ordersTable) ordersTable.style.display = 'none';
                if (noOrders) noOrders.style.display = 'block';
                totalOrdersEl.textContent = completedOrdersEl.textContent = pendingOrdersEl.textContent = '0';
                totalSpentEl.textContent = '$0';
                return;
            }
            let total = 0, completed = 0, pending = 0, spent = 0;
            snap.forEach(doc => {
                const data = doc.data();
                const status = normalizeStatus(data.estado || data.status || '');
                const row = ordersBody.insertRow();
                row.dataset.status = status;
                row.innerHTML = `
                    <td>#${doc.id.substring(0,8)}</td>
                    <td>${formatDate(data.fecha || data.date)}</td>
                    <td>${data.productos?.length || data.items?.length || 0} productos</td>
                    <td>${formatMoney(data.total)}</td>
                    <td><span class="badge-status ${statusClass(status)}">${statusLabel(status)}</span></td>
                    <td><button class="btn btn-secondary btn-sm" onclick="alert('Detalle pronto disponible')">Ver</button></td>
                `;
                total++;
                if (status === 'entregado') { completed++; spent += data.total || 0; }
                if (status === 'pendiente' || status === 'procesando') pending++;
            });
            totalOrdersEl.textContent = total;
            completedOrdersEl.textContent = completed;
            pendingOrdersEl.textContent = pending;
            totalSpentEl.textContent = formatMoney(spent);
        } catch (e) {
            console.error(e);
            showAlert('No se pudieron cargar tus compras.', 'error');
        }
    };

    const loadAddresses = async () => {
        if (!addressesContainer) return;
        addressesContainer.innerHTML = '<p class="muted">Cargando direcciones...</p>';
        try {
            const snap = await db.collection('direcciones')
                .where('usuarioId', '==', usuario.id)
                .orderBy('fechaCreacion', 'desc')
                .get();
            if (snap.empty) {
                addressesContainer.innerHTML = '<div class="empty">No tienes direcciones guardadas.</div>';
                return;
            }
            addressesContainer.innerHTML = '';
            snap.forEach(doc => {
                const d = doc.data();
                const card = document.createElement('div');
                card.className = 'address-card';
                card.innerHTML = `
                    <h4>${d.alias || 'Dirección'}</h4>
                    <p><strong>Dirección:</strong> ${d.direccion || 'N/D'}</p>
                    <p><strong>Comuna:</strong> ${d.comuna || 'N/D'}</p>
                    <p><strong>Región:</strong> ${d.region || 'N/D'}</p>
                    <p><strong>Teléfono:</strong> ${d.telefono || 'N/D'}</p>
                `;
                addressesContainer.appendChild(card);
            });
        } catch (e) {
            console.error(e);
            addressesContainer.innerHTML = '<div class="empty">No se pudo cargar direcciones.</div>';
        }
    };

    const loadWishlist = async () => {
        if (!wishlistContainer) return;
        wishlistContainer.innerHTML = '';
        try {
            const snap = await db.collection('wishlist')
                .where('usuarioId', '==', usuario.id)
                .get();
            if (snap.empty) {
                emptyWishlist.style.display = 'block';
                return;
            }
            emptyWishlist.style.display = 'none';
            snap.forEach(doc => {
                const p = doc.data();
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${p.image || 'https://via.placeholder.com/300x200?text=Producto'}" alt="${p.name || 'Producto'}">
                    <h4>${p.name || 'Producto'}</h4>
                    <p>${formatMoney(p.price)}</p>
                `;
                wishlistContainer.appendChild(card);
            });
        } catch (e) {
            console.error(e);
            emptyWishlist.style.display = 'block';
        }
    };

    // Guardar perfil
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nombre: fullName.value,
                telefono: phone.value,
                sobreMi: about.value,
                ultimaActualizacion: new Date()
            };
            try {
                await db.collection('usuarios').doc(usuario.id).set(payload, { merge: true });
                if (auth.currentUser && payload.nombre) {
                    await auth.currentUser.updateProfile({ displayName: payload.nombre });
                }
                usuario.nombre = payload.nombre;
                localStorage.setItem('usuario', JSON.stringify(usuario));
                setUserBasics();
                updateCompletion();
                showAlert('Perfil guardado.', 'success');
            } catch (err) {
                console.error(err);
                showAlert('No se pudo guardar el perfil.', 'error');
            }
        });
    }

    // Guardar preferencias
    if (savePrefs) {
        savePrefs.addEventListener('click', async () => {
            const prefs = {
                emailNotifications: prefEmail.checked,
                favVegetables: prefVeg.checked,
                favFruits: prefFruit.checked,
                favOrganic: prefOrg.checked
            };
            try {
                await db.collection('usuarios').doc(usuario.id).set({ preferencias: prefs }, { merge: true });
                showAlert('Preferencias guardadas.', 'success');
            } catch (e) {
                console.error(e);
                showAlert('No se pudo guardar preferencias.', 'error');
            }
        });
    }

    // Añadir dirección rápida
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', async () => {
            const alias = prompt('Nombre o alias de la dirección (Casa, Oficina, etc.):');
            if (alias === null) return;
            const direccion = prompt('Dirección completa:');
            if (direccion === null) return;
            const comuna = prompt('Comuna:');
            if (comuna === null) return;
            const region = prompt('Región:');
            if (region === null) return;
            const telefono = prompt('Teléfono:');
            if (telefono === null) return;
            try {
                await db.collection('direcciones').add({
                    usuarioId: usuario.id,
                    alias: alias || 'Dirección',
                    direccion: direccion || '',
                    comuna: comuna || '',
                    region: region || '',
                    telefono: telefono || '',
                    fechaCreacion: new Date()
                });
                showAlert('Dirección guardada.', 'success');
                loadAddresses();
            } catch (e) {
                console.error(e);
                showAlert('No se pudo guardar la dirección.', 'error');
            }
        });
    }

    // Filtrar pedidos
    if (orderFilter && ordersBody) {
        orderFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            ordersBody.querySelectorAll('tr').forEach(row => {
                const st = row.dataset.status || '';
                row.style.display = (status === 'todos' || st === status) ? '' : 'none';
            });
        });
    }

    // Logout
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await auth.signOut();
                localStorage.removeItem('usuario');
                window.location.href = 'login.html';
            } catch (err) {
                console.error(err);
            }
        });
    }

    loadProfile();
    loadOrders();
    loadAddresses();
    loadWishlist();
    updateCompletion();
});

