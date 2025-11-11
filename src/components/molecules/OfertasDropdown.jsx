import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOfertas } from '../../services/firebase';

const OfertasDropdown = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOfertas = async () => {
      const result = await getOfertas();
      if (result.success) {
        setOfertas(result.data);
      }
      setLoading(false);
    };
    loadOfertas();
  }, []);

  return (
    <div className="nav-item dropdown">
      <a className="nav-link dropdown-toggle" href="#" id="ofertasDropdown">
        🔥 Ofertas
      </a>
      <div className="dropdown-menu">
        {loading ? (
          <span className="dropdown-item">Cargando ofertas...</span>
        ) : ofertas.length === 0 ? (
          <span className="dropdown-item">No hay ofertas disponibles</span>
        ) : (
          ofertas.map(oferta => (
            <Link 
              key={oferta.id} 
              className="dropdown-item" 
              to={`/catalogo?producto=${oferta.id}`}
            >
              {oferta.name} - {oferta.discount}% OFF
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default OfertasDropdown;