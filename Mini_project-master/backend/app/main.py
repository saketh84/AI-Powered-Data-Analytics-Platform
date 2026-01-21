# backend/app/main.py
import os
import io
import json
import traceback
import logging

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn
import pandas as pd

# ----------------------------
# REMOVE THIS ENTIRE SECTION - NOT NEEDED ANYMORE
# ----------------------------
# try:
#     from langchain.agents import AgentType  # type: ignore
# except Exception:
#     class AgentType:
#         ZERO_SHOT_REACT_DESCRIPTION = "zero-shot-react-description"
#         REACT_DOCSTORE = "react-docstore"
#         # add additional constants your project expects here if needed
# 
#     logging.getLogger("uvicorn.error").warning(
#         "langchain.agents.AgentType not found — using a compatibility shim."
#     )

# ----------------------------
# Your existing imports (ensure these paths are correct in your project)
# ----------------------------
from app.analysis_utils import (
    read_uploaded_file_to_df,
    get_kpis,
    get_actionable_insights,
    get_data_dictionary,
    get_column_distribution,
    get_time_series_data,
    get_table_data,
    get_data_health,
    get_correlation_matrix
)

from app.core.workflow.workflow import WorkflowExecutor

# ai agent factory & query functions (your implementation)
from app.ai_agent import create_agent, query_agent

# ----------------------------
# Load environment
# ----------------------------
# Adjust dotenv_path if needed; this assumes a ../.env relative to backend/
load_dotenv(dotenv_path="../.env")

# ----------------------------
# App & CORS
# ----------------------------
app = FastAPI(
    title="Data Analytics Platform API",
    description="API for processing files and running analytics dashboards & pipelines.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# In-memory agent storage (keeps the last created agent)
# ----------------------------
agent_storage = {"agent": None}

# ----------------------------
# Pydantic model for agent query
# ----------------------------
class QueryRequest(BaseModel):
    question: str

# ----------------------------
# Endpoint 1: analyze file (unchanged logic, uses read_uploaded_file_to_df)
# ----------------------------
@app.post("/api/v1/analyze")
async def analyze_file(
    file: UploadFile = File(...),
    col_dist_target: str = Form(None),
    col_time_target: str = Form(None)
):
    try:
        contents = await file.read()
        # Use your robust reader (handles csv/xlsx etc.)
        df = read_uploaded_file_to_df(contents, file.filename)

        # Run analysis functions
        kpis = get_kpis(df)
        correlation_result = get_correlation_matrix(df)
        time_series_result = get_time_series_data(df, target_column=col_time_target)
        insights = get_actionable_insights(df, kpis, correlation_result['matrix'])

        response_data = {
            "kpiData": kpis,
            "insights": insights,
            "dictionary": get_data_dictionary(df),
            "columnDist": get_column_distribution(df, target_column=col_dist_target),
            "timeSeries": time_series_result,
            "tableData": get_table_data(df),
            "dataHealth": get_data_health(df),
            "correlationMatrix": {
                "columns": correlation_result['columns'],
                "data": correlation_result['data']
            }
        }

        return response_data

    except Exception as e:
        # Print full traceback to console for easier debugging in dev
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------------
# Endpoint 2: run workflow (pipeline builder)
# ----------------------------
@app.post("/workflow/run/")
async def run_workflow(
    file: UploadFile = File(...),
    pipeline_json: str = Form(...)
):
    try:
        file_contents = await file.read()
        pipeline_data = json.loads(pipeline_json)
        nodes_list = pipeline_data.get('nodes', [])
        edges_list = pipeline_data.get('edges', [])

        executor = WorkflowExecutor(
            nodes=nodes_list,
            edges=edges_list,
            file_contents=file_contents,
            file_name=file.filename
        )

        result = executor.run()

        return {"success": True, "result": result}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------------
# Endpoint 3: AI Chatbot (creates agent and queries it immediately)
# This endpoint will also store the created agent in memory for later calls to /query_agent
# ----------------------------
@app.post("/api/v1/chat")
async def chat_with_file(
    file: UploadFile = File(...),
    question: str = Form(...)
):
    try:
        contents = await file.read()

        # Create the agent using your ai_agent.create_agent implementation
        agent = create_agent(contents, file.filename)
        if agent is None:
            raise HTTPException(status_code=500, detail="Could not create AI agent.")

        # Store agent in memory for subsequent queries (query_agent endpoint)
        agent_storage["agent"] = agent

        # Query the agent immediately for the returned answer
        answer = query_agent(agent, question)
        return {"answer": answer}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error in chat: {e}")

# ----------------------------
# Endpoint 4: query existing agent (requires agent to be created first)
# ----------------------------
@app.post("/query_agent")
async def handle_agent_query(request: QueryRequest):
    user_question = request.question
    agent = agent_storage.get("agent")

    if agent is None:
        raise HTTPException(
            status_code=400,
            detail="Agent not initialized. Please upload a file first (use /api/v1/chat)."
        )

    try:
        answer = query_agent(agent, user_question)
        return {"answer": answer}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# ----------------------------
# Root health endpoint
# ----------------------------
@app.get("/")
def read_root():
    return {"status": "Backend server is running!"}

# ----------------------------
# Run
# ----------------------------
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)