import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Ofertas.css';

const Ofertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const snap = await getDocs(collection(db, 'ofertas'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOfertas(list);
      } catch (e) {
        console.error('Error cargando ofertas', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOfertas();
  }, []);

  const categorias = useMemo(() => {
    const set = new Set();
    ofertas.forEach(o => o.categoria && set.add(o.categoria));
    return Array.from(set);
  }, [ofertas]);

  const filtradas = useMemo(() => {
    if (!categoria) return ofertas;
    return ofertas.filter(o => o.categoria === categoria);
  }, [categoria, ofertas]);

  return (
    <div className="ofertas-page">
      <section className="ofertas-hero">
        <p className="eyebrow">Ofertas activas</p>
        <h1>Promociones especiales</h1>
        <p className="hero-subtitle">Ahorra con los mejores descuentos de HuertoHogar.</p>
      </section>

      <section className="filtros-bar">
        <select value={categoria} onChange={e => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="badge-oferta">
          {filtradas.length} producto{filtradas.length !== 1 ? 's' : ''}
        </span>
      </section>

      <section className="ofertas-grid">
        {loading && <div className="placeholder">Cargando ofertas...</div>}
        {!loading && !filtradas.length && (
          <div className="empty">Sin ofertas disponibles</div>
        )}
        {!loading && filtradas.map(o => {
          const precio = Number(o.precio) || 0;
          const precioOferta = Number(o.precioOferta || o.precio_oferta) || null;
          const descuento = precioOferta ? Math.round((1 - precioOferta / precio) * 100) : (o.descuento || 0);
          const precioFinal = precioOferta || (precio && descuento ? precio * (1 - descuento / 100) : precio);
          return (
            <article className="oferta-card" key={o.id}>
              <img
                className="oferta-img"
                src={o.imagen || 'https://via.placeholder.com/400x300?text=Oferta'}
                alt={o.nombre || 'Producto en oferta'}
              />
              <div className="oferta-nombre">{o.nombre || 'Producto en oferta'}</div>
              <div className="oferta-categoria">{o.categoria || 'Sin categoría'}</div>
              <div>
                {precio ? <div className="precio-regular">${precio.toFixed(2)}</div> : null}
                <div className="precio-oferta">${precioFinal.toFixed(2)}</div>
              </div>
              <div className="badge-descuento">
                {descuento ? `-${descuento}%` : 'Oferta'}
              </div>
              <div className="oferta-footer">
                <span className="stock">{(o.stock ?? 'N/D')} en stock</span>
                <button className="btn-add" onClick={() => alert('Agregar al carrito (pendiente)')}>
                  <i className="bi bi-cart-plus"></i> Agregar
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default Ofertas;

