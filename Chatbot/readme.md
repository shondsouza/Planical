# **Planical Chatbot**  
![Image](https://github.com/user-attachments/assets/cf9f2f66-c576-40cd-8676-e16f1ead68e5)
A simple WebSocket-based chatbot designed to provide **mental health support** by responding to user messages based on predefined keywords.  

## **Features**  
✅ Real-time communication via WebSockets   
✅ Maintains session-based conversation history  
✅ Handles user disconnects and session cleanup  

## **Installation & Setup**  

1. **Clone the Repository**  
   ```sh
   git clone https://github.com/your-repo/chatbot.git
   cd chatbot
   ```

2. **Install Dependencies**  
   ```sh
   pip install websockets
   ```

3. **Run the Chatbot Server**  
   ```sh
   python server.py
   ```
   The server starts at **ws://localhost:8765**  

4. **Connect a WebSocket Client**  
   - Use a WebSocket tool (e.g., Postman, a browser-based client, or a frontend app) to send messages.  

## **Usage**  
- Send messages containing words like **stress, anxiety, sadness** to get appropriate responses.  
- If the input doesn't match predefined keywords, a general response is given.  

