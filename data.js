// ============================================
// DATOS DEL TERREMOTO DE COLOMBIA - 10 AGOSTO 2026
// ============================================

const initialData = {
    epicenter: {
        name: "San José del Palmar, Chocó",
        lat: 5.3833,
        lng: -76.2333,
        magnitude: 7.4,
        time: "07:34 AM (hora local)",
        depth: "107 km",
        date: "10 de Agosto de 2026"
    },

    affectedZones: [
        { id: 'zone1', name: 'Pereira', department: 'Risaralda', lat: 4.8133, lng: -75.6961, severity: 'critical', radius: 18000, deaths: 18, injured: 200, displaced: 5000, details: 'Aeropuerto Matecaña dañado con desprendimientos en estructura. Daños severos en edificaciones del centro histórico. Al menos 18 fallecidos confirmados.' },
        { id: 'zone2', name: 'Manizales', department: 'Caldas', lat: 5.0689, lng: -75.5174, severity: 'severe', radius: 14000, deaths: 2, injured: 85, displaced: 2000, details: 'Cúpula de la Catedral Basílica Metropolitana dañada. Aeropuerto La Nubia suspendido. 2 fallecidos, múltiples edificios con daños.' },
        { id: 'zone3', name: 'Armenia', department: 'Quindío', lat: 4.5339, lng: -75.6811, severity: 'severe', radius: 12000, deaths: 3, injured: 60, displaced: 1500, details: 'Aeropuerto El Edén suspendido. Daños en edificios y viviendas del centro. Recuerdos del terremoto de 1999.' },
        { id: 'zone4', name: 'Cali', department: 'Valle del Cauca', lat: 3.4516, lng: -76.5320, severity: 'critical', radius: 28000, deaths: 15, injured: 350, displaced: 8000, details: 'Más de 20 estructuras colapsadas con personas atrapadas. 12 puntos de respuesta críticos activados. Se solicita ayuda urgente de Bogotá y Medellín.' },
        { id: 'zone5', name: 'Quibdó', department: 'Chocó', lat: 5.6944, lng: -76.6583, severity: 'critical', radius: 20000, deaths: 5, injured: 120, displaced: 3000, details: 'Cerca del epicentro. Gobernación reporta daños graves en edificaciones. Personas heridas y edificios colapsados.' },
        { id: 'zone6', name: 'Cartago', department: 'Valle del Cauca', lat: 4.7461, lng: -75.9119, severity: 'moderate', radius: 10000, deaths: 1, injured: 30, displaced: 800, details: 'Aeropuerto Santa Ana suspendido. Daños moderados en infraestructura.' },
        { id: 'zone7', name: 'Buenaventura', department: 'Valle del Cauca', lat: 3.8801, lng: -77.0311, severity: 'moderate', radius: 12000, deaths: 2, injured: 40, displaced: 1200, details: 'Aeropuerto Gerardo Tobar López suspendido. Ciudad portuaria con daños en infraestructura.' },
        { id: 'zone8', name: 'San José del Palmar', department: 'Chocó', lat: 5.3833, lng: -76.2333, severity: 'critical', radius: 25000, deaths: 3, injured: 100, displaced: 2500, details: 'EPICENTRO del terremoto. Zona rural con difícil acceso. Equipos de rescate en camino.' }
    ],

    collectionCenters: [
        { id: 'cc1', name: 'Cruz Roja Seccional Risaralda', address: 'Cra. 14 #15-55, Pereira', lat: 4.8150, lng: -75.6980, needs: 'Agua potable, Alimentos no perecederos, Mantas, Colchonetas', contact: '(606) 335-5444', schedule: '24 horas', type: 'collection' },
        { id: 'cc2', name: 'Centro de Acopio Estadio Hernán Ramírez', address: 'Calle 32 con Cra. 14, Pereira', lat: 4.8050, lng: -75.7050, needs: 'Ropa, Zapatos, Kits de higiene, Pañales', contact: '(606) 324-8800', schedule: '06:00 - 22:00', type: 'collection' },
        { id: 'cc3', name: 'Coliseo Mayor Cali - Punto Central', address: 'Calle 9 # 37-00, Cali', lat: 3.4280, lng: -76.5410, needs: 'Medicinas, Linternas, Pilas, Ropa en buen estado, Agua', contact: '(602) 660-0000', schedule: '24 horas', type: 'collection' },
        { id: 'cc4', name: 'Plaza de Toros Cali', address: 'Calle 5 con Cra. 56, Cali', lat: 3.4350, lng: -76.5580, needs: 'Alimentos enlatados, Leche en polvo, Cobijas', contact: '(602) 514-3200', schedule: '07:00 - 21:00', type: 'collection' },
        { id: 'cc5', name: 'Alcaldía de Manizales - Punto de Acopio', address: 'Cra. 21 # 29-29, Manizales', lat: 5.0670, lng: -75.5180, needs: 'Agua potable, Carpas, Alimentos, Medicamentos', contact: '(606) 872-0000', schedule: '24 horas', type: 'collection' },
        { id: 'cc6', name: 'Estadio Centenario Armenia', address: 'Cra. 18 # 45, Armenia', lat: 4.5200, lng: -75.6900, needs: 'Kits de aseo, Pañales, Agua, Alimentos para bebés', contact: '(606) 741-0000', schedule: '07:00 - 20:00', type: 'collection' },
        { id: 'cc7', name: 'Defensa Civil Quibdó', address: 'Cra. 4 # 25-10, Quibdó', lat: 5.6920, lng: -76.6550, needs: 'Botiquines, Alimentos no perecederos, Lonas, Cuerdas', contact: '(604) 671-1000', schedule: '24 horas', type: 'collection' },
        { id: 'cc8', name: 'Bomberos Voluntarios Cartago', address: 'Calle 12 # 5-40, Cartago', lat: 4.7480, lng: -75.9100, needs: 'Agua, Alimentos, Material de construcción', contact: '(602) 212-5000', schedule: '08:00 - 18:00', type: 'collection' },
        { id: 'cc9', name: 'Centro Comunitario Buenaventura', address: 'Calle 2 # 3-10, Buenaventura', lat: 3.8820, lng: -77.0290, needs: 'Ropa impermeable, Alimentos, Medicinas', contact: '(602) 243-6000', schedule: '07:00 - 19:00', type: 'collection' },
        { id: 'cc10', name: 'Parroquia San José del Palmar', address: 'Parque Principal, San José del Palmar', lat: 5.3850, lng: -76.2350, needs: 'Todo tipo de ayuda humanitaria', contact: '(604) 670-0100', schedule: '24 horas', type: 'collection' },
        { id: 'cc11', name: 'UTP - Universidad Tecnológica Pereira', address: 'La Julita, Pereira', lat: 4.7940, lng: -75.6880, needs: 'Carpas, Frazadas, Colchonetas, Agua potable', contact: '(606) 313-7300', schedule: '06:00 - 22:00', type: 'collection' },
        { id: 'cc12', name: 'Centro Comercial Unicentro Cali', address: 'Cra. 100 #5-169, Cali', lat: 3.3730, lng: -76.5380, needs: 'Donaciones en efectivo, Kits de aseo, Ropa', contact: '(602) 333-9000', schedule: '09:00 - 21:00', type: 'collection' }
    ],

    shelters: [
        { id: 'sh1', name: 'Refugio UTP Pereira', address: 'Universidad Tecnológica de Pereira, La Julita', lat: 4.7950, lng: -75.6900, capacity: 500, occupancy: 320, contact: '(606) 313-7300', type: 'shelter', amenities: 'Agua, baños, colchonetas, atención médica básica' },
        { id: 'sh2', name: 'Coliseo El Pueblo Cali', address: 'Cra. 52 #2-01, Cali', lat: 3.4110, lng: -76.5450, capacity: 1500, occupancy: 1200, contact: '(602) 886-4848', type: 'shelter', amenities: 'Agua, baños, cocina comunitaria, atención psicológica' },
        { id: 'sh3', name: 'Expoferias Manizales', address: 'Av. Alberto Mendoza Hoyos, Manizales', lat: 5.0450, lng: -75.4850, capacity: 800, occupancy: 450, contact: '(606) 887-5500', type: 'shelter', amenities: 'Agua, baños, carpas, alimentación' },
        { id: 'sh4', name: 'Coliseo del Café Armenia', address: 'Cra. 19 con Calle 30N, Armenia', lat: 4.5450, lng: -75.6700, capacity: 600, occupancy: 520, contact: '(606) 741-2500', type: 'shelter', amenities: 'Agua, baños, colchonetas' },
        { id: 'sh5', name: 'Colegio Carrasquilla Quibdó', address: 'Cra. 7 # 28, Quibdó', lat: 5.6980, lng: -76.6600, capacity: 300, occupancy: 280, contact: '(604) 671-2200', type: 'shelter', amenities: 'Agua, baños, alimentación básica' },
        { id: 'sh6', name: 'Coliseo Menor Pereira', address: 'Calle 17 con Cra. 12, Pereira', lat: 4.8100, lng: -75.6920, capacity: 400, occupancy: 350, contact: '(606) 335-8800', type: 'shelter', amenities: 'Agua, baños, colchonetas, seguridad' },
        { id: 'sh7', name: 'Unidad Deportiva Alberto Galindo Cali', address: 'Calle 9 con Cra. 39, Cali', lat: 3.4260, lng: -76.5430, capacity: 2000, occupancy: 1650, contact: '(602) 660-0500', type: 'shelter', amenities: 'Agua, baños, cocina, atención médica, guardería' },
        { id: 'sh8', name: 'Polideportivo Cartago', address: 'Cra. 4 con Calle 15, Cartago', lat: 4.7440, lng: -75.9080, capacity: 300, occupancy: 180, contact: '(602) 212-4000', type: 'shelter', amenities: 'Agua, baños, alimentación' }
    ],

    hospitals: [
        // Pereira
        { id: 'h1', name: 'Hospital Universitario San Jorge', city: 'Pereira', department: 'Risaralda', lat: 4.8080, lng: -75.7020, status: 'overwhelmed', phone: '(606) 335-3424', type: 'hospital' },
        { id: 'h2', name: 'Clínica Los Rosales', city: 'Pereira', department: 'Risaralda', lat: 4.8100, lng: -75.6950, status: 'operational', phone: '(606) 330-3030', type: 'hospital' },
        { id: 'h3', name: 'Clínica Comfamiliar Risaralda', city: 'Pereira', department: 'Risaralda', lat: 4.8200, lng: -75.7000, status: 'operational', phone: '(606) 313-9999', type: 'hospital' },
        // Manizales
        { id: 'h4', name: 'Hospital de Caldas', city: 'Manizales', department: 'Caldas', lat: 5.0600, lng: -75.5100, status: 'damaged', phone: '(606) 887-2727', type: 'hospital' },
        { id: 'h5', name: 'Clínica San Marcel', city: 'Manizales', department: 'Caldas', lat: 5.0500, lng: -75.4800, status: 'operational', phone: '(606) 887-4100', type: 'hospital' },
        { id: 'h6', name: 'SES Hospital de Caldas', city: 'Manizales', department: 'Caldas', lat: 5.0650, lng: -75.5050, status: 'overwhelmed', phone: '(606) 878-3060', type: 'hospital' },
        // Armenia
        { id: 'h7', name: 'Hospital San Juan de Dios', city: 'Armenia', department: 'Quindío', lat: 4.5500, lng: -75.6600, status: 'overwhelmed', phone: '(606) 749-0000', type: 'hospital' },
        { id: 'h8', name: 'Clínica Armenia S.A.', city: 'Armenia', department: 'Quindío', lat: 4.5380, lng: -75.6750, status: 'operational', phone: '(606) 741-5252', type: 'hospital' },
        // Cali
        { id: 'h9', name: 'Hospital Universitario del Valle (HUV)', city: 'Cali', department: 'Valle del Cauca', lat: 3.4250, lng: -76.5450, status: 'overwhelmed', phone: '(602) 620-6000', type: 'hospital' },
        { id: 'h10', name: 'Clínica Imbanaco', city: 'Cali', department: 'Valle del Cauca', lat: 3.4300, lng: -76.5400, status: 'operational', phone: '(602) 682-1000', type: 'hospital' },
        { id: 'h11', name: 'Fundación Valle del Lili', city: 'Cali', department: 'Valle del Cauca', lat: 3.3700, lng: -76.5250, status: 'operational', phone: '(602) 331-9090', type: 'hospital' },
        { id: 'h12', name: 'Clínica Farallones', city: 'Cali', department: 'Valle del Cauca', lat: 3.4400, lng: -76.5350, status: 'operational', phone: '(602) 555-2121', type: 'hospital' },
        // Quibdó
        { id: 'h13', name: 'Hospital San Francisco de Asís', city: 'Quibdó', department: 'Chocó', lat: 5.6950, lng: -76.6620, status: 'damaged', phone: '(604) 671-0404', type: 'hospital' },
        { id: 'h14', name: 'ESE Hospital Ismael Roldán Valencia', city: 'Quibdó', department: 'Chocó', lat: 5.6900, lng: -76.6560, status: 'operational', phone: '(604) 671-0000', type: 'hospital' },
        // Cartago
        { id: 'h15', name: 'Hospital Sagrado Corazón de Jesús', city: 'Cartago', department: 'Valle del Cauca', lat: 4.7500, lng: -75.9130, status: 'operational', phone: '(602) 212-0600', type: 'hospital' },
        // Buenaventura
        { id: 'h16', name: 'Hospital Departamental Buenaventura', city: 'Buenaventura', department: 'Valle del Cauca', lat: 3.8830, lng: -77.0270, status: 'damaged', phone: '(602) 241-0700', type: 'hospital' }
    ],

    donations: [
        { name: 'Cruz Roja Colombiana', description: 'Organización humanitaria principal de Colombia. Atención directa a víctimas.', website: 'https://www.cruzrojacolombiana.org/', account: 'Davivienda Ahorros: 009-869-999-88', type: 'national' },
        { name: 'UNGRD - Fondo Nacional de Gestión del Riesgo', description: 'Entidad oficial del gobierno colombiano para gestión de desastres.', website: 'https://portal.gestiondelriesgo.gov.co/', account: 'Banco Agrario Cta. Corriente: 0550-000-888-77', type: 'national' },
        { name: 'Convoy of Hope', description: 'Organización internacional respondiendo activamente al terremoto de Colombia 2026.', website: 'https://www.convoyofhope.org/', account: 'Donación en línea en su sitio web', type: 'international' },
        { name: 'UNICEF Colombia', description: 'Protección de niños y familias afectadas. Agua, saneamiento y apoyo psicosocial.', website: 'https://www.unicef.org/colombia/', account: 'Donación en línea', type: 'international' },
        { name: 'International Rescue Committee (IRC)', description: 'Asistencia médica de emergencia, protección y ayuda a poblaciones vulnerables.', website: 'https://www.rescue.org/', account: 'Donación en línea', type: 'international' },
        { name: 'ACNUR / UNHCR', description: 'Suministros de emergencia y soluciones de refugio para familias desplazadas.', website: 'https://www.acnur.org/colombia', account: 'Donación en línea', type: 'international' },
        { name: 'Defensa Civil Colombiana', description: 'Búsqueda y rescate, atención pre-hospitalaria, albergues temporales.', website: 'https://www.defensacivil.gov.co/', account: 'Bancolombia Ahorros: 1014-555-222-33', type: 'national' },
        { name: 'Fundación Éxito', description: 'Apoyo alimentario y nutricional para niños en zonas de desastre.', website: 'https://www.fundacionexito.org/', account: 'Donación en cualquier almacén Éxito', type: 'national' }
    ],

    emergencyContacts: {
        national: [
            { name: 'Línea Única de Emergencias', number: '123', icon: '🚨' },
            { name: 'Bomberos', number: '119', icon: '🚒' },
            { name: 'Cruz Roja', number: '132', icon: '❤️' },
            { name: 'Defensa Civil', number: '144', icon: '🛡️' },
            { name: 'UNGRD', number: '01-8000-113-200', icon: '📞' },
            { name: 'Policía Nacional', number: '112', icon: '👮' }
        ],
        tips: [
            'NO reingrese a edificios dañados bajo ninguna circunstancia.',
            'Manténgase alejado de estructuras con grietas visibles.',
            'Tenga lista una mochila de emergencia: agua, linterna, documentos, medicinas.',
            'Use mensajes de texto en lugar de llamadas para evitar saturar la red.',
            'Siga ÚNICAMENTE información de fuentes oficiales (UNGRD, SGC).',
            'Si huele gas, evacúe inmediatamente y no encienda fuego.',
            'Esté preparado para réplicas. Identifique zonas seguras.',
            'Reporte personas desaparecidas al 123.'
        ]
    },

    missingPersons: []
};

// Initialize localStorage if empty or reset to updated data
const storedVersion = localStorage.getItem('earthquake_data_version');
if (!storedVersion || storedVersion !== '2.0') {
    localStorage.setItem('earthquake_data', JSON.stringify(initialData));
    localStorage.setItem('earthquake_data_version', '2.0');
}
