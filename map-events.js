// map-events.js
// Gán event cho map + trụ sở

function handleMapClick(e){
    console.log("🗺️ Map click:", {
        isSelectingMode: isSelectingEndPointMode,
        hasPendingStart: !!pendingStartPoint
    });
    
    // Nếu đang chọn điểm đến
    if(isSelectingEndPointMode){
        if(pendingStartPoint){
            console.log("✅ Tạo route từ pending start đến điểm vừa chọn");
            createRoute(pendingStartPoint, e.latlng);
        }
        
        pendingStartPoint = null;
        isSelectingEndPointMode = false;
        document.getElementById('map').style.cursor = '';
        return;
    }
    
    // Click bình thường -> popup tạo marker
    var container = document.createElement('div');
    
    var btnM = document.createElement('button');
    btnM.className = 'popup-btn';
    btnM.innerText = "📍 Đặt Marker tại đây";
    btnM.onclick = function(event){
        L.DomEvent.stopPropagation(event);
        createMarker(e.latlng);
        map.closePopup();
    };
    container.appendChild(btnM);

    L.popup()
        .setLatLng(e.latlng)
        .setContent(container)
        .openOn(map);
}

// Gán event sau khi map & HQ marker đã tạo từ map-init.js
map.off('click', handleMapClick);
map.on('click', handleMapClick);

headquartersMarker.off('click');
headquartersMarker.on('click', function(e) {
    L.DomEvent.stopPropagation(e);
    console.log("🏢 Trụ sở chính được click");

    var container = document.createElement('div');
    container.style.minWidth = "200px";
    
    var title = document.createElement('b');
    title.innerText = "🏢 " + headquartersMarker.markerName;
    title.style.cssText = "font-size:14px;display:block;margin-bottom:8px;color:#d32f2f;";
    container.appendChild(title);
    
    var btnRoute = document.createElement('button');
    btnRoute.className = 'popup-btn';
    btnRoute.innerText = "🚗 Bắt đầu Route từ đây";
    btnRoute.style.cssText = "margin-top:5px;background:#fff3cd;font-weight:bold;";
    
    btnRoute.onclick = function(event) {
        L.DomEvent.stopPropagation(event);
        showDestinationMenu(headquartersMarker.getLatLng(), container, headquartersMarker);
    };
    container.appendChild(btnRoute);

    headquartersMarker.unbindPopup();
    headquartersMarker.bindPopup(container, {
        maxWidth: 300,
        autoPan: true,
        keepInView: true,
        closeButton: true
    }).openPopup();
});

console.log("✅ map-events.js đã load. Map events sẵn sàng.");
