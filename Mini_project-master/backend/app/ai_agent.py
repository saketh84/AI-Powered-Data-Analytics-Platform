import pandas as pd
import io
import os
import traceback
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from app.analysis_utils import read_uploaded_file_to_df

# Load environment variables
load_dotenv(dotenv_path="../.env")

# Check if API key is set
if not os.environ.get("GROQ_API_KEY"):
    raise EnvironmentError(
        "GROQ_API_KEY not set or empty. Get a free key at https://console.groq.com and add it to .env"
    )

def create_agent(file_contents: bytes, file_name: str):
    """
    Creates a Pandas DataFrame Agent using Groq (FREE & FAST).
    """
    try:
        print("=" * 50)
        print("Step 1: Reading file into DataFrame...")
        df = read_uploaded_file_to_df(file_contents, file_name)
        print(f"✓ DataFrame created successfully. Shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        print("Step 2: Creating LLM (Groq - Free & Super Fast)...")
        # Groq is MUCH faster than Ollama and great at quantitative analysis
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",  # Powerful model for analysis
            temperature=0,
            max_tokens=8000
        )
        print("✓ LLM created successfully")
        
        print("Step 3: Creating Pandas DataFrame Agent...")
        agent = create_pandas_dataframe_agent(
            llm,
            df,
            verbose=True,
            allow_dangerous_code=True,
            handle_parsing_errors=True,
            max_iterations=10,  # Allow multiple steps for complex analysis
            max_execution_time=60  # 60 seconds timeout
        )
        print("✓ Agent created successfully")
        print("=" * 50)
        return agent
        
    except Exception as e:
        print("=" * 50)
        print("ERROR CREATING AGENT:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()
        print("=" * 50)
        return None

def query_agent(agent, user_question: str) -> str:
    """
    Asks the agent a question and gets a precise quantitative answer.
    """
    if agent is None:
        return "Error: The AI agent could not be created."
        
    try:
        print(f"\n🤔 Question: {user_question}")
        
        # Enhanced prompt specifically for quantitative analysis
        prompt = f"""You are an expert quantitative data analyst. Analyze the DataFrame and answer this question with PRECISE calculations.

Question: {user_question}

Instructions:
- Use pandas operations to calculate exact numerical results
- Show actual numbers, not approximations
- For statistics, use appropriate pandas/numpy functions (.mean(), .median(), .std(), .corr(), etc.)
- Format numbers clearly with proper decimals
- If doing multiple calculations, show each step
- For aggregations, use .groupby(), .agg(), etc.
- Verify your calculations are correct

If asked to create charts or plots, respond: "I can only provide numerical analysis, not visualizations."

Provide the answer with the actual computed values."""
        
        print("🔄 Processing your question with Groq...")
        answer = agent.invoke(prompt)
        
        # Extract the answer
        if isinstance(answer, dict):
            result = answer.get('output', str(answer))
        else:
            result = str(answer)
        
        print(f"✅ Answer generated")
        return result
        
    except Exception as e:
        print(f"❌ Error querying agent: {e}")
        traceback.print_exc()
        return f"Sorry, I encountered an error: {e}"