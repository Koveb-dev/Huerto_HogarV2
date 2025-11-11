import React from 'react';
import { Link } from 'react-router-dom';

const Nosotros = () => {
  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="row align-items-center mb-5">
        <div className="col-lg-6">
          <h1 className="display-4 fw-bold text-success mb-4">
            Sobre 🌱 Huerto Hogar
          </h1>
          <p className="lead mb-4">
            Somos apasionados por la naturaleza y creemos que todos deberían tener 
            la oportunidad de cultivar sus propios alimentos, sin importar el espacio disponible.
          </p>
          <div className="d-flex gap-3">
            <Link to="/productos" className="btn btn-success btn-lg">
              Ver Productos
            </Link>
            <Link to="/contacto" className="btn btn-outline-success btn-lg">
              Contactarnos
            </Link>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1597848212624-e6d4bd7e1e92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Equipo de Huerto Hogar" 
              className="card-img-top rounded-3"
            />
          </div>
        </div>
      </div>

      {/* Nuestra Misión */}
      <div className="row mb-5">
        <div className="col-12 text-center mb-5">
          <h2 className="fw-bold text-success">Nuestra Misión</h2>
          <div className="divider bg-success mx-auto" style={{width: '80px', height: '3px'}}></div>
        </div>
        <div className="col-md-4 text-center">
          <div className="bg-light-success rounded-circle p-4 d-inline-flex mb-3">
            <span className="display-6">🌿</span>
          </div>
          <h5 className="fw-bold">Sostenibilidad</h5>
          <p>
            Promover prácticas agrícolas sostenibles y el consumo responsable 
            de productos locales y ecológicos.
          </p>
        </div>
        <div className="col-md-4 text-center">
          <div className="bg-light-success rounded-circle p-4 d-inline-flex mb-3">
            <span className="display-6">🏡</span>
          </div>
          <h5 className="fw-bold">Accesibilidad</h5>
          <p>
            Hacer que la agricultura urbana sea accesible para todos, 
            incluso en los espacios más pequeños.
          </p>
        </div>
        <div className="col-md-4 text-center">
          <div className="bg-light-success rounded-circle p-4 d-inline-flex mb-3">
            <span className="display-6">👨‍👩‍👧‍👦</span>
          </div>
          <h5 className="fw-bold">Comunidad</h5>
          <p>
            Crear una comunidad de amantes de la jardinería que compartan 
            conocimientos y experiencias.
          </p>
        </div>
      </div>

      {/* Nuestra Historia */}
      <div className="row bg-light rounded-4 p-5 mb-5">
        <div className="col-lg-8 mx-auto text-center">
          <h2 className="fw-bold text-success mb-4">Nuestra Historia</h2>
          <p className="mb-4">
            Huerto Hogar nació en 2018 de la pasión de un grupo de amigos por la agricultura 
            ecológica. Frustrados por la falta de opciones accesibles para cultivar en espacios 
            urbanos, decidimos crear una solución integral.
          </p>
          <p className="mb-4">
            Comenzamos en un pequeño local de 50m² y hoy somos la tienda de referencia 
            para más de 10,000 clientes satisfechos en todo Chile. Nuestro crecimiento 
            se basa en el compromiso con la calidad y la satisfacción del cliente.
          </p>
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="border border-success rounded-3 p-3">
                <h3 className="text-success fw-bold">10K+</h3>
                <p className="mb-0">Clientes Satisfechos</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border border-success rounded-3 p-3">
                <h3 className="text-success fw-bold">5+</h3>
                <p className="mb-0">Años de Experiencia</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border border-success rounded-3 p-3">
                <h3 className="text-success fw-bold">500+</h3>
                <p className="mb-0">Productos Disponibles</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border border-success rounded-3 p-3">
                <h3 className="text-success fw-bold">100%</h3>
                <p className="mb-0">Compromiso Ecológico</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="row mb-5">
        <div className="col-12 text-center mb-5">
          <h2 className="fw-bold text-success">Nuestros Valores</h2>
          <div className="divider bg-success mx-auto" style={{width: '80px', height: '3px'}}></div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="d-flex align-items-start">
            <div className="bg-success text-white rounded-circle p-3 me-4">
              <span className="fs-4">♻️</span>
            </div>
            <div>
              <h5 className="fw-bold">Sostenibilidad Ambiental</h5>
              <p>
                Todos nuestros productos son seleccionados por su bajo impacto ambiental 
                y promovemos técnicas de cultivo orgánico.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="d-flex align-items-start">
            <div className="bg-success text-white rounded-circle p-3 me-4">
              <span className="fs-4">⭐</span>
            </div>
            <div>
              <h5 className="fw-bold">Calidad Garantizada</h5>
              <p>
                Trabajamos solo con proveedores certificados y realizamos controles 
                de calidad rigurosos en todos nuestros productos.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="d-flex align-items-start">
            <div className="bg-success text-white rounded-circle p-3 me-4">
              <span className="fs-4">💚</span>
            </div>
            <div>
              <h5 className="fw-bold">Pasión por la Naturaleza</h5>
              <p>
                Amamos lo que hacemos y queremos compartir esa pasión contigo. 
                Cada planta cuenta una historia y nosotros queremos ser parte de la tuya.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="d-flex align-items-start">
            <div className="bg-success text-white rounded-circle p-3 me-4">
              <span className="fs-4">🤝</span>
            </div>
            <div>
              <h5 className="fw-bold">Atención Personalizada</h5>
              <p>
                Nuestro equipo de expertos está siempre disponible para asesorarte 
                y ayudarte en tu proyecto de huerto urbano.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="row bg-success rounded-4 p-5 text-white text-center">
        <div className="col-lg-8 mx-auto">
          <h2 className="fw-bold mb-3">¿Listo para comenzar tu huerto?</h2>
          <p className="mb-4">
            Únete a nuestra comunidad y descubre el placer de cultivar tus propios alimentos
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/productos" className="btn btn-light btn-lg text-success">
              Comprar Ahora
            </Link>
            <Link to="/contacto" className="btn btn-outline-light btn-lg">
              Hacer una Pregunta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;