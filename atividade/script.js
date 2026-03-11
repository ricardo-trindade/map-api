// 1. INICIALIZAR O MAPA
// Local inicial: Brasília
const map = L.map('map').setView([-15.7938, -47.8827], 4);

// 2. ADICIONAR AS IMAGENS DO MAPA
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// 3. CONFIGURAR O MOTOR DE BUSCA (GEOCODER)
const buscador = L.Control.Geocoder.nominatim();

// 4. FUNÇÃO: ONDE ESTOU?
function localizarUsuario() {
    navigator.geolocation.getCurrentPosition((posicao) => {
        const lat = posicao.coords.latitude;
        const lng = posicao.coords.longitude;

        map.flyTo([lat, lng], 16);
        L.marker([lat, lng]).addTo(map).bindPopup("Você está aqui!").openPopup();
    }, () => {
        alert("Erro ao acessar localização. Verifique as permissões.");
    });
}

// 5. FUNÇÃO: BUSCAR LOCALIZAÇÃO (DISPARADA PELO SEU NOVO BOTÃO)
// A função de busca corrigida
function buscarLocalizacao() {
    const inputBusca = document.getElementById('campo-busca');
    const valor = inputBusca.value;

    if (!valor) return;

    console.log("Buscando por:", valor);

    // Usamos o geocoder do Leaflet (L.Control.Geocoder) diretamente
    // O Leaflet gerencia as permissões de CORS internamente para nós
    L.Control.Geocoder.nominatim().geocode(valor, function(results) {
        if (results && results.length > 0) {
            const loc = results[0].center;
            map.flyTo(loc, 16);
            L.marker(loc).addTo(map).bindPopup(results[0].name).openPopup();
        } else {
            alert("Lugar não encontrado!");
        }
    });
}