// ============================================
// ACOPIO COLOMBIA - App Principal
// Mapa de Ayuda Terremoto 7.4 - 10 Agosto 2026
// PWA & Soporte Offline Incorporado
// ============================================

// --- Global State ---
let map;
let routePolyline = null;
let userLocationMarker = null;
let userLocation = null;
let markerClusterGroup;
let zonesLayerGroup;
let legendVisible = true;
let zonesVisible = true;
let db = { affectedZones: [], collectionCenters: [], shelters: [], hospitals: [], epicenter: null, donations: [], emergencyContacts: {}, missingPersons: [] };

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTheme();
    initOfflineDetection();
    initMap();
    initUI();
    initDonationFilters();
    renderAll();
    
    // Hide loading screen
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
    }, 1500);
});

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
    const stored = localStorage.getItem('earthquake_data');
    if (stored) {
        try {
            db = JSON.parse(stored);
        } catch (e) {
            console.error('Error cargando datos locales:', e);
        }
    }
}

function saveData() {
    localStorage.setItem('earthquake_data', JSON.stringify(db));
    renderAll();
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
    document.getElementById('stat-zones').textContent = db.affectedZones.length;
    document.getElementById('stat-shelters').textContent = db.shelters.length;
    document.getElementById('stat-centers').textContent = db.collectionCenters.length;
}

// --- Export JSON Data for Offline Sharing ---
window.exportDataJSON = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Acopio_Colombia_Reportes_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('💾 Copia de respaldo descargada (JSON)', 'success');
};

// --- Map Setup ---
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

    // Map click for selecting coordinates in form
    map.on('click', (e) => {
        const addTab = document.getElementById('tab-add');
        if (addTab && addTab.classList.contains('active')) {
            document.getElementById('add-lat').value = e.latlng.lat.toFixed(6);
            document.getElementById('add-lng').value = e.latlng.lng.toFixed(6);
            showToast('📍 Coordenadas fijadas en el formulario', 'success');
        }
    });
}

function renderMapMarkers() {
    markerClusterGroup.clearLayers();
    zonesLayerGroup.clearLayers();

    // Epicenter
    if (db.epicenter) {
        const pulseIcon = L.divIcon({
            className: 'pulse-icon',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
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
            .addTo(map);
    }

    // Affected Zones
    if (zonesVisible) {
        db.affectedZones.forEach(zone => {
            const colors = {
                critical: { color: '#d92525', fill: 0.14 },
                severe: { color: '#e67e22', fill: 0.12 },
                moderate: { color: '#f39c12', fill: 0.10 }
            };
            const c = colors[zone.severity] || colors.moderate;
            
            L.circle([zone.lat, zone.lng], {
                color: c.color,
                fillColor: c.color,
                fillOpacity: c.fill,
                weight: 2,
                opacity: 0.6,
                radius: zone.radius || 10000
            }).bindPopup(`
                <div class="popup-content">
                    <h3>${zone.name}, ${zone.department}</h3>
                    <p class="popup-detail">${zone.details}</p>
                    <p class="popup-detail">Nivel: <strong style="color:${c.color}">${zone.severity.toUpperCase()}</strong></p>
                </div>
            `).addTo(zonesLayerGroup);
        });
    }

    // Collection Centers
    db.collectionCenters.forEach(item => {
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
    db.shelters.forEach(item => {
        const icon = L.divIcon({
            className: 'custom-marker marker-shelter',
            html: '<span>🏠</span>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        markerClusterGroup.addLayer(marker);
    });

    // Hospitals
    db.hospitals.forEach(item => {
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
    const typeNames = { collection: '📦 Centro de Acopio', shelter: '🏠 Refugio / Albergue', hospital: '🏥 Hospital Público' };
    html += `<h3>${item.name}</h3>`;
    html += `<p class="popup-detail" style="opacity:0.6;font-size:0.75rem;">${typeNames[item.type]}</p>`;
    html += `<p class="popup-detail">📍 ${item.address || item.city || ''}</p>`;
    
    if (item.contact || item.phone) {
        html += `<p class="popup-detail">📞 ${item.contact || item.phone}</p>`;
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
        if (item.amenities) {
            html += `<p class="popup-detail">🏷️ ${item.amenities}</p>`;
        }
    }
    
    if (item.type === 'hospital') {
        const statusColors = { operational: '#27ae60', damaged: '#e67e22', overwhelmed: '#d92525' };
        const statusNames = { operational: 'Operacional', damaged: 'Instalaciones Afectadas', overwhelmed: 'Atención de Urgencias Saturada' };
        html += `<p class="popup-detail">Estado: <strong style="color:${statusColors[item.status]}">${statusNames[item.status]}</strong></p>`;
    }
    
    html += `<div class="popup-actions">`;
    html += `<button class="popup-btn popup-btn-route" onclick="calculateRouteTo(${item.lat}, ${item.lng})">🗺️ Calcular Ruta</button>`;
    
    if (item.type !== 'hospital') {
        html += `<button class="popup-btn popup-btn-edit" onclick="openEditModal('${item.id}', '${item.type}')">✏️ Editar</button>`;
        html += `<button class="popup-btn popup-btn-delete" onclick="deleteItem('${item.id}', '${item.type}')">🗑️</button>`;
    }
    
    html += `</div></div>`;
    return html;
}

// --- UI Actions ---
function initUI() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            target.classList.add('active');
            target.setAttribute('aria-selected', 'true');
            document.getElementById(`tab-${target.dataset.tab}`).classList.add('active');
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

    document.getElementById('btn-toggle-zones')?.addEventListener('click', () => {
        zonesVisible = !zonesVisible;
        if (zonesVisible) {
            map.addLayer(zonesLayerGroup);
            showToast('🔴 Zonas sismicas visibles', 'info');
        } else {
            map.removeLayer(zonesLayerGroup);
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
            document.getElementById('add-lat').value = pos.coords.latitude.toFixed(6);
            document.getElementById('add-lng').value = pos.coords.longitude.toFixed(6);
            showToast('✅ Coordenadas GPS fijadas', 'success');
        },
        () => showToast('❌ active el GPS en su dispositivo', 'error'),
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
                .catch(() => showToast('⚠️ Sin conexión a servidor de navegación. Verifique internet.', 'error'));
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
    
    if (isNaN(lat) || isNaN(lng)) {
        showToast('⚠️ Fije la ubicación en el mapa o use GPS', 'error');
        return;
    }
    
    const newItem = {
        id: 'usr_' + Date.now(),
        name: document.getElementById('add-name').value.trim(),
        address: document.getElementById('add-address').value.trim(),
        lat, lng,
        contact: document.getElementById('add-contact').value.trim(),
        type
    };

    if (type === 'collection') {
        newItem.needs = document.getElementById('add-needs').value.trim();
        newItem.schedule = document.getElementById('add-schedule').value.trim();
        db.collectionCenters.push(newItem);
    } else {
        newItem.capacity = parseInt(document.getElementById('add-capacity').value) || 0;
        newItem.occupancy = parseInt(document.getElementById('add-occupancy').value) || 0;
        newItem.amenities = document.getElementById('add-amenities')?.value.trim() || '';
        db.shelters.push(newItem);
    }

    saveData();
    showToast('✅ Punto guardado y publicado en la red comunitaria', 'success');
    e.target.reset();
    
    document.querySelector('[data-tab="list"]')?.click();
    map.flyTo([lat, lng], 14, { duration: 1 });
}

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
    document.getElementById('edit-contact').value = item.contact || '';
    
    const typeNames = { collection: '📦 Editar Centro de Acopio', shelter: '🏠 Editar Refugio / Albergue' };
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
    list[idx].contact = document.getElementById('edit-contact').value.trim();
    
    if (type === 'collection') {
        list[idx].needs = document.getElementById('edit-needs').value.trim();
        list[idx].schedule = document.getElementById('edit-schedule').value.trim();
    } else {
        list[idx].capacity = parseInt(document.getElementById('edit-capacity').value) || 0;
        list[idx].occupancy = parseInt(document.getElementById('edit-occupancy').value) || 0;
    }
    
    closeEditModal();
    saveData();
    showToast('✅ Información del punto actualizada', 'success');
}

window.deleteFromModal = function() {
    const id = document.getElementById('edit-id').value;
    const type = document.getElementById('edit-type-hidden').value;
    
    if (confirm('¿Confirma eliminar este registro comunitario?')) {
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
        }
        map.closePopup();
        saveData();
        showToast('🗑️ Registro eliminado', 'info');
    }
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
    if (filterType === 'all' || filterType === 'collection') items = items.concat(db.collectionCenters.map(i => ({...i})));
    if (filterType === 'all' || filterType === 'shelter') items = items.concat(db.shelters.map(i => ({...i})));
    if (filterType === 'all' || filterType === 'hospital') items = items.concat(db.hospitals.map(i => ({...i})));

    if (searchTxt) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(searchTxt) ||
            (item.address && item.address.toLowerCase().includes(searchTxt)) ||
            (item.city && item.city.toLowerCase().includes(searchTxt))
        );
    }

    if (countEl) countEl.textContent = `${items.length} lugar${items.length !== 1 ? 'es' : ''} visible${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
        list.innerHTML = `<li style="text-align:center;padding:20px;opacity:0.6;font-size:0.85rem;">No hay puntos registrados aún. Use la pestaña <strong>"Añadir"</strong> para reportar centros o refugios activos.</li>`;
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'place-card';
        
        const colors = { collection: 'var(--color-success)', shelter: 'var(--color-shelter)', hospital: 'var(--color-hospital)' };
        const icons = { collection: '📦', shelter: '🏠', hospital: '🏥' };
        const typeLabels = { collection: 'Centro de Acopio', shelter: 'Refugio / Albergue', hospital: 'Hospital Público' };
        
        li.style.borderLeftColor = colors[item.type];
        
        let extraInfo = '';
        if (item.type === 'shelter' && item.capacity) {
            const pct = Math.round(((item.occupancy || 0) / item.capacity) * 100);
            const barColor = pct > 90 ? 'var(--color-critical)' : pct > 70 ? 'var(--color-severe)' : 'var(--color-success)';
            extraInfo = `<div class="occupancy-bar"><div class="occupancy-fill" style="width:${pct}%;background:${barColor}"></div></div><p style="font-size:0.75rem;opacity:0.75;">Ocupación: ${item.occupancy || 0}/${item.capacity} (${pct}%)</p>`;
        }
        if (item.type === 'hospital') {
            const statusClasses = { operational: 'status-operational', damaged: 'status-damaged', overwhelmed: 'status-overwhelmed' };
            const statusLabels = { operational: 'Operacional', damaged: 'Instalaciones Afectadas', overwhelmed: 'Urgencias Saturadas' };
            extraInfo = `<span class="status-badge ${statusClasses[item.status]}">${statusLabels[item.status]}</span>`;
        }
        
        li.innerHTML = `
            <h4>${icons[item.type]} ${item.name} <span class="type-badge">${typeLabels[item.type]}</span></h4>
            <p>📍 ${item.address || item.city || ''}</p>
            ${extraInfo}
            ${item.type !== 'hospital' ? `
            <div class="place-actions">
                <button class="place-action-btn" onclick="event.stopPropagation(); openEditModal('${item.id}', '${item.type}')" title="Editar">✏️</button>
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
    
    container.innerHTML = db.affectedZones.map(zone => `
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
                <a href="${d.website}" target="_blank" rel="noopener">🌐 Sitio Oficial de Donación</a>
            </div>
        </div>
    `).join('');
}

// --- Missing Persons ---
function handleAddMissingPerson(e) {
    e.preventDefault();
    
    const person = {
        id: 'mp_' + Date.now(),
        name: document.getElementById('missing-name').value.trim(),
        age: document.getElementById('missing-age').value,
        city: document.getElementById('missing-city').value.trim(),
        description: document.getElementById('missing-description').value.trim(),
        contact: document.getElementById('missing-contact').value.trim(),
        date: new Date().toLocaleString('es-CO')
    };
    
    if (!db.missingPersons) db.missingPersons = [];
    db.missingPersons.unshift(person);
    
    saveData();
    showToast('📋 Reporte registrado en el sistema local', 'info');
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
    const text = '🆘 Mapa de Ayuda Sismo 7.4 Colombia (Offline & Colaborativo) — Reporta e identifica centros de acopio y refugios:';
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
};

window.shareOnTwitter = function() {
    const text = '🆘 Mapa de Ayuda Terremoto Colombia 7.4 — Centros de acopio, refugios y hospitales: #SismoColombia #TerremotoColombia';
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
    }, 3000);
}
