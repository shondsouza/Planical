
> @socketio.on('join-doctor-room')
  def handle_join_doctor_room(data):
      user_id = data.get('userId')
      user_name = data.get('userName')
      is_available = data.get('isAvailable', True)
      
      if not user_id:
          app.logger.warning(f"User tried to join doctor room without user ID")
          return
      
      app.logger.info(f"Doctor {user_name} ({user_id}) joined the doctor room with socket ID 
{request.sid}")
      
      # Add doctor to online doctors list
      with online_doctors_lock:
          online_doctors[user_id] = {
              'id': user_id,
              'name': user_name,
              'status': 'available' if is_available else 'unavailable',
              'socket_id': request.sid
          }
          
          app.logger.info(f"Doctor available: {is_available}")
          app.logger.info(f"Online doctors: {len(online_doctors)}")
          app.logger.info(f"Online doctors list: {online_doctors}")
      
      # Add to doctor room if available
      if is_available:
          join_room('doctor-room')
          app.logger.info(f"Doctor {user_id} added to doctor-room")
      
      # Always join a personal room for direct targeting
      join_room(f'doctor-{user_id}')
      app.logger.info(f"Doctor {user_id} added to doctor-{user_id} room")
      
      # Add to all doctor events to receive admin broadcasts
      join_room('all-doctors')
      
      # Broadcast updated doctor list to all clients
      socketio.emit('doctors-updated', {
          'doctors': list(online_doctors.values())
      })
      
      # Check for pending consultations and notify doctor
      try:
          pending_consultations = firestore_db.collection('consultations').where(
              'doctor_id', '==', user_id).where('status', '==', 'pending').get()
          
          for doc in pending_consultations:
              consultation = doc.to_dict()
              app.logger.info(f"Found pending consultation {doc.id} for doctor {user_id}, 
sending notification")
              
              notification_data = {
                  'consultationId': doc.id,
                  'patientId': consultation.get('patient_id'),
                  'patientName': consultation.get('patient_name'),
                  'doctorId': user_id,
                  'symptoms': consultation.get('symptoms'),
                  'urgency': consultation.get('urgency'),
                  'timeSlots': consultation.get('time_slots', []),
                  'consultationType': consultation.get('consultation_type', 'chat')
              }
              
              socketio.emit('new-consultation-request', notification_data, to=request.sid)
              socketio.emit('new-consultation-notification', notification_data, to=request.sid)
              app.logger.info(f"Sent pending consultation notification to doctor {user_id}")
      except Exception as e:
          app.logger.error(f"Error fetching pending consultations for doctor {user_id}: 
{str(e)}")
  
  @socketio.on('leave-doctor-room')
  def handle_leave_doctor_room(data):
      user_id = data.get('userId')
      user_name = data.get('userName')
      
      if not user_id:
          app.logger.warning(f"User tried to leave doctor room without user ID")
          return
      
      app.logger.info(f"Doctor {user_name} ({user_id}) left the doctor room")
      
      # Remove from doctor-room
      leave_room('doctor-room')
          
      # Remove from personal room
      leave_room(f'doctor-{user_id}')
      
      # Remove from all-doctors room
      leave_room('all-doctors')
      
      # Update doctor status in online_doctors
      with online_doctors_lock:
          if user_id in online_doctors:
              online_doctors[user_id]['status'] = 'unavailable'
              app.logger.info(f"Doctor {user_id} marked as unavailable")
              
              # Broadcast updated doctor list to all clients
              socketio.emit('doctors-updated', {
                  'doctors': list(online_doctors.values())
              })
          else:
              app.logger.warning(f"Doctor {user_id} tried to leave but was not in online_doctors 
list")
  


