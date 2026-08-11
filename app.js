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

const DATA_KEY_APP = 'earthquake_data_v2026_colombia_v6';
const ADMIN_LOGS_KEY = 'acopio_admin_telemetry_logs';

let db = { affectedZones: [], collectionCenters: [], shelters: [], emergencyRequests: [], hospitals: [], epicenter: null, donations: [], emergencyContacts: {}, missingPersons: [], kitchens: [], petShelters: [], volunteerHubs: [], adminMessages: [] };
let telemetryLogs = [];
let liveUsersCount = 434;
let currentUploadedMissingPhotoBase64 = null;

// --- Live Connected Users Counter ---
function initLiveUserCounter() {
    const updateDOMCounters = () => {
        const welcomeCounter = document.getElementById('welcome-live-counter');
        const mapCounter = document.getElementById('map-live-counter');
        if (welcomeCounter) welcomeCounter.textContent = liveUsersCount;
        if (mapCounter) mapCounter.textContent = liveUsersCount;
    };

    updateDOMCounters();

    // Increment dynamically every 4.5 seconds
    setInterval(() => {
        const increment = Math.floor(Math.random() * 3) + 1; // +1, +2 or +3
        liveUsersCount += increment;
        updateDOMCounters();
    }, 4500);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTheme();
    initOfflineDetection();
    initPhotoUploadHandler();
    initMissingPhotoUploadHandler();
    initModalsAndForms();
    initContactAdminForm();
    initDonationFilters();
    initAdminHashDetector();
    initLiveUserCounter();
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

// --- IP & Country Telemetry Logger ---
function recordIPVisitorTelemetry(action = 'Visita Portal') {
    const timestamp = new Date().toLocaleString('es-CO');
    const userAgent = navigator.userAgent;

    let localLogs = [];
    try {
        const saved = localStorage.getItem(ADMIN_LOGS_KEY);
        if (saved) localLogs = JSON.parse(saved);
    } catch(e) {}

    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            const countryCode = data.country_code || 'CO';
            const flagEmoji = countryCode === 'CO' ? '🇨🇴' : countryCode === 'US' ? '🇺🇸' : countryCode === 'ES' ? '🇪🇸' : countryCode === 'MX' ? '🇲🇽' : '🌍';
            const locationStr = `${flagEmoji} ${data.country_name || 'Colombia'} (${data.city || 'Bogotá'})`;

            const entry = {
                id: 'tel_' + Date.now(),
                timestamp,
                ip: data.ip || '181.135.x.x',
                location: locationStr,
                agent: userAgent.slice(0, 45) + '...',
                action
            };
            localLogs.unshift(entry);
            if (localLogs.length > 200) localLogs = localLogs.slice(0, 200);
            localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(localLogs));
            telemetryLogs = localLogs;
        })
        .catch(() => {
            fetch('https://api64.ipify.org?format=json')
                .then(r => r.json())
                .then(d => {
                    const entry = {
                        id: 'tel_' + Date.now(),
                        timestamp,
                        ip: d.ip || '181.135.x.x',
                        location: '🇨🇴 Colombia (Detectado)',
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
                        ip: 'Localhost / Conexión Directa',
                        location: '🇨🇴 Colombia',
                        agent: userAgent.slice(0, 45) + '...',
                        action
                    };
                    localLogs.unshift(entry);
                    if (localLogs.length > 200) localLogs = localLogs.slice(0, 200);
                    localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(localLogs));
                    telemetryLogs = localLogs;
                });
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

    if (typeof initialData !== 'undefined') {
        if (!db.collectionCenters || db.collectionCenters.length === 0) {
            db.collectionCenters = [...initialData.collectionCenters];
        } else {
            initialData.collectionCenters.forEach(item => {
                if (!db.collectionCenters.some(c => c.id === item.id)) {
                    db.collectionCenters.push(item);
                }
            });
        }

        if (!db.shelters || db.shelters.length === 0) {
            db.shelters = [...initialData.shelters];
        } else {
            initialData.shelters.forEach(item => {
                if (!db.shelters.some(s => s.id === item.id)) {
                    db.shelters.push(item);
                }
            });
        }

        if (initialData.kitchens) {
            if (!db.kitchens || db.kitchens.length === 0) {
                db.kitchens = [...initialData.kitchens];
            } else {
                initialData.kitchens.forEach(item => {
                    if (!db.kitchens.some(k => k.id === item.id)) {
                        db.kitchens.push(item);
                    }
                });
            }
        }

        if (initialData.petShelters) {
            if (!db.petShelters || db.petShelters.length === 0) {
                db.petShelters = [...initialData.petShelters];
            } else {
                initialData.petShelters.forEach(item => {
                    if (!db.petShelters.some(p => p.id === item.id)) {
                        db.petShelters.push(item);
                    }
                });
            }
        }

        if (initialData.volunteerHubs) {
            if (!db.volunteerHubs || db.volunteerHubs.length === 0) {
                db.volunteerHubs = [...initialData.volunteerHubs];
            } else {
                initialData.volunteerHubs.forEach(item => {
                    if (!db.volunteerHubs.some(v => v.id === item.id)) {
                        db.volunteerHubs.push(item);
                    }
                });
            }
        }

        if (initialData.emergencyContacts) {
            db.emergencyContacts = initialData.emergencyContacts;
        }

        if (initialData.donations) {
            if (!db.donations || db.donations.length === 0) {
                db.donations = [...initialData.donations];
            } else {
                initialData.donations.forEach(item => {
                    if (!db.donations.some(d => d.name === item.name)) {
                        db.donations.push(item);
                    }
                });
            }
        }
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
    if (!db.kitchens) db.kitchens = [];
    if (!db.petShelters) db.petShelters = [];
    if (!db.volunteerHubs) db.volunteerHubs = [];
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

    if (typeof initialData !== 'undefined') {
        if (!db.collectionCenters || db.collectionCenters.length === 0) {
            db.collectionCenters = [...initialData.collectionCenters];
        } else {
            initialData.collectionCenters.forEach(item => {
                if (!db.collectionCenters.some(c => c.id === item.id)) {
                    db.collectionCenters.push(item);
                }
            });
        }

        if (!db.shelters || db.shelters.length === 0) {
            db.shelters = [...initialData.shelters];
        } else {
            initialData.shelters.forEach(item => {
                if (!db.shelters.some(s => s.id === item.id)) {
                    db.shelters.push(item);
                }
            });
        }
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

    const sheltersElem = document.getElementById('stat-shelters');
    if (sheltersElem) sheltersElem.textContent = (db.shelters || []).length;

    const centersElem = document.getElementById('stat-centers');
    if (centersElem) centersElem.textContent = (db.collectionCenters || []).length;

    const kitchensElem = document.getElementById('stat-kitchens');
    if (kitchensElem) kitchensElem.textContent = (db.kitchens || []).length;

    const hospitalsElem = document.getElementById('stat-hospitals');
    if (hospitalsElem) hospitalsElem.textContent = (db.hospitals || []).length;

    const petsElem = document.getElementById('stat-pets');
    if (petsElem) petsElem.textContent = (db.petShelters || []).length;

    const volunteersElem = document.getElementById('stat-volunteers');
    if (volunteersElem) volunteersElem.textContent = (db.volunteerHubs || []).length;
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
            html: '<span class="marker-emoji">📦</span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Shelters
    (db.shelters || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-shelter',
            html: '<span class="marker-emoji">🏠</span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Kitchens / Ollas Comunitarias
    (db.kitchens || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-kitchen',
            html: '<span class="marker-emoji">🍲</span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Pet Shelters / Acopio Animal
    (db.petShelters || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-pet',
            html: '<span class="marker-emoji">🐾</span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Volunteer Hubs
    (db.volunteerHubs || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-volunteer',
            html: '<span class="marker-emoji">🤝</span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Emergency Needs Requests (🆘)
    (db.emergencyRequests || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-need',
            html: '<span class="marker-emoji">🆘</span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Hospitals & Blood Banks
    (db.hospitals || []).forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-hospital',
            html: '<span class="marker-emoji">🏥</span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });
}

function createPopupContent(item) {
    let html = `<div class="popup-content">`;
    const typeNames = {
        collection: '📦 Centro de Acopio',
        shelter: '🏠 Refugio / Albergue',
        kitchen: '🍲 Comedor de Ayuda',
        hospital: '🏥 Hospital / Banco Sangre',
        pet: '🐾 Mascotas & Animales',
        volunteer: '🤝 Punto de Voluntariado',
        need: '🆘 Solicitud de Ayuda Urgente'
    };
    
    html += `<h3>${item.name}</h3>`;
    html += `<p class="popup-detail" style="opacity:0.6;font-size:0.75rem;">${typeNames[item.type] || 'Espacio de Ayuda'}</p>`;

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
        if (item.needs) html += `<p class="popup-detail">📋 Insumos: ${item.needs}</p>`;
    }

    if (item.type === 'kitchen') {
        if (item.dailyMeals) html += `<p class="popup-detail">🍲 <strong>Raciones Diarias:</strong> ${item.dailyMeals} raciones/día</p>`;
        if (item.needs) html += `<p class="popup-detail">📋 <strong>Insumos Cocina:</strong> ${item.needs}</p>`;
        if (item.schedule) html += `<p class="popup-detail">🕐 Horario: ${item.schedule}</p>`;
    }

    if (item.type === 'pet') {
        if (item.petCapacity) html += `<p class="popup-detail">🐾 Capacidad Mascotas: ${item.petCapacity}</p>`;
        if (item.acceptedTypes) html += `<p class="popup-detail">🐕 Tipos Aceptados: ${item.acceptedTypes}</p>`;
        if (item.needs) html += `<p class="popup-detail">📋 Insumos Vet: ${item.needs}</p>`;
    }

    if (item.type === 'volunteer') {
        if (item.rolesNeeded) html += `<p class="popup-detail">🤝 <strong>Tareas:</strong> ${item.rolesNeeded}</p>`;
        if (item.schedule) html += `<p class="popup-detail">🕐 Turnos: ${item.schedule}</p>`;
        if (item.needs) html += `<p class="popup-detail">📋 Requisitos: ${item.needs}</p>`;
    }
    
    if (item.type === 'hospital') {
        const statusColors = { operational: '#27ae60', damaged: '#e67e22', overwhelmed: '#d92525' };
        const statusNames = { operational: 'Operacional / Donación Sangre', damaged: 'Instalaciones Afectadas', overwhelmed: 'Urgencias Saturadas' };
        html += `<p class="popup-detail">Estado: <strong style="color:${statusColors[item.status] || '#27ae60'}">${statusNames[item.status] || 'Operacional'}</strong></p>`;
        if (item.needs) html += `<p class="popup-detail">💉 <strong>Requerimiento:</strong> ${item.needs}</p>`;
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
            const val = e.target.value;
            document.getElementById('dynamic-fields-collection')?.classList.toggle('hidden', val !== 'collection');
            document.getElementById('dynamic-fields-shelter')?.classList.toggle('hidden', val !== 'shelter');
            document.getElementById('dynamic-fields-kitchen')?.classList.toggle('hidden', val !== 'kitchen');
            document.getElementById('dynamic-fields-hospital')?.classList.toggle('hidden', val !== 'hospital');
            document.getElementById('dynamic-fields-pet')?.classList.toggle('hidden', val !== 'pet');
            document.getElementById('dynamic-fields-volunteer')?.classList.toggle('hidden', val !== 'volunteer');
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
    } else if (type === 'shelter') {
        newItem.capacity = parseInt(document.getElementById('add-capacity').value) || 0;
        newItem.occupancy = parseInt(document.getElementById('add-occupancy').value) || 0;
        db.shelters.push(newItem);
    } else if (type === 'kitchen') {
        newItem.dailyMeals = parseInt(document.getElementById('add-kitchen-meals').value) || 0;
        newItem.needs = document.getElementById('add-kitchen-needs').value.trim();
        newItem.schedule = 'Atención Diaria';
        if (!db.kitchens) db.kitchens = [];
        db.kitchens.push(newItem);
    } else if (type === 'hospital') {
        newItem.status = document.getElementById('add-hospital-status').value;
        newItem.needs = document.getElementById('add-hospital-needs').value.trim();
        if (!db.hospitals) db.hospitals = [];
        db.hospitals.push(newItem);
    } else if (type === 'pet') {
        newItem.petCapacity = parseInt(document.getElementById('add-pet-capacity').value) || 0;
        newItem.acceptedTypes = document.getElementById('add-pet-types').value.trim();
        newItem.needs = newItem.acceptedTypes;
        if (!db.petShelters) db.petShelters = [];
        db.petShelters.push(newItem);
    } else if (type === 'volunteer') {
        newItem.rolesNeeded = document.getElementById('add-volunteer-roles').value.trim();
        newItem.schedule = document.getElementById('add-volunteer-shifts').value.trim();
        newItem.needs = newItem.rolesNeeded;
        if (!db.volunteerHubs) db.volunteerHubs = [];
        db.volunteerHubs.push(newItem);
    }

    saveData();
    recordIPVisitorTelemetry(`Registro Espacio Verificado [${type.toUpperCase()}]: ${newItem.name} (${phone})`);
    showToast('🛡️ Espacio de auxilio verificado y publicado', 'success');

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

    const pendingMissing = (db.missingPersons || []).filter(m => m.status === 'pending');
    const adminMessages = db.adminMessages || [];

    // Stat Counters
    const ipStatEl = document.getElementById('admin-stat-ips');
    if (ipStatEl) ipStatEl.textContent = new Set(logs.map(l => l.ip)).size || 1;
    
    const pendingMissingEl = document.getElementById('admin-stat-pending-missing');
    if (pendingMissingEl) pendingMissingEl.textContent = pendingMissing.length;

    const messagesEl = document.getElementById('admin-stat-messages');
    if (messagesEl) messagesEl.textContent = adminMessages.length;

    const selfiesEl = document.getElementById('admin-stat-selfies');
    if (selfiesEl) selfiesEl.textContent = (db.collectionCenters.filter(c => c.photo).length + db.shelters.filter(s => s.photo).length + (db.missingPersons || []).filter(m => m.photo).length);

    // Table 1: Telemetry (IP & Country)
    const tbody1 = document.getElementById('admin-telemetry-tbody');
    if (tbody1) {
        tbody1.innerHTML = logs.map(l => `
            <tr>
                <td>${l.timestamp}</td>
                <td><strong>${l.location || '🇨🇴 Colombia'}</strong></td>
                <td><code>${l.ip}</code></td>
                <td><span style="font-size:0.7rem;">${l.agent}</span></td>
                <td><span class="type-badge">${l.action}</span></td>
            </tr>
        `).join('') || `<tr><td colspan="5" style="text-align:center;">Sin registros de telemetría aún.</td></tr>`;
    }

    // Table 2: Missing Approval Vault
    const tbodyMissing = document.getElementById('admin-missing-tbody');
    if (tbodyMissing) {
        if (pendingMissing.length === 0) {
            tbodyMissing.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px;opacity:0.7;">No hay reportes de personas desaparecidas pendientes de aprobación.</td></tr>`;
        } else {
            tbodyMissing.innerHTML = pendingMissing.map(m => `
                <tr>
                    <td>
                        <img src="${m.photo}" class="admin-selfie-thumb" alt="Foto ${m.name}" onclick="openImageModal('${m.photo}', '${m.name}')">
                    </td>
                    <td><strong>${m.name}</strong><br><span style="font-size:0.72rem;opacity:0.75;">Reg: ${m.date}</span></td>
                    <td><span style="font-size:0.76rem;">Estatura: <strong>${m.height || 'N/A'}</strong><br>Ropa: ${m.clothing || 'N/A'}</span></td>
                    <td><span style="font-size:0.76rem;">📍 Cree que está: ${m.suspectedLocation || 'N/A'}<br>👁️ Visto: ${m.lastSeen || 'N/A'}</span></td>
                    <td>📞 <a href="tel:${m.contact}">${m.contact}</a></td>
                    <td>
                        <div style="display:flex;gap:6px;">
                            <button class="btn-primary" style="padding:4px 8px;font-size:0.75rem;" onclick="approveMissingPerson('${m.id}')">✅ Aprobar</button>
                            <button class="btn-danger" style="padding:4px 8px;font-size:0.75rem;" onclick="rejectMissingPerson('${m.id}')">❌ Rechazar</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Table 3: Messages & Feedback for Admin
    const tbodyMsgs = document.getElementById('admin-messages-tbody');
    if (tbodyMsgs) {
        if (adminMessages.length === 0) {
            tbodyMsgs.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px;opacity:0.7;">Sin mensajes o recomendaciones enviadas por usuarios aún.</td></tr>`;
        } else {
            tbodyMsgs.innerHTML = adminMessages.map(msg => `
                <tr>
                    <td>${msg.date}</td>
                    <td><strong>${msg.name}</strong></td>
                    <td>${msg.info}</td>
                    <td><span class="type-badge">${msg.type.toUpperCase()}</span></td>
                    <td style="font-size:0.8rem;max-width:260px;">${msg.message}</td>
                </tr>
            `).join('');
        }
    }

    // Table 4: Selfies Vault
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

    // Table 5: Donation Intents
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
        } else if (type === 'kitchen') {
            db.kitchens = db.kitchens.filter(i => i.id !== id);
        } else if (type === 'pet') {
            db.petShelters = db.petShelters.filter(i => i.id !== id);
        } else if (type === 'volunteer') {
            db.volunteerHubs = db.volunteerHubs.filter(i => i.id !== id);
        } else if (type === 'hospital') {
            db.hospitals = db.hospitals.filter(i => i.id !== id);
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
    if (filterType === 'all' || filterType === 'collection') items = items.concat((db.collectionCenters || []).map(i => ({...i, type: i.type || 'collection'})));
    if (filterType === 'all' || filterType === 'shelter') items = items.concat((db.shelters || []).map(i => ({...i, type: i.type || 'shelter'})));
    if (filterType === 'all' || filterType === 'kitchen') items = items.concat((db.kitchens || []).map(i => ({...i, type: i.type || 'kitchen'})));
    if (filterType === 'all' || filterType === 'pet') items = items.concat((db.petShelters || []).map(i => ({...i, type: i.type || 'pet'})));
    if (filterType === 'all' || filterType === 'volunteer') items = items.concat((db.volunteerHubs || []).map(i => ({...i, type: i.type || 'volunteer'})));
    if (filterType === 'all' || filterType === 'hospital') items = items.concat((db.hospitals || []).map(i => ({...i, type: i.type || 'hospital'})));
    if (filterType === 'all' || filterType === 'need') items = items.concat((db.emergencyRequests || []).map(i => ({...i, type: i.type || 'need'})));

    if (searchTxt) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(searchTxt) ||
            (item.address && item.address.toLowerCase().includes(searchTxt)) ||
            (item.city && item.city.toLowerCase().includes(searchTxt)) ||
            (item.contactName && item.contactName.toLowerCase().includes(searchTxt)) ||
            (item.needs && item.needs.toLowerCase().includes(searchTxt))
        );
    }

    if (countEl) countEl.textContent = `${items.length} punto${items.length !== 1 ? 's' : ''} visible${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
        list.innerHTML = `<li style="text-align:center;padding:20px;opacity:0.6;font-size:0.85rem;">No hay puntos registrados en esta categoría. Use el formulario para añadir un nuevo espacio.</li>`;
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'place-card';
        
        const colors = {
            collection: 'var(--color-success)',
            shelter: 'var(--color-shelter)',
            kitchen: '#e67e22',
            pet: '#00b894',
            volunteer: '#0984e3',
            hospital: 'var(--color-hospital)',
            need: 'var(--color-critical)'
        };
        const icons = {
            collection: '📦',
            shelter: '🏠',
            kitchen: '🍲',
            pet: '🐾',
            volunteer: '🤝',
            hospital: '🏥',
            need: '🆘'
        };
        const typeLabels = {
            collection: 'Centro Acopio',
            shelter: 'Refugio',
            kitchen: 'Comedor Ayuda',
            pet: 'Mascotas',
            volunteer: 'Voluntariado',
            hospital: 'Salud / Sangre',
            need: 'Pedido Ayuda'
        };
        
        li.style.borderLeftColor = colors[item.type] || '#003893';
        
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

        if (item.type === 'collection') {
            if (item.needs) extraInfo += `<p style="font-size:0.75rem;opacity:0.9;margin-top:3px;">📋 <strong>Insumos:</strong> ${item.needs}</p>`;
            if (item.schedule) extraInfo += `<p style="font-size:0.75rem;opacity:0.8;margin-top:2px;">🕐 <strong>Horario:</strong> ${item.schedule}</p>`;
        }

        if (item.type === 'kitchen') {
            if (item.dailyMeals) extraInfo += `<p style="font-size:0.75rem;color:#e67e22;font-weight:700;margin-top:3px;">🍲 Raciones: ${item.dailyMeals} / día</p>`;
            if (item.needs) extraInfo += `<p style="font-size:0.75rem;opacity:0.85;margin-top:2px;">📋 <strong>Insumos:</strong> ${item.needs}</p>`;
        }

        if (item.type === 'pet') {
            if (item.acceptedTypes) extraInfo += `<p style="font-size:0.75rem;color:#00b894;font-weight:600;margin-top:3px;">🐾 Acepta: ${item.acceptedTypes}</p>`;
            if (item.needs) extraInfo += `<p style="font-size:0.75rem;opacity:0.85;margin-top:2px;">📋 <strong>Insumos Vet:</strong> ${item.needs}</p>`;
        }

        if (item.type === 'volunteer') {
            if (item.rolesNeeded) extraInfo += `<p style="font-size:0.75rem;color:#0984e3;font-weight:600;margin-top:3px;">🤝 Tareas: ${item.rolesNeeded}</p>`;
            if (item.schedule) extraInfo += `<p style="font-size:0.75rem;opacity:0.85;margin-top:2px;">🕐 <strong>Turnos:</strong> ${item.schedule}</p>`;
        }

        if (item.type === 'hospital') {
            const statusClasses = { operational: 'status-operational', damaged: 'status-damaged', overwhelmed: 'status-overwhelmed' };
            const statusLabels = { operational: 'Operacional / Donación Sangre', damaged: 'Instalaciones Afectadas', overwhelmed: 'Urgencias Saturadas' };
            extraInfo += `<span class="status-badge ${statusClasses[item.status] || 'status-operational'}">${statusLabels[item.status] || 'Operacional'}</span>`;
            if (item.needs) extraInfo += `<p style="font-size:0.75rem;color:#d92525;margin-top:2px;">💉 ${item.needs}</p>`;
        }
        
        li.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <h4>${icons[item.type] || '📍'} ${item.name} <span class="type-badge">${typeLabels[item.type] || 'Espacio'}</span> ${verifiedHTML}</h4>
                    <p>📍 ${item.address || item.city || ''}</p>
                    ${extraInfo}
                </div>
                ${photoHTML}
            </div>
            <div class="place-actions">
                <button class="place-action-btn" onclick="event.stopPropagation(); calculateRouteTo(${item.lat}, ${item.lng})" title="Calcular Ruta">🗺️ Ruta</button>
                <button class="place-action-btn" onclick="event.stopPropagation(); deleteItem('${item.id}', '${item.type}')" title="Eliminar">🗑️</button>
            </div>
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

// --- Missing Persons Upload & Approval Handlers ---
function initMissingPhotoUploadHandler() {
    const fileInput = document.getElementById('missing-photo');
    const previewContainer = document.getElementById('missing-photo-preview-container');
    const previewImg = document.getElementById('missing-photo-preview');

    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            currentUploadedMissingPhotoBase64 = event.target.result;
            if (previewImg && previewContainer) {
                previewImg.src = currentUploadedMissingPhotoBase64;
                previewContainer.classList.remove('hidden');
            }
            showToast('📸 Fotografía de persona desaparecida cargada', 'success');
        };
        reader.readAsDataURL(file);
    });
}

function initContactAdminForm() {
    const form = document.getElementById('form-contact-admin');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const info = document.getElementById('contact-info').value.trim();
        const type = document.getElementById('contact-type').value;
        const message = document.getElementById('contact-message').value.trim();

        const messageItem = {
            id: 'msg_' + Date.now(),
            name,
            info,
            type,
            message,
            date: new Date().toLocaleString('es-CO')
        };

        if (!db.adminMessages) db.adminMessages = [];
        db.adminMessages.unshift(messageItem);

        saveData();
        recordIPVisitorTelemetry(`Mensaje de Contacto/Sugerencia Enviado por ${name}`);
        showToast('✉️ Mensaje enviado a los administradores. ¡Gracias por tus sugerencias!', 'success');

        form.reset();
        closeModal('modal-contact-admin');
    });
}

window.openContactAdminModal = function() {
    document.getElementById('modal-contact-admin')?.classList.remove('hidden');
};

function handleAddMissingPerson(e) {
    e.preventDefault();
    
    const phone = document.getElementById('missing-contact').value.trim();
    const coPhoneRegex = /^(\+?57)?\s?(3\d{2}|60\d{1})\s?\d{3}\s?\d{4}$/;

    if (!coPhoneRegex.test(phone)) {
        showToast('⚠️ Ingrese un teléfono de contacto válido de Colombia', 'error');
        return;
    }

    if (!currentUploadedMissingPhotoBase64) {
        showToast('📸 Por favor cargue la foto de la persona buscada (Obligatoria)', 'error');
        return;
    }

    const person = {
        id: 'mp_' + Date.now(),
        name: document.getElementById('missing-name').value.trim(),
        height: document.getElementById('missing-height').value.trim(),
        clothing: document.getElementById('missing-clothing').value.trim(),
        suspectedLocation: document.getElementById('missing-suspected-location').value.trim(),
        lastSeen: document.getElementById('missing-last-seen').value.trim(),
        contact: phone,
        photo: currentUploadedMissingPhotoBase64,
        description: document.getElementById('missing-description').value.trim(),
        status: 'pending',
        date: new Date().toLocaleString('es-CO')
    };
    
    if (!db.missingPersons) db.missingPersons = [];
    db.missingPersons.unshift(person);
    
    saveData();
    recordIPVisitorTelemetry(`Reporte Búsqueda Desaparecido: ${person.name} (Pendiente Aprobación Admin)`);
    showToast('🔍 Reporte enviado a verificación admin. Aparecerá públicamente una vez sea revisado y aprobado.', 'info');
    
    e.target.reset();
    currentUploadedMissingPhotoBase64 = null;
    document.getElementById('missing-photo-preview-container')?.classList.add('hidden');
}

function renderMissingPersonsList() {
    const container = document.getElementById('missing-persons-list');
    if (!container) return;
    
    const searchTxt = document.getElementById('search-missing')?.value.toLowerCase().trim() || '';
    
    // Display ONLY APPROVED missing persons in public view
    let persons = (db.missingPersons || []).filter(p => p.status === 'approved' || !p.status);
    
    if (searchTxt) {
        persons = persons.filter(p => 
            p.name.toLowerCase().includes(searchTxt) || 
            (p.suspectedLocation && p.suspectedLocation.toLowerCase().includes(searchTxt)) ||
            (p.lastSeen && p.lastSeen.toLowerCase().includes(searchTxt)) ||
            (p.clothing && p.clothing.toLowerCase().includes(searchTxt))
        );
    }
    
    if (persons.length === 0) {
        container.innerHTML = `<p style="text-align:center;opacity:0.6;padding:16px;font-size:0.82rem;">No hay reportes de personas desaparecidas aprobados y verificados${searchTxt ? ' con esa búsqueda' : ''}.</p>`;
        return;
    }
    
    container.innerHTML = persons.map(p => `
        <div class="missing-card">
            <div style="display:flex;gap:12px;align-items:flex-start;">
                ${p.photo ? `<img src="${p.photo}" class="missing-thumb-img" alt="Foto ${p.name}" onclick="openImageModal('${p.photo}', 'Persona Buscada: ${p.name}')">` : '<div class="missing-thumb-placeholder">👤</div>'}
                <div style="flex:1;">
                    <h4>🔍 ${p.name}</h4>
                    <p style="font-size:0.78rem;margin:2px 0;">📏 <strong>Estatura:</strong> ${p.height || 'N/A'} | 👕 <strong>Vestía:</strong> ${p.clothing || 'N/A'}</p>
                    <p style="font-size:0.78rem;margin:2px 0;">📍 <strong>Se cree que está:</strong> ${p.suspectedLocation || 'N/A'}</p>
                    <p style="font-size:0.78rem;margin:2px 0;">👁️ <strong>Visto por última vez:</strong> ${p.lastSeen || 'N/A'}</p>
                    ${p.description ? `<p style="font-size:0.75rem;opacity:0.85;margin-top:4px;">📝 ${p.description}</p>` : ''}
                    <div class="missing-meta" style="margin-top:6px;">
                        <span>📞 <strong>Contacto:</strong> <a href="tel:${p.contact}">${p.contact}</a></span>
                        <span>📅 ${p.date}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

window.approveMissingPerson = function(id) {
    if (!db.missingPersons) return;
    const idx = db.missingPersons.findIndex(m => m.id === id);
    if (idx !== -1) {
        db.missingPersons[idx].status = 'approved';
        saveData();
        showToast(`✅ ${db.missingPersons[idx].name} ha sido APROBADO y es visible públicamente`, 'success');
        renderAdminPanel();
        renderMissingPersonsList();
    }
};

window.rejectMissingPerson = function(id) {
    if (!db.missingPersons) return;
    if (confirm('¿Confirma rechazar y eliminar este reporte de persona desaparecida?')) {
        db.missingPersons = db.missingPersons.filter(m => m.id !== id);
        saveData();
        showToast('🗑️ Reporte rechazado y eliminado', 'info');
        renderAdminPanel();
        renderMissingPersonsList();
    }
};

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
