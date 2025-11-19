const stateNameToAbbv = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL",
  "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA",
  "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI",
  "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
  "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
  "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
  "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
  "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC"
};

let geojson;
d3.json("adjusted_us_states_combined.geojson").then(g => {
  geojson = g;
});

// Draw map
async function drawMap(dataByAbbv) {
  const width = 1000, height = 600;
  d3.select("#map-container").html("");

  const svg = d3.select("#map-container")
    .append("svg")
    .attr("id", "map")
    .attr("width", width)
    .attr("height", height);

  const projection = d3.geoIdentity().reflectY(true).fitSize([width, height], geojson);
  const path = d3.geoPath().projection(projection);

  const values = Object.values(dataByAbbv);
  const color = d3.scaleSequential()
    .domain([d3.min(values), d3.max(values)])
    .interpolator(d3.interpolateBlues);

  svg.append("g")
    .selectAll("path")
    .data(geojson.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const abbv = d.properties.state_abbv;
      return dataByAbbv[abbv] != null ? color(dataByAbbv[abbv]) : "#eee";
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5);

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 250},20)`);

  const legendScale = d3.scaleLinear()
    .domain(color.domain())
    .range([0, 200]);

  const legendAxis = d3.axisRight(legendScale).ticks(6);

  const legendGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%").attr("y1", "100%")
    .attr("x2", "0%").attr("y2", "0%");

  legendGradient.append("stop")
    .attr("offset", "0%").attr("stop-color", color.range()[0]);
  legendGradient.append("stop")
    .attr("offset", "100%").attr("stop-color", color.range()[1]);

  legend.append("rect")
    .attr("width", 15)
    .attr("height", 200)
    .style("fill", "url(#legend-gradient)");

  legend.append("g")
    .attr("transform", "translate(15,0)")
    .call(legendAxis);
}

// CSV upload handler
document.getElementById("csv-file").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function (results) {
      const data = results.data;
      let keyCol = null, valueCol = null;

      const headers = results.meta.fields.map(h => h.toLowerCase());
      if (headers.includes("state")) keyCol = "state";
      else if (headers.includes("state_name")) keyCol = "state_name";
      else return alert("Missing 'state' or 'state_name' column.");

      valueCol = headers.find(h => h !== keyCol);
      if (!valueCol) return alert("Could not find value column.");

      const dataByAbbv = {};

      data.forEach(row => {
        let abbv = null;
        if (keyCol === "state") {
          abbv = row[keyCol]?.toString().trim().toUpperCase();
        } else if (keyCol === "state_name") {
          const name = row[keyCol]?.toString().trim();
          abbv = stateNameToAbbv[name];
        }

        const value = parseFloat(row[valueCol]);
        if (abbv && !isNaN(value)) {
          dataByAbbv[abbv] = value;
        }
      });

      drawMap(dataByAbbv);
    }
  });
});

function downloadMap() {
  saveSvgAsPng(document.getElementById("map"), "us_map_plot.png", { scale: 2 });
}
