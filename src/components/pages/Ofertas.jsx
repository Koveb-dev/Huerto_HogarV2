import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from 'firebase/firestore';

const Ofertas = () => {
    const [productos, setProductos] = useState([]);
    const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
    const [carrito, setCarrito] = useState([]);
    const [contador, setContador] = useState({
        dias: '02',
        horas: '12',
        minutos: '45',
        segundos: '30'
    });

    // Cargar productos en oferta
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const q = query(
                    collection(db, 'productos'),
                    where('enOferta', '==', true)
                );
                const querySnapshot = await getDocs(q);
                const productosData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProductos(productosData);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            }
        };

        cargarProductos();
    }, []);

    // Inicializar contador regresivo
    useEffect(() => {
        const actualizarContador = () => {
            const ahora = new Date();
            const finOferta = new Date(ahora);
            finOferta.setDate(ahora.getDate() + 2);

            const diferencia = finOferta - ahora;

            const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            setContador({
                dias: dias.toString().padStart(2, '0'),
                horas: horas.toString().padStart(2, '0'),
                minutos: minutos.toString().padStart(2, '0'),
                segundos: segundos.toString().padStart(2, '0')
            });
        };

        const intervalo = setInterval(actualizarContador, 1000);
        actualizarContador();

        return () => clearInterval(intervalo);
    }, []);

    // Filtrar productos por categoría
    const productosFiltrados = categoriaFiltro === 'todas'
        ? productos
        : productos.filter(producto => producto.categoria === categoriaFiltro);

    // Agregar producto al carrito
    const agregarAlCarrito = (producto) => {
        const productoExistente = carrito.find(item => item.id === producto.id);

        if (productoExistente) {
            setCarrito(carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precioOferta,
                imagen: producto.imagen,
                cantidad: 1
            }]);
        }

        // Mostrar mensaje de confirmación
        alert(`${producto.nombre} añadido al carrito`);
    };

    return (
        <div className="ofertas-page">
            {/* Hero Section */}
            <section className="ofertas-hero">
                <div className="container">
                    <h1>¡Grandes Ofertas en Huerto Hogar!</h1>
                    <p>Descubre descuentos exclusivos en productos para tu huerto y hogar. ¡Aprovecha estas promociones por tiempo limitado!</p>
                    <a href="#ofertas" className="btn-ofertas">Ver Ofertas</a>
                </div>
            </section>

            {/* Filtros */}
            <section className="filtros-section">
                <div className="container">
                    <div className="filtros-ofertas">
                        {['todas', 'frutas', 'semillas', 'verduras', 'organicos'].map(categoria => (
                            <button
                                key={categoria}
                                className={`filtro-btn ${categoriaFiltro === categoria ? 'active' : ''}`}
                                onClick={() => setCategoriaFiltro(categoria)}
                            >
                                {categoria === 'todas' ? 'Todas las ofertas' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Productos en Oferta */}
            <section className="ofertas-section" id="ofertas">
                <div className="container">
                    <h2 className="section-title">Productos en Oferta</h2>
                    <div className="productos-grid">
                        {productosFiltrados.map(producto => {
                            const porcentajeDescuento = Math.round((1 - producto.precioOferta / producto.precio) * 100);

                            return (
                                <div key={producto.id} className="card-oferta">
                                    <div className="etiqueta-oferta">-{porcentajeDescuento}%</div>
                                    <div className="card-img">
                                        <img src={producto.imagen} alt={producto.nombre} />
                                    </div>
                                    <div className="card-body">
                                        <div className="card-categoria">{producto.categoria}</div>
                                        <h3 className="card-title">{producto.nombre}</h3>
                                        <div className="card-precios">
                                            <span className="precio-actual">${producto.precioOferta}</span>
                                            <span className="precio-anterior">${producto.precio}</span>
                                        </div>
                                        <p className="card-descripcion">{producto.descripcion}</p>
                                        <button
                                            className="btn-comprar"
                                            onClick={() => agregarAlCarrito(producto)}
                                        >
                                            Añadir al Carrito
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Banner Oferta Especial */}
            <section className="banner-oferta">
                <div className="container">
                    <h2>¡Oferta Flash! Solo por 48 horas</h2>
                    <p>Consigue un 50% de descuento adicional en productos seleccionados usando el código: <strong>HUERTO50</strong></p>
                    <div className="contador-oferta">
                        <div className="contador-item">
                            <div className="contador-numero">{contador.dias}</div>
                            <div className="contador-texto">Días</div>
                        </div>
                        <div className="contador-item">
                            <div className="contador-numero">{contador.horas}</div>
                            <div className="contador-texto">Horas</div>
                        </div>
                        <div className="contador-item">
                            <div className="contador-numero">{contador.minutos}</div>
                            <div className="contador-texto">Minutos</div>
                        </div>
                        <div className="contador-item">
                            <div className="contador-numero">{contador.segundos}</div>
                            <div className="contador-texto">Segundos</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Ofertas;