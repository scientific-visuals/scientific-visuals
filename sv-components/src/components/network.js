import { IEventAggregator, resolve, customElement, bindable } from 'aurelia';
import Graph from 'graphology';
import { Sigma } from 'sigma';
//import forceAtlas2 from 'graphology-layout-forceatlas2';
import ForceSupervisor from "graphology-layout-force/worker";
import { createNodeImageProgram } from "@sigma/node-image";
//import NodeGradientProgram from "./node-gradient";


@customElement('sv-network')
export class Network {
  ea /* IEventAggregator*/ = resolve(IEventAggregator);
  container;
  tabid;
  @bindable datachannel;
  attached() {
    this.ea.subscribe('showtab', (showtabid) => {
      if (this.tabid === this.showtabid) {
        if (this.layout) this.layout.start();
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
          this.layout.start();
        }
      }
    });
    if (this.datachannel) {
      this.ea.subscribe(this.datachannel, (mydata) => {
        console.log('newtork received data:', mydata);
        this.transformDataToGraph(mydata);

      })
    } else console.warn('datachannel empty')
    //this.showgraph();
    this.data = []; //TODO put data from other components
    this.transformDataToGraph(this.data);
  }

  creategraph() {
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

    // Create the spring layout and start it
    this.layout = new ForceSupervisor(this.graph);
    this.layout.start();
  }

  createGraphFromDatasheet(data) {
    // Initialize a new undirected graph (use 'directed' if your relationships are directional)
    if (this.graph) {
      this.graph.clear();
    } else {
      this.graph = new Graph({ type: 'undirected' });
    }

    // Your data array
    data = [
      ["Subject/Object/Predicate", "type", "CRC Risk", "CRC Neoplasia", "Physical Activity"],
      ["Trans-Chlordane", "environmental", 1, 1, 0],
      ["PCB194", "environmental", 1, 1],
      ["Sterilisation", "biometric", 1, 0],
      ["Tobacco Consumption", "lifestyle", 1, 1, 1],
      ["PAC-RSK", "Interaction Term", 1, 0, 1]
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
  }

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
      this.layout.stop();
    }
    // Your data array
    console.log('transformDataToGraph data.length', data.length)
    if (data.length == 0) {
      data = [
        ["Subject/Object/Predicate", "type", "CRC Risk", "CRC Neoplasia", "Physical Activity"],
        ["Trans-Chlordane", "environmental", 1, 1, 0],
        ["PCB194", "environmental", 1, 1],
        ["Sterilisation", "biometric", 1, 0],
        ["Tobacco Consumption", "lifestyle", 1, 1, 1],
        ["PAC-RSK", "Interaction Term", 1, 0, 1]
      ];
    }
    // Define type to color mapping
    const typeColorMap = {
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
      const color = typeColorMap[subjectType] || 'gray'; // Default to gray if type not mapped
      let angle = (i * 2 * Math.PI) / data.length;
      // Add Subject node
      if (!this.graph.hasNode(subject)) {
        this.graph.addNode(subject, {
          label: subject,
          size: 7,
          color: color,
          //type: subjectType
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

      this.layout.start();
    }
  }
}