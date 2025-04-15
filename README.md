# Planical - Mental Healthcare Platform

Planical is a comprehensive mental healthcare platform designed to connect patients with mental health professionals through secure video consultations. The platform facilitates virtual consultations, appointment scheduling, and mental health resources.

## Features

- **User Authentication**: Secure login system for patients, doctors, and administrators
- **Doctor Approval System**: Admin dashboard to verify and approve doctor registrations
- **Virtual Consultations**: Real-time video consultations using WebRTC
- **Appointment Scheduling**: Patients can request appointments with available doctors
- **Consultation Management**: Doctors can accept, decline, or reschedule patient consultations
- **Real-time Notifications**: Socket.IO based real-time notifications for consultations
- **Mental Health Resources**: Access to various mental health resources and tools
- **User Profiles**: Customizable profiles for both patients and healthcare providers

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Database**: Firebase Firestore
- **Real-time Communication**: Socket.IO
- **Video Calling**: WebRTC with PeerJS
- **Authentication**: Firebase Authentication

## Installation and Setup

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up Firebase project and add your configuration
4. Run the application: `python app.py`

## License

This project is proprietary and confidential. All rights reserved.

<h1 align="center">
         Planical - Mental HealthCare Web App
</h1>

*****

[![GitHub last commit](https://img.shields.io/github/last-commit/tandrimasingha/Planical-MentalHealthcare?label=Last%20commit&color=green&logo=git&logoColor=white&style=flat-square)](https://github.com/tandrimasingha/Data-Analysis)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/tandrimasingha/Planical-MentalHealthcare?label=Code%20size&logo=python&logoColor=white&style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/tandrimasingha/Planical-MentalHealthcare?label=Repo%20size&color=red&logo=github&logoColor=white&style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/tandrimasingha/Planical-MentalHealthcare?label=Stars&logo=github&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/tandrimasingha/Planical-MentalHealthcare?label=Issues&color=yellow&logo=github&style=flat-square)




## 📊 Overview of the App

Welcome to Planical. <br> Planical is a web app that analyses the psychological and mental health conditions of an individual and provide solutions to the problems.
Planical is a mental health solution that aims to provide users with easy access to resources related to mental wellbeing.  Planical will help people to identify these issues timely and take necessary steps to improve the conditions of the victims and provide care to those, who are at risk of serious mental complications. The purpose of Planical is to assist its users by providing solutions to their mental health conditions without requiring professional help in most cases. We have observed that these solutions work efficiently in bettering their mental health conditions. Users can also track their habits and keep a record of how often they have been doing the same. In serious cases, users will be able to book an appointment with a psychologist for consultation and get timely help.




## 🚀 Tech Stack:

![image](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)&nbsp;&nbsp;
![image](https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)&nbsp;&nbsp;
![Plotly](https://img.shields.io/badge/Plotly-49587c.svg?&style=for-the-badge&logo=power-bi&logoColor=white)
![image](https://img.shields.io/badge/Numpy-342B029.svg?&style=for-the-badge&logo=numpy&logoColor=white)&nbsp;&nbsp;
![image](https://img.shields.io/badge/scikit%20learn-FF8282?style=for-the-badge&logo=scikit-learn&logoColor=white)&nbsp;&nbsp;
![image](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)&nbsp;&nbsp;
![image](https://img.shields.io/badge/sqlite-E34F26?style=for-the-badge&logo=sqlite&logoColor=white)&nbsp;&nbsp;
![image](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)&nbsp;&nbsp;
![image](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)&nbsp;&nbsp;
![image](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)&nbsp;&nbsp;

****


## Structure Of The Project

- The home page consists of an about section, a services section and a contact section and a authentication system where in order to use certain services you need to sign up.
- In the first services section, there is a Stress Analysis section where the analysis of stress is visualized through different interactive plots using Plotly.
- The next section consists of Stress Detection where the ML model uses K-Nearest Neighbour to find the stress level of a person.
- Now comes the our solution to mental healh firsly music therapy which helps user to concentrate and meditate which releases stress.
- Music Therapy : User can meditate for set duration of time with soothing music playing the background.
- Exercise Recommendations : User can exercise for set duration of time by following the instructions that is being displayed on the screen.
- Our user can also get access to our ChatBot which can answer them the general questions.


## Model Deployment

- The web application is built using python library -> Flask and Web Programming languages -> HTML, CSS, , Js Bootstrap
- The entire application is finally deployed on Heroku by adding - Procfile (informs Heroku that which application is to be run first), Requirements (notifies Heroku about the libraries that needs to be installed before deploying or running our application)
- See the deployed application [here](https://mind-care.herokuapp.com/).

## Demo Video Link : https://youtu.be/7BL3_NhBIfs

## Run Locally

Open VSCode -

1.1 `git clone <repo link>`

1.2 `cd Planical`

1.3 `pip install -r requirements.txt `

1.4 `flask run`

## Running the Application with Chatbot

To run both the main application and the chatbot backend simultaneously:

1. Make sure you have installed all requirements for both the main app and the chatbot backend:
   ```
   pip install -r requirements.txt
   pip install -r Chatbot/requirements.txt
   ```

2. Run the start services script:
   ```
   python start_services.py
   ```

3. Navigate to http://localhost:5000 in your browser

4. Use the "Planical AI" link in the navigation or visit directly at http://localhost:5000/planical-ai to access the chatbot

5. Use Ctrl+C in the terminal to shut down both services


