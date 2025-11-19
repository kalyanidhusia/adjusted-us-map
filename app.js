// app.js
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;

    if (file.name.endsWith('.geojson')) {
      const geojson = JSON.parse(content);
      L.geoJSON(geojson).addTo(map);
    } else if (file.name.endsWith('.csv')) {
      const rows = Papa.parse(content, { header: true }).data;
      rows.forEach(row => {
        if (row.lat && row.lon) {
          L.circleMarker([+row.lat, +row.lon], {
            radius: 5, fillColor: "#e41a1c", color: "#000", weight: 1, fillOpacity: 0.7
          }).bindPopup(JSON.stringify(row)).addTo(map);
        }
      });
    }
  };
  reader.readAsText(file);
}
