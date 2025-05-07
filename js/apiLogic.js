// API Logic
// This file handles OpenAI API interactions, API key management, and response processing

import { 
    saveToFirebase, 
    getCurrentConversation,
    getDb,
    isFirebaseInitialized 
} from './firebaseLogic.js';
import { buildMemoryContext } from './memoryLogic.js';
// import OpenAI from "openai"; // REMOVED: Not browser-compatible. Using fetch instead.

// API Configuration
const DEFAULT_TEMPERATURE = 0.7;
const MAX_TOKENS = 800;

// API Key Management Functions
// Store API key in localStorage
function setOpenAIKey(key) {
    if (!key) return false;
    localStorage.setItem('openai-api-key', key);
    return true;
}

// Retrieve API key from localStorage
function getOpenAIKey() {
    return localStorage.getItem('openai-api-key');
}

// Clear API key from localStorage
function clearOpenAIKey() {
    localStorage.removeItem('openai-api-key');
}

// Check if the API key is in the correct format
function isValidOpenAIKey(key) {
    // Validate OpenAI API key format (e.g., sk-proj- followed by alphanumeric characters)
    return /^sk-proj-[a-zA-Z0-9-_]{40,}$/.test(key); // Adjusted length assumption
}

// Process and clean the API response
function processResponse(response) {
    if (!response) return "";
    
    let processedResponse = response;
    
    // Check if the entire message is wrapped in quotes
    if ((processedResponse.startsWith('"') && processedResponse.endsWith('"')) || 
        (processedResponse.startsWith("'") && processedResponse.endsWith("'"))) {
        processedResponse = processedResponse.substring(1, processedResponse.length - 1);
    }
    
    // Look for quotes at beginning of the string
    if (processedResponse.startsWith('"') || processedResponse.startsWith("'")) {
        processedResponse = processedResponse.substring(1);
    }
    
    // Look for quotes at end of the string
    if (processedResponse.endsWith('"') || processedResponse.endsWith("'")) {
        processedResponse = processedResponse.substring(0, processedResponse.length - 1);
    }
    
    // Remove asterisks while preserving content
    processedResponse = processedResponse.replace(/\*([^*]+)\*/g, '$1');
    
    return processedResponse;
}

// Send a message to the OpenAI API and process the response
async function sendMessageToAPI(userInput, showStatus, displayMessage) {
    if (!userInput) return null;

    console.log("User input:", userInput);
    displayMessage(userInput, false, false); // false = user message, no typing effect
    
    // Show typing indicator
    const chatBox = document.getElementById("chat-box");
    const typingIndicator = document.createElement("p");
    typingIndicator.classList.add("typing-indicator");
    typingIndicator.textContent = "Freya is typing...";
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        console.log("Sending request to OpenAI API with enhanced memory...");
        
        // Get API key
        const apiKey = getOpenAIKey();
        if (!apiKey) {
            throw new Error("API key not found. Please enter your OpenAI API key.");
        }
        
        // Check Firebase initialization
        const db = getDb();
        if (!db || !isFirebaseInitialized()) {
            throw new Error("Firebase database not initialized. Please refresh the page and try again.");
        }

        // Get current conversation ID
        const conversationId = await getCurrentConversation();
        if (!conversationId) {
            throw new Error("Could not get or create conversation");
        }
        
        // Build memory context using 3-tier system
        console.log("Building memory context using 3-tier system...");
        // The buildMemoryContext function returns messages in a format like:
        // [{ role: "system", content: "System prompt..." }, { role: "user", content: "User input..."}]
        // or [{ role: "user", content: "User input..." }, { role: "assistant", content: "Assistant response..."}]
        // This is already compatible with OpenAI's expected format.
        const messagesForAPI = await buildMemoryContext(userInput);

        // Log memory context details
        console.log("Memory context details for OpenAI:");
        console.log("- System prompt included:", messagesForAPI.some(m => m.role === "system"));
        console.log("- Total context messages:", messagesForAPI.length);
        console.log("- Context structure:", JSON.stringify(messagesForAPI.slice(0, 3), null, 2) + "... (truncated)");

        // --- Browser-based OpenAI API call using fetch ---
        const fetchResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "ft:gpt-4.1-mini-2025-04-14:gorlea-industries:freya:BULkCmxj",
                messages: messagesForAPI,
                temperature: DEFAULT_TEMPERATURE,
                max_tokens: MAX_TOKENS
            })
        });

        // Remove typing indicator
        if (typingIndicator && typingIndicator.parentNode) {
            chatBox.removeChild(typingIndicator);
        }

        if (!fetchResponse.ok) {
            let errorMessage = `OpenAI API error: ${fetchResponse.status}`;
            try {
                const errorData = await fetchResponse.json();
                if (errorData && errorData.error && errorData.error.message) {
                    errorMessage = errorData.error.message;
                }
            } catch (err) {}
            showStatus(errorMessage, true);
            throw new Error(errorMessage);
        }

        const data = await fetchResponse.json();
        if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
            const reply = data.choices[0].message.content;
            console.log("Extracted reply from OpenAI response");
            // Process the response (remove quotes, etc.)
            const processedReply = processResponse(reply);
            // Display and save the message
            displayMessage(processedReply, true, true);
            await saveToFirebase(userInput, processedReply);
            return { reply: processedReply };
        } else if (data.error) {
            console.error("API error:", data.error);
            showStatus(`There was an API error: ${data.error.message || JSON.stringify(data.error)}`, true);
            return null;
        } else {
            console.error("No valid response structure:", data);
            showStatus("Oops, I received a response but couldn't understand it. Check the console for details.", true);
            return null;
        }
    } catch (error) {
        // Remove typing indicator if it exists
        if (typingIndicator && typingIndicator.parentNode) {
            chatBox.removeChild(typingIndicator);
        }
        
        console.error("Error in sendMessageToAPI:", error);
        let errorMessage = `Sorry, there was an error: ${error.message}`;

        if (error.name === 'AuthenticationError' || error.status === 401) {
            errorMessage = "OpenAI API key is invalid or expired. Please check your key.";
            clearOpenAIKey(); // Clear the invalid key
        } else if (error.name === 'RateLimitError' || error.status === 429) {
            errorMessage = "You've exceeded your OpenAI API quota or rate limit. Please check your usage or try again later.";
        } else if (error.name === 'APIError' && error.status === 500) {
            errorMessage = "OpenAI is experiencing issues. Please try again later.";
        } else if (error.name === 'NotFoundError' || error.status === 404) {
            errorMessage = "The OpenAI model was not found. Please check the model ID. It's possible the fine-tuned model is not ready or the ID is incorrect.";
        }
        // Add more specific OpenAI error checks here if needed

        showStatus(errorMessage, true);
        throw error; // Re-throw the error for further handling if necessary
    }
}

// Display API key input modal
function showAPIKeyModal(showStatus) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'api-key-modal-container';
    document.body.appendChild(modalContainer);
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'api-key-modal-content';
    modalContainer.appendChild(modalContent);
    
    // Create modal title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Enter OpenAI API Key';
    modalContent.appendChild(modalTitle);
    
    // Create description
    const description = document.createElement('p');
    description.textContent = 'Please enter your OpenAI API key to continue. The key will be stored in your browser and used only for API calls to OpenAI.';
    modalContent.appendChild(description);
    
    // Create input field
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.placeholder = 'sk-proj-...';
    apiKeyInput.className = 'api-key-input';
    modalContent.appendChild(apiKeyInput);
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.className = 'api-key-submit';
    modalContent.appendChild(submitButton);
    
    // Show key format note
    const formatNote = document.createElement('p');
    formatNote.className = 'key-format-note';
    formatNote.textContent = 'API Key should start with "sk-proj-" and be a valid OpenAI key format.';
    modalContent.appendChild(formatNote);
    
    // Handle submit button click
    submitButton.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (isValidOpenAIKey(key)) {
            setOpenAIKey(key);
            document.body.removeChild(modalContainer);
            showStatus('API key saved successfully!');
        } else {
            formatNote.textContent = 'Invalid OpenAI API key format. Please check and try again.';
            formatNote.style.color = '#ff4d6d';
        }
    });
    
    // Handle enter key
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });
    
    // Focus input field
    apiKeyInput.focus();
}

// Check for API key and show modal if not available
function ensureAPIKey(showStatus) {
    const key = getOpenAIKey();
    if (!key) {
        showAPIKeyModal(showStatus);
        return false;
    }
    return true;
}

// Export API-related functions
export {
    sendMessageToAPI,
    getOpenAIKey,
    setOpenAIKey,
    clearOpenAIKey,
    isValidOpenAIKey,
    ensureAPIKey,
    showAPIKeyModal
};
