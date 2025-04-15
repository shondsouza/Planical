document.addEventListener('DOMContentLoaded', function() {
    // Print all script tags to console
    console.log("=== DEBUGGING SCRIPT TAGS ===");
    const scripts = document.querySelectorAll('script');
    scripts.forEach((script, index) => {
        console.log(`Script ${index}:`, script.src || 'inline script');
    });
    
    // Create a test message to confirm this script is running
    const debugMessage = document.createElement('div');
    debugMessage.style.padding = '10px';
    debugMessage.style.margin = '10px'; 
    debugMessage.style.backgroundColor = '#ffeeee';
    debugMessage.style.border = '1px solid red';
    debugMessage.innerHTML = `
        <h3>Debug Mode</h3>
        <p>Looking for cached scripts. Check console for details.</p>
        <button id="debugBtn">Test Chat API</button>
    `;
    document.body.prepend(debugMessage);
    
    // Add a test function for the chat API
    document.getElementById('debugBtn').addEventListener('click', async function() {
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: "hello from debug" })
            });
            
            const data = await response.json();
            alert("API Response: " + JSON.stringify(data));
        } catch (error) {
            console.error('Debug API Error:', error);
            alert("API Error: " + error.message);
        }
    });
}); 