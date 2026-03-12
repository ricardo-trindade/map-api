window.onload = function() {
    // Inicialização do mapa (Visão mundial padrão)
    const map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false
    });

    // Definindo as camadas (Rua e Satélite)
    const streetLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Maps 2.0 | Esri'
    }).addTo(map);

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Maps 2.0 | Satélite'
    });

    let activeMarker = null;

    // Função de Busca com Zoom Amplo (80% da área)
    async function performSearch() {
        const query = document.getElementById('input-busca').value;
        if (!query) return;

        document.getElementById('status-bar').innerText = "Buscando...";

        // Buscamos com polygon_geojson para obter os limites reais (boundingbox)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        
        try {
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.length > 0) {
                const result = data[0];
                const latlng = [result.lat, result.lon];

                // Ajuste de zoom baseado no tamanho do local (Bounding Box)
                if (result.boundingbox) {
                    const bbox = result.boundingbox;
                    // O Leaflet usa [lat, lon], o Nominatim envia [lat_min, lat_max, lon_min, lon_max]
                    const southWest = L.latLng(bbox[0], bbox[2]);
                    const northEast = L.latLng(bbox[1], bbox[3]);
                    const bounds = L.latLngBounds(southWest, northEast);
                    
                    // flyToBounds com padding garante que veremos o local inteiro com margem
                    map.flyToBounds(bounds, { 
                        padding: [40, 40], // Isso deixa os "80%" de visão que você pediu
                        duration: 1.5 
                    });
                } else {
                    // Se não tiver área definida (ex: um ponto específico), usa zoom médio
                    map.flyTo(latlng, 10, { duration: 1.5 });
                }

                // Gerenciar marcador
                if (activeMarker) map.removeLayer(activeMarker);
                activeMarker = L.marker(latlng).addTo(map)
                    .bindPopup(`<b>${result.display_name}</b>`)
                    .openPopup();

                document.getElementById('status-bar').innerText = result.display_name;
            } else {
                alert("Local não encontrado. Tente ser mais específico.");
                document.getElementById('status-bar').innerText = "Pesquisa sem resultados.";
            }
        } catch (error) {
            console.error("Erro na busca:", error);
            document.getElementById('status-bar').innerText = "Erro na conexão.";
        }
    }

    // Controle de Camadas (Street vs Satellite)
    document.getElementById('layer-sat').onclick = function() {
        if (!map.hasLayer(satelliteLayer)) {
            map.removeLayer(streetLayer);
            map.addLayer(satelliteLayer);
            this.classList.add('active');
            document.getElementById('layer-street').classList.remove('active');
        }
    };

    document.getElementById('layer-street').onclick = function() {
        if (!map.hasLayer(streetLayer)) {
            map.removeLayer(satelliteLayer);
            map.addLayer(streetLayer);
            this.classList.add('active');
            document.getElementById('layer-sat').classList.remove('active');
        }
    };

    // Botão GPS (Sua Localização)
    document.getElementById('btn-gps').onclick = () => {
        map.locate({setView: true, maxZoom: 15});
    };

    map.on('locationfound', (e) => {
        if (activeMarker) map.removeLayer(activeMarker);
        activeMarker = L.marker(e.latlng).addTo(map).bindPopup("Você está aqui!").openPopup();
        document.getElementById('status-bar').innerText = "Minha Localização";
    });

    // Listeners de Eventos
    document.getElementById('btn-busca').onclick = performSearch;
    document.getElementById('input-busca').onkeypress = (e) => {
        if (e.key === 'Enter') performSearch();
    };

    // Adiciona os controles de zoom no canto inferior direito
    L.control.zoom({ position: 'bottomright' }).addTo(map);
};