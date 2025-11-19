// app.js — Load GeoJSON, parse CSV, and render colored US map

// Global vars
let uploadedData = null;
let geojsonData = null;

const width = 960;
const height = 600;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Color scale
const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 500]);

// Tooltip
const tooltip = d3.select("#tooltip");

// Load GeoJSON
d3.json("adjusted_us_states_combined.geojson").then(geoData => {
  geojsonData = geoData;

  // File upload handler
  document.getElementById("file-input").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
          uploadedData = results.data;
          drawMap();
        },
        error: function (error) {
          alert("Error parsing CSV: " + error.message);
        }
      });
    }
  });

  // Initial draw if no file uploaded
  drawMap();
});

function drawMap() {
  svg.selectAll("*").remove();

  // Merge uploaded CSV with GeoJSON
  if (uploadedData && uploadedData.length > 0) {
    const csvMap = new Map();
    uploadedData.forEach(d => {
      if (d.state && d.plotnumber) {
        csvMap.set(d.state.trim().toUpperCase(), +d.plotnumber);
      }
    });

    geojsonData.features.forEach(f => {
      const abbrev = f.properties.state_abbv?.toUpperCase();
      f.properties.plotnumber = abbrev && csvMap.has(abbrev) ? csvMap.get(abbrev) : 0;
    });
  } else {
    geojsonData.features.forEach(f => f.properties.plotnumber = 0);
  }

  svg.selectAll("path")
    .data(geojsonData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", d => {
      const value = d.properties.plotnumber;
      return value > 0 ? colorScale(value) : "#eee";
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<strong>${d.properties.state_name}</strong><br>Plot value: ${d.properties.plotnumber}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(300).style("opacity", 0);
    });
}
