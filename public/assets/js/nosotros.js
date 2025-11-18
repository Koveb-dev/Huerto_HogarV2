// Datos de ubicaciones de HuertoHogar
const locations = [
    { name: 'Santiago', customers: 12500 },
    { name: 'Puerto Montt', customers: 3200 },
    { name: 'Villarica', customers: 1800 },
    { name: 'Nacimiento', customers: 1500 },
    { name: 'Viña del Mar', customers: 4500 },
    { name: 'Valparaíso', customers: 3800 },
    { name: 'Concepción', customers: 5200 }
];

// Función para generar la lista de ubicaciones
function generateLocationsList() {
    const locationsList = document.getElementById('locations-list');
    
    if (locationsList) {
        locationsList.innerHTML = '';
        
        locations.forEach(location => {
            const locationItem = document.createElement('div');
            locationItem.className = 'location-item';
            
            locationItem.innerHTML = `
                <h4>${location.name}</h4>
                <p>${location.customers.toLocaleString()} clientes satisfechos</p>
            `;
            
            locationsList.appendChild(locationItem);
        });
    }
}

// Función para crear un mapa visual simple (sin usar APIs externas)
function createVisualMap() {
    const mapContainer = document.getElementById('locations-map');
    
    if (mapContainer) {
        // Crear un mapa visual simple con elementos div
        const visualMap = document.createElement('div');
        visualMap.className = 'visual-map';
        
        // Crear puntos para cada ubicación
        locations.forEach((location, index) => {
            const point = document.createElement('div');
            point.className = 'map-point';
            point.style.left = `${10 + (index * 13)}%`;
            point.style.top = `${30 + Math.random() * 40}%`;
            point.innerHTML = `<span>${location.name}</span>`;
            visualMap.appendChild(point);
        });
        
        mapContainer.appendChild(visualMap);
    }
}

// Función para animar elementos al hacer scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.mission, .vision, .value-item, .location-item');
    
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
    generateLocationsList();
    createVisualMap();
    animateOnScroll();
});