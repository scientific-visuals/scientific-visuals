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
<svg id="chordDiagram" width="800" height="800"></svg>
<script>
    // Data in matrix format
    const dataCSV = [
      ["Methyl Bromide", 1, 0],
      ["Carbon Tetrachloride", 1, 0],
      ["2,4 Dichlorophenoxyacetic Acid", 1, 0],
      ["Heptachlor", 0, 1],
      ["ppDDE", 1, 1],
      ["Trifluralin", 1, 0],
      ["Oxychlordane", 1, 1],
      ["Trans-Nanochlor", 1, 1],
      ["Carbon Disulfid", 1, 0],
      ["Ethylene Dibromide", 1, 0],
      ["Cis Nanochlor", 0, 1]
    ];
    // Combine categories and chemicals for visualization
    const categories = ["CRC Risk", "CRC Neoplasia"];
    const chemicals = dataCSV.map(d => d[0]);
    const labels = categories.concat(chemicals);
    // Build the connection matrix
    const matrix = Array(labels.length)
      .fill(0)
      .map(() => Array(labels.length).fill(0));
    dataCSV.forEach((row, i) => {
      categories.forEach((cat, j) => {
        matrix[j][i + categories.length] = row[j + 1];
        matrix[i + categories.length][j] = row[j + 1];
      });
    });
    // Visualization settings
    const width = 800, height = 800, outerRadius = Math.min(width, height) / 2 - 50, innerRadius = outerRadius - 20;
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
      .domain(d3.range(labels.length))
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
      .text(d => labels[d.index]);
    // Add ribbons (chords)
    svg.append("g")
      .attr("fill-opacity", 0.67)
      .selectAll("path")
      .data(chord)
      .join("path")
      .attr("fill", d => color(d.source.index))
      .attr("stroke", d => d3.rgb(color(d.source.index)).darker())
      .attr("d", ribbon);
</script>

