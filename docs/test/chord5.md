<script src="./d3.7.js"></script>
<style>
    .chord path {
      fill-opacity: 0.67;
      stroke: #000;
      stroke-width: 0.5px;
    }
    .group path {
      stroke: #000;
      stroke-width: 1px;
    }
    text {
      font-family: sans-serif;
      font-size: 12px;
    }
</style>
  <svg id="chordDiagram" width="1000" height="800"></svg>
  <script>
    // Load CSV file
    d3.csv("environmental_data.csv").then(data => {
      // Extract labels (column names)
      const labels = data.columns.slice(1); // Skip the first column (Label)
      // Build the connection matrix
      /*const matrix = data.map(row => 
        labels.map(label => +row[label]) // Convert cell values to numbers
      );*/
      // Build the connection matrix
/*const matrix = data.map(row => 
  labels.map(label => {
    const value = row[label]?.trim(); // Trim whitespace
    return value === "" || isNaN(value) ? 0 : parseFloat(value); // Convert to number, default to 0
  })
);*/
// Build the connection matrix using a for loop
/*const matrix = [];
for (let i = 0; i < data.length; i++) {
  const row = [];
  for (let j = 0; j < labels.length; j++) {
    const value = data[i][labels[j]]?.trim(); // Trim whitespace
    if (i==76 && j == 21) {
        console.log('data 76',data[i]);
        console.log('labels 21',labels[j]);
        console.log('value',value)
    }
    row.push(value === "" || isNaN(value) ? 0 : parseFloat(value)); // Convert to number, default to 0
  }
  matrix.push(row);
}
      console.log('data',data);
      console.log('labels',labels);
      console.log('matrix',matrix);*/
// Identify all unique labels (including missing ones)
const allLabels = new Set();
// Add labels from both rows and columns
data.forEach(row => {
  allLabels.add(row["Label"]); // Add row labels
  labels.forEach(label => allLabels.add(label)); // Add column labels
});
// Convert to sorted array for consistent ordering
const normalizedLabels = Array.from(allLabels).sort();
// Build the square matrix and track missing rows
const matrix = [];
const modifiedLabels = []; // To store updated labels (with 'ZZ' prefix for missing rows)
normalizedLabels.forEach(rowLabel => {
  const row = data.find(d => d["Label"] === rowLabel);
  if (row) {
    // If the row exists, map its values
    matrix.push(
      normalizedLabels.map(colLabel => {
        const value = row[colLabel]?.trim();
        return value === "" || isNaN(value) ? 0 : parseFloat(value);
      })
    );
    modifiedLabels.push(rowLabel); // Use original label
  } else {
    // If the row is missing, add a row of 0s and prefix the label with 'ZZ'
    matrix.push(Array(normalizedLabels.length).fill(0));
    modifiedLabels.push(`ZZ-${rowLabel}`);
  }
});
// Sort labels and matrix by moving 'ZZ-' prefixed labels to the end
const sortedIndices = modifiedLabels
  .map((label, index) => ({ label, index }))
  .sort((a, b) => {
    const isA_ZZ = a.label.startsWith("ZZ-");
    const isB_ZZ = b.label.startsWith("ZZ-");
    if (isA_ZZ && !isB_ZZ) return 1; // Move ZZ to the end
    if (!isA_ZZ && isB_ZZ) return -1; // Keep non-ZZ labels at the top
    return a.label.localeCompare(b.label); // Sort alphabetically otherwise
  });
// Reorder the labels and matrix
const sortedLabels = sortedIndices.map(item => item.label);
const sortedMatrix = sortedIndices.map(item => matrix[item.index]);
// Debug logs to verify
console.log("Sorted Labels:", sortedLabels);
console.log("Sorted Matrix:", sortedMatrix);
      // Visualization settings
      const width = 800, height = 800, outerRadius = Math.min(width, height) / 2 - 100, innerRadius = outerRadius - 20;
      const svg = d3.select("#chordDiagram")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);
     const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)(matrix);
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
     const ribbon = d3.ribbon()
        .radius(innerRadius);
      const color = d3.scaleOrdinal()
        .domain(d3.range(modifiedLabels.length))
        .range(d3.schemeCategory10);
      // Add groups (arcs)
      const group = svg.append("g")
        .selectAll("g")
        .data(chord.groups)
        .join("g");
      group.append("path")
        .attr("fill", d => color(d.index))
        .attr("stroke", d => d3.rgb(color(d.index)).darker())
        .attr("d", arc);
      group.append("text")
        .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
        .attr("dy", "0.35em")
        .attr("transform", d => `
          rotate(${(d.angle * 180 / Math.PI - 90)})
          translate(${outerRadius + 5})
          ${d.angle > Math.PI ? "rotate(180)" : ""}
        `)
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .text(d => modifiedLabels[d.index]);
      // Add ribbons (chords)
      svg.append("g")
        .attr("fill-opacity", 0.67)
        .selectAll("path")
        .data(chord)
        .join("path")
        .attr("fill", d => color(d.source.index))
        .attr("stroke", d => d3.rgb(color(d.source.index)).darker())
        .attr("d", ribbon);
    }).catch(error => console.error("Error loading CSV:", error));
  </script>