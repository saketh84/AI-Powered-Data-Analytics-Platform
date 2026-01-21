import networkx as nx
import pandas as pd
from ..registry import get_node_class  # Import from parent 'core' directory (go up one level with ..)
from fastapi.encoders import jsonable_encoder
import json

class WorkflowExecutor:
    def __init__(self, nodes: list, edges: list, file_contents: bytes, file_name: str): # <-- 1. ADD file_name
        self.graph = self._build_graph(nodes, edges)
        self.node_instances = self._instantiate_nodes(nodes)
        self.file_contents = file_contents
        self.file_name = file_name # <-- 2. STORE file_name
        self.execution_results = {}

    # ... (Your _build_graph and _instantiate_nodes functions are unchanged) ...
    def _build_graph(self, nodes: list, edges: list) -> nx.DiGraph:
        graph = nx.DiGraph()
        for node in nodes:
            graph.add_node(node['id'], **node)
        
        for edge in edges:
            graph.add_edge(edge['source'], edge['target'], **edge)
        
        if not nx.is_directed_acyclic_graph(graph):
            raise ValueError("Workflow contains a cycle and cannot be run.")
        
        return graph

    def _instantiate_nodes(self, nodes: list) -> dict:
        instances = {}
        for node_data in nodes:
            node_id = node_data['id']
            node_type = node_data.get('data', {}).get('node_type')
            if not node_type:
                 raise ValueError(f"Node {node_id} is missing 'node_type' in 'data' field.")
            
            node_class = get_node_class(node_type)
            instances[node_id] = node_class(node_id=node_id, node_type=node_type)
        return instances


    def run(self) -> str:
        execution_order = list(nx.topological_sort(self.graph))
        
        print(f"Execution order: {execution_order}")

        for node_id in execution_order:
            node_instance = self.node_instances[node_id]
            inputs_for_this_node = {}

            if node_instance.node_type == 'load_csv':
                if self.file_contents is None:
                    raise ValueError("Workflow started but no file was provided.")
                inputs_for_this_node['file_contents'] = self.file_contents
                inputs_for_this_node['file_name'] = self.file_name # <-- 3. PASS file_name
            else:
                parent_node_ids = list(self.graph.predecessors(node_id))
                
                for parent_id in parent_node_ids:
                    edge_data = self.graph.get_edge_data(parent_id, node_id)
                    parent_result = self.execution_results.get(parent_id)
                    # Handle both 'input' and 'input_1' handle IDs for compatibility
                    target_handle = edge_data.get('targetHandle', 'input')
                    # Map 'input' to 'input_1' for backend compatibility
                    input_handle_id = 'input_1' if target_handle == 'input' else target_handle
                    inputs_for_this_node[input_handle_id] = parent_result

            print(f"--- Executing Node: {node_instance.node_type} ({node_id}) ---")
            result = node_instance.execute(inputs_for_this_node)
            
            self.execution_results[node_id] = result

        final_result = self.execution_results.get(execution_order[-1])
        
        if isinstance(final_result, dict):
            print("Final result is a dict, using jsonable_encoder...")
            encoded_result = jsonable_encoder(final_result)
            return json.dumps(encoded_result)

        if isinstance(final_result, pd.DataFrame):
            print("Final result is a DataFrame, using pandas .to_json()...")
            return final_result.to_json(orient='records')
        
        print(f"Final result is an unknown type: {type(final_result)}")
        return json.dumps(jsonable_encoder(final_result))