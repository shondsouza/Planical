document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Remove welcome message when first message is sent
    let firstMessage = true;
    
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function createMessage(text, sender) {
        // Create wrapper
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('message-wrapper');
        wrapperDiv.classList.add(sender === 'user' ? 'user-wrapper' : 'bot-wrapper');
        
        // Create avatar with image
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        
        const avatarImg = document.createElement('img');
        
        if (sender === 'user') {
            avatarImg.src = '/images/icon.jpeg';
            avatarImg.alt = 'User';
        } else {
            avatarImg.src = '/images/female.jpeg';
            avatarImg.alt = 'Doctor';
        }
        
        avatarDiv.appendChild(avatarImg);
        
        // Create message bubble
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        
        // Assemble the message
        wrapperDiv.appendChild(avatarDiv);
        wrapperDiv.appendChild(messageDiv);
        
        return wrapperDiv;
    }
    
    function createLoadingIndicator() {
        // Create wrapper
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('message-wrapper', 'bot-wrapper');
        wrapperDiv.id = 'loadingIndicator';
        
        // Create avatar with image
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        
        const avatarImg = document.createElement('img');
        avatarImg.src = '/images/female.jpeg';
        avatarImg.alt = 'Doctor';
        avatarDiv.appendChild(avatarImg);
        
        // Create message with typing indicator
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingIndicator.appendChild(dot);
        }
        
        messageDiv.appendChild(typingIndicator);
        
        // Assemble the message
        wrapperDiv.appendChild(avatarDiv);
        wrapperDiv.appendChild(messageDiv);
        
        return wrapperDiv;
    }
    
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Clear input
        messageInput.value = '';
        
        // Remove welcome message if this is first message
        if (firstMessage) {
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage) {
                messagesContainer.removeChild(welcomeMessage);
            }
            firstMessage = false;
        }
        
        // Add user message
        messagesContainer.appendChild(createMessage(message, 'user'));
        scrollToBottom();
        
        // Add loading indicator
        const loadingIndicator = createLoadingIndicator();
        messagesContainer.appendChild(loadingIndicator);
        scrollToBottom();
        
        // Disable input while waiting for response
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        try {
            // Send message to API (using updated endpoint)
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            // Remove loading indicator
            messagesContainer.removeChild(loadingIndicator);
            
            // Add bot response
            messagesContainer.appendChild(createMessage(data.response, 'bot'));
            scrollToBottom();
            
        } catch (error) {
            console.error('Error:', error);
            
            // Remove loading indicator
            messagesContainer.removeChild(loadingIndicator);
            
            // Add error message
            messagesContainer.appendChild(createMessage('Sorry, I encountered an error. Please try again later.', 'bot'));
            scrollToBottom();
        } finally {
            // Re-enable input
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Focus input on load
    messageInput.focus();
}); 