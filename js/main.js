// Main Application Entry Point
// This file initializes all modules and serves as the main entry point for the application

import { initFirebase } from './firebaseLogic.js';
import { setupEventListeners, initializeUI } from './eventListeners.js';
import { ensureAPIKey } from './apiLogic.js';
import { showStatus } from './uiLogic.js';

// Initialize the application
function initApp() {
    console.log("Initializing Freya AI Chat application...");
    
    // Initialize Firebase
    const db = initFirebase();
    if (!db) {
        console.warn("Firebase initialization failed. Some features may not work properly.");
    } else {
        console.log("Firebase initialized successfully");
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI
    initializeUI();
    
    // Check for API key
    ensureAPIKey(showStatus);
    
    console.log("Application initialization complete");
}

// Call init when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Expose sendMessage function globally for compatibility with HTML onclick
window.sendMessage = () => {
    // Import dynamically to avoid circular dependencies
    import('./eventListeners.js').then(module => {
        module.handleSendMessage();
    });
};
