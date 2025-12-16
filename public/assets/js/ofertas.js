// Config Firebase (mismo que el resto del sitio)
const firebaseConfig = {
    apiKey: "AIzaSyB5oGPbt9KLa--5l9OIeGisggYV33if2Xg",
    authDomain: "tiendahuertohogar-2ce3a.firebaseapp.com",
    projectId: "tiendahuertohogar-2ce3a",
    storageBucket: "tiendahuertohogar-2ce3a.appspot.com",
    messagingSenderId: "857983411223",
    appId: "1:857983411223:web:a1c200cd07b7fd63b36852",
    measurementId: "G-TX342PY82Y"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const grid = document.getElementById('gridOfertas');
const filtroCategoria = document.getElementById('filtroCategoria');
const contador = document.getElementById('contadorOfertas');
const btnFiltrar = document.getElementById('btnFiltrar');

let ofertasCache = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarOfertas();
    if (btnFiltrar) btnFiltrar.onclick = renderOfertas;
    if (filtroCategoria) filtroCategoria.onchange = renderOfertas;
});

async function cargarOfertas() {
    try {
        if (grid) grid.innerHTML = '<div class="placeholder">Cargando ofertas...</div>';

        const snap = await db.collection('ofertas').get();
        ofertasCache = [];
        snap.forEach(doc => ofertasCache.push({ id: doc.id, ...doc.data() }));

        poblarCategorias(ofertasCache);
        renderOfertas();
    } catch (error) {
        console.error('Error cargando ofertas:', error);
        if (grid) grid.innerHTML = '<div class="placeholder">Error al cargar ofertas.</div>';
    }
}

function poblarCategorias(ofertas) {
    if (!filtroCategoria) return;
    const categorias = [...new Set(ofertas.map(o => o.categoria).filter(Boolean))];
    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filtroCategoria.appendChild(opt);
    });
}

function renderOfertas() {
    if (!grid) return;
    const cat = filtroCategoria ? filtroCategoria.value : '';

    let lista = ofertasCache;
    if (cat) lista = lista.filter(o => o.categoria === cat);

    if (!lista.length) {
        grid.innerHTML = '<div class="empty">Sin ofertas disponibles</div>';
        if (contador) contador.textContent = '0 productos';
        return;
    }

    grid.innerHTML = '';
    lista.forEach(o => {
        const precio = Number(o.precio) || 0;
        const precioOferta = Number(o.precioOferta || o.precio_oferta) || null;
        const descuento = precioOferta ? Math.round((1 - precioOferta / precio) * 100) : (o.descuento || 0);
        const precioFinal = precioOferta || (precio && descuento ? precio * (1 - descuento / 100) : precio);

        const card = document.createElement('div');
        card.className = 'oferta-card';
        card.innerHTML = `
            <img class="oferta-img" src="${o.imagen || 'https://via.placeholder.com/400x300?text=Oferta'}" alt="${o.nombre || 'Producto'}">
            <div class="oferta-nombre">${o.nombre || 'Producto en oferta'}</div>
            <div class="oferta-categoria">${o.categoria || 'Sin categoría'}</div>
            <div>
                ${precio ? `<div class="precio-regular">$${precio.toFixed(2)}</div>` : ''}
                <div class="precio-oferta">$${precioFinal.toFixed(2)}</div>
            </div>
            <div class="badge-descuento">${descuento ? `-${descuento}%` : 'Oferta'}</div>
            <div class="oferta-footer">
                <span class="stock">${(o.stock ?? 'N/D')} en stock</span>
                <button class="btn-add" onclick="agregarCarrito('${o.id}')">
                    <i class="bi bi-cart-plus"></i> Agregar
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    if (contador) contador.textContent = `${lista.length} producto${lista.length !== 1 ? 's' : ''}`;
}

function agregarCarrito(id) {
    alert('Agregar al carrito (pendiente de integración). ID: ' + id);
}



