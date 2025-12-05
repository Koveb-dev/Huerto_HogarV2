// ofertas.js

// 1. Importar las funciones necesarias de tu fireStoreService.js
// Asegúrate de que la ruta sea correcta desde este archivo (ej. ../services/fireStoreService.js)
import { obtenerOfertas } from "./fireStoreService.js"; // Ajusta la ruta si es necesario

// Variables globales (mantenerlas fuera del ámbito de las funciones si las necesitas accesibles globalmente)
let listaOfertas = []; // Renombramos para almacenar los objetos de oferta completos
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    // Ya no necesitas inicializar Firebase aquí, tu fireStoreService ya lo hace.
    cargarTodasLasOfertas(); // Cambiamos el nombre de la función para mayor claridad
    inicializarFiltros();
    inicializarContador();
    actualizarCarrito();
});


// Cargar todas las ofertas desde Firebase (ahora usando el servicio)
async function cargarTodasLasOfertas() {
    const productosGrid = document.getElementById('productosOferta');
    if (!productosGrid) { // Para evitar errores si el elemento no existe
        console.error("No se encontró el elemento #productosOferta.");
        return;
    }

    // Mostrar estado de carga
    productosGrid.innerHTML = '<div class="cargando">Cargando ofertas...</div>';

    try {
        const resultado = await obtenerOfertas(); // Llama a la función del servicio

        if (resultado.exito) {
            listaOfertas = resultado.datos; // El servicio ya te devuelve las ofertas con sus productos
            productosGrid.innerHTML = ''; // Limpiar el mensaje de carga

            if (listaOfertas.length === 0) {
                productosGrid.innerHTML = '<div class="sin-productos">No hay ofertas disponibles en este momento</div>';
                return;
            }

            listaOfertas.forEach((oferta) => {
                // Verificar que la oferta tenga un producto asociado
                if (oferta.producto) {
                    renderizarOferta(oferta, productosGrid); // Renderizamos la oferta completa
                } else {
                    console.warn(`Oferta ID: ${oferta.id} no tiene un producto asociado válido.`);
                }
            });
        } else {
            console.error('Error al cargar ofertas:', resultado.error);
            productosGrid.innerHTML = `<div class="error-carga">Error al cargar las ofertas: ${resultado.error}. Intenta nuevamente.</div>`;
        }
    } catch (error) {
        console.error('Error inesperado al cargar ofertas:', error);
        productosGrid.innerHTML = '<div class="error-carga">Error inesperado al cargar los productos. Intenta nuevamente.</div>';
    }
}

// Renderizar una oferta en el grid
function renderizarOferta(oferta, contenedor) {
    const producto = oferta.producto; // Obtenemos el producto de la oferta

    // Calcular el precio de oferta y el porcentaje de descuento
    const precioOriginal = producto.precio;
    let precioOfertaCalculado = precioOriginal;

    if (oferta.tipoDescuento === 'porcentaje' && typeof oferta.valorDescuento === 'number') {
        precioOfertaCalculado = precioOriginal * (1 - oferta.valorDescuento);
    } else if (oferta.tipoDescuento === 'montoFijo' && typeof oferta.valorDescuento === 'number') {
        precioOfertaCalculado = precioOriginal - oferta.valorDescuento;
    }
    precioOfertaCalculado = Math.max(0, precioOfertaCalculado); // Asegurarse que no sea negativo

    const porcentajeDescuento = precioOriginal > 0
        ? Math.round((1 - precioOfertaCalculado / precioOriginal) * 100)
        : 0;

    const ofertaHTML = `
        <div class="card-oferta" data-categoria="${producto.categoria}" data-oferta-id="${oferta.id}">
            ${porcentajeDescuento > 0 ? `<div class="etiqueta-oferta">-${porcentajeDescuento}%</div>` : ''}
            <div class="card-img">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="card-body">
                <div class="card-categoria">${producto.categoria}</div>
                <h3 class="card-title">${oferta.nombre || oferta.nombreOferta || producto.nombre}</h3>
                <div class="card-precios">
                    <span class="precio-actual">$${precioOfertaCalculado.toFixed(2)}</span>
                    ${precioOriginal > precioOfertaCalculado ? `<span class="precio-anterior">$${precioOriginal.toFixed(2)}</span>` : ''}
                </div>
                <p class="card-descripcion">${oferta.descripcion || producto.descripcion}</p>
                <button class="btn-comprar" data-oferta-id="${oferta.id}" data-producto-id="${producto.id}">Añadir al Carrito</button>
            </div>
        </div>
    `;
    contenedor.insertAdjacentHTML('beforeend', ofertaHTML);
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

            // Filtrar ofertas por categoría
            const categoria = this.getAttribute('data-categoria');
            filtrarOfertasPorCategoria(categoria); // Cambiamos el nombre de la función
        });
    });
}

// Filtrar ofertas por categoría
function filtrarOfertasPorCategoria(categoriaSeleccionada) { // Cambiamos el nombre y parámetro
    const productosGrid = document.getElementById('productosOferta');
    if (!productosGrid) return; // Asegurarse de que el contenedor existe

    // Limpiar el grid para volver a renderizar los filtrados
    productosGrid.innerHTML = '';

    // Filtrar la lista de ofertas cargadas
    const ofertasFiltradas = listaOfertas.filter(oferta => {
        // Asegurarse de que el producto exista para poder filtrar por categoría
        return oferta.producto && (categoriaSeleccionada === 'todas' || oferta.producto.categoria === categoriaSeleccionada);
    });

    if (ofertasFiltradas.length === 0) {
        productosGrid.innerHTML = '<div class="sin-productos">No hay ofertas para esta categoría.</div>';
    } else {
        ofertasFiltradas.forEach(oferta => renderizarOferta(oferta, productosGrid));
    }
}

// Inicializar contador regresivo para oferta flash (mantener como está, ya que no depende de Firebase)
function inicializarContador() {
    function actualizarContador() {
        const ahora = new Date();
        const finOferta = new Date(ahora);
        finOferta.setDate(ahora.getDate() + 2); // Ejemplo: 2 días desde ahora

        const diferencia = finOferta - ahora;

        if (diferencia <= 0) {
            document.getElementById('dias').textContent = '00';
            document.getElementById('horas').textContent = '00';
            document.getElementById('minutos').textContent = '00';
            document.getElementById('segundos').textContent = '00';
            clearInterval(intervalo); // Detener el contador
            return;
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        document.getElementById('dias').textContent = String(dias).padStart(2, '0');
        document.getElementById('horas').textContent = String(horas).padStart(2, '0');
        document.getElementById('minutos').textContent = String(minutos).padStart(2, '0');
        document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');
    }

    const intervalo = setInterval(actualizarContador, 1000);
    actualizarContador(); // Llamada inicial
}

// Manejar eventos de añadir al carrito
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-comprar')) {
        const ofertaId = e.target.getAttribute('data-oferta-id'); // Ahora obtenemos el ID de la oferta
        agregarAlCarrito(ofertaId);
    }
});

// Agregar producto al carrito (ahora recibe el ID de la oferta)
function agregarAlCarrito(ofertaId) {
    const oferta = listaOfertas.find(o => o.id === ofertaId);

    if (!oferta || !oferta.producto) {
        mostrarMensaje('Error: Oferta o producto no encontrado.');
        return;
    }

    const producto = oferta.producto;

    // Calcular el precio de oferta real para el carrito
    let precioOfertaCalculado = producto.precio;
    if (oferta.tipoDescuento === 'porcentaje' && typeof oferta.valorDescuento === 'number') {
        precioOfertaCalculado = producto.precio * (1 - oferta.valorDescuento);
    } else if (oferta.tipoDescuento === 'montoFijo' && typeof oferta.valorDescuento === 'number') {
        precioOfertaCalculado = producto.precio - oferta.valorDescuento;
    }
    precioOfertaCalculado = Math.max(0, precioOfertaCalculado);

    // Verificar si el producto ya está en el carrito (lo identificamos por el ID del producto, no de la oferta)
    const productoEnCarrito = carrito.find(item => item.id === producto.id);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id, // Guardamos el ID del producto
            nombre: producto.nombre,
            precio: precioOfertaCalculado, // El precio ya con el descuento de la oferta
            imagen: producto.imagen,
            cantidad: 1,
            esOferta: true, // Flag para indicar que viene de una oferta
            idOferta: oferta.id // Para referencia a la oferta específica
        });
    }

    // Actualizar localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizar interfaz
    actualizarCarrito();

    // Mostrar mensaje de confirmación
    mostrarMensaje(`${producto.nombre} en oferta añadido al carrito`);
}

// Actualizar visualización del carrito (sin cambios, ya que maneja la variable global 'carrito')
function actualizarCarrito() {
    const carritoTotal = document.querySelector('.carrito-total');
    if (carritoTotal) {
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        carritoTotal.textContent = total.toFixed(2);
    }
}

// Mostrar mensaje temporal (sin cambios)
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
