import React, { useState, useEffect } from 'react';
import './blog.css';

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState('');
  const postsPerPage = 3;

  // Datos de ejemplo (en un caso real, estos vendrían de una API)
  useEffect(() => {
    const posts = [
      {
        id: 1,
        title: "Cómo cultivar tus propias hierbas en casa",
        excerpt: "Aprende a crear un pequeño huerto de hierbas aromáticas en tu cocina o balcón. Ideal para principiantes.",
        image: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: "Jardinería",
        date: "15 Marzo 2025",
        content: "Contenido completo del artículo..."
      },
      {
        id: 2,
        title: "Beneficios de los productos orgánicos",
        excerpt: "Descubre por qué los productos orgánicos son mejores para tu salud y el medio ambiente.",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: "Salud",
        date: "10 Marzo 2025",
        content: "Contenido completo del artículo..."
      },
      {
        id: 3,
        title: "Receta: Ensalada fresca con productos de temporada",
        excerpt: "Una deliciosa ensalada que aprovecha los productos frescos de esta temporada.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: "Recetas",
        date: "5 Marzo 2025",
        content: "Contenido completo del artículo..."
      },
      {
        id: 4,
        title: "Consejos para compostar en casa",
        excerpt: "Aprende a reducir tus residuos y crear abono natural para tus plantas.",
        image: "https://images.unsplash.com/photo-1589923186203-2e5b80ebfbed?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: "Sostenibilidad",
        date: "28 Febrero 2025",
        content: "Contenido completo del artículo..."
      },
      {
        id: 5,
        title: "La importancia de apoyar a los agricultores locales",
        excerpt: "Cómo tu compra en HuertoHogar ayuda a sostener la agricultura local en Chile.",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: "Comunidad",
        date: "20 Febrero 2025",
        content: "Contenido completo del artículo..."
      },
      {
        id: 6,
        title: "Guía de frutas y verduras de temporada en Chile",
        excerpt: "Descubre qué productos están en su mejor momento durante esta estación.",
        image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: "Consejos",
        date: "15 Febrero 2025",
        content: "Contenido completo del artículo..."
      }
    ];
    
    setBlogPosts(posts);
  }, []);

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`¡Gracias por suscribirte con el email: ${email}!`);
      setEmail('');
    }
  };

  // Calcular posts a mostrar
  const postsToShow = blogPosts.slice(0, currentPage * postsPerPage);
  const hasMorePosts = postsToShow.length < blogPosts.length;

  return (
    <div className="blog">
      <section className="blog-hero">
        <div className="container">
          <h1>Blog HuertoHogar</h1>
          <p>Descubre consejos, recetas y noticias sobre agricultura sostenible y vida saludable</p>
        </div>
      </section>

      <section className="blog-content">
        <div className="container">
          <div className="blog-grid">
            {postsToShow.map(post => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="blog-card-content">
                  <span className="blog-card-category">{post.category}</span>
                  <p className="blog-card-date">{post.date}</p>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <a href="#" className="blog-card-link">Leer más</a>
                </div>
              </article>
            ))}
          </div>
          
          {hasMorePosts && (
            <div className="load-more-container">
              <button onClick={handleLoadMore} className="btn">Cargar Más Artículos</button>
            </div>
          )}
        </div>
      </section>

      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Suscríbete a nuestro Newsletter</h2>
            <p>Recibe consejos, recetas y ofertas exclusivas directamente en tu email</p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                placeholder="Tu email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <button type="submit" className="btn">Suscribirse</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;