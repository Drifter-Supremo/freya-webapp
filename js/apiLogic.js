// API Logic
// This file handles Gemini API interactions, key management, and response processing

import { 
    saveToFirebase, 
    getCurrentConversation,
    getDb,
    isFirebaseInitialized 
} from './firebaseLogic.js';
import { buildMemoryContext } from './memoryLogic.js';
import { buildVertexUrl } from "./config.js";

// API Configuration
const DEFAULT_TEMPERATURE = 0.7;
const MAX_TOKENS = 800;

// API Key Management Functions
// Store API key in localStorage
function setGeminiKey(key) {
    if (!key) return false;
    localStorage.setItem('gemini-api-key', key);
    return true;
}

// Retrieve API key from localStorage
function getGeminiKey() {
    return localStorage.getItem('gemini-api-key');
}

// Clear API key from localStorage
function clearGeminiKey() {
    localStorage.removeItem('gemini-api-key');
}

// Check if the API key is in the correct format
function isValidGeminiKey(key) {
    // Validate Gemini API key format (AIza followed by 35 characters)
    return /^AIza[0-9A-Za-z-_]{35}$/.test(key);
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

// Send a message to the Gemini API and process the response
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
        console.log("Sending request to Gemini Chat API with enhanced memory...");
        
        // Get API key
        const apiKey = getGeminiKey();
        if (!apiKey) {
            throw new Error("API key not found. Please enter your Gemini API key.");
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

        // Format for Gemini API
        const apiUrl = buildVertexUrl(apiKey);
        console.log("Using API URL:", apiUrl);
        
        // Build memory context using 3-tier system
        console.log("Building memory context using 3-tier system...");
        const messages = await buildMemoryContext(userInput);
        
        // Convert messages to Gemini API format
        const contents = messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        // Log memory context details
        console.log("Memory context details:");
        console.log("- System prompt included:", contents.some(c => c.parts[0].text.includes("SYSTEM PROMPT")));
        console.log("- Total context messages:", contents.length);
        console.log("- Context structure:", JSON.stringify(contents.slice(0, 3), null, 2) + "... (truncated)");

        // Gemini API request body
        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: DEFAULT_TEMPERATURE,
                maxOutputTokens: MAX_TOKENS
            }
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify(requestBody)
        });

        console.log("Response status:", response.status);
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            clearGeminiKey(); // Clear invalid key
            throw new Error("API key is invalid or expired. Please provide a valid Gemini API key.");
        }
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Full API response:", result);
        
        // Remove typing indicator
        chatBox.removeChild(typingIndicator);
        
        if (result && result.candidates && result.candidates.length > 0) {
            console.log("Found candidates in response");
            
            // Log the candidate structure for debugging
            console.log("Candidate structure:", JSON.stringify(result.candidates[0], null, 2));
            
            // Extract reply from Gemini response format
            const reply = result.candidates[0].content.parts[0].text;
            console.log("Extracted reply from content.parts[0].text");
            
            // Process the response (remove quotes, etc.)
            const processedReply = processResponse(reply);
            
            // Display and save the message
            displayMessage(processedReply, true, true); 
            await saveToFirebase(userInput, processedReply);
            
            return { reply: processedReply };
        } else if (result.error) {
            console.error("API error:", result.error);
            showStatus(`There was an API error: ${result.error.message || JSON.stringify(result.error)}`, true);
            return null;
        } else {
            console.error("No valid response structure:", result);
            showStatus("Oops, I received a response but couldn't understand it. Check the console for details.", true);
            return null;
        }
    } catch (error) {
        // Remove typing indicator if it exists
        if (typingIndicator.parentNode) {
            chatBox.removeChild(typingIndicator);
        }
        
        console.error("Error in sendMessageToAPI:", error);
        showStatus(`Sorry, there was an error: ${error.message}`, true);
        throw error; // Re-throw the error
    }
}

// Helper function to recursively find a text property in an object
function findTextInObject(obj, depth = 0, maxDepth = 5) {
    // Prevent infinite recursion
    if (depth > maxDepth) return null;
    
    // Handle null/undefined
    if (!obj) return null;
    
    // If it's not an object, return null
    if (typeof obj !== 'object') return null;
    
    // Try to find a text property directly
    if ('text' in obj && typeof obj.text === 'string') {
        return obj.text;
    }
    
    // Recursively search through all properties
    for (const key in obj) {
        if (key === 'text' && typeof obj[key] === 'string') {
            return obj[key];
        }
        
        if (typeof obj[key] === 'object') {
            const found = findTextInObject(obj[key], depth + 1, maxDepth);
            if (found) return found;
        }
    }
    
    return null;
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
    modalTitle.textContent = 'Enter Gemini API Key';
    modalContent.appendChild(modalTitle);
    
    // Create description
    const description = document.createElement('p');
    description.textContent = 'Please enter your Gemini API key to continue. The key will be stored in your browser and used only for API calls to Gemini.';
    modalContent.appendChild(description);
    
    // Create input field
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.placeholder = 'AIza...';
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
    formatNote.textContent = 'API Key should start with "AIza" and be a valid Gemini key format.';
    modalContent.appendChild(formatNote);
    
    // Handle submit button click
    submitButton.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (isValidGeminiKey(key)) {
            setGeminiKey(key);
            document.body.removeChild(modalContainer);
            showStatus('API key saved successfully!');
        } else {
            formatNote.textContent = 'Invalid Gemini API key format. Please check and try again.';
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
    const key = getGeminiKey();
    if (!key) {
        showAPIKeyModal(showStatus);
        return false;
    }
    return true;
}

// Export API-related functions
export {
    sendMessageToAPI,
    getGeminiKey,
    setGeminiKey,
    clearGeminiKey,
    isValidGeminiKey,
    ensureAPIKey,
    showAPIKeyModal
};
