from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import time

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'test-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store online users for testing
online_doctors = {}

@app.route('/')
def index():
    return "Socket.IO Test Server - Send /test to trigger a test notification"

@app.route('/test/<doctor_id>')
def test_notification(doctor_id):
    if doctor_id in online_doctors:
        doctor_socket_id = online_doctors[doctor_id]['socket_id']
        
        # Create a test consultation request
        test_data = {
            'consultationId': f'test-{int(time.time())}',
            'patientId': 'test-patient',
            'patientName': 'Test Patient',
            'doctorId': doctor_id,
            'symptoms': 'This is a test notification from the diagnostic script'
        }
        
        # Try both event names
        socketio.emit('new-consultation-request', test_data, to=doctor_socket_id)
        socketio.emit('new-consultation-notification', test_data, to=doctor_socket_id)
        
        return f"Test notification sent to doctor {doctor_id} on socket {doctor_socket_id}"
    else:
        return f"Doctor {doctor_id} is not online. Connected doctors: {list(online_doctors.keys())}"

@app.route('/doctors')
def list_doctors():
    return json.dumps(online_doctors)

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('join-doctor-room')
def handle_join_doctor_room(data):
    user_id = data.get('userId')
    user_name = data.get('userName')
    is_available = data.get('isAvailable', True)
    
    print(f"Doctor {user_name} ({user_id}) joined the doctor room")
    
    if is_available:
        join_room('doctor-room')
        
        # Update online doctors dictionary
        online_doctors[user_id] = {
            'id': user_id,
            'name': user_name,
            'status': 'available',
            'socket_id': request.sid
        }
    
        print(f"Doctor added to online_doctors: {user_id}")
        print(f"Online doctors: {online_doctors}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    
    # Find the doctor with this socket ID and remove them
    doctor_to_remove = None
    for doctor_id, data in online_doctors.items():
        if data.get('socket_id') == request.sid:
            doctor_to_remove = doctor_id
            break
    
    if doctor_to_remove:
        del online_doctors[doctor_to_remove]
        print(f"Doctor removed from online_doctors: {doctor_to_remove}")

# Main debug route to test all connections
@app.route('/debug/<doctor_id>')
def debug(doctor_id):
    # Check if doctor is in the dictionary
    if doctor_id in online_doctors:
        doctor_data = online_doctors[doctor_id]
        
        # Broadcast to doctor-room
        socketio.emit('debug-message', {
            'message': 'Broadcast test to doctor-room'
        }, to='doctor-room')
        
        # Send direct to doctor
        socketio.emit('debug-message', {
            'message': 'Direct test to doctor socket'
        }, to=doctor_data['socket_id'])
        
        return f"Debug messages sent to doctor {doctor_id}"
    else:
        return f"Doctor {doctor_id} not found. Current doctors: {list(online_doctors.keys())}"

if __name__ == '__main__':
    # Ensure Flask is accessible on the network
    socketio.run(app, host='0.0.0.0', port=5001, debug=True) 