# Circos
This demo uses BioCircos.js library. Circos diagrams visualising gene fusions display the genomic locations of the fused genes in a circular layout. Each labeled segment around the circle corresponds to a chromosome (numbered 1 to 22, X, and Y), with arcs depicting relationships between the regions involved in gene fusion events. Genes involved in fusions are labeled on the outer ring.

Example fusin:
* BCR-ABL1: A fusion between chromosomes 9 and 22, associated with chronic myeloid leukemia.
* EML4-ALK: An intrachromosomal fusion on chromosome 2, often seen in non-small-cell lung cancer.
* FGFR3-TACC3: A fusion on chromosome 4, linked to glioblastomas and other cancers.

<!-- BioCircos.js, Jquery.js and D3.js import -->
<script src="./jquery.min.js"></script>
<script src="./d3.js"></script>
<script src="./biocircos-1.1.0.js"></script>
<!-- Prepare a <div> tag with "biocircos" id to set the picture position your will draw in html -->
<div id="biocircos"></div>
<!-- Data configuration -->
<script src="./gallery10_LINK01.js"></script>
<script src="./gallery10_LINK02.js"></script>
<!-- Genome configuration -->
<script>
  var BioCircosGenome = [
     ["1" , 249250621],
     ["2" , 243199373],
     ["3" , 198022430],
     ["4" , 191154276],
     ["5" , 180915260],
     ["6" , 171115067],
     ["7" , 159138663],
     ["8" , 146364022],
     ["9" , 141213431],
     ["10" , 135534747],
     ["11" , 135006516],
     ["12" , 133851895],
     ["13" , 115169878],
     ["14" , 107349540],
     ["15" , 102531392],
     ["16" , 90354753],
     ["17" , 81195210],
     ["18" , 78077248],
     ["19" , 59128983],
     ["20" , 63025520],
     ["21" , 48129895],
     ["22" , 51304566],
     ["X" , 155270560],
     ["Y" , 59373566]
  ];
  BioCircos01 = new BioCircos(LINK01,LINK02,BioCircosGenome,{
     target : "biocircos",
     svgWidth : 900,
     svgHeight : 600,
     innerRadius: 246,
     outerRadius: 270,
     genomeFillColor: ["#FFFFCC", "#CCFFFF", "#FFCCCC", "#CCCC99","#0099CC", "#996699", "#336699", "#FFCC33","#66CC00"],
     LINKMouseEvent : true,
     LINKMouseClickDisplay : true,
     LINKMouseClickOpacity : 1.0,
     LINKMouseClickStrokeColor : "red",
     LINKMouseClickStrokeWidth : 6,
     LINKLabelDragEvent : true,
  });
  BioCircos01.draw_genome(BioCircos01.genomeLength);
</script>
