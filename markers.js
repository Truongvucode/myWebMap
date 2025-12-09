// markers.js - ĐÃ SỬA LỖI
// Quản lý marker, popup, menu chọn điểm đến

function showDestinationMenu(latlng, container, markerInstance){
    // ... (Giữ nguyên logic cũ của bạn, không đổi gì ở hàm này) ...
    console.log("📋 Đang mở menu chọn điểm đến..."); 
    pendingStartPoint = latlng;
    
    container.innerHTML = '';
    
    var title = document.createElement('b');
    title.innerText = "Chọn điểm đến:";
    title.style.display = "block";
    title.style.marginBottom = "8px";
    container.appendChild(title);
    
    var buttonManual = document.createElement('button');
    buttonManual.className = 'popup-btn';
    buttonManual.innerText = '👆 Chọn điểm trên bản đồ';
    buttonManual.onclick = function(event){
        L.DomEvent.stopPropagation(event);
        isSelectingEndPointMode = true;
        document.getElementById('map').style.cursor = 'crosshair';
        map.closePopup();
        
        // Thông báo
        var notification = document.createElement('div');
        notification.innerText = "👆 Click vào bản đồ để chọn điểm đến";
        notification.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;z-index:10000;box-shadow:0 2px 5px rgba(0,0,0,0.3);";
        document.body.appendChild(notification);
        setTimeout(function(){ if(notification.parentNode) notification.parentNode.removeChild(notification); }, 3000);
    };
    container.appendChild(buttonManual);

    var otherMarkers = markers.filter(function(m) { return m !== markerInstance; });

    if(otherMarkers.length > 0){
        var listTitle = document.createElement('div');
        listTitle.innerText = "Hoặc chọn marker có sẵn:";
        listTitle.style.cssText = "font-size:12px;margin-top:8px;margin-bottom:5px;color:#555;";
        container.appendChild(listTitle);
        
        var listDiv = document.createElement('div');
        listDiv.className = "marker-list";
        
        otherMarkers.forEach(function(marker, index){
            var btnM = document.createElement('button');
            btnM.className = 'popup-btn';
            var name = marker.markerName || ("Điểm " + (index + 1));
            var icon = marker.isHeadquarters ? "🏢" : "📍";
            btnM.innerText = icon + " " + name;
            
            if(marker.isHeadquarters) {
                btnM.style.backgroundColor = "#fff3cd";
                btnM.style.fontWeight = "bold";
            }
            
            btnM.onclick = function(event){
                L.DomEvent.stopPropagation(event);
                createRoute(pendingStartPoint, marker.getLatLng());
                pendingStartPoint = null;
                isSelectingEndPointMode = false;
                setTimeout(function() { map.closePopup(); }, 300);
            };
            listDiv.appendChild(btnM);
        });
        container.appendChild(listDiv);
    } else {
        var noMarker = document.createElement('div');
        noMarker.innerText = "(Chưa có marker nào khác)";
        noMarker.style.cssText = "color:#999;font-style:italic;font-size:12px;margin-top:5px;";
        container.appendChild(noMarker);
    }
    setTimeout(function() { if(markerInstance && markerInstance.getPopup()){ markerInstance.getPopup().update(); } }, 10);
}

// --- PHẦN QUAN TRỌNG ĐÃ ĐƯỢC CHỈNH SỬA ---
function createMarker(latlng, customName = null){ // Thêm tham số customName
    var m = L.marker(latlng).addTo(map);
    
    // Logic đặt tên: Nếu có customName (từ n8n) thì dùng, không thì dùng số thứ tự
    m.markerName = customName ? customName : ("Marker " + (markers.length));
    m.isHeadquarters = false;
    
    m.off('click');
    
    // GIỮ NGUYÊN EVENT CLICK ĐỂ HIỆN POPUP CÓ NÚT ROUTE/DELETE
    m.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        console.log("📌 Marker được click:", m.markerName);

        var container = document.createElement('div');
        container.style.minWidth = "200px";
        
        var title = document.createElement('b');
        title.innerText = m.markerName;
        title.style.cssText = "font-size:14px;display:block;margin-bottom:8px;";
        container.appendChild(title);
        
        var btnRoute = document.createElement('button');
        btnRoute.className = 'popup-btn';
        btnRoute.innerText = "🚗 Bắt đầu Route từ đây";
        btnRoute.style.cssText = "margin-top:5px;background:#e7f3ff;";
        
        btnRoute.onclick = function(event) {
            L.DomEvent.stopPropagation(event);
            console.log("🚀 Bắt đầu tạo route từ:", m.markerName);
            // Gọi menu chọn điểm đến
            showDestinationMenu(m.getLatLng(), container, m);
        };
        container.appendChild(btnRoute);

        var btnDelete = document.createElement('button');
        btnDelete.className = 'popup-btn';
        btnDelete.innerText = "🗑️ Xóa Marker này";
        btnDelete.style.cssText = "color:red;margin-top:5px;";
        btnDelete.onclick = function(event){
            L.DomEvent.stopPropagation(event);
            console.log("🗑️ Xóa marker:", m.markerName);
            map.removeLayer(m);
            map.closePopup();
            // Cập nhật lại mảng markers
            markers = markers.filter(item => item !== m);
        };
        container.appendChild(btnDelete);

        m.unbindPopup();
        
        m.bindPopup(container, {
            maxWidth: 300,
            autoPan: true,
            keepInView: true,
            closeButton: true
        }).openPopup();
    });

    markers.push(m);
    console.log("✅ Đã tạo marker mới. Tổng số marker:", markers.length);
    return m; // Trả về đối tượng marker để dùng nếu cần
}