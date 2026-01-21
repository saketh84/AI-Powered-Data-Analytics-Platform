# Data Analytics Platform

This project appears to be a backend-only application (or the frontend is missing) built with **FastAPI**.

## Prerequisites

- Python 3.9+
- pip (Python package manager)

## Project Structure

- `backend/`: Contains the FastAPI application and source code.
- `backend/requirements.txt`: Python dependencies.
- `.env`: Environment variables configuration.

## How to Run the Backend

1.  **Navigate to the project root**:
    ```bash
    cd /path/to/Mini_project-master
    ```

2.  **Create a Virtual Environment** (Recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Configure Environment Variables**:
    The backend requires a Groq API key (free).
    1.  Get a key at [https://console.groq.com](https://console.groq.com).
    2.  Open the `.env` file in the root directory.
    3.  Add your key: `GROQ_API_KEY=your_key_here`.

4.  **Install Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```
    *Note: You may need to upgrade pip first: `pip install --upgrade pip`*

4.  **Run the Server**:
    One way is to run the main script directly (which uses uvicorn):
    ```bash
    # Make sure you are in the root directory
    export PYTHONPATH=$PYTHONPATH:$(pwd)/backend
    python backend/app/main.py
    ```
    
    Alternatively, using uvicorn directly from the `backend` directory:
    ```bash
    cd backend
    uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    ```

5.  **Access the API**:
    Once running, open your browser to:
    - Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
    - Health Check: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## Notes

- The `frontend` directory is currently empty.
- The `docker-compose.yml` files is currently empty.
