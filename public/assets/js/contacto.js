// Función para manejar el formulario de contacto
function handleContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los valores del formulario
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Validación básica
            if (!name || !email || !subject || !message) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }
            
            // Validación de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, ingresa un correo electrónico válido.');
                return;
            }
            
            // Simular envío del formulario (en un caso real, aquí se enviaría a un servidor)
            console.log('Datos del formulario:', {
                name,
                email,
                phone,
                subject,
                message
            });
            
            // Mostrar mensaje de éxito
            alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
            
            // Limpiar el formulario
            contactForm.reset();
        });
    }
}

// Función para inicializar el mapa (puedes integrar Google Maps aquí)
function initMap() {
    // En un caso real, aquí inicializarías Google Maps
    // Por ahora, solo un placeholder
    console.log('Mapa inicializado');
}

// Función para animar elementos al hacer scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.location-card, .faq-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    handleContactForm();
    initMap();
    animateOnScroll();
});