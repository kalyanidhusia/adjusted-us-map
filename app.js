let map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let geojsonLayer;

// Load GeoJSON
fetch('adjusted_us_states_combined.geojson')
  .then(res => res.json())
  .then(geoData => {
    geojsonLayer = L.geoJson(geoData, {
      style: {
        color: "#444",
        weight: 1,
        fillColor: "#e0e0e0",
        fillOpacity: 0.5
      }
    }).addTo(map);
  });

// CSV upload handler
document.getElementById('csvInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function(results) {
      const data = results.data;
      const valueMap = {};
      data.forEach(row => {
        if (row.state && row.plotnumber !== undefined) {
          valueMap[row.state.trim().toUpperCase()] = row.plotnumber;
        }
      });

      // Re-color the map based on uploaded values
      fetch('adjusted_us_states_combined.geojson')
        .then(res => res.json())
        .then(geoData => {
          if (geojsonLayer) {
            map.removeLayer(geojsonLayer);
          }

          geojsonLayer = L.geoJson(geoData, {
            style: feature => {
              const val = valueMap[feature.properties.state_abbv];
              const fill = val ? getColor(val) : "#f0f0f0";
              return {
                weight: 1,
                color: "#555",
                fillColor: fill,
                fillOpacity: 0.7
              };
            },
            onEachFeature: function (feature, layer) {
              const abbr = feature.properties.state_abbv;
              const val = valueMap[abbr];
              layer.bindPopup(`<b>${abbr}</b><br>${val !== undefined ? val : 'No data'}`);
            }
          }).addTo(map);

          document.getElementById('downloadBtn').style.display = 'inline-block';
        });
    }
  });
});

// Color scale function
function getColor(d) {
  return d > 400 ? '#08306b' :
         d > 300 ? '#2171b5' :
         d > 200 ? '#6baed6' :
         d > 100 ? '#c6dbef' :
                   '#deebf7';
}

// PNG download
document.getElementById('downloadBtn').addEventListener('click', function() {
  leafletImage(map, function(err, canvas) {
    if (err) {
      alert("Error exporting image.");
      return;
    }
    const img = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = "us_map_plot.png";
    link.href = img;
    link.click();
  });
});
