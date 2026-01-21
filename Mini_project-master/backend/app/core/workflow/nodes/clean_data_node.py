import pandas as pd
from ..node_base import NodeBase  # <-- THIS LINE IS FIXED (uses '..')

class CleanDataNode(NodeBase):
    def __init__(self, node_id: str, node_type: str):
        super().__init__(node_id, node_type)

    def execute(self, inputs: dict) -> pd.DataFrame:
        input_df = inputs.get('input_1')
        
        if input_df is None:
            raise ValueError(f"[{self.node_id}] No input DataFrame provided.")
        
        print(f"[{self.node_id}] Cleaning data. Shape before: {input_df.shape}")
        
        self.data = input_df.drop_duplicates()
        
        print(f"[{self.node_id}] Cleaning data. Shape after: {self.data.shape}")
        
        return self.data