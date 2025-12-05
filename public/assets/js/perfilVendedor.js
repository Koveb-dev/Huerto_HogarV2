// Firebase Configuration y gestión de perfil vendedor
let currentVendedorId = null;
let vendedorData = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Perfil Vendedor inicializando...');
    
    // Verificar autenticación
    await verificarAutenticacion();
    
    // Cargar datos iniciales
    await cargarDatosIniciales();
    
    // Configurar navegación
    configurarNavegacion();
    
    // Cargar dashboard por defecto
    mostrarSeccion('dashboard');
});

// ==================== AUTENTICACIÓN ====================
async function verificarAutenticacion() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = '../html/login.html';
            return;
        }
        
        currentVendedorId = user.uid;
        
        // Verificar rol de vendedor
        const userDoc = await firebase.firestore().collection('vendedores').doc(currentVendedorId).get();
        
        if (!userDoc.exists) {
            // Crear registro de vendedor si no existe
            await crearRegistroVendedor(user);
        } else {
            vendedorData = userDoc.data();
            actualizarUIUsuario();
        }
        
    } catch (error) {
        console.error('Error en autenticación:', error);
        mostrarError('Error de autenticación');
    }
}

async function crearRegistroVendedor(user) {
    const vendedorData = {
        uid: user.uid,
        email: user.email,
        nombre: user.displayName || user.email.split('@')[0],
        telefono: '',
        direccion: '',
        bio: '',
        fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
        estado: 'activo',
        totalVentas: 0,
        productos: [],
        rol: 'vendedor'
    };
    
    await firebase.firestore().collection('vendedores').doc(user.uid).set(vendedorData);
    return vendedorData;
}

function actualizarUIUsuario() {
    if (!vendedorData) return;
    
    // Actualizar sidebar
    document.getElementById('sidebarUserName').textContent = vendedorData.nombre || 'Vendedor';
    document.getElementById('sidebarUserEmail').textContent = vendedorData.email || 'Sin email';
    document.getElementById('bienvenidoVendedor').textContent = `Bienvenido, ${vendedorData.nombre}`;
    document.getElementById('currentUserName').textContent = vendedorData.nombre;
    
    // Actualizar perfil
    document.getElementById('profileNombre').value = vendedorData.nombre || '';
    document.getElementById('profileEmail').value = vendedorData.email || '';
    document.getElementById('profileTelefono').value = vendedorData.telefono || '';
    document.getElementById('profileDireccion').value = vendedorData.direccion || '';
    document.getElementById('profileBio').value = vendedorData.bio || '';
    
    // Información de vendedor
    document.getElementById('infoVendedorId').textContent = currentVendedorId.substring(0, 8) + '...';
    document.getElementById('infoFechaRegistro').textContent = vendedorData.fechaRegistro 
        ? new Date(vendedorData.fechaRegistro.toDate()).toLocaleDateString()
        : 'No disponible';
    document.getElementById('infoTotalVentas').textContent = `$${vendedorData.totalVentas || 0}`;
}

// ==================== NAVEGACIÓN ====================
function configurarNavegacion() {
    // Configurar enlaces del menú
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            mostrarSeccion(target);
            
            // Actualizar clase activa
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Configurar botones de navegación
    const navButtons = document.querySelectorAll('.nav-button, .action-card');
    navButtons.forEach(button => {
        if (button.onclick) return;
        button.addEventListener('click', function() {
            const target = this.getAttribute('onclick')?.match(/navegarA\('([^']+)'\)/)?.[1];
            if (target) {
                mostrarSeccion(target);
                
                // Actualizar clase activa en menú
                menuLinks.forEach(l => {
                    l.classList.remove('active');
                    if (l.getAttribute('href') === `#${target}`) {
                        l.classList.add('active');
                    }
                });
            }
        });
    });
}

function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('main > section');
    secciones.forEach(seccion => {
        seccion.style.display = 'none';
    });
    
    // Mostrar sección seleccionada
    const seccion = document.getElementById(seccionId);
    if (seccion) {
        seccion.style.display = 'block';
        
        // Cargar datos específicos de la sección
        switch(seccionId) {
            case 'dashboard':
                cargarDashboardVendedor();
                break;
            case 'productos':
                cargarProductosVendedor();
                break;
            case 'ordenes':
                cargarOrdenesVendedor();
                break;
            case 'mi-perfil':
                cargarPerfilVendedor();
                break;
        }
    }
}

function navegarA(seccionId) {
    mostrarSeccion(seccionId);
}

// ==================== DASHBOARD VENDEDOR ====================
async function cargarDashboardVendedor() {
    try {
        // Mostrar estado de carga
        document.getElementById('totalMisProductos').innerHTML = 
            '<span class="loading-dots"><span></span><span></span><span></span></span>';
        document.getElementById('ordenesMes').innerHTML = 
            '<span class="loading-dots"><span></span><span></span><span></span></span>';
        
        // Cargar datos del vendedor
        const [productos, ordenes, estadisticas] = await Promise.all([
            obtenerProductosVendedor(),
            obtenerOrdenesVendedor(),
            obtenerEstadisticasVendedor()
        ]);
        
        // Actualizar cards
        document.getElementById('totalMisProductos').textContent = productos.length;
        
        const productosActivos = productos.filter(p => p.estado === 'activo').length;
        const productosInactivos = productos.length - productosActivos;
        document.getElementById('productosActivos').textContent = productosActivos;
        document.getElementById('productosInactivos').textContent = productosInactivos;
        
        // Actualizar sidebar
        document.getElementById('sidebarProductos').textContent = productos.length;
        document.getElementById('sidebarOrdenes').textContent = ordenes.length;
        
        // Órdenes del mes
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const ordenesMes = ordenes.filter(o => 
            o.fecha && o.fecha.toDate() >= inicioMes
        );
        
        document.getElementById('ordenesMes').textContent = ordenesMes.length;
        
        const totalVentasMes = ordenesMes.reduce((sum, o) => sum + (o.total || 0), 0);
        document.getElementById('totalVentasMes').textContent = totalVentasMes.toFixed(2);
        
        // Tasa de conversión (simulada)
        const tasaConversion = productos.length > 0 
            ? Math.min(100, (ordenes.length / productos.length * 100)).toFixed(1)
            : 0;
        document.getElementById('tasaConversion').textContent = `${tasaConversion}%`;
        
        // Producto más vendido
        if (estadisticas.productoTop) {
            document.getElementById('productoTop').textContent = estadisticas.productoTop.nombre;
        }
        
        // Cargar últimas órdenes
        cargarUltimasOrdenes(ordenes.slice(0, 5));
        
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        mostrarError('Error cargando dashboard');
    }
}

async function obtenerEstadisticasVendedor() {
    try {
        // Obtener productos del vendedor
        const productos = await obtenerProductosVendedor();
        
        // Obtener todas las órdenes que contienen productos del vendedor
        const ordenesSnapshot = await firebase.firestore()
            .collection('ordenes')
            .where('items', 'array-contains-any', productos.map(p => p.id))
            .get();
        
        const ordenes = [];
        ordenesSnapshot.forEach(doc => {
            ordenes.push({ id: doc.id, ...doc.data() });
        });
        
        // Calcular producto más vendido
        const ventasPorProducto = {};
        ordenes.forEach(orden => {
            orden.items?.forEach(item => {
                ventasPorProducto[item.productoId] = (ventasPorProducto[item.productoId] || 0) + item.cantidad;
            });
        });
        
        let productoTop = null;
        let maxVentas = 0;
        
        for (const [productoId, cantidad] of Object.entries(ventasPorProducto)) {
            if (cantidad > maxVentas) {
                maxVentas = cantidad;
                const producto = productos.find(p => p.id === productoId);
                if (producto) {
                    productoTop = producto;
                }
            }
        }
        
        return {
            totalOrdenes: ordenes.length,
            totalVentas: ordenes.reduce((sum, o) => sum + (o.total || 0), 0),
            productoTop: productoTop
        };
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return { totalOrdenes: 0, totalVentas: 0, productoTop: null };
    }
}

function cargarUltimasOrdenes(ordenes) {
    const tbody = document.getElementById('ultimasOrdenes');
    tbody.innerHTML = '';
    
    if (ordenes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">No hay órdenes recientes</td>
            </tr>
        `;
        return;
    }
    
    ordenes.forEach(orden => {
        const fecha = orden.fecha ? new Date(orden.fecha.toDate()).toLocaleDateString() : 'No disponible';
        const estadoClass = getEstadoClass(orden.estado);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${orden.id.substring(0, 8)}...</td>
            <td>${orden.clienteNombre || 'Cliente'}</td>
            <td>${orden.items?.length || 0} productos</td>
            <td>$${orden.total?.toFixed(2) || '0.00'}</td>
            <td><span class="badge ${estadoClass}">${orden.estado || 'pendiente'}</span></td>
            <td>${fecha}</td>
        `;
        row.style.cursor = 'pointer';
        row.onclick = () => verDetallesOrden(orden.id);
        tbody.appendChild(row);
    });
}

// ==================== PRODUCTOS VENDEDOR ====================
async function cargarProductosVendedor() {
    try {
        const productos = await obtenerProductosVendedor();
        actualizarTablaProductos(productos);
        
        // Actualizar categorías en filtro
        actualizarFiltroCategorias(productos);
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarError('Error cargando productos');
    }
}

async function obtenerProductosVendedor() {
    try {
        const snapshot = await firebase.firestore()
            .collection('productos')
            .where('vendedorId', '==', currentVendedorId)
            .get();
        
        const productos = [];
        snapshot.forEach(doc => {
            productos.push({ id: doc.id, ...doc.data() });
        });
        
        return productos;
        
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        return [];
    }
}

function actualizarTablaProductos(productos) {
    const tbody = document.getElementById('productos-vendedor-tbody');
    
    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <i class="bi bi-box"></i>
                    <p>No hay productos registrados</p>
                    <button class="btn btn-primary btn-sm mt-2" onclick="mostrarModalProductoVendedor()">
                        <i class="bi bi-plus-circle"></i> Agregar Primer Producto
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    productos.forEach(producto => {
        const estadoClass = producto.estado === 'activo' ? 'activo' : 'inactivo';
        const ventas = producto.ventas || 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                ${producto.imagen 
                    ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">`
                    : '<i class="bi bi-image text-muted"></i>'
                }
            </td>
            <td>${producto.nombre || 'Sin nombre'}</td>
            <td>$${producto.precio?.toFixed(2) || '0.00'}</td>
            <td>${producto.stock || 0}</td>
            <td>${producto.categoria || 'Sin categoría'}</td>
            <td><span class="badge ${estadoClass}">${producto.estado || 'inactivo'}</span></td>
            <td>${ventas}</td>
            <td class="acciones">
                <button class="btn btn-sm btn-info" onclick="editarProductoVendedor('${producto.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProductoVendedor('${producto.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function actualizarFiltroCategorias(productos) {
    const select = document.getElementById('filtroCategoriaProducto');
    
    // Obtener categorías únicas
    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    
    // Limpiar opciones existentes (excepto la primera)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Agregar categorías
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
    });
}

function filtrarProductosVendedor() {
    const filtroEstado = document.getElementById('filtroEstadoProducto').value;
    const filtroCategoria = document.getElementById('filtroCategoriaProducto').value;
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    
    // Obtener productos (en un caso real, haríamos filtrado en Firestore)
    // Por ahora filtramos en cliente
    obtenerProductosVendedor().then(productos => {
        let filtrados = productos;
        
        if (filtroEstado) {
            filtrados = filtrados.filter(p => p.estado === filtroEstado);
        }
        
        if (filtroCategoria) {
            filtrados = filtrados.filter(p => p.categoria === filtroCategoria);
        }
        
        if (busqueda) {
            filtrados = filtrados.filter(p => 
                p.nombre.toLowerCase().includes(busqueda) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
            );
        }
        
        actualizarTablaProductos(filtrados);
    });
}

// ==================== GESTIÓN DE PRODUCTOS ====================
function mostrarModalProductoVendedor(productoId = null) {
    const modal = document.getElementById('modalProductoVendedor');
    const titulo = document.getElementById('modalProductoVendedorTitulo');
    const form = document.getElementById('formProductoVendedor');
    
    if (productoId) {
        // Modo edición
        titulo.textContent = 'Editar Producto';
        cargarDatosProducto(productoId);
    } else {
        // Modo nuevo
        titulo.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('productoVendedorId').value = '';
        document.getElementById('productoVendedorUid').value = currentVendedorId;
    }
    
    modal.style.display = 'block';
}

async function cargarDatosProducto(productoId) {
    try {
        const doc = await firebase.firestore()
            .collection('productos')
            .doc(productoId)
            .get();
        
        if (doc.exists) {
            const producto = doc.data();
            
            document.getElementById('productoVendedorId').value = productoId;
            document.getElementById('productoVendedorUid').value = currentVendedorId;
            document.getElementById('productoVendedorNombre').value = producto.nombre || '';
            document.getElementById('productoVendedorPrecio').value = producto.precio || '';
            document.getElementById('productoVendedorStock').value = producto.stock || '';
            document.getElementById('productoVendedorCategoria').value = producto.categoria || '';
            document.getElementById('productoVendedorDescripcion').value = producto.descripcion || '';
            document.getElementById('productoVendedorImagen').value = producto.imagen || '';
            document.getElementById('productoVendedorActivo').checked = producto.estado === 'activo';
        }
    } catch (error) {
        console.error('Error cargando producto:', error);
        mostrarError('Error cargando producto');
    }
}

async function guardarProductoVendedor(event) {
    event.preventDefault();
    
    try {
        const productoId = document.getElementById('productoVendedorId').value;
        const productoData = {
            nombre: document.getElementById('productoVendedorNombre').value,
            precio: parseFloat(document.getElementById('productoVendedorPrecio').value),
            stock: parseInt(document.getElementById('productoVendedorStock').value),
            categoria: document.getElementById('productoVendedorCategoria').value,
            descripcion: document.getElementById('productoVendedorDescripcion').value,
            imagen: document.getElementById('productoVendedorImagen').value || null,
            estado: document.getElementById('productoVendedorActivo').checked ? 'activo' : 'inactivo',
            vendedorId: currentVendedorId,
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (productoId) {
            // Actualizar producto existente
            await firebase.firestore()
                .collection('productos')
                .doc(productoId)
                .update(productoData);
            
            mostrarExito('Producto actualizado correctamente');
        } else {
            // Crear nuevo producto
            productoData.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
            productoData.ventas = 0;
            
            await firebase.firestore()
                .collection('productos')
                .add(productoData);
            
            mostrarExito('Producto creado correctamente');
        }
        
        cerrarModal('modalProductoVendedor');
        cargarProductosVendedor();
        cargarDashboardVendedor(); // Actualizar dashboard
        
    } catch (error) {
        console.error('Error guardando producto:', error);
        mostrarError('Error guardando producto');
    }
}

async function eliminarProductoVendedor(productoId) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }
    
    try {
        await firebase.firestore()
            .collection('productos')
            .doc(productoId)
            .delete();
        
        mostrarExito('Producto eliminado correctamente');
        cargarProductosVendedor();
        cargarDashboardVendedor();
        
    } catch (error) {
        console.error('Error eliminando producto:', error);
        mostrarError('Error eliminando producto');
    }
}

// ==================== ÓRDENES VENDEDOR ====================
async function cargarOrdenesVendedor() {
    try {
        const ordenes = await obtenerOrdenesVendedor();
        actualizarTablaOrdenes(ordenes);
        
    } catch (error) {
        console.error('Error cargando órdenes:', error);
        mostrarError('Error cargando órdenes');
    }
}

async function obtenerOrdenesVendedor() {
    try {
        // Obtener productos del vendedor primero
        const productos = await obtenerProductosVendedor();
        const productoIds = productos.map(p => p.id);
        
        if (productoIds.length === 0) {
            return [];
        }
        
        // Buscar órdenes que contengan productos del vendedor
        const snapshot = await firebase.firestore()
            .collection('ordenes')
            .where('items', 'array-contains-any', productoIds)
            .orderBy('fecha', 'desc')
            .get();
        
        const ordenes = [];
        snapshot.forEach(doc => {
            ordenes.push({ id: doc.id, ...doc.data() });
        });
        
        return ordenes;
        
    } catch (error) {
        console.error('Error obteniendo órdenes:', error);
        return [];
    }
}

function actualizarTablaOrdenes(ordenes) {
    const tbody = document.getElementById('ordenes-vendedor-tbody');
    
    if (ordenes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <i class="bi bi-cart"></i>
                    <p>No hay órdenes registradas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    ordenes.forEach(orden => {
        const fecha = orden.fecha ? new Date(orden.fecha.toDate()).toLocaleDateString() : 'No disponible';
        const estadoClass = getEstadoClass(orden.estado);
        
        // Contar productos del vendedor en la orden
        const productosVendedor = orden.items?.filter(item => 
            item.vendedorId === currentVendedorId
        ).length || 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${orden.id.substring(0, 8)}...</td>
            <td>${orden.clienteNombre || 'Cliente'}</td>
            <td>${orden.items?.length || 0} productos</td>
            <td>${productosVendedor} (tuyos)</td>
            <td>$${orden.total?.toFixed(2) || '0.00'}</td>
            <td><span class="badge ${estadoClass}">${orden.estado || 'pendiente'}</span></td>
            <td>${fecha}</td>
            <td class="acciones">
                <button class="btn btn-sm btn-info" onclick="verDetallesOrden('${orden.id}')">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filtrarOrdenesVendedor() {
    const filtroEstado = document.getElementById('filtroEstadoOrden').value;
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    
    obtenerOrdenesVendedor().then(ordenes => {
        let filtrados = ordenes;
        
        if (filtroEstado) {
            filtrados = filtrados.filter(o => o.estado === filtroEstado);
        }
        
        if (fechaDesde) {
            const desde = new Date(fechaDesde);
            filtrados = filtrados.filter(o => 
                o.fecha && o.fecha.toDate() >= desde
            );
        }
        
        if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            hasta.setHours(23, 59, 59, 999);
            filtrados = filtrados.filter(o => 
                o.fecha && o.fecha.toDate() <= hasta
            );
        }
        
        actualizarTablaOrdenes(filtrados);
    });
}

async function verDetallesOrden(ordenId) {
    try {
        const doc = await firebase.firestore()
            .collection('ordenes')
            .doc(ordenId)
            .get();
        
        if (doc.exists) {
            const orden = doc.data();
            mostrarModalDetallesOrden(ordenId, orden);
        }
    } catch (error) {
        console.error('Error cargando detalles de orden:', error);
        mostrarError('Error cargando detalles');
    }
}

function mostrarModalDetallesOrden(ordenId, orden) {
    const modal = document.getElementById('modalDetallesOrden');
    
    // ID de la orden
    document.getElementById('ordenDetalleId').textContent = ordenId.substring(0, 12);
    
    // Información del cliente
    document.getElementById('detalleClienteNombre').textContent = orden.clienteNombre || 'No disponible';
    document.getElementById('detalleClienteEmail').textContent = orden.clienteEmail || 'No disponible';
    document.getElementById('detalleClienteTelefono').textContent = orden.clienteTelefono || 'No disponible';
    document.getElementById('detalleClienteDireccion').textContent = orden.clienteDireccion || 'No disponible';
    
    // Productos (filtrar solo los del vendedor)
    const tbody = document.getElementById('detalleOrdenProductos');
    tbody.innerHTML = '';
    
    const productosVendedor = orden.items?.filter(item => 
        item.vendedorId === currentVendedorId
    ) || [];
    
    let totalVendedor = 0;
    
    productosVendedor.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalVendedor += subtotal;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>${item.cantidad}</td>
            <td>$${subtotal.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('detalleOrdenTotal').textContent = `$${totalVendedor.toFixed(2)}`;
    
    // Información de la orden
    document.getElementById('detalleOrdenEstado').textContent = orden.estado || 'pendiente';
    document.getElementById('detalleOrdenEstado').className = `badge ${getEstadoClass(orden.estado)}`;
    
    const fecha = orden.fecha ? new Date(orden.fecha.toDate()).toLocaleString() : 'No disponible';
    document.getElementById('detalleOrdenFecha').textContent = fecha;
    document.getElementById('detalleOrdenPago').textContent = orden.metodoPago || 'No especificado';
    document.getElementById('detalleOrdenNotas').textContent = orden.notas || 'Sin notas';
    
    modal.style.display = 'block';
}

// ==================== PERFIL VENDEDOR ====================
async function cargarPerfilVendedor() {
    // Los datos ya se cargan en actualizarUIUsuario()
    // Aquí podemos cargar información adicional si es necesario
}

async function actualizarPerfilVendedor(event) {
    event.preventDefault();
    
    try {
        const datosActualizados = {
            nombre: document.getElementById('profileNombre').value,
            telefono: document.getElementById('profileTelefono').value,
            direccion: document.getElementById('profileDireccion').value,
            bio: document.getElementById('profileBio').value,
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebase.firestore()
            .collection('vendedores')
            .doc(currentVendedorId)
            .update(datosActualizados);
        
        // Actualizar datos locales
        vendedorData = { ...vendedorData, ...datosActualizados };
        actualizarUIUsuario();
        
        mostrarExito('Perfil actualizado correctamente');
        
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        mostrarError('Error actualizando perfil');
    }
}

async function cambiarClaveVendedor(event) {
    event.preventDefault();
    
    const claveActual = document.getElementById('claveActual').value;
    const nuevaClave = document.getElementById('nuevaClave').value;
    const confirmarClave = document.getElementById('confirmarClave').value;
    
    if (nuevaClave !== confirmarClave) {
        mostrarError('Las claves nuevas no coinciden');
        return;
    }
    
    if (nuevaClave.length < 6) {
        mostrarError('La clave debe tener al menos 6 caracteres');
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        
        // Reautenticar para cambiar clave
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            claveActual
        );
        
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(nuevaClave);
        
        // Limpiar formulario
        document.getElementById('formCambioClave').reset();
        
        mostrarExito('Clave actualizada correctamente');
        
    } catch (error) {
        console.error('Error cambiando clave:', error);
        
        if (error.code === 'auth/wrong-password') {
            mostrarError('La clave actual es incorrecta');
        } else if (error.code === 'auth/weak-password') {
            mostrarError('La clave es muy débil');
        } else {
            mostrarError('Error cambiando la clave');
        }
    }
}

// ==================== FUNCIONES AUXILIARES ====================
function getEstadoClass(estado) {
    switch(estado) {
        case 'completado': return 'completado';
        case 'pendiente': return 'pendiente';
        case 'procesando': return 'procesando';
        case 'cancelado': return 'cancelado';
        case 'activo': return 'activo';
        case 'inactivo': return 'inactivo';
        default: return 'pendiente';
    }
}

function mostrarModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function mostrarError(mensaje) {
    // Implementar notificación de error
    alert(`Error: ${mensaje}`);
}

function mostrarExito(mensaje) {
    // Implementar notificación de éxito
    alert(`Éxito: ${mensaje}`);
}

function irATienda() {
    window.open('../index.html', '_blank');
}

function mostrarAyuda() {
    alert('Centro de ayuda del vendedor.\n\nPara soporte técnico, contacta a: soporte@mitienda.com');
}

function exportarOrdenes() {
    alert('Funcionalidad de exportación en desarrollo');
}

function exportarReporte() {
    alert('Generando reporte de ventas...');
}

function imprimirDetalleOrden() {
    window.print();
}

// ==================== INICIALIZACIÓN ====================
async function cargarDatosIniciales() {
    // Cargar datos básicos
    await cargarDashboardVendedor();
    
    // Configurar fechas por defecto en filtros
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    document.getElementById('fechaDesde').value = primerDiaMes.toISOString().split('T')[0];
    document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];
    
    // Configurar fecha de fin del mes para reportes
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    document.getElementById('fechaFin').value = ultimoDiaMes.toISOString().split('T')[0];
}

// Manejar cierre de sesión
function cerrarSesion() {
    firebase.auth().signOut().then(() => {
        window.location.href = '../html/login.html';
    }).catch(error => {
        console.error('Error cerrando sesión:', error);
    });
}