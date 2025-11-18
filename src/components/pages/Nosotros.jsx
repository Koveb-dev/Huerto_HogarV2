import React, { useState, useEffect } from 'react';
import './nosotros.css';

const Nosotros = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Datos de ubicaciones
    const locationsData = [
      { name: 'Santiago', customers: 12500 },
      { name: 'Puerto Montt', customers: 3200 },
      { name: 'Villarica', customers: 1800 },
      { name: 'Nacimiento', customers: 1500 },
      { name: 'Viña del Mar', customers: 4500 },
      { name: 'Valparaíso', customers: 3800 },
      { name: 'Concepción', customers: 5200 }
    ];
    
    setLocations(locationsData);
  }, []);

  return (
    <div className="nosotros">
      <section className="hero">
        <div className="container">
          <h1>Conectando el campo con tu hogar</h1>
          <p>Más de 6 años llevando frescura y calidad directamente a tu puerta</p>
        </div>
      </section>

      <section className="about-intro">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Sobre HuertoHogar</h2>
              <p>HuertoHogar es una tienda online dedicada a llevar la frescura y calidad de los productos del campo directamente a la puerta de nuestros clientes en Chile. Con más de 6 años de experiencia, operamos en más de 9 puntos a lo largo del país, incluyendo ciudades clave como Santiago, Puerto Montt, Villarica, Nacimiento, Viña del Mar, Valparaíso, y Concepción.</p>
              <p>Nuestra misión es conectar a las familias chilenas con el campo, promoviendo un estilo de vida saludable y sostenible.</p>
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Campo chileno" />
            </div>
          </div>
        </div>
      </section>

      <section className="mission-vision">
        <div className="container">
          <div className="mission-vision-content">
            <div className="mission">
              <div className="icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Nuestra Misión</h3>
              <p>Proporcionar productos frescos y de calidad directamente desde el campo hasta la puerta de nuestros clientes, garantizando la frescura y el sabor en cada entrega. Nos comprometemos a fomentar una conexión más cercana entre los consumidores y los agricultores locales, apoyando prácticas agrícolas sostenibles y promoviendo una alimentación saludable en todos los hogares chilenos.</p>
            </div>
            <div className="vision">
              <div className="icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Nuestra Visión</h3>
              <p>Ser la tienda online líder en la distribución de productos frescos y naturales en Chile, reconocida por nuestra calidad excepcional, servicio al cliente y compromiso con la sostenibilidad. Aspiramos a expandir nuestra presencia a nivel nacional e internacional, estableciendo un nuevo estándar en la distribución de productos agrícolas directos del productor al consumidor.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="locations">
        <div className="container">
          <h2>Nuestra Presencia en Chile</h2>
          <p>Operamos en más de 9 puntos a lo largo del país</p>
          <div className="locations-list">
            {locations.map((location, index) => (
              <div key={index} className="location-item">
                <h4>{location.name}</h4>
                <p>{location.customers.toLocaleString()} clientes satisfechos</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="values">
        <div className="container">
          <h2>Nuestros Valores</h2>
          <div className="values-grid">
            <div className="value-item">
              <i className="fas fa-seedling"></i>
              <h3>Calidad</h3>
              <p>Garantizamos productos frescos y de la más alta calidad en cada entrega.</p>
            </div>
            <div className="value-item">
              <i className="fas fa-truck"></i>
              <h3>Compromiso</h3>
              <p>Nos comprometemos con la satisfacción total de nuestros clientes.</p>
            </div>
            <div className="value-item">
              <i className="fas fa-handshake"></i>
              <h3>Sostenibilidad</h3>
              <p>Apoyamos prácticas agrícolas sostenibles y el comercio justo.</p>
            </div>
            <div className="value-item">
              <i className="fas fa-heart"></i>
              <h3>Salud</h3>
              <p>Promovemos una alimentación saludable en todos los hogares chilenos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Nosotros;