// routes-panel.js
// Render panel danh sách route + nút Hiển thị / Ẩn / Xóa / Xóa toàn bộ

function updateRouteListUI() {
    var listEl = document.getElementById('routes-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (!Array.isArray(activeRoutes) || activeRoutes.length === 0) {
        var empty = document.createElement('div');
        empty.style.fontStyle = 'italic';
        empty.style.color = '#777';
        empty.textContent = 'Chưa có route nào.';
        listEl.appendChild(empty);
        return;
    }

    activeRoutes.forEach(function(routeItem, index) {
        var itemDiv = document.createElement('div');
        itemDiv.className = 'route-item';

        var titleDiv = document.createElement('div');
        titleDiv.className = 'route-item-title';
        titleDiv.textContent = 'Route ' + (index + 1);
        itemDiv.appendChild(titleDiv);

        var meta1 = document.createElement('div');
        meta1.className = 'route-item-meta';
        meta1.textContent = formatLatLng(routeItem.start) + ' → ' + formatLatLng(routeItem.end);
        itemDiv.appendChild(meta1);

        if (routeItem.summary) {
            var km = (routeItem.summary.totalDistance / 1000).toFixed(2);
            var min = Math.round(routeItem.summary.totalTime / 60);
            var meta2 = document.createElement('div');
            meta2.className = 'route-item-meta';
            meta2.textContent = km + ' km, ' + min + ' phút';
            itemDiv.appendChild(meta2);
        }

        var btnBox = document.createElement('div');
        btnBox.className = 'route-item-buttons';

        // Nút Hiển thị: xoá preview XANH của route này và hiển thị CAM + bảng
        var btnShow = document.createElement('button');
        btnShow.textContent = 'Hiển thị';
        btnShow.onclick = function() {
            showRoute(routeItem);
        };
        btnBox.appendChild(btnShow);

        // Nút Xóa: xoá route khỏi map + danh sách
        var btnDelete = document.createElement('button');
        btnDelete.textContent = 'Xóa';
        btnDelete.classList.add('btn-danger');
        btnDelete.onclick = function() {
            // 1. Nếu route này đang hiển thị (cam + bảng)
            if (typeof currentRouteId !== 'undefined' &&
                currentRouteId === routeItem.id &&
                currentRouteControl) {
                try {
                    map.removeControl(currentRouteControl);
                } catch (e) {
                    console.error('Lỗi khi remove currentRouteControl:', e);
                }
                currentRouteControl = null;
                currentRouteId = null;
            }

            // 2. Xóa preview XANH nếu còn
            if (routeItem.previewControl) {
                try {
                    map.removeControl(routeItem.previewControl);
                } catch (e) {
                    console.error('Lỗi khi remove previewControl:', e);
                }
                routeItem.previewControl = null;
            }

            // 3. Xóa khỏi danh sách
            activeRoutes = activeRoutes.filter(function(r) {
                return r.id !== routeItem.id;
            });

            updateRouteListUI();
        };
        btnBox.appendChild(btnDelete);

        itemDiv.appendChild(btnBox);
        listEl.appendChild(itemDiv);
    });
}

// Khởi tạo panel: toggle mở/đóng + nút Ẩn + Xóa toàn bộ
(function initRoutesPanel() {
    var toggleBtn = document.getElementById('toggle-routes-btn');
    var routesPanel = document.getElementById('routes-panel');
    var clearAllBtn = document.getElementById('clear-all-routes-btn');
    var hideBtn = document.getElementById('hide-current-route-btn');

    if (toggleBtn && routesPanel) {
        toggleBtn.onclick = function() {
            if (routesPanel.style.display === 'none' || routesPanel.style.display === '') {
                routesPanel.style.display = 'block';
                updateRouteListUI();
            } else {
                routesPanel.style.display = 'none';
            }
        };
    }

    // Nút Ẩn: ẩn bảng + trả route đang chọn về XANH
    if (hideBtn) {
        hideBtn.onclick = function() {
            if (!currentRouteControl || !currentRouteId) {
                return; // không có route nào đang hiển thị
            }

            // Xóa control CAM + bảng
            try {
                map.removeControl(currentRouteControl);
            } catch (e) {
                console.error("Lỗi khi ẩn route hiện tại:", e);
            }

            var route = Array.isArray(activeRoutes)
                ? activeRoutes.find(function(r) { return r.id === currentRouteId; })
                : null;

            currentRouteControl = null;
            currentRouteId = null;

            // Trả route này về preview XANH (nếu có)
            if (route && route.previewControl) {
                try {
                    route.previewControl.addTo(map);
                } catch (e) {
                    console.error("Lỗi khi add lại preview cho route ẩn:", e);
                }
            }
        };
    }

    // Nút Xóa toàn bộ
    if (clearAllBtn) {
        clearAllBtn.onclick = function() {
            // 1. Xóa route đang hiển thị (cam + bảng)
            if (currentRouteControl) {
                try {
                    map.removeControl(currentRouteControl);
                } catch (e) {
                    console.error("Lỗi khi xóa route hiện tại:", e);
                }
                currentRouteControl = null;
                currentRouteId = null;
            }

            // 2. Xóa tất cả preview XANH
            if (Array.isArray(activeRoutes)) {
                activeRoutes.forEach(function(r) {
                    if (r.previewControl) {
                        try {
                            map.removeControl(r.previewControl);
                        } catch (e) {
                            console.error("Lỗi khi xóa previewControl:", e);
                        }
                        r.previewControl = null;
                    }
                });
            }

            // 3. Xóa danh sách
            activeRoutes = [];
            updateRouteListUI();
        };
    }
})();
