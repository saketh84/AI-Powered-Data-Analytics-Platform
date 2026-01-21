import pandas as pd
from ..node_base import NodeBase  # <-- THIS LINE IS FIXED (uses '..')

# --- This import is tricky. 'app.analysis_utils' is correct ---
# We go up two levels ('..') from 'nodes' to 'core', then one more ('...') to 'app'
# But 'app' is our main package, so we import from the top-level 'app' module.
from app.analysis_utils import (  # <-- THIS LINE IS FIXED
    get_kpis,
    get_actionable_insights,
    get_data_dictionary,
    get_column_distribution,
    get_time_series_data,
    get_table_data,
    get_data_health,
    get_correlation_matrix
)

class AnalyzeDataNode(NodeBase):
    def __init__(self, node_id: str, node_type: str):
        super().__init__(node_id, node_type)

    def execute(self, inputs: dict) -> dict:
        input_df = inputs.get('input_1')
        
        if input_df is None:
            raise ValueError(f"[{self.node_id}] No input DataFrame provided.")
        
        print(f"[{self.node_id}] Running full analysis...")

        kpis = get_kpis(input_df)
        correlation_result = get_correlation_matrix(input_df)
        insights = get_actionable_insights(input_df, kpis, correlation_result['matrix'])
        time_series_result = get_time_series_data(input_df, target_column=None)
        column_dist_result = get_column_distribution(input_df, target_column=None)

        response_data = {
            "kpiData": kpis,
            "insights": insights,
            "dictionary": get_data_dictionary(input_df),
            "columnDist": column_dist_result,
            "timeSeries": time_series_result,
            "tableData": get_table_data(input_df),
            "dataHealth": get_data_health(input_df),
            "correlationMatrix": {
                "columns": correlation_result['columns'],
                "data": correlation_result['data']
            }
        }
        
        self.data = response_data
        return self.data