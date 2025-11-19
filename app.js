const map = L.map('map').setView([37.8, -96], 4);

// Add tile layer (optional, since we're only showing borders)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  minZoom: 3,
  maxZoom: 7,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let geojsonLayer;
let stateData = {};

function getColor(d) {
  return d > 400 ? '#084594' :
         d > 300 ? '#2171b5' :
         d > 200 ? '#4292c6' :
         d > 100 ? '#6baed6' :
         d > 0   ? '#9ecae1' :
                   '#f0f0f0';
}

function style(feature) {
  const value = stateData[feature.properties.state_abbv] || 0;
  return {
    fillColor: getColor(value),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

// Load GeoJSON
fetch('adjusted_us_states_combined.geojson')
  .then(res => res.json())
  .then(data => {
    geojsonLayer = L.geoJson(data, {
      style: style,
      onEachFeature: function (feature, layer) {
        const abbv = feature.properties.state_abbv;
        layer.bindPopup(`${abbv}: ${stateData[abbv] || 0}`);
      }
    }).addTo(map);
  });

// Handle CSV upload
document.getElementById('csvFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  Papa.parse(file, {
    header: true,
    complete: function (results) {
      results.data.forEach(row => {
        const state = row.state?.trim().toUpperCase();
        const value = parseFloat(row.plotnumber);
        if (state && !isNaN(value)) {
          stateData[state] = value;
        }
      });

      // Re-style map with updated data
      if (geojsonLayer) {
        geojsonLayer.setStyle(style);
        geojsonLayer.eachLayer(layer => {
          const abbv = layer.feature.properties.state_abbv;
          layer.setPopupContent(`${abbv}: ${stateData[abbv] || 0}`);
        });
      }
    }
  });
});

// Export as PNG
document.getElementById('downloadBtn').addEventListener('click', () => {
  domtoimage.toBlob(document.getElementById('map')).then(function (blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'us_map.png';
    a.click();
  });
});
