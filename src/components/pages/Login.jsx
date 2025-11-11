import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { loginUser } from '../../services/firebase';
import { useUser } from '../../contexts/UserContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { user } = useUser();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      history.push('/');
    }
  }, [user, history]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await loginUser(formData.email, formData.password);
    
    if (result.success) {
      // LoginWrapper se encargará de la redirección según el rol
      // No necesitamos redirigir manualmente aquí
    } else {
      setErrors({ general: result.error });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  // Si ya está autenticado, no mostrar el formulario
  if (user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">
          Ya estás autenticado. Redirigiendo...
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center">Iniciar Sesión</h2>
              
              {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Contraseña:</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-success btn-block"
                  disabled={loading}
                >
                  {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
              
              <p className="text-center mt-3">
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;