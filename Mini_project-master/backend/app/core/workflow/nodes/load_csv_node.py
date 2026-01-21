import pandas as pd
import io
from ..node_base import NodeBase
from app.analysis_utils import read_uploaded_file_to_df # <-- 1. IMPORT NEW HELPER

class LoadCSVNode(NodeBase):
    def __init__(self, node_id: str, node_type: str):
        super().__init__(node_id, node_type)

    def execute(self, inputs: dict) -> pd.DataFrame:
        """
        Reads the user's uploaded file contents into a pandas DataFrame.
        """
        file_contents = inputs.get('file_contents')
        file_name = inputs.get('file_name') # <-- 2. GET THE FILENAME
        
        if file_contents is None or file_name is None:
            raise ValueError(f"[{self.node_id}] No file contents or filename provided for Load node.")
        
        print(f"[{self.node_id}] Loading data from user-uploaded file: {file_name}...")
        
        # --- 3. THIS IS THE CHANGE ---
        self.data = read_uploaded_file_to_df(file_contents, file_name)
        # --- END OF CHANGE ---
            
        return self.data