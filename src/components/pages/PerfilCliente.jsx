import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import {
  updateUserProfile,
  getUserOrders,
  getUserAddresses,
  updateUserPreferences,
  getUserWishlist
} from '../../services/firebase';

const PerfilCliente = () => {
  const { user, userProfile, updateUserProfileData } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: '',
    about: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    favVegetables: true,
    favFruits: true,
    favOrganic: false
  });
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState({
    profile: false,
    orders: false,
    addresses: false,
    wishlist: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const history = useHistory();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!user) {
      history.push('/login');
    }
  }, [user, history]);

  // Cargar datos del usuario
  useEffect(() => {
    if (user && userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        about: userProfile.about || '',
        email: user.email || ''
      });

      if (userProfile.preferences) {
        setPreferences(userProfile.preferences);
      }

      // Cargar órdenes
      loadOrders();

      // Cargar direcciones
      loadAddresses();

      // Cargar wishlist
      loadWishlist();
    }
  }, [user, userProfile]);

  const loadOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const result = await getUserOrders(user.uid);
      if (result.success) {
        setOrders(result.data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(prev => ({ ...prev, orders: false }));
  };

  const loadAddresses = async () => {
    setLoading(prev => ({ ...prev, addresses: true }));
    try {
      const result = await getUserAddresses(user.uid);
      if (result.success) {
        setAddresses(result.data || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
    setLoading(prev => ({ ...prev, addresses: false }));
  };

  const loadWishlist = async () => {
    setLoading(prev => ({ ...prev, wishlist: true }));
    try {
      const result = await getUserWishlist(user.uid);
      if (result.success) {
        setWishlist(result.data || []);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
    setLoading(prev => ({ ...prev, wishlist: false }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));

    const result = await updateUserProfile(user.uid, formData);

    if (result.success) {
      updateUserProfileData(formData);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } else {
      setMessage({ type: 'error', text: 'Error: ' + result.error });
    }
    setLoading(prev => ({ ...prev, profile: false }));

    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handlePreferencesSubmit = async () => {
    const result = await updateUserPreferences(user.uid, preferences);

    if (result.success) {
      setMessage({ type: 'success', text: 'Preferencias actualizadas' });
    } else {
      setMessage({ type: 'error', text: 'Error actualizando preferencias' });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePreferenceChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.id]: e.target.checked
    });
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    const fields = ['displayName', 'phone', 'address', 'about'];

    fields.forEach(field => {
      if (formData[field] && formData[field].trim() !== '') {
        completed++;
      }
    });

    return Math.round((completed / fields.length) * 100);
  };

  const getOrderStats = () => {
    const total = orders.length;
    const completed = orders.filter(order => order.status === 'delivered').length;
    const pending = orders.filter(order =>
      ['pending', 'processing'].includes(order.status)
    ).length;
    const totalSpent = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    return { total, completed, pending, totalSpent };
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Redirigiendo al login...
        </div>
      </div>
    );
  }

  const { total, completed, pending, totalSpent } = getOrderStats();
  const completionPercentage = calculateProfileCompletion();

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <section className="profile-header">
        <div className="container">
          <img
            src={userProfile?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
            alt="Foto de perfil"
            className="profile-avatar"
          />
          <h1>Bienvenido, {formData.displayName || userProfile?.displayName || 'Cliente'}</h1>
          <p>{user.email}</p>
        </div>
      </section>

      <div className="container">
        {/* Profile Completion */}
        <div className="profile-completion">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="completion-text">Completitud de tu perfil</span>
            <span className="completion-text">{completionPercentage}%</span>
          </div>
          <div className="progress-custom">
            <div
              className="progress-bar"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="stats-card">
              <div className="stats-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div className="stats-number">{total}</div>
              <div className="stats-label">Pedidos Totales</div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stats-card">
              <div className="stats-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stats-number">{completed}</div>
              <div className="stats-label">Pedidos Completados</div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stats-card">
              <div className="stats-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-number">{pending}</div>
              <div className="stats-label">Pedidos Pendientes</div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stats-card">
              <div className="stats-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stats-number">${totalSpent.toLocaleString()}</div>
              <div className="stats-label">Total Gastado</div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs Navigation */}
        <ul className="nav nav-tabs-custom mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user-circle me-2"></i>Mi Perfil
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-shopping-bag me-2"></i>Mis Pedidos
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              <i className="fas fa-map-marker-alt me-2"></i>Mis Direcciones
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <i className="fas fa-heart me-2"></i>Mi Lista de Deseos
            </button>
          </li>
        </ul>

        {/* Tabs Content */}
        <div className="tab-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="row">
              <div className="col-lg-8">
                <div className="profile-card">
                  <div className="card-header-custom">
                    <h3><i className="fas fa-user-edit me-2"></i>Información Personal</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleProfileSubmit}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Nombre Completo</label>
                          <input
                            type="text"
                            name="displayName"
                            className="form-control-custom"
                            value={formData.displayName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Correo Electrónico</label>
                          <input
                            type="email"
                            className="form-control-custom"
                            value={user.email}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Teléfono</label>
                          <input
                            type="tel"
                            name="phone"
                            className="form-control-custom"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Dirección</label>
                          <input
                            type="text"
                            name="address"
                            className="form-control-custom"
                            value={formData.address}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Sobre Mí</label>
                        <textarea
                          name="about"
                          className="form-control-custom"
                          rows="3"
                          value={formData.about}
                          onChange={handleChange}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn-custom"
                        disabled={loading.profile}
                      >
                        <i className="fas fa-save me-2"></i>
                        {loading.profile ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="profile-card">
                  <div className="card-header-custom">
                    <h4><i className="fas fa-cog me-2"></i>Preferencias</h4>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Notificaciones por Email</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          checked={preferences.emailNotifications}
                          onChange={handlePreferenceChange}
                        />
                        <label className="form-check-label">
                          Recibir notificaciones
                        </label>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Productos Favoritos</label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="favVegetables"
                          checked={preferences.favVegetables}
                          onChange={handlePreferenceChange}
                        />
                        <label className="form-check-label">
                          Verduras
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="favFruits"
                          checked={preferences.favFruits}
                          onChange={handlePreferenceChange}
                        />
                        <label className="form-check-label">
                          Frutas
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="favOrganic"
                          checked={preferences.favOrganic}
                          onChange={handlePreferenceChange}
                        />
                        <label className="form-check-label">
                          Productos Orgánicos
                        </label>
                      </div>
                    </div>
                    <button
                      className="btn-outline-primary w-100"
                      onClick={handlePreferencesSubmit}
                    >
                      <i className="fas fa-sync-alt me-2"></i>Actualizar Preferencias
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="profile-card">
              <div className="card-header-custom">
                <h3><i className="fas fa-history me-2"></i>Historial de Pedidos</h3>
              </div>
              <div className="card-body">
                {loading.orders ? (
                  <div className="text-center py-4">
                    <div className="loading-spinner"></div>
                    <p>Cargando pedidos...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID Pedido</th>
                          <th>Fecha</th>
                          <th>Productos</th>
                          <th>Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => (
                          <tr key={index} className="order-card">
                            <td>#{order.id}</td>
                            <td>{new Date(order.date).toLocaleDateString()}</td>
                            <td>{order.items?.length || 0} productos</td>
                            <td>${order.total?.toLocaleString()}</td>
                            <td>
                              <span className={`badge-status ${order.status === 'delivered' ? 'bg-success' :
                                  order.status === 'pending' ? 'bg-warning' :
                                    order.status === 'processing' ? 'bg-info' : 'bg-danger'
                                }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-shopping-bag fa-3x mb-3 text-muted"></i>
                    <h4>No tienes pedidos aún</h4>
                    <p>¡Comienza a comprar productos frescos en nuestro catálogo!</p>
                    <a href="/catalogo" className="btn-custom">
                      <i className="fas fa-store me-2"></i>Ir al Catálogo
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="profile-card">
              <div className="card-header-custom">
                <h3><i className="fas fa-heart me-2"></i>Mi Lista de Deseos</h3>
              </div>
              <div className="card-body">
                {loading.wishlist ? (
                  <div className="text-center py-4">
                    <div className="loading-spinner"></div>
                    <p>Cargando lista de deseos...</p>
                  </div>
                ) : wishlist.length > 0 ? (
                  <div className="row">
                    {wishlist.map((product, index) => (
                      <div className="col-md-4 mb-3" key={index}>
                        <div className="product-card">
                          <img src={product.image} alt={product.name} />
                          <h5>{product.name}</h5>
                          <p>${product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-heart fa-3x mb-3 text-muted"></i>
                    <h4>Tu lista de deseos está vacía</h4>
                    <p>¡Agrega productos que te gusten para comprarlos después!</p>
                    <a href="/catalogo" className="btn-custom">
                      <i className="fas fa-store me-2"></i>Explorar Productos
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilCliente;