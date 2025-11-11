import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-success text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          {/* Información de la empresa */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold">🌱 Huerto Hogar</h5>
            <p className="mb-2">
              Tu tienda de confianza para productos de huerto. 
              Cultiva tus sueños con nosotros.
            </p>
            <div className="social-links">
              <a href="#" className="text-white me-3">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold">Enlaces Rápidos</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">
                  Inicio
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/productos" className="text-white text-decoration-none">
                  Productos
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/ofertas" className="text-white text-decoration-none">
                  Ofertas
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contacto" className="text-white text-decoration-none">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-bold">Contacto</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-envelope me-2"></i>
                info@huertohogar.com
              </li>
              <li className="mb-2">
                <i className="fas fa-phone me-2"></i>
                +569 44444444
              </li>
              <li className="mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                C/ Los huertos 123, Rancagua
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 bg-white" />

        {/* Copyright */}
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Huerto Hogar. Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <Link to="/privacidad" className="text-white text-decoration-none me-3">
              Política de Privacidad
            </Link>
            <Link to="/terminos" className="text-white text-decoration-none">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;