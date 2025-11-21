// Datos de ejemplo para el blog (en un caso real, estos datos podrían venir de una API)
const blogPosts = [
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

// Variables para controlar la paginación
let currentPage = 1;
const postsPerPage = 3;

// Función para renderizar los artículos del blog
function renderBlogPosts() {
    const blogGrid = document.getElementById('blog-grid');
    
    if (blogGrid) {
        // Calcular qué posts mostrar
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const postsToShow = blogPosts.slice(0, endIndex);
        
        blogGrid.innerHTML = '';
        
        postsToShow.forEach(post => {
            const blogCard = document.createElement('article');
            blogCard.className = 'blog-card';
            
            blogCard.innerHTML = `
                <div class="blog-card-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <div class="blog-card-content">
                    <span class="blog-card-category">${post.category}</span>
                    <p class="blog-card-date">${post.date}</p>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <a href="#" class="blog-card-link" data-id="${post.id}">Leer más</a>
                </div>
            `;
            
            blogGrid.appendChild(blogCard);
        });
        
        // Mostrar u ocultar el botón "Cargar más"
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            if (endIndex >= blogPosts.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }
}

// Función para manejar el formulario del newsletter
function handleNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                // Aquí normalmente enviarías el email a tu servidor
                alert(`¡Gracias por suscribirte con el email: ${email}!`);
                emailInput.value = '';
            }
        });
    }
}

// Función para manejar el botón "Cargar más"
function handleLoadMore() {
    const loadMoreBtn = document.getElementById('load-more');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            renderBlogPosts();
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    renderBlogPosts();
    handleNewsletterForm();
    handleLoadMore();
    
    // Aquí podrías agregar más funcionalidades, como filtros por categoría, etc.
});