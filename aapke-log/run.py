"""
AAPKE LOG - Application Launcher
Runs the FastAPI server with Uvicorn on http://127.0.0.1:8000
"""

import uvicorn
import os
import sys

# Ensure backend package is in pythonpath
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("============================================================")
    print(" AAPKE LOG - AAPKE LIYE, HAMESHA")
    print(" Civic-Tech Problem-Solving Platform for Mumbai / BMC")
    print("============================================================")
    print(" Server starting on: http://127.0.0.1:8000")
    print(" Press Ctrl+C to terminate.")
    print("============================================================")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
