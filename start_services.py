import subprocess
import os
import signal
import sys
import platform

def start_main_app():
    """Start the main Flask app"""
    print("Starting main Flask app...")
    
    # Start the Flask app
    try:
        python_exe = 'python' if platform.system() == 'Windows' else 'python3'
        flask_process = subprocess.Popen([python_exe, 'app.py'])
        print(f"Started Flask app with PID: {flask_process.pid}")
    except Exception as e:
        print(f"Error starting Flask app: {str(e)}")
        flask_process = None
    
    return flask_process

def main():
    # Start the main app
    flask_process = start_main_app()
    
    if flask_process:
        print("\n✅ Application is now running!")
        print("✅ Access the main app at: http://localhost:5000")
        print("✅ Access the chatbot at: http://localhost:5000/planical-ai")
        print("\n🛑 Use Ctrl+C to stop the application.")
    else:
        print("\n⚠️ Warning: The application failed to start properly.")
    
    # Set up signal handler for graceful shutdown
    def signal_handler(sig, frame):
        print("\nShutting down application...")
        if flask_process:
            flask_process.terminate()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Wait for process to complete
    try:
        if flask_process:
            flask_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down application...")
        if flask_process:
            flask_process.terminate()

if __name__ == "__main__":
    main() 