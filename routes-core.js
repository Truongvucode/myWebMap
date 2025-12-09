// routes-core.js
// Quản lý route + hiển thị route trên map

// activeRoutes được tạo sẵn trong map-init.js
// Biến lưu route đang hiển thị (có BẢNG hướng dẫn)
var currentRouteControl = null;
var currentRouteId = null;

// Helper: format lat,lng gọn
function formatLatLng(latlng) {
    if (!latlng) return "";
    return latlng.lat.toFixed(4) + ", " + latlng.lng.toFixed(4);
}

/**
 * Tạo route:
 * - Gọi router để vẽ đường đi (polyline) màu XANH trên map
 * - KHÔNG hiện bảng hướng dẫn (itinerary)
 * - Lưu previewControl để sau này hiển thị lại
 */
function createRoute(startLatLng, endLatLng) {
    if (!startLatLng || !endLatLng) {
        alert("Thiếu tọa độ điểm bắt đầu hoặc kết thúc!");
        return;
    }

    if (typeof L === 'undefined' ||
        typeof L.Routing === 'undefined' ||
        typeof L.Routing.control === 'undefined') {
        alert("Lỗi: Thư viện định tuyến chưa được tải.");
        return;
    }

    var routeItem = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        start: startLatLng,
        end: endLatLng,
        summary: null,
        bounds: null,
        previewControl: null // control vẽ đường XANH, không bảng
    };

    activeRoutes.push(routeItem);
    console.log('✅ Đã tạo route (sẽ vẽ preview). Tổng routes:', activeRoutes.length);

    if (typeof updateRouteListUI === 'function') {
        updateRouteListUI();
    }

    // Tạo control preview: show:false => không hiện bảng hướng dẫn
    var previewControl = L.Routing.control({
        waypoints: [
            L.latLng(startLatLng.lat, startLatLng.lng),
            L.latLng(endLatLng.lat, endLatLng.lng)
        ],
        show: false,               // CHỈ VẼ ĐƯỜNG, KHÔNG ITINERARY
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,  // không auto zoom khi thêm preview
        showAlternatives: false,
        lineOptions: {
            styles: [{
                // 🎨 Route KHÔNG được chọn: màu XANH
                color: '#2196f3',   // xanh dương
                opacity: 0.8,
                weight: 4
            }],
            extendToWaypoints: true,
            missingRouteTolerance: 0
        },
        createMarker: function () {
            return null;
        }
    });

    routeItem.previewControl = previewControl;

    previewControl.on('routesfound', function (e) {
        console.log('✅ Preview route đã được tìm thấy');
        var r = e.routes[0];
        routeItem.summary = r.summary;
        routeItem.bounds = L.latLngBounds(r.coordinates);

        if (typeof updateRouteListUI === 'function') {
            updateRouteListUI();
        }
    });

    previewControl.on('routingerror', function (e) {
        console.error('Lỗi routing (preview):', e);
        alert('Không thể tìm thấy đường đi giữa hai điểm này!');

        try {
            map.removeControl(previewControl);
        } catch (err) {}

        // Xóa routeItem khỏi danh sách nếu lỗi
        activeRoutes = activeRoutes.filter(function (r) {
            return r.id !== routeItem.id;
        });

        if (typeof updateRouteListUI === 'function') {
            updateRouteListUI();
        }
    });

    // Thêm preview vào map → vẽ đường XANH, không hiện bảng
    previewControl.addTo(map);
}

/**
 * Hiển thị route được chọn:
 * - Route trước đó (nếu có) quay lại màu XANH (preview)
 * - Route được chọn:
 *    + Ẩn đường XANH
 *    + Tạo đường CAM + bảng hướng dẫn
 */
function showRoute(routeItem) {
    if (!routeItem) return;

    if (typeof L === 'undefined' ||
        typeof L.Routing === 'undefined' ||
        typeof L.Routing.control === 'undefined') {
        alert('Lỗi: Thư viện định tuyến chưa được tải.');
        return;
    }

    // 1. Route đang hiển thị (có bảng, màu CAM) -> quay lại XANH
    if (currentRouteControl && currentRouteId) {
        try {
            map.removeControl(currentRouteControl);
        } catch (e) {
            console.error('Lỗi khi xóa route hiện tại:', e);
        }

        var prevRoute = Array.isArray(activeRoutes)
            ? activeRoutes.find(function (r) { return r.id === currentRouteId; })
            : null;

        if (prevRoute && prevRoute.previewControl) {
            try {
                // Thêm lại preview XANH cho route trước đó
                prevRoute.previewControl.addTo(map);
            } catch (e) {
                console.error('Lỗi khi add lại preview cho route trước đó:', e);
            }
        }

        currentRouteControl = null;
        currentRouteId = null;
    }

    // 2. Ẩn preview XANH của route đang được chọn (nếu đang có)
    if (routeItem.previewControl) {
        try {
            map.removeControl(routeItem.previewControl);
        } catch (e) {
            console.error('Lỗi khi remove previewControl của route được chọn:', e);
        }
        // KHÔNG set = null để sau này còn add lại được
    }

    // 3. Tạo control mới cho route này: đường CAM + bảng hướng dẫn
    var control = L.Routing.control({
        waypoints: [
            L.latLng(routeItem.start.lat, routeItem.start.lng),
            L.latLng(routeItem.end.lat, routeItem.end.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
            styles: [{
                // 🎨 Route ĐANG ĐƯỢC CHỌN: màu CAM, nét dày
                color: '#ff9800',
                opacity: 0.95,
                weight: 6
            }],
            extendToWaypoints: true,
            missingRouteTolerance: 0
        },
        createMarker: function () {
            return null;
        }
    });

    currentRouteControl = control;
    currentRouteId = routeItem.id;

    control.on('routesfound', function (e) {
        console.log('✅ Route (có bảng) đã được tìm thấy');
        var r = e.routes[0];
        routeItem.summary = r.summary;
        routeItem.bounds = L.latLngBounds(r.coordinates);

        if (routeItem.bounds) {
            map.fitBounds(routeItem.bounds, { padding: [30, 30] });
        }

        if (typeof updateRouteListUI === 'function') {
            updateRouteListUI();
        }
    });

    control.on('routingerror', function (e) {
        console.error('Lỗi routing (showRoute):', e);
        alert('Không thể tìm thấy đường đi giữa hai điểm này!');
    });

    // 4. Thêm vào map → vẽ CAM + bảng hướng dẫn cho route này
    control.addTo(map);
}
