import networkx as nx

def convert_graphml_to_gexf(graphml_file, gexf_file):
    # Read the GraphML file
    graph = nx.read_graphml(graphml_file)
    
    # Write to a GEXF file
    nx.write_gexf(graph, gexf_file)
    print(f"Converted {graphml_file} to {gexf_file}")

# Example usage
graphml_file = "crc.graphml"
gexf_file = "crc.gexf"

convert_graphml_to_gexf(graphml_file, gexf_file)
