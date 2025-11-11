import React from 'react';
import { Link } from 'react-router-dom';

const CartWidget = ({ itemCount }) => {
  return (
    <Link to="/carrito" className="nav-link position-relative mx-3">
      🛒 Carrito
      {itemCount > 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartWidget;