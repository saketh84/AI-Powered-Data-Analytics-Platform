import pandas as pd
import numpy as np
import io
from pathlib import Path
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.seasonal import seasonal_decompose

def read_uploaded_file_to_df(file_contents: bytes, file_name: str) -> pd.DataFrame:
    """
    Reads a file's contents into a pandas DataFrame, automatically
    detecting the file type from its extension.
    """
    extension = Path(file_name).suffix.lower()
    
    try:
        if extension == '.csv':
            try:
                # Try standard utf-8
                df = pd.read_csv(io.StringIO(file_contents.decode('utf-8')))
            except UnicodeDecodeError:
                # Fallback to latin-1
                df = pd.read_csv(io.StringIO(file_contents.decode('latin-1')))
        
        elif extension in ['.xls', '.xlsx']:
            # Excel files must be read from bytes
            # Determine the engine to use
            if extension == '.xlsx':
                engine = 'openpyxl'
            else:
                # For .xls files, try to use xlrd, but fallback to openpyxl or None
                engine = None
                try:
                    import xlrd
                    engine = 'xlrd'
                except ImportError:
                    # xlrd not installed, try openpyxl or let pandas choose
                    engine = 'openpyxl'  # openpyxl can sometimes handle .xls
            
            # Try multiple approaches to read the Excel file
            df = None
            last_error = None
            
            # Approach 1: Try reading with header=0 (standard approach)
            try:
                buffer = io.BytesIO(file_contents)
                read_params = {
                    'io': buffer,
                    'sheet_name': 0,
                    'header': 0,
                }
                if engine:
                    read_params['engine'] = engine
                    
                df = pd.read_excel(**read_params)
            except Exception as e1:
                last_error = e1
                # Approach 2: Try reading without header, then detect it
                try:
                    buffer = io.BytesIO(file_contents)
                    read_params = {
                        'io': buffer,
                        'sheet_name': 0,
                        'header': None,  # No header
                    }
                    if engine:
                        read_params['engine'] = engine
                    else:
                        # Try without engine specification
                        pass
                    
                    df_temp = pd.read_excel(**read_params)
                    
                    # Find first row with substantial data (likely the header)
                    header_idx = 0
                    max_cols = len(df_temp.columns) if len(df_temp.columns) > 0 else 1
                    for idx in range(min(10, len(df_temp))):  # Check first 10 rows
                        row = df_temp.iloc[idx]
                        non_null = row.notna().sum()
                        if non_null >= max(2, max_cols * 0.3):  # At least 30% filled or 2 columns
                            header_idx = idx
                            break
                    
                    # Use the detected header row
                    if header_idx >= 0 and header_idx < len(df_temp):
                        # Set the header row - safely get column values
                        header_row = df_temp.iloc[header_idx]
                        new_columns = []
                        for i, val in enumerate(header_row):
                            if pd.notna(val) and str(val).strip():
                                new_columns.append(str(val).strip())
                            else:
                                new_columns.append(f'Unnamed_{i}')
                        df_temp.columns = new_columns[:len(df_temp.columns)]
                        # Skip the header row and any rows before it
                        if header_idx + 1 < len(df_temp):
                            df = df_temp.iloc[header_idx + 1:].copy().reset_index(drop=True)
                        else:
                            df = df_temp.iloc[header_idx:].copy().reset_index(drop=True)
                    else:
                        df = df_temp.copy()
                    last_error = None
                except Exception as e2:
                    last_error = e2
                    # Approach 3: Try with openpyxl engine regardless of extension
                    try:
                        buffer = io.BytesIO(file_contents)
                        df = pd.read_excel(
                            buffer,
                            sheet_name=0,
                            header=0,
                            engine='openpyxl'
                        )
                        last_error = None
                    except Exception as e3:
                        last_error = e3
                        # Approach 4: Try without specifying engine (let pandas decide)
                        try:
                            buffer = io.BytesIO(file_contents)
                            df = pd.read_excel(
                                buffer,
                                sheet_name=0,
                                header=0
                            )
                            last_error = None
                        except Exception as e4:
                            last_error = e4
            
            if df is None:
                error_msg = str(last_error) if last_error else "Unknown error"
                # Provide more helpful error message
                if 'tokenizing' in error_msg.lower():
                    raise ValueError(
                        f"Error reading Excel file '{file_name}'. The file may have formatting issues "
                        f"such as merged cells, inconsistent rows, or empty header rows. "
                        f"Please check the file structure. Original error: {error_msg}"
                    )
                else:
                    raise ValueError(
                        f"Error reading Excel file '{file_name}': {error_msg}. "
                        f"Please ensure the file is a valid Excel file (.xls or .xlsx) and not corrupted."
                    )
            
            # Clean up the dataframe: remove completely empty rows and columns
            df = df.dropna(how='all').dropna(axis=1, how='all')
            
            # If dataframe is empty after cleanup, the file might have issues
            if df.empty:
                raise ValueError("Excel file appears to be empty or contains no valid data rows.")
            
            # Reset index
            df = df.reset_index(drop=True)
            
            # Ensure column names are valid (no NaN column names, handle duplicates)
            new_columns = []
            seen = {}
            for i, col in enumerate(df.columns):
                col_str = str(col).strip() if pd.notna(col) else f'Unnamed_{i}'
                if col_str == '' or col_str == 'nan':
                    col_str = f'Unnamed_{i}'
                # Handle duplicate column names
                if col_str in seen:
                    count = seen[col_str]
                    seen[col_str] = count + 1
                    col_str = f'{col_str}_{count}'
                else:
                    seen[col_str] = 1
                new_columns.append(col_str)
            df.columns = new_columns
        
        elif extension == '.json':
            # JSON is text
            df = pd.read_json(io.StringIO(file_contents.decode('utf-8')))
        
        elif extension == '.parquet':
            # Parquet is binary
            df = pd.read_parquet(io.BytesIO(file_contents))
            
        elif extension == '.feather':
            # Feather is binary
            df = pd.read_feather(io.BytesIO(file_contents))
            
        elif extension == '.h5':
            # HDF5 is binary
            df = pd.read_hdf(io.BytesIO(file_contents))
            
        else:
            raise ValueError(f"Unsupported file type: {extension}")
        
        # Final validation: ensure we have a valid dataframe
        if df.empty:
            raise ValueError("The file appears to be empty or contains no valid data.")
        
        return df
        
    except ValueError:
        # Re-raise ValueError as-is (these are our custom errors)
        raise
    except Exception as e:
        print(f"Error reading {file_name}: {e}")
        import traceback
        traceback.print_exc()
        # Re-raise the error so the frontend can see it
        raise ValueError(f"Error analyzing file: {str(e)}")



# --- Helper function for finding anomalies ---
def get_anomalies(df, numeric_col):
    """Finds anomalies in a numeric column using the IQR method."""
    if df[numeric_col].dtype not in ['int64', 'float64']:
        return [] # Can't find anomalies in non-numeric data
        
    Q1 = df[numeric_col].quantile(0.25)
    Q3 = df[numeric_col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    anomalies = df[(df[numeric_col] < lower_bound) | (df[numeric_col] > upper_bound)]
    
    # Format for the insights panel
    return [
        f"Found {len(anomalies)} anomalies (outliers) in '{numeric_col}'."
    ]

# --- Helper function for finding correlations ---
def get_correlations(correlation_matrix):
    """Finds strong correlations from the matrix."""
    correlations = []
    for col in correlation_matrix:
        for idx in correlation_matrix.index:
            if col != idx and abs(correlation_matrix.loc[idx, col]) > 0.75:
                corr_value = correlation_matrix.loc[idx, col]
                corr_type = "positive" if corr_value > 0 else "negative"
                insight = f"Found a strong {corr_type} correlation ({corr_value:.2f}) between '{idx}' and '{col}'."
                # Add insight only once (avoid duplicates)
                if not any(f"between '{col}' and '{idx}'" in s for s in correlations):
                     correlations.append(insight)
    return correlations

# --- Original Function (Unchanged) ---
def get_kpis(df):
    """Calculates all the Key Performance Indicators."""
    total_records = len(df)
    
    total_cells = np.prod(df.shape)
    missing_values = df.isnull().sum().sum()
    valid_cells = total_cells - missing_values
    data_quality_score = (valid_cells / total_cells) * 100 if total_cells > 0 else 0
    
    total_columns = len(df.columns)
    numeric_cols = df.select_dtypes(include=np.number).columns
    categorical_cols = df.select_dtypes(include='object').columns
    
    anomalies = df.duplicated().sum()
    anomalies_percent = (anomalies / total_records) * 100 if total_records > 0 else 0

    return {
        "totalRecords": f"{total_records:,}",
        "totalRecordsDelta": "Uploaded file",
        "dataQuality": f"{data_quality_score:.1f}%",
        "dataQualityDelta": f"{missing_values:,} missing",
        "columns": f"{total_columns}",
        "columnsDelta": f"{len(categorical_cols)} Cat, {len(numeric_cols)} Num",
        "anomalies": f"{anomalies:,}",
        "anomaliesDelta": f"{anomalies_percent:.1f}% duplicate",
        "anomaliesDeltaType": "negative" if anomalies > 0 else "positive"
    }

# --- UPGRADED FUNCTION ---
def get_actionable_insights(df, kpis, correlation_matrix):
    """Generates simple text-based insights."""
    insights = [
        {"id": "i1", "insight": f"Analysis complete for {kpis['totalRecords']} records."},
        {"id": "i2", "insight": f"Data Quality Score is {kpis['dataQuality']}. Check 'Data Health' for details on missing values."},
    ]
    if int(kpis['anomalies'].replace(',', '')) > 0:
        insights.append({"id": "i3", "insight": f"Found {kpis['anomalies']} duplicate rows. Recommend running 'Deduplication' process."})
    
    # --- New AI Insights ---
    # 1. Add Correlation Insights
    corr_insights = get_correlations(correlation_matrix)
    for i, insight in enumerate(corr_insights, 1):
        insights.append({"id": f"c{i}", "insight": insight})

    # 2. Add Anomaly Insights (check first 2 numeric columns)
    numeric_cols = df.select_dtypes(include=np.number).columns
    for i, col in enumerate(numeric_cols[:2]):
        anomaly_insights = get_anomalies(df, col)
        for j, insight in enumerate(anomaly_insights, 1):
            insights.append({"id": f"a{i}{j}", "insight": insight})
            
    return insights

# --- Original Function (Unchanged) ---
def get_data_dictionary(df):
    """Generates a list of all columns, their types, and missing %."""
    dictionary = []
    total_records = len(df)
    for col in df.columns:
        col_type = str(df[col].dtype)
        missing_count = df[col].isnull().sum()
        missing_percent = (missing_count / total_records) * 100 if total_records > 0 else 0
        
        dictionary.append({
            "id": col,
            "columnName": col,
            "columnType": col_type,
            "metric": f"{missing_percent:.1f}% missing"
        })
    return dictionary

# --- Original Function (Unchanged) ---
def get_column_distribution(df, target_column=None):
    if df.empty or len(df.columns) == 0:
        return {"columnName": "N/A", "chartData": []}
    
    col_to_analyze = target_column
    
    if col_to_analyze is None:
        categorical_cols = df.select_dtypes(include='object').columns
        if len(categorical_cols) > 0:
            col_to_analyze = categorical_cols[0]
        else:
            col_to_analyze = df.columns[0]
    
    if col_to_analyze not in df.columns:
        raise ValueError(f"Column '{col_to_analyze}' not found in file.")

    counts = df[col_to_analyze].value_counts().nlargest(10).to_dict()
    chart_data = [{"name": str(key), "value": int(val)} for key, val in counts.items()]
    
    return {
        "columnName": col_to_analyze,
        "chartData": chart_data
    }

# --- NEW FORECASTING FUNCTION ---
def get_forecasting(monthly_data):
    """Generates a 12-month forecast based on monthly data."""
    if len(monthly_data) < 12: # Need at least 12 data points to forecast
        return []
        
    try:
        # We need to ensure the index has a frequency
        monthly_data.index.freq = 'ME'
        
        # Decompose to find seasonality (optional, but good)
        decompose_result = seasonal_decompose(monthly_data, model='additive')
        
        # Simple ARIMA model (p,d,q) - (1,1,1) is a common starting point
        # (P,D,Q,m) - (1,1,1,12) for seasonal component
        model = ARIMA(monthly_data, order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
        model_fit = model.fit()
        
        # Forecast 12 steps (months) ahead
        forecast = model_fit.forecast(steps=12)
        
        # Format for ECharts
        forecast_data = [{"name": date.strftime('%Y-%m-%d'), "value": f_val} for date, f_val in forecast.items()]
        return forecast_data
        
    except Exception as e:
        print(f"Error during forecasting: {e}")
        return [] # Return empty if forecasting fails

# --- UPGRADED FUNCTION ---
# ... (all your other functions like get_kpis, get_forecasting, etc. are fine) ...

# ... (keep all your other functions like get_kpis, get_anomalies, etc.) ...

# --- REPLACE THIS ENTIRE FUNCTION ---
def get_time_series_data(df, target_column=None):
    """
    Finds the first datetime column (or uses target_column) and aggregates by month.
    """
    if df.empty:
        return {"timeColumn": None, "seriesData": [], "xAxisData": []}
        
    date_col = target_column
    
    # --- NEW "AUTO-GUESS" LOGIC ---
    if date_col is None:
        # First, look for column names that contain "date" or "time"
        for col in df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    temp_col = pd.to_datetime(df[col], errors='coerce')
                    if not temp_col.isnull().all() and temp_col.nunique() > 1:
                        date_col = col # Found it!
                        df[date_col] = temp_col
                        break
                except Exception:
                    continue # Try next column
        
        # If still not found, try converting *all* object columns
        if date_col is None:
             for col in df.select_dtypes(include='object').columns:
                try:
                    temp_col = pd.to_datetime(df[col], errors='coerce')
                    if not temp_col.isnull().all() and temp_col.nunique() > 1:
                        date_col = col # Found it!
                        df[date_col] = temp_col
                        break
                except Exception:
                    continue
    # --- END OF NEW LOGIC ---
    else:
        # User provided a column, we MUST try to convert it
        if target_column not in df.columns:
            raise ValueError(f"Time column '{target_column}' not found in file.")
        try:
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            if df[date_col].isnull().all():
                date_col = None # Conversion failed for all rows
        except Exception:
            date_col = None # Conversion failed

    if date_col is None:
        # If still no date column, return empty
        return {"timeColumn": None, "seriesData": [], "xAxisData": []}

    # Aggregate by month-end frequency ('ME')
    monthly_counts = df.set_index(date_col).resample('ME').size()
    
    # --- Prepare data for ECharts ---
    actual_data_values = monthly_counts.tolist()
    actual_data_dates = [date.strftime('%Y-%m-%d') for date in monthly_counts.index]
    
    # --- Call the forecasting function ---
    forecast_results = get_forecasting(monthly_counts) # This returns a list of objects
    
    forecast_data_values = [item['value'] for item in forecast_results]
    forecast_data_dates = [item['name'] for item in forecast_results]

    # Combine all dates for the x-axis
    all_dates = actual_data_dates + forecast_data_dates
    
    # Create padded series data
    actual_series_padded = actual_data_values + ([None] * len(forecast_data_values))
    forecast_series_padded = ([None] * len(actual_data_values)) + forecast_data_values

    series_data = [
        {
            "name": "Record Count (Actual)",
            "type": "line",
            "smooth": True,
            "data": actual_series_padded
        }
    ]
    
    if forecast_data_values:
        series_data.append({
            "name": "Record Count (Forecast)",
            "type": "line",
            "smooth": True,
            "lineStyle": {"type": "dashed"},
            "data": forecast_series_padded
        })
    
    return {
        "timeColumn": date_col,
        "seriesData": series_data,
        "xAxisData": all_dates
    }

# --- NEW CORRELATION FUNCTION ---
def get_correlation_matrix(df):
    """Generates a correlation matrix for all numeric columns."""
    numeric_df = df.select_dtypes(include=np.number)
    if numeric_df.empty:
        return {"columns": [], "data": []}
        
    correlation_matrix = numeric_df.corr()
    
    # Format for ECharts Heatmap
    columns = correlation_matrix.columns.tolist()
    data = []
    for i in range(len(columns)):
        for j in range(len(columns)):
            data.append([i, j, round(correlation_matrix.iloc[i, j], 3)])
            
    return {"columns": columns, "data": data, "matrix": correlation_matrix}

# --- Original Function (Unchanged) ---
def get_table_data(df):
    column_defs = []
    for col in df.columns:
        column_defs.append({
            "headerName": col,
            "field": col,
            "sortable": True,
            "filter": True,
            "resizable": True,
        })
    
    df_head = df.head(100).replace({np.nan: None})
    row_data = df_head.to_dict(orient='records')
    
    return {"columnDefs": column_defs, "rowData": row_data}

# --- Original Function (Unchanged) ---
def get_data_health(df):
    if df.empty:
        return [
            {"metric": "Completeness", "value": "0%", "status": "negative"},
            {"metric": "Uniqueness", "value": "0%", "status": "negative"},
        ]
        
    total_records = len(df)
    missing_values = df.isnull().sum().sum()
    total_cells = np.prod(df.shape)
    completeness = (total_cells - missing_values) / total_cells * 100 if total_cells > 0 else 0
    
    duplicates = df.duplicated().sum()
    duplicate_percent = (duplicates / total_records) * 100 if total_records > 0 else 0

    return [
        {"metric": "Completeness", "value": f"{completeness:.1f}%", "status": "positive" if completeness > 95 else "neutral"},
        {"metric": "Uniqueness", "value": f"{(100 - duplicate_percent):.1f}%", "status": "positive" if duplicate_percent == 0 else "negative"},
        {"metric": "Total Duplicates", "value": f"{duplicates:,}", "status": "positive" if duplicates == 0 else "negative"},
        {"metric": "Missing Values", "value": f"{missing_values:,}", "status": "positive" if missing_values == 0 else "negative"},
    ]