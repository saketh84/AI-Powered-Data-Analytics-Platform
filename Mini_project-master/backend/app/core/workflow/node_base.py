from abc import ABC, abstractmethod
import pandas as pd

class NodeBase(ABC):
    """
    Abstract base class for all workflow nodes.
    
    This acts as a contract, ensuring that every node we create
    has the same foundational structure.
    """
    def __init__(self, node_id: str, node_type: str):
        self.node_id = node_id
        self.node_type = node_type
        self.data = None # To store the result after execution

    @abstractmethod
    def execute(self, inputs: dict) -> pd.DataFrame:
        """
        The main logic of the node goes here.
        
        'inputs' is a dictionary where keys are input handle IDs 
        (e.g., 'input_1') and values are the data (e.g., a DataFrame)
        from the parent node.
        
        It must return a pandas DataFrame.
        """
        pass
    