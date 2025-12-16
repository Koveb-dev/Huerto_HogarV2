import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserOrders,
  getUserAddresses,
  getUserWishlist,
  addUserAddress
} from '../../services/firebase';
import { useUser } from '../../contexts/UserContext';

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

const formatMoney = (value = 0) => {
  try {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value || 0);
  } catch {
    return `$${(value || 0).toLocaleString()}`;
  }
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    const d = value.seconds ? new Date(value.seconds * 1000) : new Date(value);
    return d.toLocaleDateString('es-CL');
  } catch {
    return '-';
  }
};

const normalizeStatus = (status = '') => {
  const s = status.toLowerCase();
  if (['pending', 'pendiente'].includes(s)) return 'pendiente';
  if (['processing', 'procesando', 'en proceso'].includes(s)) return 'procesando';
  if (['delivered', 'entregado'].includes(s)) return 'entregado';
  if (['cancelled', 'cancelado'].includes(s)) return 'cancelado';
  return s || 'desconocido';
};

const statusLabel = (s) => {
  const map = { pendiente: 'Pendiente', procesando: 'En proceso', entregado: 'Entregado', cancelado: 'Cancelado' };
  return map[s] || s;
};

const statusClass = (s) => {
  const map = { pendiente: 'bg-warning', procesando: 'bg-info', entregado: 'bg-success', cancelado: 'bg-danger' };
  return map[s] || 'bg-secondary';
};

const PerfilCliente = () => {
  const history = useHistory();
  const { user, updateUserProfileData } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({ displayName: '', phone: '', about: '' });
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    favVegetables: true,
    favFruits: true,
    favOrganic: false
  });
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      history.push('/login');
      return;
    }
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAll = async () => {
    if (!user) return;
    const profile = await getUserProfile(user.uid);
    if (profile.success && profile.data) {
      const data = profile.data;
      setFormData({
        displayName: data.displayName || data.nombre || '',
        phone: data.phone || data.telefono || '',
        about: data.about || data.sobreMi || ''
      });
      if (data.preferences || data.preferencias) {
        setPrefs(data.preferences || data.preferencias);
      }
      updateUserProfileData(data);
    }
    const ordersRes = await getUserOrders(user.uid);
    if (ordersRes.success) setOrders(ordersRes.data || []);
    const addrRes = await getUserAddresses(user.uid);
    if (addrRes.success) setAddresses(addrRes.data || []);
    const wishRes = await getUserWishlist(user.uid);
    if (wishRes.success) setWishlist(wishRes.data || []);
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const result = await updateUserProfile(user.uid, {
      displayName: formData.displayName,
      phone: formData.phone,
      about: formData.about
    });
    if (result.success) {
      setMessage({ type: 'success', text: 'Perfil actualizado' });
      updateUserProfileData({ ...formData });
    } else {
      setMessage({ type: 'error', text: 'No se pudo actualizar el perfil' });
    }
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 2500);
  };

  const onSavePrefs = async () => {
    if (!user) return;
    setLoading(true);
    const result = await updateUserPreferences(user.uid, prefs);
    setMessage(result.success
      ? { type: 'success', text: 'Preferencias guardadas' }
      : { type: 'error', text: 'No se pudieron guardar las preferencias' });
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 2500);
  };

  const onAddAddress = async () => {
    if (!user) return;
    const alias = prompt('Alias (Casa, Oficina, etc.):');
    if (alias === null) return;
    const direccion = prompt('Dirección completa:');
    if (direccion === null) return;
    const comuna = prompt('Comuna:');
    if (comuna === null) return;
    const region = prompt('Región:');
    if (region === null) return;
    const telefono = prompt('Teléfono:');
    if (telefono === null) return;
    const res = await addUserAddress(user.uid, {
      alias: alias || 'Dirección',
      direccion: direccion || '',
      comuna: comuna || '',
      region: region || '',
      telefono: telefono || ''
    });
    if (res.success) {
      setMessage({ type: 'success', text: 'Dirección agregada' });
      loadAll();
    } else {
      setMessage({ type: 'error', text: 'No se pudo agregar la dirección' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 2500);
  };

  const completion = () => {
    let total = 3;
    let filled = 0;
    if (formData.displayName) filled++;
    if (formData.phone) filled++;
    if (formData.about) filled++;
    return Math.round((filled / total) * 100);
  };

  const filteredOrders = (status) => {
    if (!status || status === 'todos') return orders;
    return orders.filter(o => normalizeStatus(o.status || o.estado) === status);
  };

  return (
    <div className="perfil-react">
      <div className="profile-hero">
        <div className="container profile-hero__grid">
          <div className="profile-hero__left">
            <img src={user?.photoURL || defaultAvatar} alt="avatar" className="profile-avatar" />
          </div>
          <div className="profile-hero__right">
            <p className="eyebrow">Mi cuenta</p>
            <h1>{formData.displayName || user?.displayName || 'Cliente'}</h1>
            <p className="muted">{user?.email}</p>
            <div className="tags">
              <span className="tag">Cliente</span>
              <span className="tag">HuertoHogar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">Pedidos totales</div>
            <div className="stat-value">{orders.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completados</div>
            <div className="stat-value">{orders.filter(o => normalizeStatus(o.status || o.estado) === 'entregado').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pendientes</div>
            <div className="stat-value">{orders.filter(o => ['pendiente','procesando'].includes(normalizeStatus(o.status || o.estado))).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total gastado</div>
            <div className="stat-value">
              {formatMoney(
                orders
                  .filter(o => normalizeStatus(o.status || o.estado) === 'entregado')
                  .reduce((acc, o) => acc + (o.total || 0), 0)
              )}
            </div>
          </div>
          <div className="stat-card progress-card">
            <div className="stat-label">Completitud</div>
            <div className="stat-value">{completion()}%</div>
            <div className="progress-custom">
              <div className="progress-bar" style={{ width: `${completion()}%` }}></div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="fas fa-user"></i> Perfil
          </button>
          <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <i className="fas fa-receipt"></i> Compras
          </button>
          <button className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
            <i className="fas fa-map-marker-alt"></i> Direcciones
          </button>
          <button className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>
            <i className="fas fa-heart"></i> Favoritos
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="panel-grid">
            <div className="card">
              <div className="card-header"><h3><i className="fas fa-id-card"></i> Datos personales</h3></div>
              <div className="card-body">
                <form className="form-grid" onSubmit={onSaveProfile}>
                  <label>Nombre completo
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    />
                  </label>
                  <label>Correo
                    <input type="email" value={user?.email || ''} disabled />
                  </label>
                  <label>Teléfono
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </label>
                  <label>Sobre mí
                    <textarea
                      rows="3"
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    />
                  </label>
                  <div className="form-actions">
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h3><i className="fas fa-sliders-h"></i> Preferencias</h3></div>
              <div className="card-body">
                <div className="switch">
                  <input
                    type="checkbox"
                    id="pref-email"
                    checked={prefs.emailNotifications}
                    onChange={(e) => setPrefs({ ...prefs, emailNotifications: e.target.checked })}
                  />
                  <label htmlFor="pref-email">Notificaciones por email</label>
                </div>
                <div className="checkbox">
                  <input
                    type="checkbox"
                    id="pref-veg"
                    checked={prefs.favVegetables}
                    onChange={(e) => setPrefs({ ...prefs, favVegetables: e.target.checked })}
                  />
                  <label htmlFor="pref-veg">Verduras</label>
                </div>
                <div className="checkbox">
                  <input
                    type="checkbox"
                    id="pref-fruit"
                    checked={prefs.favFruits}
                    onChange={(e) => setPrefs({ ...prefs, favFruits: e.target.checked })}
                  />
                  <label htmlFor="pref-fruit">Frutas</label>
                </div>
                <div className="checkbox">
                  <input
                    type="checkbox"
                    id="pref-org"
                    checked={prefs.favOrganic}
                    onChange={(e) => setPrefs({ ...prefs, favOrganic: e.target.checked })}
                  />
                  <label htmlFor="pref-org">Productos orgánicos</label>
                </div>
                <div className="form-actions">
                  <button className="btn btn-secondary" onClick={onSavePrefs} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar preferencias'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="card">
            <div className="card-header card-header--split">
              <h3><i className="fas fa-box-open"></i> Mis compras</h3>
              <select onChange={(e) => setOrders(filteredOrders(e.target.value))}>
                <option value="todos">Todos</option>
                <option value="pendiente">Pendientes</option>
                <option value="procesando">En proceso</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            <div className="card-body">
              {orders.length === 0 ? (
                <div className="empty">
                  <p>No tienes compras aún.</p>
                  <a className="btn btn-primary" href="/catalogo"><i className="fas fa-store"></i> Ir al catálogo</a>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, idx) => {
                        const st = normalizeStatus(o.status || o.estado);
                        return (
                          <tr key={idx}>
                            <td>#{o.id}</td>
                            <td>{formatDate(o.date || o.fecha)}</td>
                            <td>{(o.items || o.productos || []).length} productos</td>
                            <td>{formatMoney(o.total)}</td>
                            <td><span className={`badge-status ${statusClass(st)}`}>{statusLabel(st)}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="card">
            <div className="card-header card-header--split">
              <h3><i className="fas fa-map-marked-alt"></i> Mis direcciones</h3>
              <button className="btn btn-primary" onClick={onAddAddress}><i className="fas fa-plus"></i> Agregar</button>
            </div>
            <div className="card-body">
              <div className="card-grid">
                {addresses.length === 0 && <div className="empty">No tienes direcciones guardadas.</div>}
                {addresses.map((a) => (
                  <div key={a.id} className="address-card">
                    <h4>{a.alias || 'Dirección'}</h4>
                    <p><strong>Dirección:</strong> {a.direccion || 'N/D'}</p>
                    <p><strong>Comuna:</strong> {a.comuna || 'N/D'}</p>
                    <p><strong>Región:</strong> {a.region || 'N/D'}</p>
                    <p><strong>Teléfono:</strong> {a.telefono || 'N/D'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="card">
            <div className="card-header"><h3><i className="fas fa-heart"></i> Favoritos</h3></div>
            <div className="card-body">
              <div className="product-grid">
                {wishlist.length === 0 && <div className="empty">Tu lista de deseos está vacía.</div>}
                {wishlist.map((p) => (
                  <div key={p.id} className="product-card">
                    <img src={p.image || 'https://via.placeholder.com/300x200?text=Producto'} alt={p.name || 'Producto'} />
                    <h4>{p.name || 'Producto'}</h4>
                    <p>{formatMoney(p.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilCliente;

