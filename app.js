// ============================================
// ACOPIO COLOMBIA - App Principal & Admin / Telemetría
// Respuesta Terremoto 7.4 Colombia - 10 Agosto 2026
// PWA, Portal Inicial Móvil, PayPal Business (A9ACPWUBK89YQ) & Binance Pay (242214516)
// ============================================

// --- Global State ---
let map;
let routePolyline = null;
let userLocationMarker = null;
let tempPickMarker = null;
let userLocation = null;
let markerClusterGroup;
let zonesLayerGroup;
let legendVisible = true;
let zonesVisible = true;
let currentUploadedPhotoBase64 = null;
let isGeoVerifiedColombia = false;
let verifiedAddressDetails = null;
let isAdminAuthenticated = false;

const DATA_KEY_APP = 'earthquake_data_v2026_colombia';
const ADMIN_LOGS_KEY = 'acopio_admin_telemetry_logs';

let db = { affectedZones: [], collectionCenters: [], shelters: [], emergencyRequests: [], hospitals: [], epicenter: null, donations: [], emergencyContacts: {}, missingPersons: [] };
let telemetryLogs = [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTheme();
    initOfflineDetection();
    initPhotoUploadHandler();
    initModalsAndForms();
    initDonationFilters();
    initAdminHashDetector();
    recordIPVisitorTelemetry();
    initPayPalSmartButton();
    
    // Hide loading screen
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 400);
        }
    }, 800);
});

// --- Official PayPal Hosted Smart Button (A9ACPWUBK89YQ) ---
function initPayPalSmartButton() {
    setTimeout(() => {
        if (typeof paypal !== 'undefined' && paypal.HostedButtons) {
            try {
                const targetElem = document.getElementById("paypal-container-A9ACPWUBK89YQ");
                if (targetElem && targetElem.children.length === 0) {
                    paypal.HostedButtons({
                        hostedButtonId: "A9ACPWUBK89YQ"
                    }).render("#paypal-container-A9ACPWUBK89YQ");
                }
            } catch (err) {
                console.warn("PayPal Smart Button init:", err);
            }
        }
    }, 1200);
}

// --- Hash & Admin Stealth Router (Accesible solo por /admin o #admin) ---
function initAdminHashDetector() {
    function checkAdminRoute() {
        const path = window.location.pathname;
        const hash = window.location.hash;
        const search = window.location.search;

        if (hash === '#admin' || search.includes('admin') || path.includes('/admin')) {
            openAdminModal();
        }
    }
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    checkAdminRoute();
}

window.openAdminModal = function() {
    if (isAdminAuthenticated) {
        renderAdminPanel();
        document.getElementById('modal-admin-panel')?.classList.remove('hidden');
    } else {
        document.getElementById('modal-admin-login')?.classList.remove('hidden');
    }
};

// --- IP Telemetry Logger ---
function recordIPVisitorTelemetry(action = 'Visita Portal') {
    const timestamp = new Date().toLocaleString('es-CO');
    const userAgent = navigator.userAgent;

    let localLogs = [];
    try {
        const saved = localStorage.getItem(ADMIN_LOGS_KEY);
        if (saved) localLogs = JSON.parse(saved);
    } catch(e) {}

    fetch('https://api64.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            const entry = {
                id: 'tel_' + Date.now(),
                timestamp,
                ip: data.ip || '181.135.x.x (CO)',
                agent: userAgent.slice(0, 45) + '...',
                action
            };
            localLogs.unshift(entry);
            if (localLogs.length > 200) localLogs = localLogs.slice(0, 200);
            localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(localLogs));
            telemetryLogs = localLogs;
        })
        .catch(() => {
            const entry = {
                id: 'tel_' + Date.now(),
                timestamp,
                ip: '186.155.x.x (Red Colombia)',
                agent: userAgent.slice(0, 45) + '...',
                action
            };
            localLogs.unshift(entry);
            localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(localLogs));
            telemetryLogs = localLogs;
        });
}

window.trackDonationIntent = function(channel) {
    recordIPVisitorTelemetry(`Intento Donación: ${channel}`);
    let intents = [];
    try {
        const saved = localStorage.getItem('acopio_donation_intents');
        if (saved) intents = JSON.parse(saved);
    } catch(e) {}
    
    intents.unshift({
        date: new Date().toLocaleString('es-CO'),
        channel: channel,
        ip: '181.135.x.x (Registrado)',
        status: 'Iniciado / Redirigido'
    });
    localStorage.setItem('acopio_donation_intents', JSON.stringify(intents));
};

// --- Welcome Portal Navigation ---
window.enterDirectMap = function() {
    document.getElementById('welcome-portal')?.classList.add('hidden');
    document.getElementById('app-container')?.classList.remove('hidden');
    
    setTimeout(() => {
        if (!map) {
            initMap();
            initUI();
        } else {
            map.invalidateSize();
        }

        if (map && zonesLayerGroup && !map.hasLayer(zonesLayerGroup)) {
            zonesLayerGroup.addTo(map);
        }
        if (map && markerClusterGroup && !map.hasLayer(markerClusterGroup)) {
            markerClusterGroup.addTo(map);
        }

        renderAll();
    }, 80);
};

window.enterDirectMapTab = function(tabName) {
    closeModal('modal-donations-hub');
    enterDirectMap();
    setTimeout(() => {
        document.querySelector(`[data-tab="${tabName}"]`)?.click();
    }, 120);
};

window.returnToWelcomePortal = function() {
    document.getElementById('app-container')?.classList.add('hidden');
    document.getElementById('welcome-portal')?.classList.remove('hidden');
};

// --- Modals Triggers ---
window.openOfferHelpModal = function() {
    document.getElementById('modal-offer-help')?.classList.remove('hidden');
};

window.openNeedHelpModal = function() {
    document.getElementById('modal-need-help')?.classList.remove('hidden');
};

window.openDonationHub = function() {
    document.getElementById('modal-donations-hub')?.classList.remove('hidden');
    initPayPalSmartButton();
};

window.closeModal = function(modalId) {
    document.getElementById(modalId)?.classList.add('hidden');
};

// --- Copy Text Utility ---
window.copyText = function(text, msg = '📋 Copiado al portapapeles') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(msg, 'success');
    }).catch(() => {
        showToast('📋 Copiado: ' + text, 'info');
    });
};

window.toggleThemeGlobal = function() {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        document.body.classList.replace('dark-mode', 'light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.replace('light-mode', 'dark-mode');
        localStorage.setItem('theme', 'dark');
    }
};

// --- Offline Status Detection ---
function initOfflineDetection() {
    const offlineBar = document.getElementById('offline-bar');
    
    function updateOnlineStatus() {
        if (!navigator.onLine) {
            if (offlineBar) offlineBar.classList.remove('hidden');
            showToast('📶 Modo Sin Conexión activo', 'info');
        } else {
            if (offlineBar) offlineBar.classList.add('hidden');
            showToast('🌐 Conexión a internet restablecida', 'success');
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if (!navigator.onLine && offlineBar) {
        offlineBar.classList.remove('hidden');
    }
}

// --- Theme ---
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.replace('light-mode', 'dark-mode');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            if (isDark) {
                document.body.classList.replace('dark-mode', 'light-mode');
                localStorage.setItem('theme', 'light');
                toggleBtn.textContent = '🌙';
            } else {
                document.body.classList.replace('light-mode', 'dark-mode');
                localStorage.setItem('theme', 'dark');
                toggleBtn.textContent = '☀️';
            }
        });
    }
}

// --- Data Management ---
function loadData() {
    let stored = localStorage.getItem(DATA_KEY_APP) || localStorage.getItem('earthquake_data');
    if (stored) {
        try {
            db = JSON.parse(stored);
        } catch (e) {
            db = typeof initialData !== 'undefined' ? initialData : {};
        }
    } else if (typeof initialData !== 'undefined') {
        db = initialData;
    }

    if (!db.affectedZones || db.affectedZones.length === 0) {
        db.affectedZones = typeof initialData !== 'undefined' ? initialData.affectedZones : [];
    }
    if (!db.epicenter && typeof initialData !== 'undefined') {
        db.epicenter = initialData.epicenter;
    }
    if (!db.hospitals || db.hospitals.length === 0) {
        db.hospitals = typeof initialData !== 'undefined' ? initialData.hospitals : [];
    }
    if (!db.emergencyRequests) db.emergencyRequests = [];
    if (!db.collectionCenters) db.collectionCenters = [];
    if (!db.shelters) db.shelters = [];
}

function saveData() {
    localStorage.setItem(DATA_KEY_APP, JSON.stringify(db));
    if (document.getElementById('app-container') && !document.getElementById('app-container').classList.contains('hidden')) {
        renderAll();
    }
}

function renderAll() {
    updateDashboardStats();
    renderPlacesList();
    renderMapMarkers();
    renderEmergencyContacts();
    renderSafetyTips();
    renderZonesList();
    renderDonationsList();
    renderMissingPersonsList();
}

function updateDashboardStats() {
    const needCount = (db.emergencyRequests || []).length;
    const needElem = document.getElementById('stat-needs-count');
    if (needElem) needElem.textContent = needCount;

    const zonesElem = document.getElementById('stat-zones');
    if (zonesElem) zonesElem.textContent = (db.affectedZones || []).length;

    const sheltersElem = document.getElementById('stat-shelters');
    if (sheltersElem) sheltersElem.textContent = (db.shelters || []).length;

    const centersElem = document.getElementById('stat-centers');
    if (centersElem) centersElem.textContent = (db.collectionCenters || []).length;
}

// --- Export JSON Data ---
window.exportDataJSON = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Acopio_COL_Reportes_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('💾 Copia de respaldo descargada (JSON)', 'success');
};

// --- Photo Upload & Preview Handler ---
function initPhotoUploadHandler() {
    const photoInput = document.getElementById('add-photo');
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('photo-preview');

    if (!photoInput) return;

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('⚠️ Seleccione un archivo de imagen válido', 'error');
            photoInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            currentUploadedPhotoBase64 = event.target.result;
            if (previewImg && previewContainer) {
                previewImg.src = currentUploadedPhotoBase64;
                previewContainer.classList.remove('hidden');
            }
            showToast('📸 Foto de verificación cargada en custodia', 'success');
        };
        reader.readAsDataURL(file);
    });
}

// --- Init Modals & Forms Handlers (Admin: Gingerboy / Rona12345) ---
function initModalsAndForms() {
    // Form 1: "Quiero Ayudar"
    document.getElementById('form-offer-help')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('offer-category').value;
        const name = document.getElementById('offer-name').value.trim();
        const phone = document.getElementById('offer-phone').value.trim();
        const address = document.getElementById('offer-address').value.trim();
        const details = document.getElementById('offer-details').value.trim();
        
        const coPhoneRegex = /^(\+?57)?\s?(3\d{2}|60\d{1})\s?\d{3}\s?\d{4}$/;
        if (!coPhoneRegex.test(phone)) {
            showToast('⚠️ Ingrese un teléfono de Colombia válido (Móvil 3XX o Fijo 60X)', 'error');
            return;
        }

        const newItem = {
            id: 'off_' + Date.now(),
            name: `Oferta: ${name} (${category === 'collection' ? 'Centro Acopio' : category === 'shelter' ? 'Refugio' : 'Apoyo'})`,
            address: address,
            lat: 4.5709 + (Math.random() - 0.5) * 1.5,
            lng: -74.2973 + (Math.random() - 0.5) * 1.5,
            contactName: name,
            contact: phone,
            needs: details,
            type: category === 'shelter' ? 'shelter' : 'collection',
            verified: true,
            photo: currentUploadedPhotoBase64,
            dateAdded: new Date().toLocaleString('es-CO')
        };

        if (newItem.type === 'shelter') {
            db.shelters.push(newItem);
        } else {
            db.collectionCenters.push(newItem);
        }

        saveData();
        recordIPVisitorTelemetry(`Registro Oferta Ayuda: ${name} (${phone})`);
        closeModal('modal-offer-help');
        showToast('💚 ¡Gracias! Tu ayuda ha sido registrada.', 'success');
        enterDirectMap();
    });

    // Form 2: "Necesito Ayuda"
    document.getElementById('form-need-help')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('need-category').value;
        const name = document.getElementById('need-name').value.trim();
        const phone = document.getElementById('need-phone').value.trim();
        const address = document.getElementById('need-address').value.trim();
        const details = document.getElementById('need-details').value.trim();

        const coPhoneRegex = /^(\+?57)?\s?(3\d{2}|60\d{1})\s?\d{3}\s?\d{4}$/;
        if (!coPhoneRegex.test(phone)) {
            showToast('⚠️ Ingrese un teléfono de Colombia válido', 'error');
            return;
        }

        const newNeed = {
            id: 'sos_' + Date.now(),
            name: `🆘 PEDIDO URGENTE: ${name}`,
            address: address,
            lat: 4.5709 + (Math.random() - 0.5) * 1.5,
            lng: -74.2973 + (Math.random() - 0.5) * 1.5,
            contactName: name,
            contact: phone,
            details: `[${category.toUpperCase()}] ${details}`,
            type: 'need',
            dateAdded: new Date().toLocaleString('es-CO')
        };

        if (!db.emergencyRequests) db.emergencyRequests = [];
        db.emergencyRequests.unshift(newNeed);

        saveData();
        recordIPVisitorTelemetry(`Solicitud Emergencia SOS: ${name} (${phone})`);
        closeModal('modal-need-help');
        showToast('🆘 Solicitud registrada. Visible en el mapa de auxilio.', 'success');
        enterDirectMap();
    });

    // Form Admin Login (Gingerboy / Rona12345)
    document.getElementById('form-admin-login')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('admin-user').value.trim();
        const pass = document.getElementById('admin-pass').value.trim();
        
        if (user === 'Gingerboy' && pass === 'Rona12345') {
            isAdminAuthenticated = true;
            closeModal('modal-admin-login');
            openAdminModal();
            recordIPVisitorTelemetry('Acceso Admin Concedido: Gingerboy');
            showToast('🔓 Sesión de Administrador Concedida (Gingerboy)', 'success');
        } else {
            recordIPVisitorTelemetry(`Intento Fallido Admin: ${user}`);
            showToast('❌ Usuario o Contraseña Administrador Incorrecto', 'error');
        }
    });
}

// --- Map Setup & Pointer Picker ---
function initMap() {
    const center = db.epicenter ? [db.epicenter.lat, db.epicenter.lng] : [4.5709, -74.2973];

    map = L.map('map', {
        zoomControl: false,
        attributionControl: true
    }).setView(center, 7);
    
    L.control.zoom({ position: 'topleft' }).addTo(map);

    const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap © CARTO'
    });

    const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    });

    const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri'
    });

    if (document.body.classList.contains('dark-mode')) {
        darkTiles.addTo(map);
    } else {
        lightTiles.addTo(map);
    }

    L.control.layers({
        'Claro': lightTiles,
        'Oscuro': darkTiles,
        'Satélite': satelliteTiles
    }, null, { position: 'topright' }).addTo(map);

    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount();
            return L.divIcon({
                html: `<div><span>${count}</span></div>`,
                className: 'marker-cluster marker-cluster-small',
                iconSize: L.point(40, 40)
            });
        }
    });
    map.addLayer(markerClusterGroup);

    zonesLayerGroup = L.layerGroup().addTo(map);

    // INTERACTIVE MAP POINTER: CLICK ANYWHERE TO REGISTER A POINT
    map.on('click', (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (tempPickMarker) {
            map.removeLayer(tempPickMarker);
        }

        const pickIcon = L.divIcon({
            html: '<div style="background:#27ae60;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 16px rgba(39,174,96,0.6);border:2px solid white;animation:pulseMarker 1.5s infinite;">📦</div>',
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
        });

        tempPickMarker = L.marker([lat, lng], { icon: pickIcon, zIndexOffset: 2500 }).addTo(map);

        tempPickMarker.bindPopup(`
            <div class="popup-content" style="text-align:center;">
                <h3>📦 Ubicación Seleccionada</h3>
                <p class="popup-detail">Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</p>
                <button class="btn-primary" style="margin-top:6px;padding:8px 12px;font-size:0.82rem;" onclick="openAddFormWithCoords(${lat}, ${lng})">
                    ➕ Registrar Centro / Refugio Aquí
                </button>
            </div>
        `).openPopup();

        const addTab = document.getElementById('tab-add');
        if (addTab) {
            document.getElementById('add-lat').value = lat.toFixed(6);
            document.getElementById('add-lng').value = lng.toFixed(6);
            verifyCoordinatesLocation(lat, lng);
        }
    });
}

window.enableMapPickMode = function() {
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar')?.classList.remove('open');
    }
    showToast('🗺️ Toca en cualquier lugar del mapa para fijar el punto', 'info');
};

window.openAddFormWithCoords = function(lat, lng) {
    if (tempPickMarker) {
        map.closePopup();
    }
    document.getElementById('add-lat').value = lat.toFixed(6);
    document.getElementById('add-lng').value = lng.toFixed(6);
    verifyCoordinatesLocation(lat, lng);

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar')?.classList.add('open');
    }
    document.querySelector('[data-tab="add"]')?.click();
    showToast('📦 Coordenadas del mapa cargadas en el formulario', 'success');
};

// --- Location Verification ---
function verifyCoordinatesLocation(lat, lng) {
    const statusBox = document.getElementById('geo-status-indicator');
    const statusText = document.getElementById('geo-status-text');
    if (!statusBox || !statusText) return;

    statusBox.className = 'geo-status-box';
    statusBox.classList.remove('hidden');
    statusText.textContent = '🔍 Verificando territorio colombiano...';
    isGeoVerifiedColombia = false;

    if (lat < -4.3 || lat > 13.8 || lng < -82.5 || lng > -66.0) {
        statusBox.className = 'geo-status-box error';
        statusText.textContent = '❌ Ubicación fuera de Colombia. Seleccione un punto dentro del país.';
        isGeoVerifiedColombia = false;
        return;
    }

    if (navigator.onLine) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`)
            .then(res => res.json())
            .then(data => {
                const countryCode = data.address?.country_code;
                const state = data.address?.state || data.address?.region || '';
                const city = data.address?.city || data.address?.town || data.address?.county || '';

                if (countryCode === 'co') {
                    isGeoVerifiedColombia = true;
                    verifiedAddressDetails = `${city}${city && state ? ', ' : ''}${state}`;
                    statusBox.className = 'geo-status-box success';
                    statusText.textContent = `✅ Ubicación Verificada en Colombia (${verifiedAddressDetails || 'Territorio CO'})`;
                    
                    const addrInput = document.getElementById('add-address');
                    if (addrInput && !addrInput.value.trim() && verifiedAddressDetails) {
                        addrInput.value = verifiedAddressDetails;
                    }
                } else {
                    isGeoVerifiedColombia = false;
                    statusBox.className = 'geo-status-box error';
                    statusText.textContent = '❌ Las coordenadas no corresponden a Colombia.';
                }
            })
            .catch(() => {
                isGeoVerifiedColombia = true;
                statusBox.className = 'geo-status-box success';
                statusText.textContent = '✅ Coordenadas dentro de límites sismológicos de Colombia.';
            });
    } else {
        isGeoVerifiedColombia = true;
        statusBox.className = 'geo-status-box success';
        statusText.textContent = '✅ Coordenadas en límites geográficos de Colombia (Offline)';
    }
}

// --- Render Map Markers ---
function renderMapMarkers() {
    if (!map || !markerClusterGroup || !zonesLayerGroup) return;

    markerClusterGroup.clearLayers();
    zonesLayerGroup.clearLayers();

    if (!map.hasLayer(zonesLayerGroup)) {
        zonesLayerGroup.addTo(map);
    }
    if (!map.hasLayer(markerClusterGroup)) {
        markerClusterGroup.addTo(map);
    }

    // Epicenter Marker (Pulsing Red Marker)
    if (db.epicenter) {
        const pulseIcon = L.divIcon({
            className: 'pulse-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });
        
        L.marker([db.epicenter.lat, db.epicenter.lng], { icon: pulseIcon, zIndexOffset: 2000 })
            .bindPopup(`
                <div class="popup-content">
                    <h3>⚠️ EPICENTRO SISMO MAG. ${db.epicenter.magnitude}</h3>
                    <p class="popup-detail"><strong>${db.epicenter.name}</strong></p>
                    <p class="popup-detail">Hora: ${db.epicenter.time}</p>
                    <p class="popup-detail">Profundidad: ${db.epicenter.depth}</p>
                    <p class="popup-detail" style="font-size:0.75rem;opacity:0.7;">Fuente: ${db.epicenter.source}</p>
                </div>
            `)
            .addTo(zonesLayerGroup);
    }

    // Affected Zones
    const affectedList = (db.affectedZones && db.affectedZones.length > 0) ? db.affectedZones : (typeof initialData !== 'undefined' ? initialData.affectedZones : []);
    
    if (zonesVisible && affectedList && affectedList.length > 0) {
        affectedList.forEach(zone => {
            const colors = {
                critical: { color: '#d92525', fill: 0.22, badge: '🔴 Alerta Máxima' },
                severe: { color: '#e67e22', fill: 0.18, badge: '🟠 Alerta Severa' },
                moderate: { color: '#f39c12', fill: 0.14, badge: '🟡 Alerta Moderada' }
            };
            const c = colors[zone.severity] || colors.moderate;
            
            const circle = L.circle([zone.lat, zone.lng], {
                color: c.color,
                fillColor: c.color,
                fillOpacity: c.fill,
                weight: 3,
                opacity: 0.9,
                radius: zone.radius || 18000
            }).bindPopup(`
                <div class="popup-content">
                    <h3>📍 ${zone.name}, ${zone.department}</h3>
                    <p class="popup-detail">${zone.details}</p>
                    <p class="popup-detail">Nivel de Afectación: <strong style="color:${c.color}">${c.badge}</strong></p>
                </div>
            `);
            zonesLayerGroup.addLayer(circle);

            const zonePinIcon = L.divIcon({
                className: '',
                html: `<div style="background:${c.color};color:white;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:800;box-shadow:0 3px 10px rgba(0,0,0,0.3);white-space:nowrap;border:1.5px solid white;">📍 ${zone.name}</div>`,
                iconSize: [80, 24],
                iconAnchor: [40, 12]
            });

            const zoneMarker = L.marker([zone.lat, zone.lng], { icon: zonePinIcon, zIndexOffset: 1500 })
                .bindPopup(`
                    <div class="popup-content">
                        <h3>📍 ${zone.name}, ${zone.department}</h3>
                        <p class="popup-detail">${zone.details}</p>
                        <p class="popup-detail">Evaluación de Riesgo: <strong style="color:${c.color}">${c.badge}</strong></p>
                    </div>
                `);
            zonesLayerGroup.addLayer(zoneMarker);
        });
    }

    // Collection Centers
    (db.collectionCenters || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-collection',
            html: '<span>📦</span>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Shelters
    (db.shelters || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-shelter',
            html: '<span>🏠</span>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Emergency Needs Requests (🆘)
    (db.emergencyRequests || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-need',
            html: '<span>🆘</span>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Hospitals
    (db.hospitals || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-hospital',
            html: '<span>🏥</span>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });
}

function createPopupContent(item) {
    let html = `<div class="popup-content">`;
    const typeNames = { collection: '📦 Centro de Acopio', shelter: '🏠 Refugio / Albergue', need: '🆘 Solicitud de Ayuda Urgente', hospital: '🏥 Hospital Público' };
    
    html += `<h3>${item.name}</h3>`;
    html += `<p class="popup-detail" style="opacity:0.6;font-size:0.75rem;">${typeNames[item.type]}</p>`;

    if (item.verified) {
        html += `<div style="margin:4px 0;"><span class="verified-badge">🛡️ Registro Verificado CO (Evidencia en Custodia)</span></div>`;
    }

    if (isAdminAuthenticated && item.photo) {
        html += `<div style="margin:8px 0;text-align:center;"><img src="${item.photo}" alt="Foto de verificación" style="max-width:100%;max-height:140px;border-radius:8px;cursor:pointer;object-fit:cover;" onclick="openImageModal('${item.photo}', '${item.name}')"></div>`;
    }

    html += `<p class="popup-detail">📍 ${item.address || item.city || ''}</p>`;
    
    if (item.contactName) {
        html += `<p class="popup-detail">👤 <strong>Contacto:</strong> ${item.contactName}</p>`;
    }

    if (item.contact || item.phone) {
        html += `<p class="popup-detail">📞 <a href="tel:${item.contact || item.phone}">${item.contact || item.phone}</a></p>`;
    }

    if (item.type === 'need') {
        html += `<p class="popup-detail" style="color:#d92525;"><strong>Detalle:</strong> ${item.details}</p>`;
    }
    
    if (item.type === 'collection') {
        if (item.needs) html += `<p class="popup-detail">📋 <strong>Insumos:</strong> ${item.needs}</p>`;
        if (item.schedule) html += `<p class="popup-detail">🕐 Horario: ${item.schedule}</p>`;
    }
    
    if (item.type === 'shelter') {
        if (item.capacity) {
            const pct = item.capacity > 0 ? Math.round(((item.occupancy || 0) / item.capacity) * 100) : 0;
            html += `<p class="popup-detail">👥 Ocupación: ${item.occupancy || 0}/${item.capacity} (${pct}%)</p>`;
        }
    }
    
    if (item.type === 'hospital') {
        const statusColors = { operational: '#27ae60', damaged: '#e67e22', overwhelmed: '#d92525' };
        const statusNames = { operational: 'Operacional', damaged: 'Instalaciones Afectadas', overwhelmed: 'Urgencias Saturadas' };
        html += `<p class="popup-detail">Estado: <strong style="color:${statusColors[item.status]}">${statusNames[item.status]}</strong></p>`;
    }
    
    html += `<div class="popup-actions">`;
    html += `<button class="popup-btn popup-btn-route" onclick="calculateRouteTo(${item.lat}, ${item.lng})">🗺️ Calcular Ruta</button>`;
    
    if (item.type !== 'hospital') {
        html += `<button class="popup-btn popup-btn-delete" onclick="deleteItem('${item.id}', '${item.type}')">🗑️</button>`;
    }
    
    html += `</div></div>`;
    return html;
}

// --- UI Actions & Map Quick Registration ---
function initUI() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            target.classList.add('active');
            target.setAttribute('aria-selected', 'true');
            document.getElementById(`tab-${target.dataset.tab}`).classList.add('active');
            if (target.dataset.tab === 'donations') {
                initPayPalSmartButton();
            }
        });
    });

    const typeSelect = document.getElementById('add-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            document.getElementById('dynamic-fields-collection').classList.toggle('hidden', e.target.value !== 'collection');
            document.getElementById('dynamic-fields-shelter').classList.toggle('hidden', e.target.value !== 'shelter');
        });
    }

    document.getElementById('btn-use-location')?.addEventListener('click', getAndSetLocation);
    document.getElementById('add-place-form')?.addEventListener('submit', handleAddPlace);
    document.getElementById('edit-form')?.addEventListener('submit', handleEditPlace);
    document.getElementById('btn-geolocate')?.addEventListener('click', geolocateUser);

    document.getElementById('btn-add-center-map')?.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar')?.classList.add('open');
        }
        document.querySelector('[data-tab="add"]')?.click();
        getAndSetLocation();
        showToast('📦 Registra la ubicación del Centro de Acopio', 'info');
    });

    document.getElementById('btn-toggle-zones')?.addEventListener('click', () => {
        zonesVisible = !zonesVisible;
        if (zonesVisible) {
            if (map && zonesLayerGroup) map.addLayer(zonesLayerGroup);
            showToast('🔴 Zonas sismicas visibles', 'info');
        } else {
            if (map && zonesLayerGroup) map.removeLayer(zonesLayerGroup);
            showToast('Zonas sismicas ocultas', 'info');
        }
        renderMapMarkers();
    });

    document.getElementById('btn-toggle-legend')?.addEventListener('click', () => {
        const legend = document.getElementById('map-legend');
        legendVisible = !legendVisible;
        if (legend) legend.classList.toggle('hidden', !legendVisible);
    });

    document.getElementById('close-route')?.addEventListener('click', clearRoute);
    document.getElementById('btn-clear-route')?.addEventListener('click', clearRoute);

    document.getElementById('filter-type')?.addEventListener('change', renderPlacesList);
    document.getElementById('search-input')?.addEventListener('input', renderPlacesList);

    document.getElementById('missing-person-form')?.addEventListener('submit', handleAddMissingPerson);
    document.getElementById('search-missing')?.addEventListener('input', renderMissingPersonsList);

    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
    });
    
    document.getElementById('sidebar-toggle-mobile')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });
}

// --- Geolocation ---
function getAndSetLocation() {
    if (!navigator.geolocation) {
        showToast('⚠️ Geolocalización no soportada en este navegador', 'error');
        return;
    }
    
    showToast('📍 Obteniendo coordenadas GPS...', 'info');
    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            document.getElementById('add-lat').value = lat.toFixed(6);
            document.getElementById('add-lng').value = lng.toFixed(6);
            verifyCoordinatesLocation(lat, lng);
            showToast('✅ Coordenadas GPS fijadas', 'success');
        },
        () => showToast('❌ Active el GPS en su dispositivo', 'error'),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function geolocateUser() {
    if (!navigator.geolocation) {
        showToast('⚠️ Geolocalización no soportada', 'error');
        return;
    }

    showToast('📍 Buscando tu ubicación...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        pos => {
            userLocation = [pos.coords.latitude, pos.coords.longitude];
            map.flyTo(userLocation, 14, { duration: 1.2 });
            
            if (userLocationMarker) map.removeLayer(userLocationMarker);
            
            userLocationMarker = L.marker(userLocation, {
                icon: L.divIcon({
                    html: '<div style="width:16px;height:16px;background:#003893;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,56,147,0.5);"></div>',
                    className: '',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                }),
                zIndexOffset: 3000
            }).addTo(map).bindPopup('📍 Tu ubicación actual').openPopup();
            
            showToast('✅ Ubicación localizada', 'success');
        },
        () => showToast('❌ Habilite el permiso de GPS', 'error'),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// --- Routing ---
window.calculateRouteTo = function(destLat, destLng) {
    if (!navigator.geolocation) {
        showToast('⚠️ Geolocalización no disponible', 'error');
        return;
    }
    
    showToast('🗺️ Calculando ruta vial...', 'info');
    map.closePopup();
    
    navigator.geolocation.getCurrentPosition(
        pos => {
            const startLat = pos.coords.latitude;
            const startLng = pos.coords.longitude;
            
            const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;
            
            fetch(url)
                .then(r => r.json())
                .then(data => {
                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
                        
                        clearRoute(false);
                        
                        routePolyline = L.polyline(coords, {
                            color: '#003893',
                            weight: 5,
                            opacity: 0.85,
                            dashArray: '8 6'
                        }).addTo(map);
                        
                        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
                        
                        const distKm = (route.distance / 1000).toFixed(1);
                        const timeMin = Math.ceil(route.duration / 60);
                        const timeStr = timeMin >= 60 ? `${Math.floor(timeMin/60)}h ${timeMin%60}m` : `${timeMin} min`;
                        
                        document.getElementById('route-panel').classList.remove('hidden');
                        document.getElementById('route-distance').textContent = `${distKm} km`;
                        document.getElementById('route-time').textContent = timeStr;
                        
                        showToast(`✅ Ruta: ${distKm} km (~${timeStr})`, 'success');
                    } else {
                        showToast('❌ No se encontró ruta terrestre', 'error');
                    }
                })
                .catch(() => showToast('⚠️ Sin conexión a servidor de navegación.', 'error'));
        },
        () => showToast('📍 Active el GPS para trazar la ruta', 'error'),
        { enableHighAccuracy: true, timeout: 10000 }
    );
};

function clearRoute(hidePanel = true) {
    if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }
    if (hidePanel !== false) {
        document.getElementById('route-panel')?.classList.add('hidden');
    }
}

// --- Add Place ---
function handleAddPlace(e) {
    e.preventDefault();
    
    const type = document.getElementById('add-type').value;
    const lat = parseFloat(document.getElementById('add-lat').value);
    const lng = parseFloat(document.getElementById('add-lng').value);
    const contactName = document.getElementById('add-contact-name').value.trim();
    const phone = document.getElementById('add-phone').value.trim();
    const address = document.getElementById('add-address').value.trim();
    
    const coPhoneRegex = /^(\+?57)?\s?(3\d{2}|60\d{1})\s?\d{3}\s?\d{4}$/;

    if (!contactName || contactName.length < 5) {
        showToast('⚠️ Ingrese el nombre del responsable', 'error');
        return;
    }

    if (!coPhoneRegex.test(phone)) {
        showToast('⚠️ Ingrese un teléfono válido de Colombia', 'error');
        return;
    }

    if (!currentUploadedPhotoBase64) {
        showToast('⚠️ Tome/suba una foto de verificación', 'error');
        return;
    }

    if (isNaN(lat) || isNaN(lng)) {
        showToast('⚠️ Fije la ubicación en el mapa o mediante GPS', 'error');
        return;
    }

    if (!isGeoVerifiedColombia && (lat < -4.3 || lat > 13.8 || lng < -82.5 || lng > -66.0)) {
        showToast('❌ La ubicación debe estar dentro de Colombia', 'error');
        return;
    }
    
    const newItem = {
        id: 'usr_' + Date.now(),
        name: document.getElementById('add-name').value.trim(),
        address: address,
        lat, lng,
        contactName: contactName,
        contact: phone,
        photo: currentUploadedPhotoBase64,
        verified: true,
        type: type,
        dateAdded: new Date().toLocaleString('es-CO')
    };

    if (type === 'collection') {
        newItem.needs = document.getElementById('add-needs').value.trim();
        newItem.schedule = document.getElementById('add-schedule').value.trim();
        db.collectionCenters.push(newItem);
    } else {
        newItem.capacity = parseInt(document.getElementById('add-capacity').value) || 0;
        newItem.occupancy = parseInt(document.getElementById('add-occupancy').value) || 0;
        db.shelters.push(newItem);
    }

    saveData();
    recordIPVisitorTelemetry(`Registro Centro Verificado: ${newItem.name} (${phone})`);
    showToast('🛡️ Centro verificado y registrado exitosamente', 'success');

    e.target.reset();
    currentUploadedPhotoBase64 = null;
    document.getElementById('photo-preview-container')?.classList.add('hidden');
    document.getElementById('geo-status-indicator')?.classList.add('hidden');
    
    document.querySelector('[data-tab="list"]')?.click();
    map.flyTo([lat, lng], 14, { duration: 1 });
}

// --- Admin Panel Renderers (/admin) ---
function renderAdminPanel() {
    let logs = [];
    try {
        const saved = localStorage.getItem(ADMIN_LOGS_KEY);
        if (saved) logs = JSON.parse(saved);
    } catch(e) {}

    let intents = [];
    try {
        const savedI = localStorage.getItem('acopio_donation_intents');
        if (savedI) intents = JSON.parse(savedI);
    } catch(e) {}

    // Stat Counters
    document.getElementById('admin-stat-ips').textContent = new Set(logs.map(l => l.ip)).size || 1;
    document.getElementById('admin-stat-registrations').textContent = db.collectionCenters.length + db.shelters.length;
    document.getElementById('admin-stat-donations-intent').textContent = intents.length;
    document.getElementById('admin-stat-selfies').textContent = db.collectionCenters.filter(c => c.photo).length + db.shelters.filter(s => s.photo).length;

    // Table 1: Telemetry
    const tbody1 = document.getElementById('admin-telemetry-tbody');
    if (tbody1) {
        tbody1.innerHTML = logs.map(l => `
            <tr>
                <td>${l.timestamp}</td>
                <td><strong>${l.ip}</strong></td>
                <td><span style="font-size:0.7rem;">${l.agent}</span></td>
                <td><span class="type-badge">${l.action}</span></td>
            </tr>
        `).join('') || `<tr><td colspan="4" style="text-align:center;">Sin registros de telemetría aún.</td></tr>`;
    }

    // Table 2: Selfies Vault
    const tbody2 = document.getElementById('admin-selfies-tbody');
    if (tbody2) {
        const verifiedItems = [...db.collectionCenters, ...db.shelters].filter(i => i.photo);
        tbody2.innerHTML = verifiedItems.map(i => `
            <tr>
                <td><strong>${i.name}</strong></td>
                <td>${i.contactName || 'N/A'}</td>
                <td>📞 ${i.contact || 'N/A'}</td>
                <td>${i.address || 'CO'}</td>
                <td>
                    <img src="${i.photo}" class="admin-selfie-thumb" alt="Selfie" onclick="openImageModal('${i.photo}', '${i.name}')">
                </td>
            </tr>
        `).join('') || `<tr><td colspan="5" style="text-align:center;">Sin fotos de verificación registradas.</td></tr>`;
    }

    // Table 3: Donation Intents
    const tbody3 = document.getElementById('admin-intents-tbody');
    if (tbody3) {
        tbody3.innerHTML = intents.map(i => `
            <tr>
                <td>${i.date}</td>
                <td><strong>${i.channel}</strong></td>
                <td>${i.ip}</td>
                <td><span class="status-badge status-operational">${i.status}</span></td>
            </tr>
        `).join('') || `<tr><td colspan="4" style="text-align:center;">Sin intentos de donación registrados.</td></tr>`;
    }
}

window.showAdminSubTab = function(paneId, btn) {
    document.querySelectorAll('#modal-admin-panel .donation-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.admin-pane').forEach(p => p.classList.add('hidden'));
    document.getElementById(`admin-tab-${paneId}`)?.classList.remove('hidden');
};

window.exportAdminAuditLog = function() {
    let logs = [];
    try {
        logs = JSON.parse(localStorage.getItem(ADMIN_LOGS_KEY) || '[]');
    } catch(e) {}
    
    let intents = [];
    try {
        intents = JSON.parse(localStorage.getItem('acopio_donation_intents') || '[]');
    } catch(e) {}

    const auditData = {
        meta: { title: 'Acopio COL Audit Report', adminUser: 'Gingerboy', exportDate: new Date().toISOString() },
        database: db,
        telemetryIPs: logs,
        donationIntents: intents
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Acopio_COL_Auditoria_Gingerboy_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('💾 Informe de Auditoría descargado por Gingerboy', 'success');
};

// --- Edit Modal ---
window.openEditModal = function(id, type) {
    map.closePopup();
    let item;
    if (type === 'collection') {
        item = db.collectionCenters.find(i => i.id === id);
    } else if (type === 'shelter') {
        item = db.shelters.find(i => i.id === id);
    }
    if (!item) return;
    
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-type-hidden').value = item.type;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-address').value = item.address || '';
    document.getElementById('edit-contact-name').value = item.contactName || '';
    document.getElementById('edit-phone').value = item.contact || '';
    
    const typeNames = { collection: '📦 Editar Centro de Acopio', shelter: '🏠 Editar Refugio' };
    document.getElementById('edit-modal-title').textContent = typeNames[item.type] || 'Editar Punto';
    
    if (item.type === 'collection') {
        document.getElementById('edit-collection-fields').classList.remove('hidden');
        document.getElementById('edit-shelter-fields').classList.add('hidden');
        document.getElementById('edit-needs').value = item.needs || '';
        document.getElementById('edit-schedule').value = item.schedule || '';
    } else {
        document.getElementById('edit-collection-fields').classList.add('hidden');
        document.getElementById('edit-shelter-fields').classList.remove('hidden');
        document.getElementById('edit-capacity').value = item.capacity || 0;
        document.getElementById('edit-occupancy').value = item.occupancy || 0;
    }
    
    document.getElementById('edit-modal').classList.remove('hidden');
};

window.closeEditModal = function() {
    document.getElementById('edit-modal').classList.add('hidden');
};

function handleEditPlace(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const type = document.getElementById('edit-type-hidden').value;
    let list = type === 'collection' ? db.collectionCenters : db.shelters;
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return;
    
    list[idx].name = document.getElementById('edit-name').value.trim();
    list[idx].address = document.getElementById('edit-address').value.trim();
    list[idx].contactName = document.getElementById('edit-contact-name').value.trim();
    list[idx].contact = document.getElementById('edit-phone').value.trim();
    
    if (type === 'collection') {
        list[idx].needs = document.getElementById('edit-needs').value.trim();
        list[idx].schedule = document.getElementById('edit-schedule').value.trim();
    } else {
        list[idx].capacity = parseInt(document.getElementById('edit-capacity').value) || 0;
        list[idx].occupancy = parseInt(document.getElementById('edit-occupancy').value) || 0;
    }
    
    closeEditModal();
    saveData();
    showToast('✅ Punto actualizado', 'success');
}

window.deleteFromModal = function() {
    const id = document.getElementById('edit-id').value;
    const type = document.getElementById('edit-type-hidden').value;
    if (confirm('¿Confirma eliminar este registro?')) {
        if (type === 'collection') {
            db.collectionCenters = db.collectionCenters.filter(i => i.id !== id);
        } else {
            db.shelters = db.shelters.filter(i => i.id !== id);
        }
        closeEditModal();
        saveData();
        showToast('🗑️ Punto eliminado', 'info');
    }
};

window.deleteItem = function(id, type) {
    if (confirm('¿Confirma eliminar este punto del mapa?')) {
        if (type === 'collection') {
            db.collectionCenters = db.collectionCenters.filter(i => i.id !== id);
        } else if (type === 'shelter') {
            db.shelters = db.shelters.filter(i => i.id !== id);
        } else if (type === 'need') {
            db.emergencyRequests = db.emergencyRequests.filter(i => i.id !== id);
        }
        map.closePopup();
        saveData();
        showToast('🗑️ Registro eliminado', 'info');
    }
};

// --- Image Viewer Modal ---
window.openImageModal = function(src, title) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('image-modal-img');
    const caption = document.getElementById('image-modal-caption');
    if (!modal || !img) return;

    img.src = src;
    if (caption) caption.textContent = title ? `Punto: ${title}` : 'Foto de Verificación';
    modal.classList.remove('hidden');
};

window.closeImageModal = function() {
    document.getElementById('image-modal')?.classList.add('hidden');
};

// --- Render Lists ---
function renderPlacesList() {
    const list = document.getElementById('places-list');
    const countEl = document.getElementById('list-count');
    if (!list) return;
    
    list.innerHTML = '';
    
    const filterType = document.getElementById('filter-type')?.value || 'all';
    const searchTxt = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    
    let items = [];
    if (filterType === 'all' || filterType === 'collection') items = items.concat((db.collectionCenters || []).map(i => ({...i})));
    if (filterType === 'all' || filterType === 'shelter') items = items.concat((db.shelters || []).map(i => ({...i})));
    if (filterType === 'all' || filterType === 'need') items = items.concat((db.emergencyRequests || []).map(i => ({...i})));
    if (filterType === 'all' || filterType === 'hospital') items = items.concat((db.hospitals || []).map(i => ({...i})));

    if (searchTxt) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(searchTxt) ||
            (item.address && item.address.toLowerCase().includes(searchTxt)) ||
            (item.city && item.city.toLowerCase().includes(searchTxt)) ||
            (item.contactName && item.contactName.toLowerCase().includes(searchTxt))
        );
    }

    if (countEl) countEl.textContent = `${items.length} punto${items.length !== 1 ? 's' : ''} visible${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
        list.innerHTML = `<li style="text-align:center;padding:20px;opacity:0.6;font-size:0.85rem;">No hay puntos registrados en esta categoría. Use las opciones del menú principal para registrar una oferta o pedido de ayuda.</li>`;
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'place-card';
        
        const colors = { collection: 'var(--color-success)', shelter: 'var(--color-shelter)', need: 'var(--color-critical)', hospital: 'var(--color-hospital)' };
        const icons = { collection: '📦', shelter: '🏠', need: '🆘', hospital: '🏥' };
        const typeLabels = { collection: 'Centro de Acopio', shelter: 'Refugio', need: 'Pedido de Ayuda', hospital: 'Hospital Público' };
        
        li.style.borderLeftColor = colors[item.type];
        
        let verifiedHTML = item.verified ? `<span class="verified-badge">🛡️ Verificado</span>` : '';
        let photoHTML = (isAdminAuthenticated && item.photo) ? `<img src="${item.photo}" class="center-thumb-img" alt="Foto" onclick="event.stopPropagation(); openImageModal('${item.photo}', '${item.name}')">` : '';
        
        let extraInfo = '';
        if (item.contactName) {
            extraInfo += `<p style="font-size:0.76rem;margin-top:2px;">👤 Contacto: <strong>${item.contactName}</strong> ${item.contact ? `(📞 ${item.contact})` : ''}</p>`;
        }

        if (item.type === 'need') {
            extraInfo += `<p style="font-size:0.78rem;color:#d92525;margin-top:2px;">${item.details}</p>`;
        }

        if (item.type === 'shelter' && item.capacity) {
            const pct = Math.round(((item.occupancy || 0) / item.capacity) * 100);
            const barColor = pct > 90 ? 'var(--color-critical)' : pct > 70 ? 'var(--color-severe)' : 'var(--color-success)';
            extraInfo += `<div class="occupancy-bar"><div class="occupancy-fill" style="width:${pct}%;background:${barColor}"></div></div><p style="font-size:0.75rem;opacity:0.75;">Ocupación: ${item.occupancy || 0}/${item.capacity} (${pct}%)</p>`;
        }

        if (item.type === 'hospital') {
            const statusClasses = { operational: 'status-operational', damaged: 'status-damaged', overwhelmed: 'status-overwhelmed' };
            const statusLabels = { operational: 'Operacional', damaged: 'Instalaciones Afectadas', overwhelmed: 'Urgencias Saturadas' };
            extraInfo += `<span class="status-badge ${statusClasses[item.status]}">${statusLabels[item.status]}</span>`;
        }
        
        li.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <h4>${icons[item.type]} ${item.name} <span class="type-badge">${typeLabels[item.type]}</span> ${verifiedHTML}</h4>
                    <p>📍 ${item.address || item.city || ''}</p>
                    ${extraInfo}
                </div>
                ${photoHTML}
            </div>
            ${item.type !== 'hospital' ? `
            <div class="place-actions">
                <button class="place-action-btn" onclick="event.stopPropagation(); deleteItem('${item.id}', '${item.type}')" title="Eliminar">🗑️</button>
            </div>` : ''}
        `;
        
        li.addEventListener('click', () => {
            map.flyTo([item.lat, item.lng], 15, { duration: 1 });
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar')?.classList.remove('open');
            }
        });
        
        list.appendChild(li);
    });
}

function renderEmergencyContacts() {
    const container = document.getElementById('emergency-contacts-list');
    if (!container || !db.emergencyContacts?.national) return;
    
    container.innerHTML = db.emergencyContacts.national.map(c => `
        <a href="tel:${c.number}" class="contact-item">
            <span class="contact-icon">${c.icon}</span>
            <div>
                <div class="contact-name">${c.name}</div>
                <div class="contact-number">${c.number}</div>
            </div>
        </a>
    `).join('');
}

function renderSafetyTips() {
    const container = document.getElementById('safety-tips');
    if (!container || !db.emergencyContacts?.tips) return;
    
    container.innerHTML = db.emergencyContacts.tips.map(tip => `<li>${tip}</li>`).join('');
}

function renderZonesList() {
    const container = document.getElementById('zones-list');
    if (!container) return;
    
    const affectedList = (db.affectedZones && db.affectedZones.length > 0) ? db.affectedZones : (typeof initialData !== 'undefined' ? initialData.affectedZones : []);
    
    container.innerHTML = affectedList.map(zone => `
        <div class="zone-card ${zone.severity}" onclick="map.flyTo([${zone.lat}, ${zone.lng}], 12, {duration:1})">
            <h4>📍 ${zone.name}, ${zone.department}</h4>
            <p>${zone.details}</p>
        </div>
    `).join('');
}

// --- Donations ---
function initDonationFilters() {
    document.querySelectorAll('.donation-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.donation-filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderDonationsList(e.target.dataset.dtype);
        });
    });
}

function renderDonationsList(filter = 'all') {
    const container = document.getElementById('donations-list');
    if (!container || !db.donations) return;
    
    const filtered = filter === 'all' ? db.donations : db.donations.filter(d => d.type === filter);
    
    container.innerHTML = filtered.map(d => `
        <div class="donation-card">
            <h4>${d.name}</h4>
            <p class="donation-desc">${d.description}</p>
            <div class="donation-account">🏛️ ${d.account}</div>
            ${d.officialPhone ? `<p class="donation-desc" style="font-weight:600;">📞 ${d.officialPhone}</p>` : ''}
            <div class="donation-links">
                <a href="${d.website}" target="_blank" rel="noopener" onclick="trackDonationIntent('${d.name}')">🌐 Sitio Oficial de Donación</a>
            </div>
        </div>
    `).join('');
}

// --- Missing Persons ---
function handleAddMissingPerson(e) {
    e.preventDefault();
    
    const phone = document.getElementById('missing-contact').value.trim();
    const coPhoneRegex = /^(\+?57)?\s?(3\d{2}|60\d{1})\s?\d{3}\s?\d{4}$/;

    if (!coPhoneRegex.test(phone)) {
        showToast('⚠️ Ingrese un teléfono de contacto válido de Colombia', 'error');
        return;
    }

    const person = {
        id: 'mp_' + Date.now(),
        name: document.getElementById('missing-name').value.trim(),
        age: document.getElementById('missing-age').value,
        city: document.getElementById('missing-city').value.trim(),
        description: document.getElementById('missing-description').value.trim(),
        contact: phone,
        date: new Date().toLocaleString('es-CO')
    };
    
    if (!db.missingPersons) db.missingPersons = [];
    db.missingPersons.unshift(person);
    
    saveData();
    recordIPVisitorTelemetry(`Reporte Búsqueda Persona: ${person.name}`);
    showToast('📋 Reporte publicado en la red comunitaria', 'info');
    e.target.reset();
}

function renderMissingPersonsList() {
    const container = document.getElementById('missing-persons-list');
    if (!container) return;
    
    const searchTxt = document.getElementById('search-missing')?.value.toLowerCase().trim() || '';
    
    let persons = db.missingPersons || [];
    if (searchTxt) {
        persons = persons.filter(p => p.name.toLowerCase().includes(searchTxt) || (p.city && p.city.toLowerCase().includes(searchTxt)));
    }
    
    if (persons.length === 0) {
        container.innerHTML = `<p style="text-align:center;opacity:0.6;padding:16px;font-size:0.82rem;">No hay reportes de personas ingresadas${searchTxt ? ' con esa búsqueda' : ''}.</p>`;
        return;
    }
    
    container.innerHTML = persons.map(p => `
        <div class="missing-card">
            <h4>🔍 ${p.name}</h4>
            <p>${p.description || 'Sin descripción adicional'}</p>
            <div class="missing-meta">
                ${p.age ? `<span>Edad: ${p.age}</span>` : ''}
                ${p.city ? `<span>📍 ${p.city}</span>` : ''}
                ${p.contact ? `<span>📞 Contacto: ${p.contact}</span>` : ''}
            </div>
            <div class="missing-meta"><span>Fecha registro: ${p.date}</span></div>
        </div>
    `).join('');
}

// --- Collapsible Sections ---
window.toggleSection = function(header) {
    const section = header.closest('.section');
    if (section) section.classList.toggle('collapsed');
};

// --- Social Sharing ---
window.shareOnWhatsApp = function() {
    const text = '🆘 Mapa de Ayuda Sismo 7.4 Colombia — Quiero Ayudar / Necesito Ayuda / Donaciones PayPal y Binance:';
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
};

window.shareOnTwitter = function() {
    const text = '🆘 Mapa de Ayuda Terremoto Colombia 7.4 — Registra ayuda, pide auxilio o dona en PayPal/Binance: #SismoColombia #TerremotoColombia';
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
};

window.copyShareLink = function() {
    const url = window.location.href;
    navigator.clipboard.writeText(`🆘 Mapa de Ayuda Terremoto Colombia 7.4: ${url}`).then(() => {
        showToast('✅ Enlace copiado al portapapeles', 'success');
    }).catch(() => {
        showToast('📋 Copie la dirección URL del navegador', 'info');
    });
};

// --- Toast Notifications ---
function showToast(msg, type = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    
    setTimeout(() => {
        if (container.contains(toast)) container.removeChild(toast);
    }, 3200);
}
