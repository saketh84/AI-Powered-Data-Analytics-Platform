# --- Import all the node classes using relative paths ---
from .workflow.nodes.load_csv_node import LoadCSVNode
from .workflow.nodes.clean_data_node import CleanDataNode
from .workflow.nodes.analyze_data_node import AnalyzeDataNode

# --- This is the "phonebook" mapping the string name to the Python class ---
NODE_REGISTRY = {
    "load_csv": LoadCSVNode,
    "clean_data": CleanDataNode,
    "analyze_data": AnalyzeDataNode,
}

def get_node_class(node_type: str):
    """
    Retrieves the actual Python class for a given node type string.
    """
    node_class = NODE_REGISTRY.get(node_type)
    if node_class is None:
        raise ValueError(f"Node type '{node_type}' not found in registry.")
    return node_class