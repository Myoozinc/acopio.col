// ============================================
// DATOS VERIFICADOS - SISMO COLOMBIA 10 AGOSTO 2026
// Fuentes: SGC, USGS, UNGRD, Cruz Roja Colombiana, Medios Oficiales
// ============================================

const initialData = {
    epicenter: {
        name: "San José del Palmar, Chocó",
        lat: 5.3833,
        lng: -76.2333,
        magnitude: 7.4,
        time: "07:34 AM (hora local)",
        depth: "107 km",
        date: "10 de Agosto de 2026",
        source: "Servicio Geológico Colombiano (SGC) / USGS"
    },

    affectedZones: [
        { id: 'zone1', name: 'Pereira', department: 'Risaralda', lat: 4.8133, lng: -75.6961, severity: 'critical', radius: 15000, details: 'Reportes de víctimas mortales y heridos. Afectaciones en edificaciones y suspensión preventiva de operaciones en Aeropuerto Matecaña.' },
        { id: 'zone2', name: 'Manizales', department: 'Caldas', lat: 5.0689, lng: -75.5174, severity: 'severe', radius: 12000, details: 'Fallecidos confirmados por autoridades locales. Daños en estructura de la Catedral Basílica y suspensión en Aeropuerto La Nubia.' },
        { id: 'zone3', name: 'Armenia', department: 'Quindío', lat: 4.5339, lng: -75.6811, severity: 'severe', radius: 10000, details: 'Daños estructurales en edificaciones. Operaciones en Aeropuerto El Edén suspendidas por revisión técnica.' },
        { id: 'zone4', name: 'Cali', department: 'Valle del Cauca', lat: 3.4516, lng: -76.5320, severity: 'critical', radius: 22000, details: 'Más de 20 estructuras colapsadas reportadas. Puestos de respuesta activados por la Alcaldía y solicitud de apoyo nacional.' },
        { id: 'zone5', name: 'Quibdó', department: 'Chocó', lat: 5.6944, lng: -76.6583, severity: 'critical', radius: 18000, details: 'Cercano al epicentro. Gobernación reporta heridos y daños estructurales. Aeropuerto El Caraño suspendido.' },
        { id: 'zone6', name: 'Cartago', department: 'Valle del Cauca', lat: 4.7461, lng: -75.9119, severity: 'moderate', radius: 8000, details: 'Operaciones suspendidas en Aeropuerto Santa Ana. Evaluaciones de seguridad por Gestión del Riesgo.' },
        { id: 'zone7', name: 'Buenaventura', department: 'Valle del Cauca', lat: 3.8801, lng: -77.0311, severity: 'moderate', radius: 10000, details: 'Suspensión preventiva de vuelos en Aeropuerto Gerardo Tobar López. Inspecciones en zona portuaria.' },
        { id: 'zone8', name: 'San José del Palmar', department: 'Chocó', lat: 5.3833, lng: -76.2333, severity: 'critical', radius: 25000, details: 'EPICENTRO DEL SISMO (Mag. 7.4). Zona rural con despliegue prioritario de equipos de rescate.' }
    ],

    // Puntos colaborativos añadidos por la comunidad / autoridades (inician limpios para asegurar veracidad)
    collectionCenters: [],
    shelters: [],

    // Hospitales de referencia pública en las ciudades más afectadas
    hospitals: [
        { id: 'h1', name: 'Hospital Universitario San Jorge', city: 'Pereira', department: 'Risaralda', lat: 4.8080, lng: -75.7020, status: 'overwhelmed', phone: 'Línea 123 (Urgencias Pereira)', type: 'hospital' },
        { id: 'h2', name: 'SES Hospital de Caldas', city: 'Manizales', department: 'Caldas', lat: 5.0600, lng: -75.5100, status: 'damaged', phone: 'Línea 123 (Urgencias Manizales)', type: 'hospital' },
        { id: 'h3', name: 'Hospital San Juan de Dios', city: 'Armenia', department: 'Quindío', lat: 4.5500, lng: -75.6600, status: 'overwhelmed', phone: 'Línea 123 (Urgencias Armenia)', type: 'hospital' },
        { id: 'h4', name: 'Hospital Universitario del Valle (HUV)', city: 'Cali', department: 'Valle del Cauca', lat: 3.4250, lng: -76.5450, status: 'overwhelmed', phone: 'Línea 123 (Urgencias Cali)', type: 'hospital' },
        { id: 'h5', name: 'Hospital San Francisco de Asís', city: 'Quibdó', department: 'Chocó', lat: 5.6950, lng: -76.6620, status: 'damaged', phone: 'Línea 123 (Urgencias Quibdó)', type: 'hospital' },
        { id: 'h6', name: 'Hospital Departamental de Buenaventura', city: 'Buenaventura', department: 'Valle del Cauca', lat: 3.8830, lng: -77.0270, status: 'damaged', phone: 'Línea 123 (Urgencias Buenaventura)', type: 'hospital' }
    ],

    // Canales de donación oficiales e institucionales
    donations: [
        { 
            name: 'Cruz Roja Colombiana', 
            description: 'Institución oficial humanitaria. Aportes recibidos en dinero para canalizar recursos de forma rápida en la zona afectada.', 
            website: 'https://ayuda.cruzrojacolombiana.org', 
            account: 'Cuenta Corriente Davivienda No. 0560455069996490 (Sociedad Nacional de la Cruz Roja Colombiana)', 
            type: 'national',
            officialPhone: 'WhatsApp Oficial: +57 321 213 9525 / Tel: (601) 4376300'
        },
        { 
            name: 'UNGRD - Unidad Nacional para la Gestión del Riesgo', 
            description: 'Coordinación gubernamental de respuesta del Sistema Nacional de Gestión del Riesgo.', 
            website: 'https://portal.gestiondelriesgo.gov.co/', 
            account: 'Línea Gratuita Nacional: 01-8000-113200 / PBX (+57) 601 5529696', 
            type: 'national',
            officialPhone: '01-8000-113200 / contactenos@gestiondelriesgo.gov.co'
        },
        { 
            name: 'Convoy of Hope', 
            description: 'Organización internacional humanitaria activada para respuesta al desastre sismico en Colombia.', 
            website: 'https://www.convoyofhope.org/', 
            account: 'Donaciones verificadas a través de su portal oficial', 
            type: 'international'
        },
        { 
            name: 'UNICEF Colombia', 
            description: 'Protección infantil, provisión de agua potable y kits de higiene para emergencias.', 
            website: 'https://www.unicef.org/colombia/', 
            account: 'Donación directa en su plataforma oficial en Colombia', 
            type: 'international'
        },
        { 
            name: 'International Rescue Committee (IRC)', 
            description: 'Asistencia de salud, protección y respuesta a poblaciones vulnerables.', 
            website: 'https://www.rescue.org/', 
            account: 'Donaciones en línea mediante el sitio oficial de la organización', 
            type: 'international'
        },
        { 
            name: 'ACNUR / UNHCR Colombia', 
            description: 'Suministros de emergencia y apoyo a familias en situación de vulnerabilidad o desplazamiento.', 
            website: 'https://www.acnur.org/colombia', 
            account: 'Donaciones en línea en sitio oficial institucional', 
            type: 'international'
        }
    ],

    emergencyContacts: {
        national: [
            { name: 'Línea Única de Emergencias', number: '123', icon: '🚨' },
            { name: 'Bomberos Colombia', number: '119', icon: '🚒' },
            { name: 'Cruz Roja Colombiana', number: '132', icon: '❤️' },
            { name: 'Defensa Civil Colombiana', number: '144', icon: '🛡️' },
            { name: 'Ambulancias / Urgencias Médicas', number: '125', icon: '🚑' },
            { name: 'UNGRD (Línea Nacional)', number: '01-8000-113200', icon: '📞' }
        ],
        tips: [
            'NO ingrese a edificaciones que presenten grietas o fallas estructurales.',
            'Privilegie los mensajes de texto o chat antes que las llamadas de voz para evitar colapsar la red celular.',
            'Tenga a la mano la mochila de emergencia: agua potable, radio a pilas, linterna, botiquín e identificaciones.',
            'Siga únicamente la información de organismos oficiales (SGC, UNGRD, Cruz Roja). No difunda rumores.',
            'Ante olor a gas, cierre la llave general de inmediato y no accione interruptores de luz.',
            'Facilite el paso de vehículos de rescate y ambulancias en las vías públicas.',
            'En caso de emergencias vitales o rescate urgente, llame inmediatamente al 123.'
        ]
    },

    missingPersons: []
};

// Reinicializar con datos 100% verificados sin registros inventados
localStorage.removeItem('earthquake_data');
localStorage.setItem('earthquake_data', JSON.stringify(initialData));
