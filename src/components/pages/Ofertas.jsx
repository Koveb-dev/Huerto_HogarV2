import { useState, useEffect } from "react";
// Importar las funciones específicas de tu servicio de Firestore, no db directamente
import { obtenerOfertas } from "../../services/fireStoreService"; // Asegúrate que la ruta sea correcta

const Ofertas = () => {
    // Cambiamos 'productos' a 'ofertas' para reflejar que estamos cargando documentos de la colección 'ofertas'
    // Cada elemento en este array será un objeto de oferta que ya incluye su producto anidado.
    const [ofertas, setOfertas] = useState([]);
    const [cargando, setCargando] = useState(true); // Nuevo estado para controlar la carga
    const [error, setError] = useState(null); // Nuevo estado para manejar errores
    const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
    const [carrito, setCarrito] = useState([]); // Mantenemos el carrito

    const [contador, setContador] = useState({
        dias: '00', // Inicializamos en 0
        horas: '00',
        minutos: '00',
        segundos: '00'
    });

    // Cargar ofertas (desde la colección 'ofertas' de Firestore)
    useEffect(() => {
        const cargarTodasLasOfertas = async () => {
            try {
                // Usamos la función obtenerOfertas de tu fireStoreService.js
                const resultado = await obtenerOfertas(); // Esta función ya resuelve el producto
                if (resultado.exito) {
                    setOfertas(resultado.datos);
                } else {
                    setError(resultado.error);
                }
            } catch (err) {
                setError("Error desconocido al cargar las ofertas.");
                console.error('Error al cargar ofertas:', err);
            } finally {
                setCargando(false);
            }
        };

        cargarTodasLasOfertas();
    }, []);

    // Inicializar contador regresivo (este sigue siendo estático, no vinculado a una oferta específica)
    useEffect(() => {
        // Se puede hacer más dinámico si las ofertas tienen fechaFin
        const calcularFechaFinGeneral = () => {
            const ahora = new Date();
            const finOfertaGeneral = new Date(ahora);
            finOfertaGeneral.setDate(ahora.getDate() + 2); // Ejemplo: 2 días desde ahora
            return finOfertaGeneral;
        };

        const fechaLimite = calcularFechaFinGeneral(); // La fecha límite para este contador genérico

        const actualizarContador = () => {
            const ahora = new Date();
            const diferencia = fechaLimite - ahora;

            if (diferencia <= 0) {
                setContador({ dias: '00', horas: '00', minutos: '00', segundos: '00' });
                clearInterval(intervalo);
                return;
            }

            const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            setContador({
                dias: String(dias).padStart(2, '0'),
                horas: String(horas).padStart(2, '0'),
                minutos: String(minutos).padStart(2, '0'),
                segundos: String(segundos).padStart(2, '0')
            });
        };

        const intervalo = setInterval(actualizarContador, 1000);
        actualizarContador(); // Ejecutar una vez inmediatamente

        return () => clearInterval(intervalo); // Limpiar el intervalo al desmontar
    }, []); // Dependencias vacías, se ejecuta una vez

    // Filtrar ofertas por categoría del producto asociado
    const ofertasFiltradas = categoriaFiltro === 'todas'
        ? ofertas
        : ofertas.filter(oferta => oferta.producto && oferta.producto.categoria === categoriaFiltro);

    // Agregar producto con oferta al carrito
    const agregarAlCarrito = (oferta) => {
        // Asegúrate de que el producto esté presente en la oferta
        if (!oferta.producto) {
            alert('No se pudo añadir al carrito: producto asociado no encontrado.');
            return;
        }

        // Calcula el precio de oferta real
        let precioOfertaCalculado = oferta.producto.precio; // Precio base del producto
        if (oferta.tipoDescuento === 'porcentaje' && typeof oferta.valorDescuento === 'number') {
            precioOfertaCalculado = oferta.producto.precio * (1 - oferta.valorDescuento);
        } else if (oferta.tipoDescuento === 'montoFijo' && typeof oferta.valorDescuento === 'number') {
            precioOfertaCalculado = oferta.producto.precio - oferta.valorDescuento;
        }
        // Asegúrate de que el precio no sea negativo
        precioOfertaCalculado = Math.max(0, precioOfertaCalculado);

        const productoExistenteEnCarrito = carrito.find(item => item.id === oferta.producto.id);

        if (productoExistenteEnCarrito) {
            setCarrito(carrito.map(item =>
                item.id === oferta.producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, {
                id: oferta.producto.id,
                nombre: oferta.producto.nombre,
                precio: precioOfertaCalculado, // El precio ya con el descuento de la oferta
                imagen: oferta.producto.imagen,
                cantidad: 1,
                esOferta: true, // Puedes añadir un flag si lo necesitas
                idOferta: oferta.id // Referencia a la oferta
            }]);
        }

        alert(`${oferta.producto.nombre} en oferta añadido al carrito`);
    };

    if (cargando) {
        return <div className="ofertas-page">Cargando ofertas...</div>;
    }

    if (error) {
        return <div className="ofertas-page">Error al cargar las ofertas: {error}</div>;
    }

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
                        {ofertasFiltradas.length === 0 ? (
                            <p>No hay ofertas disponibles para esta categoría en este momento.</p>
                        ) : (
                            ofertasFiltradas.map(oferta => {
                                // Asegurarse de que el producto asociado exista antes de renderizar
                                if (!oferta.producto) {
                                    return <div key={oferta.id} className="card-oferta error-card">
                                        <p>Oferta sin producto asociado válido (ID: {oferta.id})</p>
                                    </div>;
                                }

                                // Calcula el precio de oferta y el porcentaje de descuento
                                const precioOriginal = oferta.producto.precio;
                                let precioOferta = precioOriginal;

                                if (oferta.tipoDescuento === 'porcentaje' && typeof oferta.valorDescuento === 'number') {
                                    precioOferta = precioOriginal * (1 - oferta.valorDescuento);
                                } else if (oferta.tipoDescuento === 'montoFijo' && typeof oferta.valorDescuento === 'number') {
                                    precioOferta = precioOriginal - oferta.valorDescuento;
                                }
                                precioOferta = Math.max(0, precioOferta); // Asegurar que no sea negativo

                                const porcentajeDescuento = precioOriginal > 0
                                    ? Math.round((1 - precioOferta / precioOriginal) * 100)
                                    : 0;

                                return (
                                    <div key={oferta.id} className="card-oferta">
                                        <div className="etiqueta-oferta">-{porcentajeDescuento}%</div>
                                        <div className="card-img">
                                            <img src={oferta.producto.imagen} alt={oferta.producto.nombre} />
                                        </div>
                                        <div className="card-body">
                                            {/* Usamos el nombre de la oferta, no el del producto si es un campo distinto */}
                                            <div className="card-categoria">{oferta.producto.categoria}</div>
                                            <h3 className="card-title">{oferta.nombreOferta || oferta.producto.nombre}</h3>
                                            <div className="card-precios">
                                                <span className="precio-actual">${precioOferta.toFixed(2)}</span>
                                                {precioOriginal > precioOferta && ( // Solo muestra precio anterior si hay descuento
                                                    <span className="precio-anterior">${precioOriginal.toFixed(2)}</span>
                                                )}
                                            </div>
                                            <p className="card-descripcion">{oferta.descripcion || oferta.producto.descripcion}</p>
                                            <button
                                                className="btn-comprar"
                                                onClick={() => agregarAlCarrito(oferta)}
                                            >
                                                Añadir al Carrito
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
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
