// map-init.js

// Biến global dùng chung cho các file khác
var markers = [];
var activeRoutes = [];
var pendingStartPoint = null;
var isSelectingEndPointMode = false;

// Tọa độ trụ sở chính
var headquartersLocation = {
    lat: 21.029037,
    lng: 105.779702,
    name: "Trụ sở chính"
};

// 1. Tạo Map
var map = L.map('map').setView([headquartersLocation.lat, headquartersLocation.lng], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, 
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// 2. Tạo marker trụ sở chính với icon đặc biệt
var headquartersIcon = L.divIcon({
    className: 'headquarters-icon',
    html: '<div style="background:#ff4444; width:30px; height:30px; border-radius:50%; border:3px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:16px;">🏢</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
});

var headquartersMarker = L.marker(
    [headquartersLocation.lat, headquartersLocation.lng],
    {icon: headquartersIcon}
).addTo(map);

headquartersMarker.markerName = headquartersLocation.name;
headquartersMarker.isHeadquarters = true; // Đánh dấu đây là trụ sở

// Thêm vào mảng markers
markers.push(headquartersMarker);

console.log("Map và marker trụ sở chính đã được khởi tạo");
console.log("Leaflet Routing available:", typeof L.Routing !== 'undefined');
