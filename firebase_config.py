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
        project_id = "planical1"  # Fallback
else:
    print(f"Service account file not found at {service_account_path}")
    project_id = "planical1"  # Fallback

# Firebase Web Config (for client-side)
firebase_config = {
    "apiKey": "AIzaSyAbJTW1tbUMxDBta49sBEbt0dptwviDuU4",
    "authDomain": f"{project_id}.firebaseapp.com",
    "projectId": project_id,
    "storageBucket": f"{project_id}.appspot.com",
    "messagingSenderId": "233635331250",
    "appId": "1:233635331250:web:1b379c216a0204cbf9ddab",
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

# Initialize Firebase Admin SDK (for Firestore)
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
            # Initialize with application default credentials
            firebase_app = firebase_admin.initialize_app()
            print("Firebase Admin initialized with application default credentials")
except Exception as e:
    print(f"Error initializing Firebase Admin: {str(e)}")
    raise

# Get Firestore client
try:
    db = firestore.client()
    print("Firestore client initialized successfully")
except Exception as e:
    print(f"Error initializing Firestore client: {str(e)}")
    raise 