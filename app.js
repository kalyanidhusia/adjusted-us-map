const width = 960, height = 600;
const svg = d3.select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale(1000);

const path = d3.geoPath().projection(projection);
const tooltip = d3.select("#tooltip");

let geoData;

// Load GeoJSON
d3.json("adjusted_us_states_combined.geojson").then(geojson => {
  geoData = geojson;
  drawMap(geojson);
});

function drawMap(geojson, colorScale = d3.scaleSequential().interpolator(d3.interpolateBlues), dataMap = new Map()) {
  svg.selectAll("path").remove();

  const values = Array.from(dataMap.values());
  const extent = d3.extent(values);

  if (!isNaN(extent[0]) && !isNaN(extent[1])) {
    colorScale.domain(extent);
  }

  svg.selectAll("path")
    .data(geojson.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const key = (d.properties.state_abbv || d.properties.state_name || "").trim().toUpperCase();
      const val = dataMap.get(key);
      return val !== undefined ? colorScale(val) : "#eee";
    })
    .attr("stroke", "#333")
    .on("mouseover", (event, d) => {
      const key = (d.properties.state_abbv || d.properties.state_name || "").trim().toUpperCase();

      const val = dataMap.get(key);

      tooltip.style("opacity", 1)
        .html(`<strong>${key}</strong><br>${val !== undefined ? val : "N/A"}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  drawLegend(colorScale, extent);
}

function drawLegend(colorScale, extent) {
  d3.select("#legend-svg").remove();

  const legendWidth = 300, legendHeight = 12;
  const canvas = document.createElement("canvas");
  canvas.width = legendWidth;
  canvas.height = 1;
  const context = canvas.getContext("2d");

  for (let i = 0; i < legendWidth; ++i) {
    context.fillStyle = colorScale(extent[0] + (extent[1] - extent[0]) * i / legendWidth);
    context.fillRect(i, 0, 1, 1);
  }

  const legendSvg = svg.append("g")
    .attr("id", "legend-svg")
    .attr("transform", `translate(${width - 340},${height - 50})`);

  legendSvg.append("image")
    .attr("xlink:href", canvas.toDataURL())
    .attr("width", legendWidth)
    .attr("height", legendHeight);

  const scale = d3.scaleLinear().domain(extent).range([0, legendWidth]);
  const axis = d3.axisBottom(scale).ticks(5);

  legendSvg.append("g")
    .attr("transform", `translate(0,${legendHeight})`)
    .call(axis)
    .append("text")
    .attr("x", legendWidth / 2)
    .attr("y", 30)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Uploaded Data Value");
}

// Handle CSV upload
document.getElementById("csv-file").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: results => {
      const rows = results.data;
      const dataMap = new Map();

      // Detect numeric column
      const numericCol = Object.keys(rows[0]).find(col =>
        !isNaN(parseFloat(rows[0][col])) && isFinite(rows[0][col])
      );

      rows.forEach(row => {
        const key = (
          row.state ||
          row.State ||
          row.state_abbv ||
          row.state_name ||
          row.State_Name ||
          row.NAME ||
          ""
        ).trim().toUpperCase();


        const val = row[numericCol];

        if (key && val) {
          dataMap.set(key.trim().toUpperCase(), +val);
        }
      });

      const selectedScheme = document.getElementById("color-scheme").value;
      const scale = d3.scaleSequential().interpolator(d3[selectedScheme]);

      drawMap(geoData, scale, dataMap);
    }
  });
});

// PNG Download
function downloadMap() {
  saveSvgAsPng(document.querySelector("svg"), "adjusted_us_map.png", { scale: 3 });
}
