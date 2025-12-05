// Configuración de Firebase
const firebaseConfig = {
    // Tu configuración de Firebase aquí
    apiKey: "AIzaSyB5oGPbt9KLa--5l9OIeGisggYV33if2Xg",
    authDomain: "tiendahuertohogar-2ce3a.firebaseapp.com",
    projectId: "tiendahuertohogar-2ce3a",
    storageBucket: "tiendahuertohogar-2ce3a.appspot.com",
    messagingSenderId: "857983411223",
    appId: "1:857983411223:web:a1c200cd07b7fd63b36852"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables globales
let productosOferta = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    inicializarFirebase();
    cargarProductosOferta();
    inicializarFiltros();
    inicializarContador();
    actualizarCarrito();
});

// Inicializar Firebase
function inicializarFirebase() {
    // Verificar si Firebase está inicializado correctamente
    console.log('Firebase inicializado');
}

// Cargar productos en oferta desde Firebase
function cargarProductosOferta() {
    const productosGrid = document.getElementById('productosOferta');

    // Mostrar estado de carga
    productosGrid.innerHTML = '<div class="cargando">Cargando productos...</div>';

    db.collection('productos')
        .where('enOferta', '==', true)
        .get()
        .then((querySnapshot) => {
            productosOferta = [];
            productosGrid.innerHTML = '';

            if (querySnapshot.empty) {
                productosGrid.innerHTML = '<div class="sin-productos">No hay productos en oferta en este momento</div>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const producto = {
                    id: doc.id,
                    ...doc.data()
                };
                productosOferta.push(producto);
                renderizarProducto(producto, productosGrid);
            });
        })
        .catch((error) => {
            console.error('Error al cargar productos:', error);
            productosGrid.innerHTML = '<div class="error-carga">Error al cargar los productos. Intenta nuevamente.</div>';
        });
}

// Renderizar un producto en el grid
function renderizarProducto(producto, contenedor) {
    const porcentajeDescuento = Math.round((1 - producto.precioOferta / producto.precio) * 100);

    const productoHTML = `
    <div class="card-oferta" data-categoria="${producto.categoria}">
      <div class="etiqueta-oferta">-${porcentajeDescuento}%</div>
      <div class="card-img">
        <img src="${producto.imagen}" alt="${producto.nombre}">
      </div>
      <div class="card-body">
        <div class="card-categoria">${producto.categoria}</div>
        <h3 class="card-title">${producto.nombre}</h3>
        <div class="card-precios">
          <span class="precio-actual">$${producto.precioOferta}</span>
          <span class="precio-anterior">$${producto.precio}</span>
        </div>
        <p class="card-descripcion">${producto.descripcion}</p>
        <button class="btn-comprar" data-id="${producto.id}">Añadir al Carrito</button>
      </div>
    </div>
  `;

    contenedor.insertAdjacentHTML('beforeend', productoHTML);
}

// Inicializar filtros de categorías
function inicializarFiltros() {
    const filtroBtns = document.querySelectorAll('.filtro-btn');

    filtroBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remover clase active de todos los botones
            filtroBtns.forEach(b => b.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');

            // Filtrar productos por categoría
            const categoria = this.getAttribute('data-categoria');
            filtrarProductos(categoria);
        });
    });
}

// Filtrar productos por categoría
function filtrarProductos(categoria) {
    const productosGrid = document.getElementById('productosOferta');
    const productos = document.querySelectorAll('.card-oferta');

    productos.forEach(producto => {
        if (categoria === 'todas' || producto.getAttribute('data-categoria') === categoria) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
}

// Inicializar contador regresivo para oferta flash
function inicializarContador() {
    function actualizarContador() {
        const ahora = new Date();
        const finOferta = new Date(ahora);
        finOferta.setDate(ahora.getDate() + 2); // 2 días desde ahora

        const diferencia = finOferta - ahora;

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        document.getElementById('dias').textContent = dias.toString().padStart(2, '0');
        document.getElementById('horas').textContent = horas.toString().padStart(2, '0');
        document.getElementById('minutos').textContent = minutos.toString().padStart(2, '0');
        document.getElementById('segundos').textContent = segundos.toString().padStart(2, '0');
    }

    // Actualizar el contador cada segundo
    setInterval(actualizarContador, 1000);
    actualizarContador(); // Llamada inicial
}

// Manejar eventos de añadir al carrito
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-comprar')) {
        const productoId = e.target.getAttribute('data-id');
        agregarAlCarrito(productoId);
    }
});

// Agregar producto al carrito
function agregarAlCarrito(productoId) {
    const producto = productosOferta.find(p => p.id === productoId);

    if (!producto) return;

    // Verificar si el producto ya está en el carrito
    const productoEnCarrito = carrito.find(item => item.id === productoId);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precioOferta,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    // Actualizar localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizar interfaz
    actualizarCarrito();

    // Mostrar mensaje de confirmación
    mostrarMensaje(`${producto.nombre} añadido al carrito`);
}

// Actualizar visualización del carrito
function actualizarCarrito() {
    const carritoTotal = document.querySelector('.carrito-total');
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    carritoTotal.textContent = total.toFixed(2);
}

// Mostrar mensaje temporal
function mostrarMensaje(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-flotante';
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2E8B57;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 1000;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  `;

    document.body.appendChild(mensajeDiv);

    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}