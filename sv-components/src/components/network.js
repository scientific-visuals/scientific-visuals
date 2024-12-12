import { IEventAggregator, resolve, customElement, bindable } from 'aurelia';
import Graph from 'graphology';
import { Sigma } from 'sigma';
//import forceAtlas2 from 'graphology-layout-forceatlas2';
import ForceSupervisor from "graphology-layout-force/worker";
import { createNodeImageProgram } from "@sigma/node-image";
//import NodeGradientProgram from "./node-gradient";

const TEXT_COLOR = "#000000";

export function drawRoundRect(
  ctx/*: CanvasRenderingContext2D*/,
  x/*: number*/,
  y/*: number*/,
  width/*: number*/,
  height/*: number*/,
  radius/*: number*/,
)/*: void*/ {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}


@customElement('sv-network')
export class Network {
  ea /* IEventAggregator*/ = resolve(IEventAggregator);
  container;
  searchinput;
  @bindable tabid;
  @bindable datachannel;
  @bindable searchValue;

  searchValueChanged(newValue,oldValue) {
    console.log('searchValue changed',newValue,oldValue);
    this.setSearchQuery(newValue) 
  }

  attached() {
    this.ea.subscribe('showtab', (showtabid) => {
      if (this.tabid === this.showtabid) {
        if (this.layout) this.startAnimate();//this.layout.start();
        else {
          console.warn('empty layout')
          this.renderer = new Sigma(this.graph, this.container, {
            // We don't have to declare edgeProgramClasses here, because we only use the default ones ("line" and "arrow")
            nodeProgramClasses: {
              image: createNodeImageProgram(),
              //gradient: NodeGradientProgram,
            },
            renderEdgeLabels: true,
            allowInvalidContainer: true
          });

          // Create the spring layout and start it
          this.layout = new ForceSupervisor(this.graph);
          this.startAnimate();//this.layout.start();
        }
      }
    });
    if (this.datachannel) {
      this.ea.subscribe(this.datachannel, (mydata) => {
        console.log('network received data:', mydata);
        if (Array.isArray(mydata)) {
          this.transformDataToGraph(mydata);
        } else {
          //process changes
          if (this.layout) this.stopAnimate();//this.layout.stop();
          if (mydata.type == 'changeNode') {
            console.log('network changeNode')
            this.renameNode(mydata.old, mydata.value)
          } else if (mydata.type == 'changeType') {
            console.log('network changeType')
            this.changeNodeType(mydata.node, mydata.value)
          } else if (mydata.type == 'changeEdge') {
            console.log('network changeEdge')
            //        {'type':'changeEdge','subject':subjectName,'object':objectName,'old':oldValue,'value':newValue})              
            this.updateEdge(mydata.subject, mydata.object, mydata.value)
          } else {
            console.warn('not recognized change', mydata);
          }
          if (this.layout) this.startAnimate();
        }
      })
    } else console.warn('datachannel empty')
    //this.showgraph();
    this.data = []; //TODO put data from other components
    this.transformDataToGraph(this.data);
  }
  state =  { searchQuery: "" }
  // Actions:
  setSearchQuery(query) {
    this.state.searchQuery = query;

    if (this.searchValue !== query) this.searchValue = query;

    if (query) {
      const lcQuery = query.toLowerCase();
      const suggestions = this.graph
        .nodes()
        .map((n) => ({ id: n, label: this.graph.getNodeAttribute(n, "label") }))
        .filter(({ label }) => label.toLowerCase().includes(lcQuery));

      // If we have a single perfect match, them we remove the suggestions, and
      // we consider the user has selected a node through the datalist
      // autocomplete:
      if (suggestions.length === 1 && suggestions[0].label === query) {
        this.state.selectedNode = suggestions[0].id;
        this.state.suggestions = undefined;

        // Move the camera to center it on the selected node:
        const nodePosition = this.renderer.getNodeDisplayData(state.selectedNode);
        this.renderer.getCamera().animate(nodePosition, {
          duration: 500,
        });
      }
      // Else, we display the suggestions list:
      else {
        this.state.selectedNode = undefined;
        this.state.suggestions = new Set(suggestions.map(({ id }) => id));
      }
    }
    // If the query is empty, then we reset the selectedNode / suggestions state:
    else {
      this.state.selectedNode = undefined;
      this.state.suggestions = undefined;
    }

    // Refresh rendering
    // You can directly call `renderer.refresh()`, but if you need performances
    // you can provide some options to the refresh method.
    // In this case, we don't touch the graph data so we can skip its reindexation
    this.renderer.refresh({
      skipIndexation: true,
    });
  }

  setHoveredNode(node) {
    if (node) {
      this.state.hoveredNode = node;
      this.state.hoveredNeighbors = new Set(this.graph.neighbors(node));
    }

    if (!node) {
      this.state.hoveredNode = undefined;
      this.state.hoveredNeighbors = undefined;
    }

    // Refresh rendering
    this.renderer.refresh({
      // We don't touch the graph data so we can skip its reindexation
      skipIndexation: true,
    });
  }
  

  changeNodeType(nodeId, nodetype) {
    const mycolor = this.typeColorMap[nodetype] || 'gray';

    //    color: color,
    //subjectType: subjectType,
    if (!this.graph.hasNode(nodeId)) {
      console.log(`Node "${nodeId}" does not exist. Creating.`);
      const angle = (this.graph.order * 2 * Math.PI) / this.graph.order;
      
      this.graph.addNode(nodeId, {
        label: nodeId,
        size: 15,
        color: mycolor, // Default color for objects without a type
        // type: 'object' // Optional: Define type as 'object'
        x: 100 * Math.cos(angle),
        y: 100 * Math.sin(angle)
      });

    }
    this.graph.setNodeAttribute(nodeId, 'color', mycolor);
    this.graph.setNodeAttribute(nodeId, 'subjectType', nodetype);
  }

  renameNode(oldName, newName) {
    if (!oldName) {
      //oldname is null create Node
      this.changeNodeType(newName,'default');
      return;
    }
    if (!this.graph.hasNode(oldName)) {
      console.error(`Node "${oldName}" does not exist.`);
      return;
    }
    if (this.graph.hasNode(newName)) {
      console.error(`Node "${newName}" already exists.`);
      return;
    }

    // Get attributes of the old node
    const attributes = this.graph.getNodeAttributes(oldName);
    attributes.label = newName;

    // Add the new node with the same attributes
    this.graph.addNode(newName, attributes);

    // Transfer all edges from old node to new node
    this.graph.forEachEdge(oldName, (edge, attr, source, target) => {
      const connectedNode = source === oldName ? target : source;
      this.graph.addEdge(newName, connectedNode, attr);
    });

    // Remove the old node
    this.graph.dropNode(oldName);
  }

  /**
   * Updates or removes an edge based on the provided value.
   *
   * @param {string} subject - The source node identifier.
   * @param {string} object - The target node identifier.
   * @param {string|number} value - The value to determine the action.
   */
  updateEdge(subject, object, value) {
    // Check if the edge exists between subject and object
    if (this.graph.hasEdge(subject, object)) {
      if (! value || value == 0) {
        // Remove the edge if value is empty string or 0
        this.graph.dropEdge(subject, object);
        console.log(`Edge between "${subject}" and "${object}" has been removed.`);
      } else {
        // Update the 'label' attribute of the existing edge
        this.graph.setEdgeAttribute(subject, object, 'label', value);
        console.log(`Edge between "${subject}" and "${object}" updated with label: "${value}".`);
      }
    } else {
      if (value !== '' && value !== 0) {
        // Optionally, add the edge if it doesn't exist and value is valid
        this.graph.addEdge(subject, object, {
          relationship: 'related',
          type: 'line',
          label: value,
          size: 5
        });
        console.log(`Edge between "${subject}" and "${object}" has been added with label: "${value}".`);
      } else {
        console.warn(`Edge between "${subject}" and "${object}" does not exist and no action was taken.`);
      }
    }
  }


  /*creategraph() {
    // Step 1: Create a new graph
    this.graph = new Graph();

    const RED = "#FA4F40";
    const BLUE = "#727EE0";
    const GREEN = "#5DB346";

    this.graph.addNode("John", { size: 15, label: "John", type: "image", image: "./user.svg", color: RED });
    this.graph.addNode("Mary", { size: 15, label: "Mary", type: "image", image: "./user.svg", color: RED });
    this.graph.addNode("Suzan", { size: 15, label: "Suzan", type: "image", image: "./user.svg", color: RED });
    this.graph.addNode("Nantes", { size: 15, label: "Nantes", type: "image", image: "./city.svg", color: BLUE });
    this.graph.addNode("New-York", { size: 15, label: "New-York", type: "image", image: "./city.svg", color: BLUE });
    this.graph.addNode("Sushis", { size: 7, label: "Sushis", color: GREEN });
    this.graph.addNode("Falafels", { size: 7, label: "Falafels", color: GREEN });
    this.graph.addNode("Kouign Amann", { size: 7, label: "Kouign Amann", color: GREEN });

    this.graph.addEdge("John", "Mary", { type: "line", label: "works with", size: 5 });
    this.graph.addEdge("Mary", "Suzan", { type: "line", label: "works with", size: 5 });
    this.graph.addEdge("Mary", "Nantes", { type: "arrow", label: "lives in", size: 5 });
    this.graph.addEdge("John", "New-York", { type: "arrow", label: "lives in", size: 5 });
    this.graph.addEdge("Suzan", "New-York", { type: "arrow", label: "lives in", size: 5 });
    this.graph.addEdge("John", "Falafels", { type: "arrow", label: "eats", size: 5 });
    this.graph.addEdge("Mary", "Sushis", { type: "arrow", label: "eats", size: 5 });
    this.graph.addEdge("Suzan", "Kouign Amann", { type: "arrow", label: "eats", size: 5 });

    this.graph.nodes().forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / this.graph.order;
      this.graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
      this.graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
    });
  }
  */
  showgraph() {
    console.log('showgraph()')
    this.renderer = new Sigma(this.graph, this.container, {
      // We don't have to declare edgeProgramClasses here, because we only use the default ones ("line" and "arrow")
      nodeProgramClasses: {
        image: createNodeImageProgram(),
        //gradient: NodeGradientProgram,
      },
      renderEdgeLabels: true,
      allowInvalidContainer: true,
    });
  //hover feature
    // Bind graph interactions:
    this.renderer.on("enterNode", ({ node }) => {
      this.setHoveredNode(node);
    });
    this.renderer.on("leaveNode", () => {
      this.setHoveredNode(undefined);
    });
  //multiline label feature
  // Custom rendering for multi-line labels
/*this.renderer.on('afterRender', () => {
  const ctx = this.renderer.context;
  this.graph.forEachNode((node, attrs) => {
    const { x, y } = this.renderer.getNodeDisplayData(node);
    const lines = attrs.label.split('\n');
    ctx.fillStyle = '#000'; // Text color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y - (lines.length / 2 - index) * 12); // Adjust 12 for line height
    });
  });
});*/
  this.renderer.setSetting("defaultDrawNodeHover", (context/*: CanvasRenderingContext2D*/, data/*: PlainObject*/, settings/*: PlainObject*/) => {
    const size = settings.labelSize;
    const font = settings.labelFont;
    const weight = settings.labelWeight;
    const subLabelSize = size - 2;
  
    const label = data.label;
    const subLabel = data.tag !== "unknown" ? data.tag : "";
    const clusterLabel = data.clusterLabel;
  
    // Then we draw the label background
    context.beginPath();
    context.fillStyle = "#fff";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;
    context.shadowBlur = 8;
    context.shadowColor = "#000";
  
    context.font = `${weight} ${size}px ${font}`;
    const labelWidth = context.measureText(label).width;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    const subLabelWidth = subLabel ? context.measureText(subLabel).width : 0;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    const clusterLabelWidth = clusterLabel ? context.measureText(clusterLabel).width : 0;
  
    const textWidth = Math.max(labelWidth, subLabelWidth, clusterLabelWidth);
  
    const x = Math.round(data.x);
    const y = Math.round(data.y);
    const w = Math.round(textWidth + size / 2 + data.size + 3);
    const hLabel = Math.round(size / 2 + 4);
    const hSubLabel = subLabel ? Math.round(subLabelSize / 2 + 9) : 0;
    const hClusterLabel = Math.round(subLabelSize / 2 + 9);
  
    drawRoundRect(context, x, y - hSubLabel - 12, w, hClusterLabel + hLabel + hSubLabel + 12, 5);
    context.closePath();
    context.fill();
  
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;
  
    // And finally we draw the labels
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${size}px ${font}`;
    context.fillText(label, data.x + data.size + 3, data.y + size / 3);
  
    if (subLabel) {
      context.fillStyle = TEXT_COLOR;
      context.font = `${weight} ${subLabelSize}px ${font}`;
      context.fillText(subLabel, data.x + data.size + 3, data.y - (2 * size) / 3 - 2);
    }
  
    context.fillStyle = data.color;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(clusterLabel, data.x + data.size + 3, data.y + size / 3 + 3 + subLabelSize);
  })
  // search feature
  // Render nodes accordingly to the internal state:
  // 1. If a node is selected, it is highlighted
  // 2. If there is query, all non-matching nodes are greyed
  // 3. If there is a hovered node, all non-neighbor nodes are greyed
  this.renderer.setSetting("nodeReducer", (node, data) => {
    const res = { ...data };
    if (this.state.hoveredNeighbors && !this.state.hoveredNeighbors.has(node) && this.state.hoveredNode !== node) {
      res.label = "";
      res.color = "#f6f6f6";
    }
    if (this.state.selectedNode === node) {
      res.highlighted = true;
    } else if (this.state.suggestions) {
      if (this.state.suggestions.has(node)) {
        res.forceLabel = true;
      } else {
        res.label = "";
        res.color = "#f6f6f6";
      }
    }
    return res;
  });

  // Render edges accordingly to the internal state:
  // 1. If a node is hovered, the edge is hidden if it is not connected to the
  //    node
  // 2. If there is a query, the edge is only visible if it connects two
  //    suggestions
  this.renderer.setSetting("edgeReducer", (edge, data) => {
    const res = { ...data };

    if (
      this.state.hoveredNode &&
      !this.graph.extremities(edge).every((n) => n === this.state.hoveredNode || this.graph.areNeighbors(n, this.state.hoveredNode))
    ) {
      res.hidden = true;
    }

    if (
      this.state.suggestions &&
      (!this.state.suggestions.has(this.graph.source(edge)) || !this.state.suggestions.has(this.graph.target(edge)))
    ) {
      res.hidden = true;
    }

    return res;
  });    

    // Create the spring layout and start it
    this.layout = new ForceSupervisor(this.graph);
    this.startAnimate();
    //this.layout.start();
  }

  /*createGraphFromDatasheet(data) {
    // Initialize a new undirected graph (use 'directed' if your relationships are directional)
    if (this.graph) {
      this.graph.clear();
    } else {
      this.graph = new Graph({ type: 'undirected' });
    }

    // Your data array
    data = [
      ["Subject/Object/Predicate", "type", "CRC Risk", "CRC Neoplasia", "Physical Activity"],
      ["Trans-Chlordane", "environmental", "corelates", "is", 0],
      ["PCB194", "environmental", "corelates", 1],
      ["Sterilisation", "biometric", "increase", 0],
      ["Tobacco Consumption", "lifestyle", "increase", 1, 1],
      ["PAC-RSK", "Interaction Term", "decrease", 0, 1]
    ];

    // Step 1: Extract Object Names from the Header Row
    const header = data[0];
    const objectNames = header.slice(2); // Exclude first two columns

    // Step 2: Add Object Nodes to the Graph
    objectNames.forEach(obj => {
      this.graph.addNode(obj, { type: 'object' });
    });

    // Step 3: Iterate Through Each Subject Row to Add Nodes and Edges
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const subject = row[0];
      const subjectType = row[1];

      // Add Subject Node with 'type' attribute
      if (!this.graph.hasNode(subject)) {
        this.graph.addNode(subject, { type: subjectType });
      }

      // Iterate through the predicate columns
      for (let j = 2; j < header.length; j++) {
        const object = header[j];
        const relationship = row[j]; // This might be undefined

        if (relationship === 1) {
          // Ensure the Object node exists
          if (!graph.hasNode(object)) {
            graph.addNode(object, { type: 'object' });
          }

          // Define a unique edge key or let Graphology handle it
          const edgeKey = `${subject}-${object}`;

          // Add an edge if it doesn't already exist
          if (!graph.hasEdge(edgeKey)) {
            graph.addEdge(subject, object, { relationship: 'related' }); // You can specify the relationship type here
          }
        }
      }

      // Handle cases where the row might have fewer columns than the header
      for (let j = header.length; j < row.length; j++) {
        // If there are extra columns beyond the header, you can decide how to handle them
        // For this example, we'll ignore them
        continue;
      }
    }
  }*/

  /**
 * Transforms a data array into a Graphology graph.
 * @returns {Graph} - The resulting Graphology graph.
 */
  transformDataToGraph(data) {
    // Initialize a new undirected graph
    if (this.graph) {
      //this.graph.clear();
      this.graph.clearEdges();
    } else {
      this.graph = new Graph({ type: 'undirected' });
    }
    if (this.layout) {
      //this.layout.stop();
      this.stopAnimate();
    }
    // Your data array
    console.log('transformDataToGraph data.length', data.length)
    if (data.length == 0) {
      data = [
        ["Subject/Object/Predicate", "type", "CRC Risk", "CRC Neoplasia", "Physical Activity"],
        ["Trans-Chlordane", "environmental", "corelates", "is", 0],
        ["PCB194", "environmental", "corelates", 1],
        ["Sterilisation", "biometric", "increase", 0],
        ["Tobacco Consumption", "lifestyle", "increase", 1, 1],
        ["PAC-RSK", "Interaction Term", "decrease", 0, 1]
      ];
    }
    // Define type to color mapping
    this.typeColorMap = {
      'environmental': 'blue',
      'biometric': 'red',
      'lifestyle': 'green',
      'Interaction Term': 'purple',
      // Add more mappings as needed
    };

    // Extract header row
    const header = data[0];
    const objectNames = header.slice(2); // Exclude first two columns

    // Add Object nodes
    for (let i = 0; i < objectNames.length; i++) {
      const object = objectNames[i];
      if (!this.graph.hasNode(object)) {
        let angle = (i * 2 * Math.PI) / data.length;
        this.graph.addNode(object, {
          label: object,
          tag:'object',
          clusterLabel:'cluster',
          size: 15,
          color: 'orange', // Default color for objects without a type
          // type: 'object' // Optional: Define type as 'object'
          x: 100 * Math.cos(angle),
          y: 100 * Math.sin(angle)
        });
      }
    }

    // Iterate through each Subject row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const subject = row[0];
      const subjectType = row[1];

      // Determine color based on type
      const color = this.typeColorMap[subjectType] || 'gray'; // Default to gray if type not mapped
      let angle = (i * 2 * Math.PI) / data.length;
      // Add Subject node
      if (!this.graph.hasNode(subject)) {
        this.graph.addNode(subject, {
          label: subject,
          tag: subjectType,
          clusterLabel:'cluster',
          size: 7,
          color: color,
          subjectType: subjectType,
          x: 100 * Math.cos(angle),
          y: 100 * Math.sin(angle)
        });
      }

      // Remove all edges from the graph

      // Iterate through predicate columns
      for (let j = 2; j < header.length; j++) {
        const object = header[j];
        const relationship = row[j];

        // Check if relationship exists (value === 1)
        if (relationship && (relationship != 0)) {
          console.log('transformDataToGraph adding edge', subject, object)
          // Add edge between Subject and Object
          const edgeKey = `${subject}-${object}`;
          if (!this.graph.hasEdge(edgeKey)) {
            console.log('edge not exist adddge')
            this.graph.addEdge(subject, object, {
              relationship: 'related', // You can customize this as needed
              type: "line",
              label: relationship,
              size: 5
            });
          } else {
            console.log('edge exist adddge')
          }
        }
      }
    }
    /*this.graph.nodes().forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / this.graph.order;
      this.graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
      this.graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
    });*/
    if (!this.layout) {
      console.log('no layout showgraph()')
      this.showgraph();
    } else {
      console.log('layout detected, stop(), start()')

      this.startAnimate();//this.layout.start();
    }    
  }
  layoutOnOff() {
    this.animationstarted = ! this.animationstarted;    
    if (this.animationstarted) this.layout.start()
      else this.layout.stop()
  }

  stopAnimate() {    
    this.layout.stop()
  }
  startAnimate(){
    if (this.animationstarted) this.layout.start()
  }

/**
 * Custom hover renderer
 */
drawHover(context/*: CanvasRenderingContext2D*/, data/*: PlainObject*/, settings/*: PlainObject*/) {
  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;
  const subLabelSize = size - 2;

  const label = data.label;
  const subLabel = data.tag !== "unknown" ? data.tag : "";
  const clusterLabel = data.clusterLabel;

  // Then we draw the label background
  context.beginPath();
  context.fillStyle = "#fff";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = "#000";

  context.font = `${weight} ${size}px ${font}`;
  const labelWidth = context.measureText(label).width;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  const subLabelWidth = subLabel ? context.measureText(subLabel).width : 0;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  const clusterLabelWidth = clusterLabel ? context.measureText(clusterLabel).width : 0;

  const textWidth = Math.max(labelWidth, subLabelWidth, clusterLabelWidth);

  const x = Math.round(data.x);
  const y = Math.round(data.y);
  const w = Math.round(textWidth + size / 2 + data.size + 3);
  const hLabel = Math.round(size / 2 + 4);
  const hSubLabel = subLabel ? Math.round(subLabelSize / 2 + 9) : 0;
  const hClusterLabel = Math.round(subLabelSize / 2 + 9);

  drawRoundRect(context, x, y - hSubLabel - 12, w, hClusterLabel + hLabel + hSubLabel + 12, 5);
  context.closePath();
  context.fill();

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  // And finally we draw the labels
  context.fillStyle = TEXT_COLOR;
  context.font = `${weight} ${size}px ${font}`;
  context.fillText(label, data.x + data.size + 3, data.y + size / 3);

  if (subLabel) {
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(subLabel, data.x + data.size + 3, data.y - (2 * size) / 3 - 2);
  }

  context.fillStyle = data.color;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  context.fillText(clusterLabel, data.x + data.size + 3, data.y + size / 3 + 3 + subLabelSize);
}

}