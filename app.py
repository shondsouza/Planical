from flask import Flask, json, redirect, render_template, flash, request, jsonify
from flask.globals import request, session
from flask.helpers import url_for
from functools import wraps
from firebase_config import db as firestore_db, firebase_config, auth
from firebase_admin import firestore
import json
import numpy as np
import pickle
import pandas as pd
import plotly
import plotly.express as px
import plotly.graph_objs as go
import os
from flask import send_from_directory
import requests
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.middleware.proxy_fix import ProxyFix
from flask import Response
from flask_cors import CORS
# from pypeerjs import PeerJSServer
from datetime import datetime
import time

# Load environment variables
load_dotenv()

# Get API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
DATA_PATH = os.getenv("DATA_PATH", "./data")

# Ensure directories exist
os.makedirs(CHROMA_DB_PATH, exist_ok=True)
os.makedirs(DATA_PATH, exist_ok=True)

model = pickle.load(open('stresslevel.pkl', 'rb'))

app = Flask(__name__,
            static_url_path='', 
            static_folder='static',
            template_folder='templates')

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

app.secret_key = "tandrima"

# Initialize Socket.IO with your Flask app
socketio = SocketIO(app, 
                    cors_allowed_origins="*", 
                    async_mode='threading',
                    ping_timeout=60,
                    ping_interval=25)

# Dictionary to track online doctors and their status
online_doctors = {}
# Dictionary to track active calls
active_calls = {}

# Custom login_required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            flash('Please log in to access this page', 'warning')
            return redirect(url_for('login', next=request.path))
        return f(*args, **kwargs)
    return decorated_function

# Role-based access control decorator
def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user' not in session:
                flash('Please log in to access this page', 'warning')
                return redirect(url_for('login', next=request.path))
            
            user_role = session.get('user', {}).get('role', 'patient')
            if user_role not in allowed_roles:
                flash(f'Access denied. {", ".join(allowed_roles)} privileges required.', 'danger')
                # Redirect to appropriate dashboard based on user role
                if user_role == 'doctor':
                    return redirect(url_for('doctor_dashboard'))
                elif user_role == 'admin':
                    return redirect(url_for('admin_dashboard'))
                else:
                    return redirect(url_for('home'))
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Helper function to get AI completion
def get_ai_response(message, use_openai=False):
    print(f"GROQ_API_KEY available: {bool(GROQ_API_KEY)}")
    
    if use_openai and OPENAI_API_KEY:
        # Use OpenAI API
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_API_KEY}"
            }
            
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a compassionate mental health assistant named Planical AI. Provide helpful, empathetic responses for mental health concerns. Keep responses concise and supportive."},
                    {"role": "user", "content": message}
                ],
                "max_tokens": 150
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                print(f"OpenAI API Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            return None
            
    elif GROQ_API_KEY:
        # Use Groq API
        try:
            print(f"Using Groq API with key: {GROQ_API_KEY[:5]}...")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}"
            }
            
            data = {
                "model": "llama3-8b-8192",
                "messages": [
                    {"role": "system", "content": "You are a compassionate mental health assistant named Planical AI. Provide helpful, empathetic responses for mental health concerns. Keep responses concise and supportive."},
                    {"role": "user", "content": message}
                ],
                "max_tokens": 150
            }
            
            print("Sending request to Groq API...")
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=data
            )
            
            print(f"Groq API Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()["choices"][0]["message"]["content"]
                print("Groq API response successful")
                return result
            else:
                print(f"Groq API Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error calling Groq API: {str(e)}")
            return None
    
    # Return None if no API keys are available
    print("No API keys available, returning None")
    return None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/signup', methods=['POST', 'GET'])
def signup():
    if request.method == "POST":
        name = request.form.get('name')
        age = request.form.get('age')
        email = request.form.get('email')
        password = request.form.get('password')
        role = 'patient'  # Always set role to patient
        
        try:
            # Create user in Firebase
            user = auth.create_user_with_email_and_password(email, password)
            
            # Send email verification with custom action URL
            action_url = request.url_root.rstrip('/') + url_for('verify_email')
            auth.send_email_verification(user['idToken'], action_url=action_url)
            
            # Store additional user data in Firestore
            firestore_db.collection('users').document(user['localId']).set({
                'name': name,
                'age': int(age),
                'email': email,
                'emailVerified': False,
                'role': role,
                'createdAt': None  # We'll update this client-side
            })
            
            flash("SignUp Success! Please verify your email.", "success")
            return redirect(url_for('verify_email'))
        except Exception as e:
            error_message = str(e)
            # Check for specific error types
            if "EMAIL_EXISTS" in error_message:
                flash("This email address is already registered. Please use a different email or try logging in.", "danger")
            else:
                flash(f"Error creating account: {error_message}", "danger")
            return render_template("usersignup.html")

    return render_template("usersignup.html")

@app.route('/verify-email')
def verify_email():
    mode = request.args.get('mode')
    oobCode = request.args.get('oobCode')
    
    # Check if this is a password reset request
    if mode == 'resetPassword':
        return redirect(url_for('reset_password', mode=mode, oobCode=oobCode))
    
    # Check if this is a direct verification from email link
    if mode == 'verifyEmail' and oobCode:
        return render_template('email_verified_success.html')
    
    # Otherwise show the regular verification page
    return render_template('verify_email.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        try:
            # Sign in with Firebase
            user = auth.sign_in_with_email_and_password(email, password)
            
            # Get account info
            user_info = auth.get_account_info(user['idToken'])
            user_id = user_info['users'][0]['localId']
            email_verified = user_info['users'][0]['emailVerified']
            
            if not email_verified:
                flash('Please verify your email before logging in.', 'warning')
                return redirect(url_for('verify_email'))
            
            # Get user data from Firestore
            user_data = {}
            try:
                user_doc = firestore_db.collection('users').document(user_id).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
            except Exception as e:
                print(f"Error fetching user data: {str(e)}")
            
            # Extract first name from full name
            full_name = user_data.get('name', '')
            first_name = full_name.split()[0] if full_name else ''
            
            # Get user role
            role = user_data.get('role', 'patient')
            
            # Check doctor approval status
            if role == 'doctor':
                approval_status = user_data.get('approval_status', 'pending')
                if approval_status == 'rejected':
                    rejection_reason = user_data.get('rejection_reason', 'No reason provided')
                    flash(f'Your doctor account has been rejected. Reason: {rejection_reason}', 'danger')
                    return render_template('userlogin.html')
                elif approval_status == 'pending':
                    flash('Your doctor account is pending approval by an administrator. You will be notified once approved.', 'warning')
                    return render_template('userlogin.html')
            
            # Create session
            session['user'] = {
                'uid': user_id,
                'email': email,
                'emailVerified': email_verified,
                'name': user_data.get('name', ''),
                'first_name': first_name,
                'age': user_data.get('age', ''),
                'role': role  # Add role to session
            }
            
            # Add approval status to session if doctor
            if role == 'doctor':
                session['user']['approval_status'] = user_data.get('approval_status', 'pending')
            
            # Redirect to the appropriate dashboard based on role
            if role == 'admin':
                return redirect(url_for('admin_dashboard'))
            elif role == 'doctor':
                return redirect(url_for('doctor_dashboard'))
            else:
            return redirect(url_for('home'))
            
        except Exception as e:
            print(f"Login error: {str(e)}")
            flash('Invalid email or password', 'danger')
            
    return render_template('userlogin.html')

@app.route('/doctor-login')
def doctor_login():
    return render_template('doctor/login.html')

@app.route('/doctor-signup', methods=['GET', 'POST'])
def doctor_signup():
    if request.method == "POST":
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        doctor_id = request.form.get('doctor_id')
        specialization = request.form.get('specialization')
        
        try:
            # Create user in Firebase
            user = auth.create_user_with_email_and_password(email, password)
            
            # Send email verification
            auth.send_email_verification(user['idToken'])
            
            # Store additional user data in Firestore
            firestore_db.collection('users').document(user['localId']).set({
                'name': name,
                'email': email,
                'emailVerified': False,
                'role': 'doctor',
                'doctor_id': doctor_id,
                'specialization': specialization,
                'approval_status': 'pending',
                'createdAt': firestore.SERVER_TIMESTAMP
            })
            
            flash("Registration successful! Please verify your email. Your account will be reviewed by an administrator.", "success")
            return redirect(url_for('verify_email'))
        except Exception as e:
            error_message = str(e)
            # Check for specific error types
            if "EMAIL_EXISTS" in error_message:
                flash("This email address is already registered. Please use a different email or try logging in.", "danger")
            else:
                flash(f"Error creating account: {error_message}", "danger")
            return render_template("doctor/signup.html")

    return render_template("doctor/signup.html")

@app.route('/admin-login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Check if it's the admin email
        if email and email.lower() == "shondsouza11@gmail.com":
            try:
                # Try to authenticate with Firebase
                user = auth.sign_in_with_email_and_password(email, password)
                
                # Get account info
                user_info = auth.get_account_info(user['idToken'])
                user_id = user_info['users'][0]['localId']
                
                # Admin accounts bypass email verification check
                # Create admin session immediately after authentication
                session['user'] = {
                    'uid': user_id,
                    'email': email,
                    'name': "Shon D'Souza",
                    'role': 'admin',
                    'emailVerified': True  # Force this to true for admin
                }
                
                flash('Admin login successful!', 'success')
                return redirect(url_for('admin_dashboard'))
                
            except Exception as auth_error:
                # Authentication error
                error_message = str(auth_error)
                print(f"Authentication error: {error_message}")
                
                if "INVALID_PASSWORD" in error_message or "INVALID_LOGIN_CREDENTIALS" in error_message:
                    flash('Invalid password. Please try again.', 'danger')
                elif "EMAIL_NOT_FOUND" in error_message:
                    flash('Admin account not found. Please contact the system administrator.', 'danger')
                else:
                    flash('Authentication error. Please try again later.', 'danger')
        else:
            # Not the admin email
            flash('This login is only for administrators.', 'danger')
            
    return render_template('admin/login.html')

@app.route('/logout')
@login_required
def logout():
    session.pop('user', None)
    flash("Logout Successful", "warning")
    return redirect(url_for('login'))

@app.route('/music')
@login_required
def music():
    return render_template('music.html')

@app.route('/quizandgame')
@login_required
def quizandgame():
    return render_template('quizandgame.html')

@app.route('/exercises')
@login_required
def exercises():
    return render_template('exercises.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/analysis', methods=['GET'])
def analysis():
    #reading the dataset
    train_df = pd.read_csv('dreaddit-train.csv', encoding='ISO-8859-1')
    train_df.drop(['text', 'post_id', 'sentence_range', 'id', 'social_timestamp'], axis=1, inplace=True)
    values = train_df['subreddit'].value_counts()
    labels = train_df['subreddit'].value_counts().index

    fig = px.pie(train_df, names=labels, values=values)
    fig.update_layout(title='Distribution of Subreddits')
    fig.update_traces(hovertemplate='%{label}: %{value}')
    #convert the plot to JSON using json.dumps() and the JSON encoder that comes with Plotly
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    
    train_df['label'].replace([0,1], ['Not in Stress', 'In Stress'], inplace=True)
    fig2 = px.histogram(train_df,
                 x="label",
                 title='Distribution of Stress Type',
                 color="label"
    )
    fig2.update_layout(bargap=0.1)
    #convert the plot to JSON using json.dumps() and the JSON encoder that comes with Plotly
    graphJSON2 = json.dumps(fig2, cls=plotly.utils.PlotlyJSONEncoder)
    
    fig3 = px.bar(train_df,
                 x='subreddit',
                 y='sentiment',
                 title='Car brand year resale ratio',
                 color='subreddit')
    fig3.update_traces()
    graphJSON3 = json.dumps(fig3, cls=plotly.utils.PlotlyJSONEncoder)
    fig4 = px.scatter(train_df,
                 x='subreddit',
                 y='social_karma',
                 title='Car brand price thousand ratio',
                 color="subreddit")
    fig4.update_traces()
    graphJSON4 = json.dumps(fig4, cls=plotly.utils.PlotlyJSONEncoder)
    
    fig5 = px.histogram(train_df,
                   x='confidence',
                   marginal='box',
                   title='Distribution of count reason of Mental Health issue',)
    fig5.update_layout(bargap=0.1)
    graphJSON5 = json.dumps(fig5, cls=plotly.utils.PlotlyJSONEncoder)
    
    fig6 = px.histogram(train_df,
                 x="subreddit",
                 title='Distribution of Vehicle Type', color='subreddit')
    fig6.update_layout(bargap=0.1)
    graphJSON6 = json.dumps(fig6, cls=plotly.utils.PlotlyJSONEncoder)
    
    return render_template('analysis.html', graphJSON=graphJSON, graphJSON2=graphJSON2, graphJSON3=graphJSON3, graphJSON4=graphJSON4,
                           graphJSON5=graphJSON5, graphJSON6=graphJSON6)

@app.route('/i')
def i():
    return render_template('stress.html')

@app.route('/stressdetect', methods=['POST'])
def stressdetect():
    int_features = [int(x) for x in request.form.values()]
    final_features = [np.array(int_features)]
    prediction = model.predict(final_features)
    #on basis of prediction displaying the desired output
    if prediction == "Absence":
        data = "You are having Normal Stress!! Take Care of yourself"
    elif prediction == "Presence":
        data = "You are having High Stress!! Consult a doctor and get the helpline number from our chatbot"
    return render_template('stress.html', prediction_text3='Stress Level is: {}'.format(data))

@app.route('/profile')
@login_required
def profile():
    # Get user data from Firestore
    user_id = session.get('user', {}).get('uid')
    if user_id:
        try:
            user_doc = firestore_db.collection('users').document(user_id).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                # Extract first name
                full_name = user_data.get('name', '')
                first_name = full_name.split()[0] if full_name else ''
                
                # Add the user data to the session
                session['user'].update({
                    'name': user_data.get('name', ''),
                    'first_name': first_name,
                    'email': user_data.get('email', ''),
                    'age': user_data.get('age', '')
                })
        except Exception as e:
            flash(f"Error fetching profile: {str(e)}", "danger")
    
    return render_template('profile.html')

@app.route('/planical-ai')
@login_required
def planical_ai():
    # Serve the direct chat interface instead
    return send_from_directory('Chatbot/chatbot', 'direct-chat.html')

@app.route('/direct-chat')
def direct_chat():
    # Serve the direct chat page without login requirement (for testing)
    return send_from_directory('Chatbot/chatbot', 'direct-chat.html')

@app.route('/chatbot-test')
def chatbot_test():
    # Serve the test page without login requirement
    return send_from_directory('Chatbot/chatbot', 'test.html')

@app.route('/Chatbot/chatbot/<path:path>')
def serve_chatbot_files(path):
    return send_from_directory('Chatbot/chatbot', path)

# Add routes for chatbot's static assets with more direct paths
@app.route('/styles.css')
def chatbot_styles():
    return send_from_directory('Chatbot/chatbot', 'styles.css')

@app.route('/script.js')
def chatbot_script():
    return send_from_directory('Chatbot/chatbot', 'script.js')

@app.route('/script.v2.js')
def chatbot_script_v2():
    return send_from_directory('Chatbot/chatbot', 'script.v2.js')

@app.route('/debug.js')
def chatbot_debug_script():
    return send_from_directory('Chatbot/chatbot', 'debug.js')

@app.route('/images/<path:filename>')
def chatbot_images(filename):
    return send_from_directory('Chatbot/chatbot/images', filename)

@app.route('/favicon.ico')
def favicon():
    # Try serving from static directory first
    try:
        return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')
    except:
        # If not found, try from Chatbot/chatbot/images with logo.png
        try:
            return send_from_directory('Chatbot/chatbot/images', 'logo.png', mimetype='image/png')
        except:
            # Return an empty response if both fail
            return '', 204

@app.route('/settings')
@login_required
def settings():
    return redirect(url_for('profile') + '#settings')

@app.route('/activity')
@login_required
def activity():
    return redirect(url_for('profile') + '#activity')

@app.route('/reset-password')
def reset_password():
    mode = request.args.get('mode')
    oobCode = request.args.get('oobCode')
    
    if mode == 'resetPassword' and oobCode:
        return render_template('reset_password.html', firebase_config=firebase_config)
    
    flash('Invalid password reset link. Please request a new one.', 'danger')
    return redirect(url_for('login'))

@app.route('/chat', methods=['POST'])
def chat_proxy():
    try:
        # Get the message from the request
        data = request.get_json()
        if not data:
            return {"response": "Error: No data received"}, 400
            
        message = data.get('message', '')
        
        # Print debug info
        print(f"Received chat message: '{message}'")
        print(f"GROQ_API_KEY exists: {bool(GROQ_API_KEY)}")
        print(f"GROQ_API_KEY (first 5 chars): {GROQ_API_KEY[:5] if GROQ_API_KEY else 'None'}")
        
        # Try to get a response from the AI
        ai_response = get_ai_response(message)
        
        # If AI response failed, use mock responses
        if not ai_response:
            print("AI response failed, using mock responses")
            # Simple mock response
            mock_responses = {
                "hello": "Hello! How can I help you today?",
                "how are you": "I'm just a digital assistant, but thanks for asking! How are you feeling today?",
                "stress": "Stress is a common response to challenging situations. Would you like to try some relaxation techniques?",
                "anxiety": "Anxiety can be difficult. Deep breathing exercises and mindfulness might help. Would you like to know more?",
                "depression": "I'm sorry to hear you're feeling down. It's important to talk to someone you trust about these feelings. Would you like me to suggest some resources?",
                "help": "I'm here to help with mental health questions. You can ask about stress, anxiety, depression, or relaxation techniques.",
            }
            
            # Look for keywords in the message to provide relevant responses
            response = "Thank you for your message. As this is a demo version, I can provide limited responses. In the full version, I would connect to an AI service to give you helpful information and support for your mental health questions."
            
            for keyword, resp in mock_responses.items():
                if keyword.lower() in message.lower():
                    response = resp
                    break
                    
            return {"response": response, "using_ai": False}
        
        # Return the AI response
        print(f"Returning AI response: '{ai_response[:50]}...'")
        return {"response": ai_response, "using_ai": True}
    except Exception as e:
        print(f"Error in chat_proxy: {str(e)}")
        return {"response": f"Error processing request: {str(e)}", "using_ai": False}, 500

# Add Firebase config to templates
@app.context_processor
def inject_firebase_config():
    return dict(firebase_config=firebase_config)

@app.route('/memory-game')
@login_required
def memory_game():
    return render_template('games/memory/index.html')

@app.route('/number-puzzle')
@login_required
def number_puzzle():
    return render_template('games/number/number.html')

# Add these routes for the CSS and JS files
@app.route('/number.css')
def number_css():
    return send_from_directory('static/games/number', 'number.css')

@app.route('/number.js')
def number_js():
    return send_from_directory('static/games/number', 'number.js')

@app.route('/debug-session')
def debug_session():
    return {
        'session_user': session.get('user', {}),
        'has_user_object': 'user' in session,
        'user_name': session.get('user', {}).get('name', 'No name found')
    }

@app.route('/update-profile', methods=['POST'])
@login_required
def update_profile():
    user_id = session.get('user', {}).get('uid')
    if not user_id:
        flash('User not authenticated', 'danger')
        return redirect(url_for('login'))
    
    try:
        # Get form data
        name = request.form.get('name')
        age = request.form.get('age')
        
        # Update Firestore
        firestore_db.collection('users').document(user_id).update({
            'name': name,
            'age': int(age) if age else None
        })
        
        # Update session data
        first_name = name.split()[0] if name else ''
        session['user'].update({
            'name': name,
            'first_name': first_name,
            'age': age
        })
        
        # This is important - make sure Flask knows the session has changed
        session.modified = True
        
        flash('Profile updated successfully', 'success')
    except Exception as e:
        flash(f'Error updating profile: {str(e)}', 'danger')
    
    return redirect(url_for('profile'))

@app.route('/help-support')
@login_required
def help_support():
    return render_template('help_support.html')

# Also add a route for the old /help URL that redirects to the new one
@app.route('/help')
@login_required
def help_redirect():
    return redirect(url_for('help_support'))

@app.route('/virtual-consultation')
@login_required
def virtual_consultation():
    """Handle video consultation between patients and doctors"""
    
    # Get current user data
    user_id = session.get('user', {}).get('uid')
    user_role = session.get('user', {}).get('role', 'patient')
    user_name = session.get('user', {}).get('name', 'User')
    
    if not user_id:
        flash('Please log in to access video consultation.', 'warning')
        return redirect(url_for('login'))
    
    # Redirect to the role-specific consultation view
    if user_role == 'doctor':
        return redirect(url_for('doctor_consultation'))
    else:
        return redirect(url_for('patient_consultation'))

@app.route('/doctor-consultation')
@role_required(['doctor'])
def doctor_consultation():
    """Doctor-specific virtual consultation view"""
    
    user_id = session.get('user', {}).get('uid')
    user_name = session.get('user', {}).get('name', 'User')
    user_role = 'doctor'
    
    # Check if doctor is approved
    approval_status = session.get('user', {}).get('approval_status', 'pending')
    if approval_status != 'approved':
        flash('Your doctor account must be approved by an administrator before you can access video consultations.', 'warning')
        return redirect(url_for('home'))
    
    # Pass Firebase configuration to template
    firebase_config = {
        'apiKey': app.config.get('FIREBASE_API_KEY', ''),
        'authDomain': app.config.get('FIREBASE_AUTH_DOMAIN', ''),
        'projectId': app.config.get('FIREBASE_PROJECT_ID', ''),
        'storageBucket': app.config.get('FIREBASE_STORAGE_BUCKET', ''),
        'messagingSenderId': app.config.get('FIREBASE_MESSAGING_SENDER_ID', ''),
        'appId': app.config.get('FIREBASE_APP_ID', '')
    }
    
    return render_template('virtual_consultation/doctor_view.html', 
                        user_id=user_id, 
                        user_role=user_role,
                        user_name=user_name,
                        firebase_config=firebase_config)

@app.route('/patient-consultation')
@role_required(['patient'])
def patient_consultation():
    """Patient-specific virtual consultation view"""
    
    user_id = session.get('user', {}).get('uid')
    user_name = session.get('user', {}).get('name', 'User')
    user_role = 'patient'
    
    # Get available doctors
    available_doctors = []
    try:
        # Query for approved doctors
        doctors_query = firestore_db.collection('users').where('role', '==', 'doctor').where('approval_status', '==', 'approved').stream()
        for doc in doctors_query:
            doctor_data = doc.to_dict()
            doctor_data['id'] = doc.id
            available_doctors.append(doctor_data)
    except Exception as e:
        print(f"Error fetching doctors: {str(e)}")
        flash('Error loading available doctors.', 'danger')
    
    return render_template('virtual_consultation/patient_view.html', 
                        doctors=available_doctors,
                        user_id=user_id,
                        user_role=user_role,
                        user_name=user_name)

@app.route('/video-call/<call_id>')
@login_required
def video_call(call_id):
    """Handle the video call between patient and doctor"""
    
    user_id = session.get('user', {}).get('uid')
    user_role = session.get('user', {}).get('role', 'patient')
    
    if not user_id:
        flash('Please log in to access video consultations.', 'warning')
        return redirect(url_for('login'))
    
    # Redirect to role-specific video call pages
    if user_role == 'doctor':
        return redirect(url_for('doctor_video_call', call_id=call_id))
    else:
        return redirect(url_for('patient_video_call', call_id=call_id))

@app.route('/doctor-video-call/<call_id>')
@role_required(['doctor'])
def doctor_video_call(call_id):
    """Doctor-specific video call view"""
    
    user_id = session.get('user', {}).get('uid')
    user_name = session.get('user', {}).get('name', 'User')
    user_role = 'doctor'
    
    # Check if doctor is approved
    approval_status = session.get('user', {}).get('approval_status', 'pending')
    if approval_status != 'approved':
        flash('Your doctor account must be approved by an administrator before you can access video calls.', 'warning')
        return redirect(url_for('doctor_dashboard'))
    
    return render_template(
        'virtual_consultation/video_call.html',
                          call_id=call_id,
                          user_id=user_id,
        user_role=user_role,
        user_name=user_name
    )

@app.route('/patient-video-call/<call_id>')
@role_required(['patient'])
def patient_video_call(call_id):
    """Patient-specific video call view"""
    
    user_id = session.get('user', {}).get('uid')
    user_name = session.get('user', {}).get('name', 'User')
    user_role = 'patient'
    
    # Fetch doctor info to display in the call
    doctor_info = None
    try:
        doctor_doc = firestore_db.collection('users').document(call_id).get()
        if doctor_doc.exists:
            doctor_info = doctor_doc.to_dict()
            doctor_info['id'] = doctor_doc.id
    except Exception as e:
        print(f"Error fetching doctor info: {str(e)}")
        
    return render_template(
        'virtual_consultation/video_call.html',
        call_id=call_id,
        user_id=user_id,
        user_role=user_role,
                          user_name=user_name,
        doctor_info=doctor_info
    )

# Setup PeerJS server
# @app.before_first_request
# def setup_peerjs_server():
#     # Create and start the PeerJS server on port 9000
#     peerjs_server = PeerJSServer(debug=True, port=9000)
#     peerjs_server.start()

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('join-doctor-room')
def handle_join_doctor_room(data):
    user_id = data.get('userId')
    user_name = data.get('userName')
    is_available = data.get('isAvailable', True)
    
    print(f"Doctor {user_name} ({user_id}) joined the doctor room")
    
    # Add to the general doctor room for discovery by patients
    if is_available:
        join_room('doctor-room')
        
        # Update online doctors dictionary
        online_doctors[user_id] = {
            'id': user_id,
            'name': user_name,
        'status': 'available',
        'socket_id': request.sid
    }
    
        # Broadcast updated doctor list to all patients
        emit('doctors-updated', list(online_doctors.values()), to='patient-room', broadcast=True)
    
    print(f"Online doctors: {len(online_doctors)}")

@socketio.on('leave-doctor-room')
def handle_leave_doctor_room(data):
    user_id = data.get('userId')
    user_name = data.get('userName')
    
    print(f"Doctor {user_name} ({user_id}) left the doctor room")
        
    # Remove from the general doctor room
        leave_room('doctor-room')
        
    # Remove from online doctors dictionary
    if user_id in online_doctors:
        del online_doctors[user_id]
        
    # Broadcast updated doctor list to all patients
    emit('doctors-updated', list(online_doctors.values()), to='patient-room', broadcast=True)
    
    print(f"Online doctors: {len(online_doctors)}")

@socketio.on('update-doctor-status')
def handle_update_doctor_status(data):
    user_id = data.get('userId')
    user_name = data.get('userName')
    is_available = data.get('isAvailable', True)
    
    if is_available:
        # Join the general doctor room and mark as available
        join_room('doctor-room')
        if user_id in online_doctors:
            online_doctors[user_id]['status'] = 'available'
        else:
            online_doctors[user_id] = {
                'id': user_id,
                'name': user_name,
                'status': 'available',
                'socket_id': request.sid
            }
    else:
        # Leave the general doctor room and mark as busy
        leave_room('doctor-room')
        if user_id in online_doctors:
            online_doctors[user_id]['status'] = 'busy'
    
    # Broadcast updated doctor list to all patients
    emit('doctors-updated', list(online_doctors.values()), to='patient-room', broadcast=True)

@socketio.on('join-call-room')
def handle_join_call_room(data):
    user_id = data.get('userId')
    user_name = data.get('userName')
    user_type = data.get('userType')
    call_id = data.get('callId')
    
    if not call_id:
        print("Error: No call_id provided")
        return
    
    # Join the specific call room
    join_room(call_id)
    
    # Track this call
    if call_id not in active_calls:
        active_calls[call_id] = {}
    
    active_calls[call_id][user_id] = {
        'id': user_id,
        'name': user_name,
        'type': user_type,
        'socket_id': request.sid
    }
    
    # Notify others in the call room that this user joined
    emit('user-joined-call', {
        'userId': user_id,
        'userName': user_name,
        'userType': user_type
    }, to=call_id, broadcast=True, include_self=False)
    
    print(f"{user_type.capitalize()} {user_name} joined call room {call_id}")

@socketio.on('leave-call-room')
def handle_leave_call_room(data):
    user_id = data.get('userId')
    user_name = data.get('userName')
    user_type = data.get('userType')
    call_id = data.get('callId')
    
    if not call_id:
        print("Error: No call_id provided")
        return
    
    # Leave the specific call room
    leave_room(call_id)
    
    # Remove from active calls
    if call_id in active_calls and user_id in active_calls[call_id]:
        del active_calls[call_id][user_id]
        
        # If call room is empty, remove it
        if not active_calls[call_id]:
            del active_calls[call_id]
    
    # Notify others in the call room that this user left
    emit('user-left-call', {
        'userId': user_id,
        'userName': user_name,
        'userType': user_type
    }, to=call_id, broadcast=True)
    
    print(f"{user_type.capitalize()} {user_name} left call room {call_id}")

@socketio.on('call-signal')
def handle_call_signal(data):
    call_id = data.get('callId')
    # Forward the WebRTC signaling data to others in the call room
    emit('call-signal', data, to=call_id, broadcast=True, include_self=False)

@socketio.on('request-consultation')
def handle_request_consultation(data):
    doctor_id = data.get('doctorId')
    patient_id = data.get('patientId')
    patient_name = data.get('patientName')
    call_id = data.get('callId')
    
    # If the doctor is online, send them the consultation request
    if doctor_id in online_doctors and online_doctors[doctor_id]['status'] == 'available':
        doctor_socket_id = online_doctors[doctor_id]['socket_id']
        
        emit('consultation-request', {
            'patientId': patient_id,
            'patientName': patient_name,
            'callId': call_id
        }, to=doctor_socket_id)
        
        print(f"Consultation request sent to doctor {doctor_id} from patient {patient_name}")
        return True
    else:
        print(f"Doctor {doctor_id} is not available")
        return False

@socketio.on('consultation-accepted')
def handle_consultation_accepted(data):
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    doctor_name = data.get('doctorName')
    call_id = data.get('callId')
    
    # Notify the patient that the consultation was accepted
    emit('consultation-accepted', {
        'doctorId': doctor_id,
        'doctorName': doctor_name,
        'callId': call_id
    }, to=request.sid)
    
    print(f"Consultation accepted by doctor {doctor_name} for patient {patient_id}")

@socketio.on('consultation-rejected')
def handle_consultation_rejected(data):
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    doctor_name = data.get('doctorName')
    reason = data.get('reason', 'No reason provided')
    call_id = data.get('callId')
    
    # Find the patient's socket ID
    for room in socketio.server.rooms(patient_id):
        if room != patient_id:  # Skip the default room
            # Notify the patient that the consultation was rejected
            emit('consultation-rejected', {
                'doctorId': doctor_id,
                'doctorName': doctor_name,
                'reason': reason,
                'callId': call_id
            }, to=room)
            break
    
    print(f"Consultation rejected by doctor {doctor_name} for patient {patient_id}: {reason}")

@socketio.on('consultation-accept-from-firestore')
def handle_consultation_accept_from_firestore(data):
    """Handle doctor accepting a consultation request from Firestore"""
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    doctor_name = data.get('doctorName')
    consultation_id = data.get('consultationId')
    scheduled_time = data.get('scheduledTime')
    
    # Find patient's socket ID if they're online
    for sid, user_data in online_doctors.items():
        if user_data.get('id') == patient_id:
            # Notify the patient that the consultation was accepted
            emit('consultation-accepted', {
                'doctorId': doctor_id,
                'doctorName': doctor_name,
                'consultationId': consultation_id,
                'scheduledTime': scheduled_time
            }, to=sid)
            
            print(f"Consultation {consultation_id} accepted notification sent to patient {patient_id}")
            break
    
    print(f"Consultation {consultation_id} accepted by doctor {doctor_name}" + 
        (f" and scheduled for {scheduled_time}" if scheduled_time else " for immediate consultation"))

@socketio.on('consultation-reject-from-firestore')
def handle_consultation_reject_from_firestore(data):
    """Handle doctor rejecting a consultation request from Firestore"""
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    doctor_name = data.get('doctorName')
    consultation_id = data.get('consultationId')
    reason = data.get('reason', 'Not specified')
    
    # Find patient's socket ID if they're online
    for sid, user_data in online_doctors.items():
        if user_data.get('id') == patient_id:
            # Notify the patient that the consultation was rejected
            emit('consultation-rejected', {
                'doctorId': doctor_id,
                'doctorName': doctor_name,
                'consultationId': consultation_id,
                'reason': reason
            }, to=sid)
            
            print(f"Consultation {consultation_id} rejected notification sent to patient {patient_id}")
            break
    
    print(f"Consultation {consultation_id} rejected by doctor {doctor_name}. Reason: {reason}")

# Modify the setup-admin route to be more secure
@app.route('/setup-admin/<setup_key>')
def setup_admin(setup_key):
    # Secure setup key to prevent unauthorized admin creation
    # In production, use a strong randomly generated key stored securely
    valid_setup_key = "ad3b17qs8d39xh94j2k3"
    
    if setup_key != valid_setup_key:
        return "Access Denied: Invalid setup key", 403
    
    try:
        # Create user in Firebase
        email = "shondsouza11@gmail.com"
        password = "Shon@Planical"
        
        # Check if user exists already
        try:
            user = auth.sign_in_with_email_and_password(email, password)
            user_id = auth.get_account_info(user['idToken'])['users'][0]['localId']
        except Exception as e:
            print(f"User not found, creating new admin: {str(e)}")
            # Create if doesn't exist
            user = auth.create_user_with_email_and_password(email, password)
            user_id = user['localId']
        
        # Store admin data in Firestore
        firestore_db.collection('users').document(user_id).set({
            'name': "Shon D'Souza",
            'email': email,
            'role': 'admin',
            'emailVerified': True,
            'createdAt': firestore.SERVER_TIMESTAMP
        })
        
        return f"Admin account created successfully for {email}. Please login through the admin login page."
    except Exception as e:
        return f"Error: {str(e)}"

# Modify the admin dashboard route to check for the specific admin
@app.route('/admin-dashboard')
@role_required(['admin'])
def admin_dashboard():
    # Get pending doctor applications
    pending_doctors = []
    doctors_approved = []
    doctors_rejected = []
    all_users = []
    recent_activities = []
    
    try:
        print("Fetching doctor data from Firestore...")
        
        # Get doctors with pending approval status
        print("Querying pending doctors...")
        doctors_pending_query = firestore_db.collection('users').where('role', '==', 'doctor').where('approval_status', '==', 'pending').stream()
        for doc in doctors_pending_query:
            doctor_data = doc.to_dict()
            doctor_data['id'] = doc.id
            doctor_data['created_date'] = doctor_data.get('createdAt', None)
            
            # Handle different timestamp scenarios
            if doctor_data['created_date'] is None:
                doctor_data['created_date'] = 'Unknown'
            elif hasattr(doctor_data['created_date'], 'timestamp'):
                # It's a Firestore timestamp object
                doctor_data['created_date'] = doctor_data['created_date'].strftime('%Y-%m-%d')
            else:
                # It's some other value, use current date
                doctor_data['created_date'] = datetime.now().strftime('%Y-%m-%d')
                
            print(f"Found pending doctor: {doctor_data.get('name')} ({doctor_data.get('email')})")
            pending_doctors.append(doctor_data)
        
        print(f"Total pending doctors found: {len(pending_doctors)}")
        
        # Get doctors with approved status
        doctors_approved_query = firestore_db.collection('users').where('role', '==', 'doctor').where('approval_status', '==', 'approved').stream()
        for doc in doctors_approved_query:
            doctor_data = doc.to_dict()
            doctor_data['id'] = doc.id
            doctors_approved.append(doctor_data)
            
        # Get doctors with rejected status
        doctors_rejected_query = firestore_db.collection('users').where('role', '==', 'doctor').where('approval_status', '==', 'rejected').stream()
        for doc in doctors_rejected_query:
            doctor_data = doc.to_dict()
            doctor_data['id'] = doc.id
            doctors_rejected.append(doctor_data)
            
        # Get all users (limited to most recent 50)
        users_query = firestore_db.collection('users').limit(50).stream()
        for doc in users_query:
            user_data = doc.to_dict()
            user_data['id'] = doc.id
            all_users.append(user_data)
            
        # Get recent activities (limited to most recent 10)
        # In a real app, you would have an activities collection
        # For now, we'll generate some sample activities based on the data we have
        
        # Add activities for recently approved doctors
        for doctor in doctors_approved[:3]:
            recent_activities.append({
                'type': 'Doctor Approval',
                'user': doctor.get('name', 'Unknown Doctor'),
                'date': doctor.get('created_date', datetime.now().strftime('%Y-%m-%d')),
                'status': 'approved'
            })
            
        # Add activities for recently rejected doctors
        for doctor in doctors_rejected[:2]:
            recent_activities.append({
                'type': 'Doctor Rejection',
                'user': doctor.get('name', 'Unknown Doctor'),
                'date': doctor.get('created_date', datetime.now().strftime('%Y-%m-%d')),
                'status': 'rejected'
            })
            
        # Add activities for recent user registrations
        for user in all_users[:3]:
            if user.get('role') != 'doctor':  # Avoid duplication with doctor activities
                recent_activities.append({
                    'type': 'New Registration',
                    'user': user.get('name', 'Unknown User'),
                    'date': user.get('createdAt', datetime.now().strftime('%Y-%m-%d')),
                    'status': 'completed'
                })
                
        # Sort activities by date (most recent first)
        recent_activities.sort(key=lambda x: x['date'], reverse=True)
        
    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        flash(f"Error fetching data: {str(e)}", "danger")
    
    # Get counts for statistics
    total_users = len(all_users)
    total_doctors = len(doctors_approved) + len(doctors_rejected) + len(pending_doctors)
    pending_count = len(pending_doctors)
    
    print(f"Dashboard stats: {total_users} users, {total_doctors} doctors, {pending_count} pending approvals")
    
    return render_template(
        'admin/dashboard.html', 
        pending_doctors=pending_doctors,
        doctors_approved=doctors_approved,
        doctors_rejected=doctors_rejected,
        all_users=all_users,
        recent_activities=recent_activities,
        stats={
            'total_users': total_users,
            'total_doctors': total_doctors,
            'pending_approvals': pending_count
        }
    )

# Add a route to approve doctor accounts
@app.route('/approve-doctor/<user_id>', methods=['POST'])
@role_required(['admin'])
def approve_doctor(user_id):
    try:
        # Update user role to approved doctor
        firestore_db.collection('users').document(user_id).update({
            'approval_status': 'approved'
        })
        
        return {'success': True, 'message': 'Doctor approved successfully'}, 200
    except Exception as e:
        return {'success': False, 'message': f'Error approving doctor: {str(e)}'}, 500

# Add a route to reject doctor accounts
@app.route('/reject-doctor/<user_id>', methods=['POST'])
@role_required(['admin'])
def reject_doctor(user_id):
    try:
        # Update user role to rejected doctor
        rejection_reason = request.json.get('reason', 'No reason provided')
        
        firestore_db.collection('users').document(user_id).update({
            'approval_status': 'rejected',
            'rejection_reason': rejection_reason
        })
        
        return {'success': True, 'message': 'Doctor rejected successfully'}, 200
    except Exception as e:
        return {'success': False, 'message': f'Error rejecting doctor: {str(e)}'}, 500

# Add a route to delete users
@app.route('/delete-user/<user_id>', methods=['POST'])
@role_required(['admin'])
def delete_user(user_id):
    try:
        # Check if the user is an admin to prevent deletion of admin accounts
        user_doc = firestore_db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            return {'success': False, 'message': 'User not found'}, 404
            
        user_data = user_doc.to_dict()
        
        if user_data.get('role') == 'admin':
            return {'success': False, 'message': 'Cannot delete admin accounts'}, 403
        
        # Delete the user document
        firestore_db.collection('users').document(user_id).delete()
        
        # Add to activities log (in a real app)
        # Here we would log this action for audit purposes
        
        return {'success': True, 'message': 'User deleted successfully'}, 200
    except Exception as e:
        return {'success': False, 'message': f'Error deleting user: {str(e)}'}, 500

# Add a route to revoke doctor approval
@app.route('/revoke-doctor/<user_id>', methods=['POST'])
@role_required(['admin'])
def revoke_doctor(user_id):
    try:
        # Update user approval status to pending
        firestore_db.collection('users').document(user_id).update({
            'approval_status': 'pending'
        })
        
        return {'success': True, 'message': 'Doctor approval revoked successfully'}, 200
    except Exception as e:
        return {'success': False, 'message': f'Error revoking doctor approval: {str(e)}'}, 500

@app.route('/doctor-dashboard')
@role_required(['doctor'])
def doctor_dashboard():
    # Check if doctor is approved
    approval_status = session.get('user', {}).get('approval_status', 'pending')
    if approval_status != 'approved':
        flash('Your doctor account must be approved by an administrator before you can access the dashboard.', 'warning')
        return redirect(url_for('home'))
    
    user_id = session['user']['uid']
    user_name = session['user']['name']
    
    return render_template('consultation/doctor_dashboard.html', 
                            user_id=user_id, 
                            user_name=user_name)

# Apply proxy fix
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

# Add PeerJS server routes
@app.route('/peerjs/peerjs', methods=['GET', 'POST', 'OPTIONS'])
def peerjs_endpoint():
    # Enable CORS for PeerJS
    if request.method == 'OPTIONS':
        response = Response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response
    
    # For GET and POST requests, pass through to Socket.IO
    # This is a simple pass-through implementation
    user_id = request.args.get('id', '')
    
    # Join a room named after the peer ID
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        target_id = data.get('dst')
        if target_id:
            socketio.emit('peerjs-message', data, room=target_id)
    
    # Enable CORS for the response
    response = Response(json.dumps({'status': 'success'}))
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Content-Type', 'application/json')
    return response

@socketio.on('peerjs-connect')
def handle_peerjs_connect(data):
    peer_id = data.get('id')
    if peer_id:
        join_room(peer_id)
        print(f"PeerJS: Client {peer_id} connected")

@app.route('/request-consultation/<doctor_id>')
@role_required(['patient'])
def request_consultation(doctor_id):
    """Handle consultation request form for patients"""
    
    user_id = session.get('user', {}).get('uid')
    user_name = session.get('user', {}).get('name', 'User')
    user_role = session.get('user', {}).get('role', 'patient')
    
    # Additional check to ensure only patients can access this route
    if user_role != 'patient':
        flash('Only patients can request consultations', 'warning')
        if user_role == 'doctor':
            return redirect(url_for('doctor_dashboard'))
        else:
            return redirect(url_for('home'))
    
    # Get doctor name from query parameter or fetch from database
    doctor_name = request.args.get('doctorName', None)
    doctor_specialization = None
    
    # If doctor name is not provided in query parameters, fetch from Firestore
    if not doctor_name:
        try:
            doctor_doc = firestore_db.collection('users').document(doctor_id).get()
            if doctor_doc.exists:
                doctor_data = doctor_doc.to_dict()
                doctor_name = doctor_data.get('name', 'Unknown Doctor')
                doctor_specialization = doctor_data.get('specialization', 'Mental Health Specialist')
        except Exception as e:
            print(f"Error fetching doctor info: {str(e)}")
            flash('Error loading doctor information.', 'danger')
            return redirect(url_for('patient_consultation'))
    
    # Pass Firebase configuration to template
    firebase_config = {
        'apiKey': app.config.get('FIREBASE_API_KEY', ''),
        'authDomain': app.config.get('FIREBASE_AUTH_DOMAIN', ''),
        'projectId': app.config.get('FIREBASE_PROJECT_ID', ''),
        'storageBucket': app.config.get('FIREBASE_STORAGE_BUCKET', ''),
        'messagingSenderId': app.config.get('FIREBASE_MESSAGING_SENDER_ID', ''),
        'appId': app.config.get('FIREBASE_APP_ID', '')
    }
    
    return render_template(
        'virtual_consultation/request_consultation.html',
        user_id=user_id,
        user_name=user_name,
        user_role=user_role,
        doctor_id=doctor_id,
        doctor_name=doctor_name,
        doctor_specialization=doctor_specialization,
        firebase_config=firebase_config
    )

@socketio.on('new-consultation-request')
def handle_new_consultation_request(data):
    """Handle new consultation request submitted via the form"""
    doctor_id = data.get('doctorId')
    patient_id = data.get('patientId')
    patient_name = data.get('patientName')
    consultation_id = data.get('consultationId')
    symptoms = data.get('symptoms', '')
    
    print(f"New consultation request from {patient_name} to doctor {doctor_id}")
    
    # Check if the doctor is online and available
    is_doctor_available = doctor_id in online_doctors and online_doctors[doctor_id]['status'] == 'available'
    print(f"Doctor {doctor_id} available status: {is_doctor_available}")
    
    if doctor_id in online_doctors:
        doctor_socket_id = online_doctors[doctor_id]['socket_id']
        
        # Prepare complete consultation data to send to doctor
        consultation_data = {
            'consultationId': consultation_id,
            'patientId': patient_id,
            'patientName': patient_name,
            'doctorId': doctor_id,
            'symptoms': symptoms
        }
        
        # Send using both event names to ensure compatibility
        emit('new-consultation-request', consultation_data, to=doctor_socket_id)
        emit('new-consultation-notification', consultation_data, to=doctor_socket_id)
        
        print(f"Notification sent to doctor {doctor_id} about consultation request {consultation_id}")
        return True
    else:
        print(f"Doctor {doctor_id} is not available or not online")
        return False

@app.route('/submit-consultation-request', methods=['POST'])
@login_required
def submit_consultation_request():
    """Handle direct server-side consultation request submission"""
    if request.method != 'POST':
        flash('Invalid request method', 'error')
        return redirect(url_for('virtual_consultation'))
    
    # Get user data
    user_id = session.get('user', {}).get('uid')
    user_name = session.get('user', {}).get('name', 'User')
    user_role = session.get('user', {}).get('role', 'patient')
    
    # Check if user is a patient
    if user_role != 'patient':
        flash('Only patients can request consultations', 'warning')
        return redirect(url_for('virtual_consultation'))
    
    # Determine if this is an AJAX request - check both headers
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.headers.get('Accept') == 'application/json' or request.form.get('X-Requested-With') == 'XMLHttpRequest'
    
    print(f"Processing consultation request - AJAX: {is_ajax}")
    
    try:
        # Get form data
        doctor_id = request.form.get('doctor_id')
        symptoms = request.form.get('symptoms')
        urgency = request.form.get('urgency')
        is_available = bool(request.form.get('availability'))
        time_slots = request.form.getlist('time_slots')
        consultation_type = request.form.get('consultation_type', 'video')
        
        # Debug form data
        print(f"Form data: doctor_id={doctor_id}, urgency={urgency}, slots={time_slots}")
        
        # Validate form data
        if not doctor_id:
            if is_ajax:
                return jsonify({'success': False, 'message': 'Doctor ID is required'}), 400, {'Content-Type': 'application/json'}
            flash('Doctor ID is required', 'error')
            return redirect(url_for('virtual_consultation'))
        
        if not symptoms:
            if is_ajax:
                return jsonify({'success': False, 'message': 'Please describe your symptoms'}), 400, {'Content-Type': 'application/json'}
            flash('Please describe your symptoms', 'error')
            return redirect(url_for('request_consultation', doctor_id=doctor_id))
        
        if not urgency:
            if is_ajax:
                return jsonify({'success': False, 'message': 'Please select urgency level'}), 400, {'Content-Type': 'application/json'}
            flash('Please select urgency level', 'error')
            return redirect(url_for('request_consultation', doctor_id=doctor_id))
        
        if not time_slots:
            if is_ajax:
                return jsonify({'success': False, 'message': 'Please select at least one time slot'}), 400, {'Content-Type': 'application/json'}
            flash('Please select at least one time slot', 'error')
            return redirect(url_for('request_consultation', doctor_id=doctor_id))
        
        # Get doctor info
        doctor_doc = firestore_db.collection('users').document(doctor_id).get()
        doctor_data = doctor_doc.to_dict() if doctor_doc.exists else {}
        doctor_name = doctor_data.get('name', 'Unknown Doctor')
        
        # Generate consultation ID
        consultation_id = f"consult-{int(time.time())}-{user_id[:6]}"
        
        # Create consultation document in Firestore
        consultation_data = {
            'patientId': user_id,
            'patientName': user_name,
            'doctorId': doctor_id,
            'doctorName': doctor_name,
            'symptoms': symptoms,
            'timeSlots': time_slots,
            'urgency': urgency,
            'consultationType': consultation_type,
            'patientAvailable': is_available,
            'status': 'pending',
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        firestore_db.collection('consultations').document(consultation_id).set(consultation_data)
        
        # Emit Socket.IO event to notify doctor
        socketio.emit('new-consultation-request', {
            'consultationId': consultation_id,
            'doctorId': doctor_id,
            'patientId': user_id,
            'patientName': user_name,
            'symptoms': symptoms
        })
        
        # Return appropriate response based on request type
        if is_ajax:
            return jsonify({
                'success': True, 
                'message': 'Consultation request submitted successfully',
                'consultation_id': consultation_id,
                'doctor_name': doctor_name
            }), 200, {'Content-Type': 'application/json'}
        
        flash('Consultation request submitted successfully', 'success')
        
        # Redirect to the waiting page for regular form submissions
        return redirect(url_for('consultation_waiting', consultation_id=consultation_id, doctor_name=doctor_name))
    
    except Exception as e:
        print(f"Error submitting consultation request: {str(e)}")
        if is_ajax:
            return jsonify({'success': False, 'message': str(e)}), 500, {'Content-Type': 'application/json'}
        flash(f'Error submitting consultation request: {str(e)}', 'error')
        return redirect(url_for('request_consultation', doctor_id=doctor_id))

@app.route('/virtual-consultation/waiting')
@login_required
def consultation_waiting():
    """Display waiting page while patient waits for doctor to respond to consultation request"""
    # Get query parameters
    consultation_id = request.args.get('consultation_id')
    doctor_name = request.args.get('doctor_name', 'the doctor')
    
    if not consultation_id:
        flash('Missing consultation ID', 'error')
        return redirect(url_for('virtual_consultation'))
    
    # Get user data
    user_id = session.get('user', {}).get('uid')
    user_name = session.get('user', {}).get('name', 'User')
    
    return render_template(
        'virtual_consultation/waiting.html',
        consultation_id=consultation_id,
        doctor_name=doctor_name,
        user_id=user_id,
        user_name=user_name
    )

@app.route('/cancel-consultation/<consultation_id>', methods=['POST'])
@login_required
def cancel_consultation(consultation_id):
    """Handle cancellation of a pending consultation request"""
    # Get user data
    user_id = session.get('user', {}).get('uid')
    user_name = session.get('user', {}).get('name', 'User')
    
    try:
        # Update the consultation status in Firestore
        consultation_ref = firestore_db.collection('consultations').document(consultation_id)
        consultation_doc = consultation_ref.get()
        
        if not consultation_doc.exists:
            flash('Consultation not found.', 'error')
            return redirect(url_for('virtual_consultation'))
        
        consultation_data = consultation_doc.to_dict()
        
        # Check if this consultation belongs to the current user
        if consultation_data.get('patientId') != user_id:
            flash('You are not authorized to cancel this consultation.', 'error')
            return redirect(url_for('virtual_consultation'))
        
        # Check if the consultation is still pending
        if consultation_data.get('status') != 'pending':
            flash('This consultation can no longer be cancelled as it has already been processed.', 'warning')
            return redirect(url_for('virtual_consultation'))
        
        # Update status to cancelled
        consultation_ref.update({
            'status': 'cancelled',
            'cancelledAt': firestore.SERVER_TIMESTAMP
        })
        
        # Notify the doctor via Socket.IO if they're online
        doctor_id = consultation_data.get('doctorId')
        if doctor_id in online_doctors:
            doctor_socket_id = online_doctors[doctor_id]['socket_id']
            socketio.emit('consultation-cancelled', {
                'consultationId': consultation_id,
                'patientId': user_id,
                'patientName': user_name
            }, to=doctor_socket_id)
        
        flash('Consultation request cancelled successfully.', 'success')
        return redirect(url_for('virtual_consultation'))
    except Exception as e:
        print(f"Error cancelling consultation: {str(e)}")
        flash(f'Error cancelling consultation: {str(e)}', 'error')
        return redirect(url_for('virtual_consultation'))

@socketio.on('cancel-consultation')
def handle_cancel_consultation(data):
    """Handle patient cancelling a consultation request via Socket.IO"""
    consultation_id = data.get('consultationId')
    user_id = data.get('userId')
    
    if not consultation_id:
        print("Error: No consultation_id provided")
        return
    
    try:
        # Update the consultation status in Firestore
        consultation_ref = firestore_db.collection('consultations').document(consultation_id)
        consultation_doc = consultation_ref.get()
        
        if not consultation_doc.exists:
            print(f"Consultation {consultation_id} not found")
            return
        
        consultation_data = consultation_doc.to_dict()
        
        # Check if this consultation belongs to the user
        if consultation_data.get('patientId') != user_id:
            print(f"User {user_id} not authorized to cancel consultation {consultation_id}")
            return
        
        # Check if the consultation is still pending
        if consultation_data.get('status') != 'pending':
            print(f"Consultation {consultation_id} cannot be cancelled as it is not pending")
            return
        
        # Update status to cancelled
        consultation_ref.update({
            'status': 'cancelled',
            'cancelledAt': firestore.SERVER_TIMESTAMP
        })
        
        # Notify the doctor if they're online
        doctor_id = consultation_data.get('doctorId')
        if doctor_id in online_doctors:
            doctor_socket_id = online_doctors[doctor_id]['socket_id']
            emit('consultation-cancelled', {
                'consultationId': consultation_id,
                'patientId': user_id,
                'patientName': consultation_data.get('patientName', 'A patient')
            }, to=doctor_socket_id)
        
        print(f"Consultation {consultation_id} cancelled by user {user_id}")
    except Exception as e:
        print(f"Error in handle_cancel_consultation: {str(e)}")

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)