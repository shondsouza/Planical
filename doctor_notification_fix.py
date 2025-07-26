import os
import time

def fix_app_py():
    print("Attempting to fix app.py")
    
    # Read the file
    with open('app.py', 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    fixed_lines = []
    for i, line in enumerate(lines):
        # Fix line 984 - join_room indentation
        if i+1 == 984 and "join_room('doctor-room')" in line:
            fixed_lines.append("        join_room('doctor-room')\n")
            continue
            
        # Fix line 1037 - leave_room indentation 
        if i+1 == 1037 and "leave_room('doctor-room')" in line:
            fixed_lines.append("    leave_room('doctor-room')\n")
            continue
            
        # Add the line as is
        fixed_lines.append(line)
    
    # Write the fixed content back
    with open('app.py', 'w', encoding='utf-8') as file:
        file.writelines(fixed_lines)
    
    print("Fixed indentation issues in app.py")

def check_doctor_event_handlers():
    # Read the doctor_view.html file to verify the event handlers
    try:
        with open('templates/virtual_consultation/doctor_view.html', 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Check if doctor view listens for plain 'new-consultation-request' events
        if "socket.on('new-consultation-request'" not in content:
            # Add a listener for the generic event if it doesn't exist
            with open('templates/virtual_consultation/doctor_view.html', 'a', encoding='utf-8') as file:
                file.write("\n<!-- Fix for consultation notifications -->\n")
                file.write("<script>\n")
                file.write("  // Add a generic listener for consultation requests\n")
                file.write("  document.addEventListener('DOMContentLoaded', function() {\n")
                file.write("    if (window.socket) {\n")
                file.write("      window.socket.on('new-consultation-request', function(data) {\n")
                file.write("        console.log('Generic consultation request received:', data);\n")
                file.write("        if (typeof safeAddConsultationRequest === 'function') {\n")
                file.write("          safeAddConsultationRequest(data);\n")
                file.write("        }\n")
                file.write("        if (typeof safeShowNotification === 'function') {\n")
                file.write("          safeShowNotification('New consultation request from ' + (data.patientName || 'a patient'), 'info');\n")
                file.write("        }\n")
                file.write("      });\n")
                file.write("      window.socket.on('new-consultation-notification', function(data) {\n")
                file.write("        console.log('Generic consultation notification received:', data);\n")
                file.write("        if (typeof safeAddConsultationRequest === 'function') {\n")
                file.write("          safeAddConsultationRequest(data);\n")
                file.write("        }\n")
                file.write("        if (typeof safeShowNotification === 'function') {\n")
                file.write("          safeShowNotification('New consultation request from ' + (data.patientName || 'a patient'), 'info');\n")
                file.write("        }\n")
                file.write("      });\n")
                file.write("    }\n")
                file.write("  });\n")
                file.write("</script>\n")
            
            print("Added generic consultation request event listeners to doctor_view.html")
        else:
            print("Generic event listeners already exist in doctor_view.html")
    
    except Exception as e:
        print(f"Error checking doctor event handlers: {e}")

def fix_doctor_id_in_requests():
    # Check if doctor ID is being properly set in doctor view
    try:
        with open('templates/virtual_consultation/doctor_view.html', 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if doctor ID is being set from the right session variable
        if "doctor_id" not in content.lower() or "uid" not in content.lower():
            print("Warning: Doctor ID might not be set correctly in doctor_view.html")
            print("The correct session variable should be used: session.get('user', {}).get('uid')")
    except Exception as e:
        print(f"Error checking doctor ID in templates: {e}")

def run_fixes():
    print("Starting fixes for patient-doctor consultation issues...")
    
    # Fix indentation issues in app.py
    fix_app_py()
    
    # Check and fix doctor event handlers
    check_doctor_event_handlers()
    
    # Fix doctor ID in requests
    fix_doctor_id_in_requests()
    
    print("Fixes completed. Please restart the Flask server.")

if __name__ == "__main__":
    run_fixes() 