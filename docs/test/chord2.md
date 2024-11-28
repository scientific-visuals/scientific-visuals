<style>
svg {
    margin: auto;
    display: block;
}
</style>
<h1>D3.js Chord Diagram Example</h1>
<!-- Include local D3.js -->
<script src="./d3.7.js"></script>
<svg id="chordDiagram" width="600" height="600"></svg>
<script>
    const matrix = [
      [11975, 5871, 8916, 2868],
      [1951, 10048, 2060, 6171],
      [8010, 16145, 8090, 8045],
      [1013, 990, 940, 6907]
    ];
   const width = 600, height = 600, outerRadius = Math.min(width, height) / 2 - 50, innerRadius = outerRadius - 20;
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
      .domain(d3.range(matrix.length))
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
      .text((d, i) => `Group ${i}`);
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