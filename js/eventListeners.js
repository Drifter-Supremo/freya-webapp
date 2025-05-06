// Event Listeners
// This file handles all event listeners and DOM interactions

import { toggleTheme, loadThemePreference, showStatus } from './uiLogic.js';
import { sendMessageToAPI } from './apiLogic.js';
import { loadChatHistory } from './firebaseLogic.js';
import { displayMessage, displayMessagesFromHistory, showWelcomeMessage } from './uiLogic.js';

// Auto-resize textarea as user types
function autoResizeTextarea(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set new height based on scrollHeight
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Set up event handlers
function setupEventListeners() {
    // User input keypress event (Enter key)
    const userInput = document.getElementById('user-input');
    
    // Auto-resize textarea on input
    userInput.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
    
    // Handle Enter key (with shift+enter support)
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });
    
    // Send button click event
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            handleSendMessage();
        });
    }
    
    // Theme toggle click event
    const themeButton = document.getElementById('theme-toggle');
    themeButton.addEventListener('click', toggleTheme);
    
    // Load theme preference
    loadThemePreference();
    
    // History button click event
    const historyButton = document.getElementById('history-button');
    historyButton.addEventListener('click', function() {
        // Show a loading status immediately when clicked
        showStatus("Loading conversation history...");
        // Give a small delay to allow the status to appear
        setTimeout(handleLoadHistory, 100);
    });
}

// Handler for sending messages
function handleSendMessage() {
    const textarea = document.getElementById("user-input");
    const message = textarea.value.trim();
    if (!message) return;
    
    // Clear input field and reset height
    textarea.value = "";
    textarea.style.height = 'auto';
    
    // Send message to API
    sendMessageToAPI(message, showStatus, displayMessage);
}

// Handler for loading chat history
async function handleLoadHistory() {
    try {
        const messages = await loadChatHistory(showStatus);
        
        if (messages.length > 0) {
            const messageCount = displayMessagesFromHistory(messages);
            showStatus(`Loaded ${messageCount/2} conversation exchanges.`);
        } else {
            // Display a welcome message if no history
            showWelcomeMessage();
        }
    } catch (error) {
        console.error("Error in handleLoadHistory:", error);
        showStatus("Failed to load chat history. Check console for details.", true);
    }
}

// Initialize the UI on page load
function initializeUI() {
    // Always show a fresh welcome message on startup
    console.log("Starting fresh chat session");
    showWelcomeMessage();
    
    // Add a small hint about history
    setTimeout(() => {
        showStatus("Previous conversations can be accessed using the history button", false);
    }, 3000);
}

// Export event listener functions
export {
    setupEventListeners,
    handleSendMessage,
    handleLoadHistory,
    initializeUI
};
