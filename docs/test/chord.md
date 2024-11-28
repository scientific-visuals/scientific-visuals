<style>
svg {
    margin: auto;
    display: block;
}
</style>
<h1>D3.js Chord Diagram Example</h1>
<svg id="chordDiagram" width="600" height="600"></svg>
<!-- Include local D3.js -->
<script src="./d3.7.js"></script>
<script>
const svg = d3.select("#chordDiagram"),
      width = +svg.attr("width"),
      height = +svg.attr("height"),
      outerRadius = Math.min(width, height) * 0.5 - 40,
      innerRadius = outerRadius - 30;
const chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);
const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);
const ribbon = d3.ribbon()
    .radius(innerRadius);
const color = d3.scaleOrdinal(d3.schemeCategory10);
// Sample data matrix
const matrix = [
    [11975,  5871, 8916, 2868],
    [ 1951, 10048, 2060, 6171],
    [ 8010, 16145, 8090, 8045],
    [ 1013,   990,  940, 6907]
];
const chords = chord(matrix);
const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`)
    .datum(chords);
// Groups
const group = g.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");
group.append("path")
    .style("fill", d => color(d.index))
    .style("stroke", d => d3.rgb(color(d.index)).darker())
    .attr("d", arc);
group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", "0.35em")
    .attr("transform", d => `
rotate(${(d.angle * 180 / Math.PI - 90)})
translate(${outerRadius + 10})
${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
    .text(d => `Group ${d.index + 1}`);
// Ribbons
g.append("g")
    .attr("fill-opacity", 0.67)
    .selectAll("path")
    .data(chords)
    .join("path")
    .attr("d", ribbon)
    .style("fill", d => color(d.target.index))
    .style("stroke", d => d3.rgb(color(d.target.index)).darker());
</script>
