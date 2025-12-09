// n8n-bridge.js

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/get-map-data'; 

// Hàm chờ (Sleep) để tránh bị khóa IP
const delay = ms => new Promise(res => setTimeout(res, ms));

async function geocodeAndDraw(address, name) {
    try {
        // Gọi API Nominatim trực tiếp từ trình duyệt
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const res = await fetch(url);
        const json = await res.json();

        if (json && json.length > 0) {
            const lat = parseFloat(json[0].lat);
            const lon = parseFloat(json[0].lon);
            
            // Gọi hàm tạo marker của bạn
            createMarker({ lat: lat, lng: lon }, name);
            console.log(`✅ Đã tìm thấy: ${name}`);
        } else {
            console.log(`❌ Không tìm thấy tọa độ cho: ${name}`);
        }
    } catch (e) {
        console.error("Lỗi Geocode:", name, e);
    }
}

async function loadDataFromN8n() {
    console.log("🚀 Đang tải danh sách từ Sheet...");
    
    // 1. Lấy dữ liệu thô từ Sheet (chưa có Lat/Lng cũng được)
    const response = await fetch(N8N_WEBHOOK_URL);
    const data = await response.json();

    console.log(`Tìm thấy ${data.length} địa điểm. Bắt đầu xử lý...`);

    // 2. Duyệt từng dòng
    for (const item of data) {
        const name = item['Name'] || item['Tên'];
        const address = item['Address'] || item['Địa chỉ'];
        
        // Kiểm tra: Nếu trong Sheet đã có Lat/Lng thì dùng luôn cho nhanh
        if (item.Latitude && item.Longitude) {
             createMarker({ lat: item.Latitude, lng: item.Longitude }, name);
        } 
        // Nếu chưa có, thì Web tự đi tìm (Sẽ chậm)
        else if (address) {
            await geocodeAndDraw(address, name);
            // ⚠️ QUAN TRỌNG: Chờ 1.5 giây trước khi xử lý dòng tiếp theo
            await delay(1500); 
        }
    }
    console.log("🏁 Hoàn tất hiển thị bản đồ.");
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadDataFromN8n, 500); 
});