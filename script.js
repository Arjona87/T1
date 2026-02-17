// Configuración del mapa
const mapConfig = {
    center: [20.6596, -103.3496],
    zoom: 9,
    minZoom: 7,
    maxZoom: 15
};

// Inicializar el mapa
const map = L.map('map').setView(mapConfig.center, mapConfig.zoom);

// Agregar capa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

let markers = [];
let municipiosLayer = null;

// ID de la hoja de cálculo y rango
const SPREADSHEET_ID = '1x8jI4RYM6nvhydMfxBn68x7shxyEuf_KWNC0iDq8mzw';
const SHEET_NAME = 'Hoja 1';

/**
 * Cargar datos usando la API de Google Sheets
 */
async function loadDataFromSheet() {
    try {
        console.log('Cargando datos...');
        
        // URL de la API pública de Google Sheets (sin autenticación necesaria)
        const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/query?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
        
        const response = await fetch(url);
        const text = await response.text();
        
        // Parsear la respuesta de Google Visualization API
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        
        const pueblos = parseGoogleSheetData(data);
        console.log(`Cargados ${pueblos.length} pueblos`);
        
        pueblos.forEach(pueblo => {
            addMarkerToMap(pueblo);
        });
        
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
        
    } catch (error) {
        console.error('Error:', error);
        // Fallback: cargar datos locales
        loadLocalData();
    }
}

/**
 * Parsear datos de Google Visualization API
 */
function parseGoogleSheetData(data) {
    const pueblos = [];
    
    if (!data.table || !data.table.rows) {
        return pueblos;
    }
    
    // Saltar la primera fila (encabezados)
    for (let i = 0; i < data.table.rows.length; i++) {
        const row = data.table.rows[i];
        const cells = row.c;
        
        if (cells && cells.length >= 8) {
            const pueblo = {
                id: cells[0]?.v || '',
                nombre: cells[1]?.v || '',
                latitud: parseFloat(cells[2]?.v || 0),
                longitud: parseFloat(cells[3]?.v || 0),
                consejos: cells[4]?.v ? String(cells[4].v) : '',
                distancia_tiempo: cells[5]?.v || '',
                ruta: cells[6]?.v || '',
                link: cells[7]?.v || ''
            };
            
            if (!isNaN(pueblo.latitud) && !isNaN(pueblo.longitud) && pueblo.nombre) {
                pueblos.push(pueblo);
            }
        }
    }
    
    return pueblos;
}

/**
 * Datos locales como fallback
 */
function loadLocalData() {
    const pueblos = [
        {
            id: '1',
            nombre: 'Ajijic',
            latitud: 20.305337,
            longitud: -103.262198,
            distancia_tiempo: '1.5 hrs / 60km',
            consejos: 'Disfruta el centro a pie. Mantén tus pertenencias en bolsillos frontales.',
            ruta: 'https://www.waze.com/live-map/directions/ajijic-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/ajijic/'
        },
        {
            id: '2',
            nombre: 'Cocula',
            latitud: 20.658117,
            longitud: -103.269627,
            distancia_tiempo: '2.0 hrs / 90km',
            consejos: 'Respeta el entorno local. Mantén contacto con familiares.',
            ruta: 'https://www.waze.com/live-map/directions/cocula-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/cocula/'
        },
        {
            id: '3',
            nombre: 'Lagos de Moreno',
            latitud: 21.607402,
            longitud: -101.925953,
            distancia_tiempo: '2.2hrs / 190km',
            consejos: 'Explora durante horas de luz. Usa transporte oficial.',
            ruta: 'https://www.waze.com/live-map/directions/lagos-de-moreno-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/lagos-de-moreno/'
        },
        {
            id: '4',
            nombre: 'Mascota',
            latitud: 20.289743,
            longitud: -104.790351,
            distancia_tiempo: '3.2 hrs / 220 km',
            consejos: 'Senderismo con guías certificados. Evita zonas poco iluminadas.',
            ruta: 'https://www.waze.com/live-map/directions/mascota-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/mascota/'
        },
        {
            id: '5',
            nombre: 'Mazamitla',
            latitud: 19.179625,
            longitud: -103.019921,
            distancia_tiempo: '2.4hrs / 170km',
            consejos: 'Clima frío. Lleva abrigo. Respeta la naturaleza local.',
            ruta: 'https://www.waze.com/live-map/directions/mazamitla-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/mazamitla/'
        },
        {
            id: '6',
            nombre: 'San Sebastián del Oeste',
            latitud: 20.616408,
            longitud: -104.852881,
            distancia_tiempo: '4.4hrs / 250km',
            consejos: 'Caminos sinuosos. Maneja con precaución. Lleva agua.',
            ruta: 'https://www.waze.com/live-map/directions/san-sebastian-del-oeste-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/san-sebastian-del-oeste/'
        },
        {
            id: '7',
            nombre: 'Sayula',
            latitud: 19.796661,
            longitud: -103.598472,
            distancia_tiempo: '2.1 hrs / 150km',
            consejos: 'Pueblo tranquilo. Respeta las tradiciones locales.',
            ruta: 'https://www.waze.com/live-map/directions/sayula-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/sayula/'
        },
        {
            id: '8',
            nombre: 'Talpa de Allende',
            latitud: 20.783058,
            longitud: -104.819555,
            distancia_tiempo: '3.2 hrs / 200km',
            consejos: 'Sitio religioso importante. Respeta los espacios sagrados.',
            ruta: 'https://www.waze.com/live-map/directions/talpa-de-allende-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/talpa-de-allende/'
        },
        {
            id: '9',
            nombre: 'Tapalpa',
            latitud: 19.458624,
            longitud: -103.759173,
            distancia_tiempo: '2.5 hrs / 170km',
            consejos: 'Clima frío en las noches. Lleva abrigo. Disfruta la gastronomía local.',
            ruta: 'https://www.waze.com/live-map/directions/tapalpa-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/tapalpa/'
        },
        {
            id: '10',
            nombre: 'Temacapulín',
            latitud: 21.188262,
            longitud: -102.706869,
            distancia_tiempo: '2.0 hrs / 135km',
            consejos: 'Pueblo pequeño y tranquilo. Ideal para descansar.',
            ruta: 'https://www.waze.com/live-map/directions/temacapulin-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/temacapulin/'
        },
        {
            id: '11',
            nombre: 'Tequila',
            latitud: 20.816072,
            longitud: -103.832902,
            distancia_tiempo: '1.1hrs / 66km',
            consejos: 'Catas de tequila. Conoce tu límite. Manténte hidratado.',
            ruta: 'https://www.waze.com/live-map/directions/tequila-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/tequila-jalisco/'
        },
        {
            id: '12',
            nombre: 'Tlaquepaque',
            latitud: 20.396534,
            longitud: -103.311907,
            distancia_tiempo: '30 min / 14 km',
            consejos: 'Centro muy caminable. Mantén tus pertenencias seguras.',
            ruta: 'https://www.waze.com/live-map/directions/tlaquepaque-jal.-mx',
            link: 'https://pueblosmagicos.mexicodesconocido.com.mx/jalisco/tlaquepaque-jalisco/'
        }
    ];
    
    pueblos.forEach(pueblo => {
        addMarkerToMap(pueblo);
    });
    
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

/**
 * Cargar el GeoJSON de municipios
 */
function loadMunicipios() {
    fetch('jalisco_municipios.geojson')
        .then(response => response.json())
        .then(data => {
            municipiosLayer = L.geoJSON(data, {
                style: {
                    fillColor: '#E8E8E8',
                    weight: 2,
                    opacity: 1,
                    color: '#888888',
                    fillOpacity: 0.5
                },
                onEachFeature: function(feature, layer) {
                    // No agregar pop-ups a los municipios
                }
            }).addTo(map);
            
            // Enviar municipios al fondo
            municipiosLayer.bringToBack();
        })
        .catch(error => console.error('Error cargando GeoJSON:', error));
}

/**
 * Agregar marcador al mapa
 */
function addMarkerToMap(pueblo) {
    const customIcon = L.icon({
        iconUrl: 'icon.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        className: 'custom-marker'
    });
    
    const marker = L.marker([pueblo.latitud, pueblo.longitud], {
        icon: customIcon,
        title: pueblo.nombre
    }).addTo(map);
    
    const popupHTML = createPopupContent(pueblo);
    
    marker.bindPopup(popupHTML, {
        maxWidth: 450,
        className: 'custom-popup'
    });
    
    marker.on('click', function() {
        this.openPopup();
    });
    
    markers.push(marker);
}

/**
 * Crear contenido del pop-up
 */
function createPopupContent(pueblo) {
    const html = `
        <div class="popup-content">
            <div class="popup-title">${pueblo.nombre}</div>
            
            <div class="popup-info">
                <span class="popup-label">Desde Guadalajara:</span>
                <span class="popup-value">${pueblo.distancia_tiempo}</span>
            </div>
            
            <div class="popup-info">
                <span class="popup-label">🛡️ Consejos de Seguridad:</span>
                <span class="popup-value">${pueblo.consejos}</span>
            </div>
            
            <div class="popup-link">
                ${pueblo.ruta ? `<a href="${pueblo.ruta}" target="_blank" rel="noopener noreferrer">🗺️ Ruta desde Guadalajara</a><br>` : ''}
                ${pueblo.link ? `<a href="${pueblo.link}" target="_blank" rel="noopener noreferrer">ℹ️ Información Turística</a>` : ''}
            </div>
        </div>
    `;
    
    return html;
}

// Cargar municipios y datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadMunicipios();
    loadDataFromSheet();
});
