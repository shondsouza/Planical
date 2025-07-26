import firebase_admin
from firebase_admin import credentials, firestore
import pyrebase
import os
import json

# Check if service account file exists
service_account_path = 'firebase-service-account.json'
if os.path.exists(service_account_path):
    try:
        with open(service_account_path, 'r') as f:
            service_account = json.load(f)
            project_id = service_account.get('project_id')
            print(f"Using service account for project: {project_id}")
    except Exception as e:
        print(f"Error reading service account file: {str(e)}")
        project_id = os.getenv('FIREBASE_PROJECT_ID', "planical1")  # Use env var with fallback
else:
    print(f"Service account file not found at {service_account_path}")
    project_id = os.getenv('FIREBASE_PROJECT_ID', "planical1")  # Use env var with fallback

# Firebase Web Config (for client-side) - Use environment variables
firebase_config = {
    "apiKey": os.getenv('FIREBASE_API_KEY', "AIzaSyAbJTW1tbUMxDBta49sBEbt0dptwviDuU4"),
    "authDomain": f"{project_id}.firebaseapp.com",
    "projectId": project_id,
    "storageBucket": f"{project_id}.appspot.com",
    "messagingSenderId": os.getenv('FIREBASE_MESSAGING_SENDER_ID', "233635331250"),
    "appId": os.getenv('FIREBASE_APP_ID', "1:233635331250:web:1b379c216a0204cbf9ddab"),
    "databaseURL": f"https://{project_id}-default-rtdb.firebaseio.com",
    "dynamicLinksDomain": f"{project_id}.page.link"
}

print(f"Initializing Firebase with project ID: {project_id}")

# Initialize Pyrebase
try:
    firebase = pyrebase.initialize_app(firebase_config)
    auth = firebase.auth()
    print("Firebase Authentication initialized successfully")
except Exception as e:
    print(f"Error initializing Firebase Authentication: {str(e)}")
    raise

# Initialize Firebase Admin SDK (for Firestore) - Optional for local development
db = None
try:
    # Check if the app has already been initialized
    try:
        app = firebase_admin.get_app()
        print("Using existing Firebase Admin app")
    except ValueError:
        # App not initialized, so initialize it
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_app = firebase_admin.initialize_app(cred)
            print(f"Firebase Admin initialized with service account for project: {project_id}")
        else:
            # For local development, skip Firestore if no service account
            print("No service account found - Firestore will be disabled for local development")
            print("To enable Firestore, add firebase-service-account.json file")
            db = None
            # Don't raise exception, just continue without Firestore
except Exception as e:
    print(f"Warning: Firebase Admin initialization failed: {str(e)}")
    print("Continuing without Firestore for local development")
    db = None

# Get Firestore client only if admin was initialized
if db is None:
    try:
        db = firestore.client()
        print("Firestore client initialized successfully")
    except Exception as e:
        print(f"Warning: Firestore client not available: {str(e)}")
        print("Some features may not work without Firestore")
        db = None 