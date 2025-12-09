// geocoding.js
// Tìm kiếm địa điểm theo tên (Nominatim) + mark lên map

// Tên User-Agent bạn có thể sửa lại cho đúng project của bạn
var NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

function performGeocodingSearch(query) {
    if (!query || query.trim().length === 0) {
        alert('Vui lòng nhập tên địa điểm!');
        return;
    }

    var url = NOMINATIM_BASE_URL
        + '?format=json'
        + '&q=' + encodeURIComponent(query)
        + '&addressdetails=1'
        + '&limit=5';

    console.log('🔍 Gửi request geocoding:', url);

    var resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = '<div style="color:#555;font-style:italic;">Đang tìm kiếm...</div>';
    }

    fetch(url, {
        headers: {
            // Khuyến nghị của Nominatim: gửi User-Agent / Referer hợp lệ
            'Accept-Language': 'vi,en'
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        return response.json();
    })
    .then(function(data) {
        console.log('✅ Geocoding results:', data);

        if (!resultsContainer) return;

        if (!Array.isArray(data) || data.length === 0) {
            resultsContainer.innerHTML = '<div style="color:#c62828;">Không tìm thấy địa điểm phù hợp.</div>';
            return;
        }

        resultsContainer.innerHTML = '';

        data.forEach(function(item, index) {
            var lat = parseFloat(item.lat);
            var lon = parseFloat(item.lon);
            var displayName = item.display_name || ('Kết quả ' + (index + 1));

            var div = document.createElement('div');
            div.className = 'search-result-item';
            div.textContent = displayName;

            div.onclick = function() {
                console.log('📍 Chọn địa điểm:', displayName, lat, lon);

                // Zoom tới địa điểm
                map.setView([lat, lon], 16);

                // Tạo marker mới bằng hàm createMarker có sẵn
                if (typeof createMarker === 'function') {
                    var marker = createMarker({ lat: lat, lng: lon });
                    // Đặt tên marker là tên địa điểm
                    if (marker) {
                        marker.markerName = displayName;
                    }
                } else {
                    // fallback: tạo marker trực tiếp nếu không có createMarker
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup(displayName)
                        .openPopup();
                }

                // Hiển thị một message ngắn trong list
                resultsContainer.innerHTML =
                    '<div style="color:#2e7d32;">✅ Đã đánh dấu: </div>' +
                    '<div style="margin-top:3px;">' + displayName + '</div>';
            };

            resultsContainer.appendChild(div);
        });
    })
    .catch(function(error) {
        console.error('❌ Lỗi geocoding:', error);
        if (resultsContainer) {
            resultsContainer.innerHTML =
                '<div style="color:#c62828;">Lỗi khi tìm kiếm: ' + error.message + '</div>';
        }
    });
}

// Gắn event cho nút tìm kiếm + Enter
(function initGeocodingUI() {
    var input = document.getElementById('search-input');
    var btn = document.getElementById('search-btn');

    if (!input || !btn) {
        console.warn('Không tìm thấy search-input hoặc search-btn trong DOM.');
        return;
    }

    btn.onclick = function() {
        performGeocodingSearch(input.value);
    };

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            performGeocodingSearch(input.value);
        }
    });

    console.log('✅ geocoding.js đã được khởi tạo.');
})();
