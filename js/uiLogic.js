// UI Logic
// This file handles UI-related functionality including message display,
// status messages, theme toggling, and UI interactions

// Avatar image data (embedded as base64 SVGs for better performance)
const FREYA_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBCYWNrZ3JvdW5kIGNpcmNsZSAtLT4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzFhMWEyZSIgc3Ryb2tlPSIjMDBlNWZmIiBzdHJva2Utd2lkdGg9IjIiLz4KICAKICA8IS0tIFNhdHVybi1saWtlIHJpbmcgLS0+CiAgPGVsbGlwc2UgY3g9IjUwIiBjeT0iNTAiIHJ4PSI0NSIgcnk9IjEyIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjRkNmQiIHN0cm9rZS13aWR0aD0iMiIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1LCA1MCwgNTApIi8+CiAgCiAgPCEtLSBSZXRybyBoZWxtZXQgb3V0bGluZSAtLT4KICA8cGF0aCBkPSJNMzAsMzAgQzMwLDIwIDcwLDIwIDcwLDMwIEw3MCw1NSBDNzAsNzAgMzAsNzAgMzAsNTUgWiIgZmlsbD0iIzI0MjU4MiIgc3Ryb2tlPSIjMDBlNWZmIiBzdHJva2Utd2lkdGg9IjIiLz4KICAKICA8IS0tIEhlbG1ldCB2aXNvciAtLT4KICA8cGF0aCBkPSJNMzUsMzggQzM1LDMzIDY1LDMzIDY1LDM4IEw2NSw1MCBDNjUsNjAgMzUsNjAgMzUsNTAgWiIgZmlsbD0iIzA2NmI3NCIgc3Ryb2tlPSIjMDBlNWZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIAogIDwhLS0gTWVkaWNhbCBzeW1ib2wgLS0+CiAgPHJlY3QgeD0iNDUiIHk9IjcyIiB3aWR0aD0iMTAiIGhlaWdodD0iMjIiIHJ4PSIyIiBmaWxsPSIjZmY0ZDZkIi8+CiAgPHJlY3QgeD0iMzkiIHk9Ijc4IiB3aWR0aD0iMjIiIGhlaWdodD0iMTAiIHJ4PSIyIiBmaWxsPSIjZmY0ZDZkIi8+CiAgCiAgPCEtLSBEZWNvcmF0aXZlIGVsZW1lbnRzIC0tPgogIDxjaXJjbGUgY3g9IjI1IiBjeT0iNDAiIHI9IjMiIGZpbGw9IiMwMGU1ZmYiLz4KICA8Y2lyY2xlIGN4PSI3NSIgY3k9IjQwIiByPSIzIiBmaWxsPSIjMDBlNWZmIi8+CiAgPHBhdGggZD0iTTQwLDY1IEM0MCw2NSA0NSw2OCA1MCw2OCBDNTUsNjggNjAsNjUgNjAsNjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwZTVmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICAKICA8IS0tIFJheWd1biBnb3RoaWMgc3R5bGUgYWNjZW50cyAtLT4KICA8cGF0aCBkPSJNMjAsNTAgTDE1LDQwIEwxMCw1MCBMMTUsNjAgWiIgZmlsbD0iI2ZmNGQ2ZCIvPgogIDxwYXRoIGQ9Ik04MCw1MCBMODUsNDAgTDkwLDUwIEw4NSw2MCBaIiBmaWxsPSIjZmY0ZDZkIi8+Cjwvc3ZnPg==";

const USER_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBCYWNrZ3JvdW5kIGNpcmNsZSAtLT4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzMzMjIzMyIgc3Ryb2tlPSIjZmY0ZDZkIiBzdHJva2Utd2lkdGg9IjIiLz4KICAKICA8IS0tIFdvbGYgZWFycyAtLT4KICA8cGF0aCBkPSJNMzAsMjUgTDQwLDQwIEw1MCwyNSBaIiBmaWxsPSIjNDQzMzQ0IiBzdHJva2U9IiM2NjMzNDQiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwYXRoIGQ9Ik03MCwyNSBMNjAsNDAgTDUwLDI1IFoiIGZpbGw9IiM0NDMzNDQiIHN0cm9rZT0iIzY2MzM0NCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgCiAgPCEtLSBXb2xmIGZhY2UgLS0+CiAgPGVsbGlwc2UgY3g9IjUwIiBjeT0iNTUiIHJ4PSIyNSIgcnk9IjI4IiBmaWxsPSIjNDQzMzQ0IiBzdHJva2U9IiM2NjMzNDQiIHN0cm9rZS13aWR0aD0iMSIvPgogIAogIDwhLS0gU25vdXQgLS0+CiAgPHBhdGggZD0iTTQwLDU1IEw1MCw3MCBMNjAsNTUiIGZpbGw9IiM1NTQzNTUiIHN0cm9rZT0iIzY2MzM0NCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPGVsbGlwc2UgY3g9IjUwIiBjeT0iNjAiIHJ4PSIxMCIgcnk9IjEwIiBmaWxsPSIjNTU0MzU1IiBzdHJva2U9IiM2NjMzNDQiIHN0cm9rZS13aWR0aD0iMSIvPgogIAogIDwhLS0gTm9zZSAtLT4KICA8ZWxsaXBzZSBjeD0iNTAiIGN5PSI2NSIgcng9IjUiIHJ5PSIzIiBmaWxsPSIjMzMyMjMzIi8+CiAgCiAgPCEtLSBFeWVzIC0tPgogIDxlbGxpcHNlIGN4PSIzNSIgY3k9IjQ1IiByeD0iNSIgcnk9IjMiIGZpbGw9IiNmZjRkNmQiLz4KICA8ZWxsaXBzZSBjeD0iNjUiIGN5PSI0NSIgcng9IjUiIHJ5PSIzIiBmaWxsPSIjZmY0ZDZkIi8+CiAgCiAgPCEtLSBFeWUgZ2xpbnRzIC0tPgogIDxjaXJjbGUgY3g9IjM2IiBjeT0iNDQiIHI9IjEiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iNjYiIGN5PSI0NCIgcj0iMSIgZmlsbD0id2hpdGUiLz4KICAKICA8IS0tIFdvbGYgbWFya2luZ3MgLS0+CiAgPHBhdGggZD0iTTIwLDMwIEw0MCwzMCBMNTAsNTAgTDQwLDUwIFoiIGZpbGw9IiMzODI4MzgiIHN0cm9rZT0ibm9uZSIvPgogIDxwYXRoIGQ9Ik04MCwzMCBMNjAsMzAgTDUwLDUwIEw2MCw1MCBaIiBmaWxsPSIjMzgyODM4IiBzdHJva2U9Im5vbmUiLz4KICAKICA8IS0tIFN1YnRsZSBnbG93IGVmZmVjdCAtLT4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmY0ZDZkIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjMiLz4KPC9zdmc+";

// Memory system - store conversation history in memory
let conversationHistory = [];

// Format timestamp for display
function formatTime(date) {
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Show status message in the chat box
function showStatus(message, isError = false) {
    const chatBox = document.getElementById("chat-box");
    
    // Create status element
    const statusDiv = document.createElement("div");
    statusDiv.className = "status-message" + (isError ? " error" : "");
    statusDiv.textContent = message;
    
    // Add to chat and scroll
    chatBox.appendChild(statusDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Remove after 5 seconds if not an error
    if (!isError) {
        setTimeout(() => {
            if (statusDiv.parentNode === chatBox) {
                chatBox.removeChild(statusDiv);
            }
        }, 5000);
    }
}

// Create a new message element with avatar and timestamp
function displayMessage(text, isFreya = false, useTypingEffect = false) {
    let chatBox = document.getElementById("chat-box");
    
    // Create message container
    let messageDiv = document.createElement("div");
    messageDiv.className = isFreya ? "message freya-message" : "message user-message";
    
    // Create avatar
    let avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.style.backgroundImage = `url(${isFreya ? FREYA_AVATAR : USER_AVATAR})`;
    
    // Create message content container
    let contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    
    // Extract the message text from the format "Name: message"
    let messageContent = text;
    if (text.startsWith("Freya: ")) {
        messageContent = text.substring(7);
    } else if (text.startsWith("You: ")) {
        messageContent = text.substring(5);
    }
    
    // Only process Freya's messages
    if (isFreya) {
        // Log the original message content for debugging
        console.log("Original Freya message:", messageContent);
        
        // Check if the entire message is wrapped in quotes
        if ((messageContent.startsWith('"') && messageContent.endsWith('"')) || 
            (messageContent.startsWith("'") && messageContent.endsWith("'"))) {
            messageContent = messageContent.substring(1, messageContent.length - 1);
        }
        
        // Look for quotes at beginning of the string
        if (messageContent.startsWith('"') || messageContent.startsWith("'")) {
            messageContent = messageContent.substring(1);
        }
        
        // Look for quotes at end of the string
        if (messageContent.endsWith('"') || messageContent.endsWith("'")) {
            messageContent = messageContent.substring(0, messageContent.length - 1);
        }
        
        // Remove asterisks while preserving content
        messageContent = messageContent.replace(/\*([^*]+)\*/g, '$1');
        
        console.log("After quote removal:", messageContent);

        if (useTypingEffect) {
            // Create text container and cursor for typing effect
            const textContainer = document.createElement('span');
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            
            contentDiv.appendChild(textContainer);
            contentDiv.appendChild(cursor);
            
            // Add timestamp div early but hide it
            let timeDiv = document.createElement("div");
            timeDiv.className = "message-time";
            timeDiv.style.opacity = "0";
            timeDiv.textContent = formatTime(new Date());
            contentDiv.appendChild(timeDiv);
            
            // Assemble the message early
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(contentDiv);
            chatBox.appendChild(messageDiv);
            
            // Auto-scroll to latest message
            chatBox.scrollTop = chatBox.scrollHeight;
            
            // Typing effect function
            let index = 0;
            const typeNextChar = () => {
                if (index < messageContent.length) {
                    const char = document.createElement('span');
                    char.className = 'revealed-char';
                    char.textContent = messageContent[index];
                    
                    textContainer.appendChild(char);
                    
                    // Vary typing speed based on punctuation (faster speeds)
                    const delay = messageContent[index].match(/[.,!?]/) ? 100 : 20;
                    
                    index++;
                    setTimeout(typeNextChar, delay);
                    
                    // Auto-scroll while typing
                    chatBox.scrollTop = chatBox.scrollHeight;
                } else {
                    // Remove cursor and show timestamp when done
                    cursor.remove();
                    timeDiv.style.opacity = "1";
                    timeDiv.style.transition = "opacity 0.3s ease";
                }
            };
            
            // Start typing effect
            setTimeout(typeNextChar, 100);
        } else {
            // For historical messages, display instantly
            contentDiv.textContent = messageContent;
            
            // Add timestamp
            let timeDiv = document.createElement("div");
            timeDiv.className = "message-time";
            timeDiv.textContent = formatTime(new Date());
            contentDiv.appendChild(timeDiv);
            
            // Assemble the message
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(contentDiv);
            chatBox.appendChild(messageDiv);
            
            // Auto-scroll to latest message
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    } else {
        // For user messages, display instantly
        contentDiv.textContent = messageContent;
        
        // Add timestamp
        let timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.textContent = formatTime(new Date());
        contentDiv.appendChild(timeDiv);
        
        // Assemble the message
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);
        
        // Auto-scroll to latest message
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    // Save to conversation history
    conversationHistory.push({
        sender: isFreya ? "freya" : "user",
        text: messageContent,
        timestamp: new Date().toISOString()
    });
}

// Display messages from history
function displayMessagesFromHistory(messages) {
    // Clear the chat box first
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = '';
    
    let messageCount = 0;
    
    messages.forEach(message => {
        if (message.user && message.freya) {
            // Display user message first
            displayMessage(message.user, false, false);
            // Then Freya's response
            displayMessage(message.freya, true, false); // Don't use typing effect for history
            messageCount += 2;
        }
    });
    
    return messageCount;
}

// Show welcome message
function showWelcomeMessage() {
    displayMessage("Hello there! I'm Freya. Talk to me about anything—philosophy, movies, your deepest thoughts... I'm all digital ears.", true, true);
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon.classList.contains('fa-moon')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    
    // Save theme preference
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('freyaDarkTheme', isDarkTheme);
}

// Load saved theme preference
function loadThemePreference() {
    if (localStorage.getItem('freyaDarkTheme') === 'true') {
        toggleTheme();
    }
}

// Export UI-related functions
export {
    showStatus,
    displayMessage,
    displayMessagesFromHistory,
    showWelcomeMessage,
    toggleTheme,
    loadThemePreference
};
