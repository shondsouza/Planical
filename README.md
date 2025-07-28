# Planical - Mental Healthcare Platform

<div align="center">
  <img src="https://github.com/user-attachments/assets/ef1fd885-53ec-4dba-bd76-2b882f32bbb4" alt="Planical Platform Preview" width="800"/>
</div>

<h1 align="center">
  🧠 Prioritize Your Mental Health
</h1>

<p align="center">
  <strong>A comprehensive web-based platform designed to provide mental health support through multiple channels including professional consultation, self-help resources, and AI-powered assistance.</strong>
</p>

<div align="center">

[![Python](https://img.shields.io/badge/Python-%233776ab.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://javascript.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com)
[![Firebase](https://img.shields.io/badge/Firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-%23333333.svg?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org)
[![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io)

</div>

## 🌟 Features

### 🩺 Professional Support
- **Video Consultations**: Secure real-time video sessions with licensed mental health professionals
- **Doctor Approval System**: Verified healthcare providers through admin-controlled approval process
- **Appointment Scheduling**: Easy-to-use booking system for patient-doctor consultations
- **Consultation Management**: Comprehensive tools for doctors to manage their practice

### 🔐 User Authentication & Security
- **Secure Login System**: Multi-role authentication for patients, doctors, and administrators
- **Firebase Authentication**: Industry-standard security protocols
- **User Profiles**: Customizable profiles for both patients and healthcare providers
- **Data Privacy**: HIPAA-compliant data handling and storage

### 🧠 Self-Help Resources
- **Stress Analysis Dashboard**: Interactive visualization of stress patterns using Plotly
- **ML-Powered Stress Detection**: K-Nearest Neighbour algorithm for personalized stress assessment
- **Music Therapy**: Guided meditation sessions with curated background music
- **Exercise Recommendations**: Personalized workout routines with step-by-step instructions
- **Mental Health Resources**: Comprehensive library of wellness tools and guides

### 🤖 AI-Powered Assistance
- **Planical AI Chatbot**: 24/7 intelligent support for general mental health questions
- **Real-time Notifications**: Socket.IO-based instant updates for appointments and consultations
- **Habit Tracking**: Monitor and record mental wellness activities and progress

### 📊 Analytics & Insights
- **Interactive Data Visualization**: Stress analysis through dynamic charts and graphs
- **Progress Tracking**: Monitor improvement over time with detailed analytics
- **Personalized Recommendations**: Data-driven suggestions for mental wellness

## 🚀 Tech Stack

### Backend
- **Python & Flask**: Robust server-side framework
- **Firebase Firestore**: Cloud-based NoSQL database
- **Socket.IO**: Real-time bidirectional communication
- **WebRTC with PeerJS**: Peer-to-peer video calling

### Frontend
- **HTML5, CSS3, JavaScript**: Modern web standards
- **Bootstrap**: Responsive UI framework
- **Plotly**: Interactive data visualization

### Machine Learning & Analytics
- **Pandas & NumPy**: Data processing and analysis
- **Scikit-learn**: Machine learning algorithms
- **K-Nearest Neighbour**: Stress level prediction model

## 📱 Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js (for frontend dependencies)
- Firebase account and project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/planical.git
   cd planical
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r Chatbot/requirements.txt
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Fill in your Firebase configuration:
   ```env
   FIREBASE_API_KEY=your_firebase_api_key_here
   FIREBASE_PROJECT_ID=your_project_id_here
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   FIREBASE_APP_ID=your_app_id_here
   FLASK_SECRET_KEY=your_secret_key_here
   ```

4. **Start the application**
   ```bash
   python start_services.py
   ```

5. **Access the platform**
   - Main Application: http://localhost:5000
   - AI Chatbot: http://localhost:5000/planical-ai

## 🏗️ Project Structure

```
planical/
├── app.py                 # Main Flask application
├── start_services.py      # Service orchestrator
├── Chatbot/              # AI chatbot backend
├── static/               # CSS, JS, images
├── templates/            # HTML templates
├── requirements.txt      # Python dependencies
└── .env                  # Environment variables
```

## 🔧 Core Functionalities

### For Patients
- Schedule and attend video consultations
- Access personalized stress analysis
- Use music therapy and exercise tools
- Chat with AI for immediate support
- Track mental wellness progress

### For Healthcare Providers
- Manage patient consultations
- Access patient stress analytics
- Approve/decline appointment requests
- Conduct secure video sessions

### For Administrators
- Verify and approve doctor registrations
- Monitor platform usage and analytics
- Manage user accounts and permissions

## 🤝 Contributing

We welcome contributions to improve Planical! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For support and inquiries:
- Create an issue in this repository
- Contact our support team through the platform
- Check our documentation for troubleshooting guides

---

<div align="center">
  <p><strong>Made with ❤️ for mental wellness</strong></p>
  <p>Planical - Where mental health meets technology</p>
</div>
