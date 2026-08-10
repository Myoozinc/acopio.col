// ============================================
// DATOS VERIFICADOS - SISMO COLOMBIA 10 AGOSTO 2026
// Fuentes: SGC, USGS, UNGRD, Cruz Roja Colombiana, Medios Oficiales & Reportes Comunitarios
// ============================================

const DATA_KEY = 'earthquake_data_v2026_colombia_v3';

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
        { id: 'zone1', name: 'Pereira', department: 'Risaralda', lat: 4.8133, lng: -75.6961, severity: 'critical', radius: 22000, details: 'Reportes de víctimas mortales y heridos. Afectaciones en edificaciones y suspensión preventiva de operaciones en Aeropuerto Matecaña.' },
        { id: 'zone2', name: 'Manizales', department: 'Caldas', lat: 5.0689, lng: -75.5174, severity: 'severe', radius: 18000, details: 'Fallecidos confirmados por autoridades locales. Daños en estructura de la Catedral Basílica y suspensión en Aeropuerto La Nubia.' },
        { id: 'zone3', name: 'Armenia', department: 'Quindío', lat: 4.5339, lng: -75.6811, severity: 'severe', radius: 16000, details: 'Daños estructurales en edificaciones. Operaciones en Aeropuerto El Edén suspendidas por revisión técnica.' },
        { id: 'zone4', name: 'Cali', department: 'Valle del Cauca', lat: 3.4516, lng: -76.5320, severity: 'critical', radius: 28000, details: 'Más de 20 estructuras colapsadas reportadas. Puestos de respuesta activados por la Alcaldía y solicitud de apoyo nacional.' },
        { id: 'zone5', name: 'Quibdó', department: 'Chocó', lat: 5.6944, lng: -76.6583, severity: 'critical', radius: 24000, details: 'Cercano al epicentro. Gobernación reporta heridos y daños estructurales. Aeropuerto El Caraño suspendido.' },
        { id: 'zone6', name: 'Cartago', department: 'Valle del Cauca', lat: 4.7461, lng: -75.9119, severity: 'moderate', radius: 12000, details: 'Operaciones suspendidas en Aeropuerto Santa Ana. Evaluaciones de seguridad por Gestión del Riesgo.' },
        { id: 'zone7', name: 'Buenaventura', department: 'Valle del Cauca', lat: 3.8801, lng: -77.0311, severity: 'moderate', radius: 15000, details: 'Suspensión preventiva de vuelos en Aeropuerto Gerardo Tobar López. Inspecciones en zona portuaria.' },
        { id: 'zone8', name: 'San José del Palmar', department: 'Chocó', lat: 5.3833, lng: -76.2333, severity: 'critical', radius: 35000, details: 'EPICENTRO DEL SISMO (Mag. 7.4). Zona rural con despliegue prioritario de equipos de rescate.' }
    ],

    // CENTROS DE ACOPIO VERIFICADOS Y REGISTRADOS
    collectionCenters: [
        {
            id: 'acop_cali_luzmery',
            name: 'Centro Deportivo Luz Mery Tristán',
            address: 'Autopista Cali-Jamundí # 120-00, Cali, Valle del Cauca',
            city: 'Cali',
            lat: 3.3556,
            lng: -76.5385,
            type: 'collection',
            contactName: 'Luz Elena Restrepo (Gestión Social)',
            contact: '315 489 2011',
            needs: 'Agua potable, víveres, guantes de carnaza, seguetas, alcohol y mantas de abrigo.',
            schedule: '8:00 AM - 8:00 PM',
            verified: true,
            dateAdded: '10/08/2026, 08:30:00'
        },
        {
            id: 'acop_cali_jairo_varela',
            name: 'Plazoleta Jairo Varela',
            address: 'Av. 2 Nte. # 10-01, Granada, Cali, Valle del Cauca',
            city: 'Cali',
            lat: 3.4542,
            lng: -76.5348,
            type: 'collection',
            contactName: 'Andrés Felipe Caicedo (Puesto de Mando Unificado)',
            contact: '310 523 9811',
            needs: 'Guantes de construcción, cascos de protección, agua potable, colchonetas y gafas de seguridad.',
            schedule: 'Abierto 24 Horas',
            verified: true,
            dateAdded: '10/08/2026, 09:15:00'
        },
        {
            id: 'acop_medellin_eafit',
            name: 'Universidad EAFIT - Bloque 29, Piso 5',
            address: 'Cra 49 # 7 Sur-50, El Poblado, Medellín, Antioquia',
            city: 'Medellín',
            lat: 6.2007,
            lng: -75.5784,
            type: 'collection',
            contactName: 'Voluntariado @CAS_OE',
            contact: '+57 322 849 1960',
            needs: 'Medicamentos, alimentos no perecederos, agua potable, ropa en buen estado y elementos de primeros auxilios.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '10/08/2026, 09:40:00'
        },
        {
            id: 'acop_barranquilla_sec',
            name: 'Centro de Acopio Sector Barranquillita',
            address: 'Carrera 43 # 6-120, Sector Barranquillita, Barranquilla, Atlántico',
            city: 'Barranquilla',
            lat: 10.9785,
            lng: -74.7758,
            type: 'collection',
            contactName: 'Defensa Civil Distrital Barranquilla',
            contact: '300 654 1120',
            needs: 'Alimentos no perecederos, agua potable, elementos de aseo personal y colchonetas.',
            schedule: 'Abierto 24 horas (según disposición distrital)',
            verified: true,
            dateAdded: '10/08/2026, 10:10:00'
        },
        {
            id: 'acop_armenia_banco',
            name: 'Banco de Alimentos Monseñor Roberto López Londoño',
            address: 'Cra. 19 # 50-00, Armenia, Quindío',
            city: 'Armenia',
            lat: 4.5268,
            lng: -75.6892,
            type: 'collection',
            contactName: 'Padre José Manuel Ortiz',
            contact: '312 876 5432',
            needs: 'Granos, enlatados, agua embotellada, cobijas y kits de primeros auxilios.',
            schedule: '7:00 AM - 5:00 PM',
            verified: true,
            dateAdded: '10/08/2026, 10:45:00'
        },
        {
            id: 'acop_manizales_banco',
            name: 'Banco de Alimentos de Manizales',
            address: 'Calle 24 # 22-02, Centro, Manizales, Caldas',
            city: 'Manizales',
            lat: 5.0678,
            lng: -75.5189,
            type: 'collection',
            contactName: 'Gladys Ramírez (Coordinación de Acopio)',
            contact: '311 345 6789',
            needs: 'Agua embotellada, frazadas, leche en polvo, pañales y medicamentos básicos.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '10/08/2026, 11:20:00'
        }
    ],

    // REFUGIOS Y ALBERGUES TEMPORALES VERIFICADOS
    shelters: [
        {
            id: 'shelter_manizales_coliseo',
            name: 'Albergue Temporal Coliseo Mayor de Manizales',
            address: 'Av. Lindsay, Sector Universitario, Manizales, Caldas',
            city: 'Manizales',
            lat: 5.0624,
            lng: -75.4965,
            type: 'shelter',
            capacity: 350,
            occupancy: 140,
            contactName: 'Gestión del Riesgo Caldas / Cruz Roja',
            contact: '314 567 8901',
            needs: 'Alojamiento temporal habilitado para familias vulnerables y evacuadas por sismo.',
            verified: true,
            dateAdded: '10/08/2026, 08:00:00'
        }
    ],

    emergencyRequests: [],

    hospitals: [
        { id: 'h1', name: 'Hospital Universitario San Jorge', city: 'Pereira', department: 'Risaralda', lat: 4.8080, lng: -75.7020, status: 'overwhelmed', phone: 'Línea 123 (Urgencias Pereira)', type: 'hospital' },
        { id: 'h2', name: 'SES Hospital de Caldas', city: 'Manizales', department: 'Caldas', lat: 5.0600, lng: -75.5100, status: 'damaged', phone: 'Línea 123 (Urgencias Manizales)', type: 'hospital' },
        { id: 'h3', name: 'Hospital San Juan de Dios', city: 'Armenia', department: 'Quindío', lat: 4.5500, lng: -75.6600, status: 'overwhelmed', phone: 'Línea 123 (Urgencias Armenia)', type: 'hospital' },
        { id: 'h4', name: 'Hospital Universitario del Valle (HUV)', city: 'Cali', department: 'Valle del Cauca', lat: 3.4250, lng: -76.5450, status: 'overwhelmed', phone: 'Línea 123 (Urgencias Cali)', type: 'hospital' },
        { id: 'h5', name: 'Hospital San Francisco de Asís', city: 'Quibdó', department: 'Chocó', lat: 5.6950, lng: -76.6620, status: 'damaged', phone: 'Línea 123 (Urgencias Quibdó)', type: 'hospital' },
        { id: 'h6', name: 'Hospital Departamental de Buenaventura', city: 'Buenaventura', department: 'Valle del Cauca', lat: 3.8830, lng: -77.0270, status: 'damaged', phone: 'Línea 123 (Urgencias Buenaventura)', type: 'hospital' }
    ],

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

// Guardar datos iniciales con la clave v3
try {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
} catch(e) {
    console.warn('Error inicializando datos locales:', e);
}
