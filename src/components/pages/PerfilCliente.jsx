import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { updateUserProfile } from '../../services/firebase';

const PerfilCliente = () => {
  const { user, userProfile, updateUserProfileData } = useUser();
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!user) {
      history.push('/login');
    }
  }, [user, history]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateUserProfile(user.uid, formData);
    
    if (result.success) {
      updateUserProfileData(formData);
      setMessage('Perfil actualizado correctamente');
    } else {
      setMessage('Error: ' + result.error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Redirigiendo al login...
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Mi Perfil</h2>
              
              {message && (
                <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre Completo:</label>
                  <input
                    type="text"
                    name="displayName"
                    className="form-control"
                    value={formData.displayName}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Dirección:</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilCliente;