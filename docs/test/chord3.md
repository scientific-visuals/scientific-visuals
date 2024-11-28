<link href="./tabulator.min.css" rel="stylesheet">
<style>
body {
font-family: Arial, sans-serif;
text-align: center;
}
#matrixTable {
margin: 20px auto;
width: 90%;
}
svg {
margin: auto;
display: block;
}
.controls {
margin: 20px;
}
.controls button {
padding: 10px 20px;
margin: 0 10px;
font-size: 16px;
cursor: pointer;
}
</style>
</head>
<body>
<h1>D3.js Chord Diagram with Editable Matrix</h1>

<!-- Control Button -->
<div class="controls">
<button id="addColumn">Add Column</button>
</div>

<!-- Editable Matrix Table -->
<div id="matrixTable"></div>

<svg id="chordDiagram" width="600" height="600"></svg>

<!-- Include D3.js -->
<script src="./d3.7.js"></script>
<!-- Include Tabulator JS -->
<script type="text/javascript" src="./tabulator.min.js"></script>
<script>
// Initialize Tabulator
var table = new Tabulator("#matrixTable", {
layout: "fitColumns",
reactiveData: true, // Enable reactive data
placeholder: "No Data Available",
data: [
{ id: 1, group: "Group 1", col1: 11975, col2: 5871, col3: 8916, col4: 2868 },
{ id: 2, group: "Group 2", col1: 1951, col2: 10048, col3: 2060, col4: 6171 },
{ id: 3, group: "Group 3", col1: 8010, col2: 16145, col3: 8090, col4: 8045 },
{ id: 4, group: "Group 4", col1: 1013, col2: 990, col3: 940, col4: 6907 },
],
columns: [
{ title: "Group", field: "group", editor: "input", hozAlign: "center" },
{ title: "Group 1", field: "col1", hozAlign: "center", editor: "number" },
{ title: "Group 2", field: "col2", hozAlign: "center", editor: "number" },
{ title: "Group 3", field: "col3", hozAlign: "center", editor: "number" },
{ title: "Group 4", field: "col4", hozAlign: "center", editor: "number" },
],
});
// Attach the cellEdited event using table.on
table.on("cellEdited", function(cell){
console.log('Cell Edited:', cell.getField(), cell.getValue());
// If the 'group' field is edited, update the corresponding column header
if(cell.getField() === "group") {
let row = cell.getRow().getData();
let groupIndex = row.id - 1; // Assuming id starts at 1 and increments by 1
let newGroupName = row.group;
let fieldName = `col${groupIndex + 1}`;
// Find the column definition and update its title
let column = table.getColumn(fieldName);
if(column) {
column.updateDefinition({title: newGroupName});
}
}
updateChordDiagram();
});
// D3.js Chord Diagram Setup
const svg = d3.select("#chordDiagram"),
width = +svg.attr("width"),
  height = +svg.attr("height"),
  outerRadius = Math.min(width, height) * 0.5 - 40,
  innerRadius = outerRadius - 30;
const chordGenerator = d3.chord()
.padAngle(0.05)
.sortSubgroups(d3.descending);
const arc = d3.arc()
.innerRadius(innerRadius)
.outerRadius(outerRadius);
const ribbon = d3.ribbon()
.radius(innerRadius);
const color = d3.scaleOrdinal(d3.schemeCategory10);
let matrix = [
[11975,  5871, 8916, 2868],
[1951, 10048, 2060, 6171],
[8010, 16145, 8090, 8045],
[1013,   990,  940, 6907]
];
let g = svg.append("g")
.attr("transform", `translate(${width / 2},${height / 2})`);
function renderChord(matrixData, groupNames) {
// Clear previous diagram
svg.selectAll("*").remove();
// Recreate the group container
g = svg.append("g")
.attr("transform", `translate(${width / 2},${height / 2})`)
.datum(chordGenerator(matrixData));
// Groups
const group = g.append("g")
.selectAll("g")
.data(d => d.groups)
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
.text(d => groupNames[d.index]);
// Ribbons
g.append("g")
.attr("fill-opacity", 0.67)
.selectAll("path")
.data(d => d)
.join("path")
.attr("d", ribbon)
.style("fill", d => color(d.target.index))
.style("stroke", d => d3.rgb(color(d.target.index)).darker());
}
// Initial render
renderChord(matrix, ["Group 1", "Group 2", "Group 3", "Group 4"]);
// Function to update matrix from Tabulator and re-render chord diagram
function updateChordDiagram() {
console.log('update chord')
let tableData = table.getData();
let size = tableData.length;
let groupNames = tableData.map(row => row.group);
let newMatrix = [];
for (let i = 0; i < size; i++) {
let row = [];
for (let j = 0; j < size; j++) {
let field = `col${j + 1}`;
row.push(parseInt(tableData[i][field]) || 0);
}
newMatrix.push(row);
}
matrix = newMatrix;
renderChord(matrix, groupNames);
}
// Utility function to get the next group number
function getNextGroupNumber() {
let currentGroups = table.getData().map(row => row.group);
let max = 0;
currentGroups.forEach(g => {
let num = parseInt(g.replace(/\D/g, '')) || 0;
if (num > max) max = num;
});
return max + 1;
}
// Add Column Button Event
document.getElementById("addColumn").addEventListener("click", function(){
let newGroupNumber = getNextGroupNumber();
let newGroupName = `Group ${newGroupNumber}`;
let newField = `col${newGroupNumber}`;
// Add a new column to the right
table.addColumn({
title: newGroupName,
field: newField,
hozAlign: "center",
editor: "number",
}); // No second parameter to ensure it adds to the end
// Update existing rows to include the new column with 0s
let allData = table.getData();
allData.forEach(row => {
row[newField] = 0;
table.updateData([row]);
});
// Add a new row with the new group name and 0s for all columns
let newRowData = { id: table.getDataCount() + 1, group: newGroupName };
for(let i = 1; i <= newGroupNumber; i++) {
let field = `col${i}`;
newRowData[field] = 0;
}
table.addRow(newRowData);
// Update the matrix
updateChordDiagram();
});
</script>
