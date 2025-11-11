import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';
import { logoutUser } from '../../services/firebase';
import OfertasDropdown from '../molecules/OfertasDropdown';
import CartWidget from '../molecules/CartWidget';

const Header = () => {
  const { user, userProfile } = useUser();
  const { totalItems } = useCart();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🌱 Huerto Hogar
        </Link>
        
        <div className="navbar-nav ml-auto d-flex flex-row align-items-center">
          <OfertasDropdown />
          <CartWidget itemCount={totalItems} />
          
          {user ? (
            <div className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="userDropdown">
                👤 {userProfile?.displayName || user.email}
              </a>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="/perfil-cliente">
                  Mi Perfil
                </Link>
                <button className="dropdown-item" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <Link className="nav-link" to="/login">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;