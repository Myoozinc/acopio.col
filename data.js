// ============================================
// DATOS VERIFICADOS - SISMO COLOMBIA 10 AGOSTO 2026
// Fuentes: SGC, USGS, UNGRD, Cruz Roja Colombiana, Medios Oficiales & Reportes Comunitarios
// ============================================

const DATA_KEY = 'earthquake_data_v2026_colombia_v5';

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
            id: 'acop_cali_banco',
            name: 'Banco de Alimentos de Cali',
            address: 'Calle 24 # 6-103, Cali, Valle del Cauca',
            city: 'Cali',
            lat: 3.4560,
            lng: -76.5230,
            type: 'collection',
            contactName: 'Banco de Alimentos Cali',
            contact: '(602) 889 1234',
            needs: 'Alimentos no perecederos, agua embotellada, medicinas, kits de aseo personal y elementos para bebés.',
            schedule: '8:00 AM - 5:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
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
            id: 'acop_medellin_banco',
            name: 'Fundación Arquidiocesana Banco de Alimentos de Medellín',
            address: 'Carrera 52 # 30A-97, Barrio Guayabal, Medellín, Antioquia',
            city: 'Medellín',
            lat: 6.2285,
            lng: -75.5780,
            type: 'collection',
            contactName: 'Banco de Alimentos de Medellín',
            contact: '(604) 341 4141',
            needs: 'Alimentos no perecederos, agua potable, medicinas, kits de aseo personal, ropa en buen estado y elementos para bebés.',
            schedule: '8:00 AM - 5:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_medellin_saciar',
            name: 'Fundación Saciar - Barrio Belén',
            address: 'Carrera 50 # 25-261, Barrio Belén, Medellín, Antioquia',
            city: 'Medellín',
            lat: 6.2270,
            lng: -75.5840,
            type: 'collection',
            contactName: 'Fundación Saciar',
            contact: '(604) 444 7171',
            needs: 'Alimentos no perecederos, agua potable, elementos de higiene, cobijas y ropa en buen estado.',
            schedule: '8:00 AM - 5:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_samusur',
            name: 'Samu Sur - Centro de Acopio',
            address: 'Avenida Carrera 68 # 31-41 sur, Bogotá',
            city: 'Bogotá',
            lat: 4.5950,
            lng: -74.1350,
            type: 'collection',
            contactName: 'Secretaría de Salud / Red Samu Sur',
            contact: 'Línea 123 / Samu Sur',
            needs: 'Alimentos no perecederos, agua potable, medicinas, kits de aseo personal, ropa en buen estado y elementos para bebés.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_samunorte',
            name: 'Samu Norte - Centro de Acopio',
            address: 'Calle 134 - Carrera 7B Bis # 132-31, Bogotá',
            city: 'Bogotá',
            lat: 4.7088,
            lng: -74.0305,
            type: 'collection',
            contactName: 'Secretaría de Salud / Red Samu Norte',
            contact: 'Línea 123 / Samu Norte',
            needs: 'Alimentos no perecederos, agua potable, medicinas, kits de aseo personal, ropa en buen estado y elementos para bebés.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_salvamento',
            name: 'Centro de Salvamento Acuático',
            address: 'Avenida La Esmeralda # 63-81, Bogotá',
            city: 'Bogotá',
            lat: 4.6595,
            lng: -74.0880,
            type: 'collection',
            contactName: 'Defensa Civil / Salvamento Acuático',
            contact: 'Línea 144 / Red Bogotá',
            needs: 'Alimentos no perecederos, agua, medicinas, kits de aseo personal, ropa en buen estado y elementos para bebés.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_cruzroja_admin',
            name: 'Cruz Roja Colombiana - Sede Administrativa',
            address: 'Carrera 24 # 73-38, Bogotá',
            city: 'Bogotá',
            lat: 4.6635,
            lng: -74.0675,
            type: 'collection',
            contactName: 'Cruz Roja Colombiana Cundinamarca/Bogotá',
            contact: '(601) 4376300',
            needs: 'Alimentos no perecederos, agua potable, medicamentos, kits de aseo personal, ropa en buen estado y elementos para bebés.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_cruzroja_bodega',
            name: 'Bodega Cruz Roja Colombiana',
            address: 'Diagonal 79B # 62-53, Bogotá',
            city: 'Bogotá',
            lat: 4.6780,
            lng: -74.0820,
            type: 'collection',
            contactName: 'Logística Cruz Roja Colombiana',
            contact: '(601) 4376300',
            needs: 'Alimentos no perecederos, agua embotellada, medicamentos, kits de higiene y cobijas.',
            schedule: '8:00 AM - 5:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_palacio_deportes',
            name: 'Palacio de los Deportes',
            address: 'Calle 63 # 59A-06, Bogotá',
            city: 'Bogotá',
            lat: 4.6575,
            lng: -74.0865,
            type: 'collection',
            contactName: 'IDRD / Gestión del Riesgo Bogotá',
            contact: 'Línea 123',
            needs: 'Alimentos no perecederos, agua potable, frazadas, insumos médicos y elementos para bebés.',
            schedule: '7:00 AM - 7:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_jardin_origen',
            name: 'Casa Jardín Origen (Ayuda para Chocó)',
            address: 'Calle 38 # 29-29, Barrio Teusaquillo, Bogotá',
            city: 'Bogotá',
            lat: 4.6290,
            lng: -74.0805,
            type: 'collection',
            contactName: 'Colectivo Jardín Origen (@jackemaldonado_)',
            contact: 'Instagram @jackemaldonado_',
            needs: 'Agua potable, alimentos no perecederos, elementos de aseo personal, cobijas y medicinas destinadas al Chocó.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_human_construction',
            name: 'Human Construction (Ayuda para Chocó)',
            address: 'Carrera 52A # 134D-23 Local 1, Bogotá',
            city: 'Bogotá',
            lat: 4.7215,
            lng: -74.0550,
            type: 'collection',
            contactName: 'Human Construction',
            contact: 'Local 1 - Recepción de Acopio',
            needs: 'Agua, alimentos no perecederos, elementos de aseo, cobijas y medicinas destinadas al Chocó.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_catalina_munoz',
            name: 'Fundación Catalina Muñoz (Ayuda para Chocó)',
            address: 'Diagonal 48 # 19-16, Bogotá',
            city: 'Bogotá',
            lat: 4.6360,
            lng: -74.0710,
            type: 'collection',
            contactName: 'Fundación Catalina Muñoz',
            contact: 'Sede Teusaquillo',
            needs: 'Agua, alimentos no perecederos, elementos de aseo, cobijas y medicinas destinadas al Chocó.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
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
        },
        {
            id: 'acop_doral_gem',
            name: 'Global Empowerment Mission (GEM) - Drop-Off Doral',
            address: '1850 NW 84th Ave #100, Doral, FL 33126, EE.UU.',
            city: 'Doral (Florida, EE.UU.)',
            lat: 25.7925,
            lng: -80.3328,
            type: 'collection',
            contactName: 'Global Empowerment Mission (GEM) Team',
            contact: 'info@gem.org / gem.org/volunteer',
            needs: 'Refugio (carpas, sleeping bags, catres, colchones, cobijas, guantes/botas trabajo, mascarillas KN95, linternas solares, power banks, radios, botiquines), Higiene (crema/cepillos, desodorante, higiene femenina, pañales adultos), Bebés (pañales, teteros, pañitos, ropa nueva).',
            schedule: '9:00 AM - 5:00 PM (Lunes a Domingo)',
            verified: true,
            dateAdded: '11/08/2026, 12:00:00'
        },
        {
            id: 'acop_bogota_usaquen',
            name: 'Punto Acopio Usaquén (Global Shapers)',
            address: 'AC 116 # 11C-22, Usaquén, Bogotá',
            city: 'Bogotá',
            lat: 4.6980,
            lng: -74.0375,
            type: 'collection',
            contactName: 'Global Shapers Community / @jackemaldonado_',
            contact: 'Recepción 24 horas',
            needs: 'Alimentos no perecederos, medicamentos, bebidas y productos de higiene personal. (Priorizado: NO ropa).',
            schedule: 'Disponible las 24 horas',
            verified: true,
            dateAdded: '11/08/2026, 12:44:00'
        },
        {
            id: 'acop_bogota_puente_aranda',
            name: 'Punto Acopio Puente Aranda',
            address: 'TV 52C # 2-46, Puente Aranda, Bogotá',
            city: 'Bogotá',
            lat: 4.6185,
            lng: -74.1160,
            type: 'collection',
            contactName: 'Global Shapers Community / @jackemaldonado_',
            contact: 'Punto de Acopio',
            needs: 'Alimentos no perecederos, medicamentos, bebidas y productos de higiene personal. (Priorizado: NO ropa).',
            schedule: '8:00 AM - 9:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:44:00'
        },
        {
            id: 'acop_bogota_multiplaza',
            name: 'Punto Acopio C.C. Multiplaza (Sótano 2)',
            address: 'Calle 19A # 72-57, Sótano 2 (Entrada del Éxito), Bogotá',
            city: 'Bogotá',
            lat: 4.6520,
            lng: -74.1265,
            type: 'collection',
            contactName: 'Global Shapers / C.C. Multiplaza',
            contact: 'Sótano 2 (Entrada del Éxito)',
            needs: 'Alimentos no perecederos, medicamentos, bebidas y productos de higiene personal. (Priorizado: NO ropa).',
            schedule: '2:00 PM - 9:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:44:00'
        },
        {
            id: 'acop_manizales_banco_arquidiocesano',
            name: 'Banco Arquidiócesano de Alimentos de Manizales',
            address: 'Calle 49 # 27A-85, Manizales, Caldas',
            city: 'Manizales',
            lat: 5.0560,
            lng: -75.4950,
            type: 'collection',
            contactName: 'Arquidiócesis de Manizales',
            contact: 'Recepción de Donaciones Manizales',
            needs: 'Alimentos no perecederos, agua embotellada, frazadas, leche en polvo, pañales y medicamentos.',
            schedule: '8:00 AM - 6:00 PM',
            verified: true,
            dateAdded: '11/08/2026, 12:44:00'
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
            name: 'Global Empowerment Mission (GEM)', 
            description: 'Organización internacional humanitaria respondiendo a la emergencia en Colombia. Punto físico de acopio en Doral, FL y donaciones en línea.', 
            website: 'https://www.gem.org/', 
            account: 'Donaciones en línea en gem.org | Centro físico: 1850 NW 84th Ave #100, Doral, FL 33126', 
            type: 'international',
            officialPhone: 'info@gem.org / Voluntariado: www.gem.org/volunteer'
        },
        { 
            name: 'Psicólogos Sin Fronteras', 
            description: 'Atención psicológica gratuita y confidencial para personas víctimas del terremoto en Colombia y Venezuela.', 
            website: 'https://www.instagram.com/psfvenezuela/', 
            account: 'Líneas directas: Colombia +57 316 297 1851 | Venezuela +58 412 722 5080 | EE.UU. +1 754 275 0793', 
            type: 'international',
            officialPhone: 'Colombia: +57 316 297 1851 | Venezuela: +58 412 722 5080 | USA: +1 754 275 0793'
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
            { name: 'UNGRD (Línea Nacional)', number: '01-8000-113200', icon: '📞' },
            { name: 'Psicólogos Sin Fronteras (Colombia)', number: '+57 316 297 1851', icon: '🧠' },
            { name: 'Psicólogos Sin Fronteras (Venezuela)', number: '+58 412 722 5080', icon: '🧠' },
            { name: 'Psicólogos Sin Fronteras (EE.UU.)', number: '+1 754 275 0793', icon: '🧠' }
        ],
        tips: [
            'NO ingrese a edificaciones que presenten grietas o fallas estructurales.',
            'Privilegie los mensajes de texto o chat antes que las llamadas de voz para evitar colapsar la red celular.',
            'Tenga a la mano la mochila de emergencia: agua potable, radio a pilas, linterna, botiquín e identificaciones.',
            'Siga únicamente la información de organismos oficiales (SGC, UNGRD, Cruz Roja). No difunda rumores.',
            'Ante olor a gas, cierre la llave general de inmediato y no accione interruptores de luz.',
            'Facilite el paso de vehículos de rescate y ambulancias en las vías públicas.',
            'En caso de emergencias vitales o rescate urgente, llame inmediatamente al 123.',
            'Si requiere contención emocional o ayuda psicológica gratuita, contacte a Psicólogos Sin Fronteras (+57 316 297 1851 / +58 412 722 5080 / +1 754 275 0793).'
        ]
    },

    missingPersons: []
};

// Guardar datos iniciales con la clave v4
try {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
} catch(e) {
    console.warn('Error inicializando datos locales:', e);
}

