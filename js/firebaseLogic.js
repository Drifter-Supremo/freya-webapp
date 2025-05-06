// Firebase Logic
// This file handles all Firebase-related functionality including initialization,
// message storage, and history retrieval

import { firebaseConfig } from './firebaseEnv.js';

// Initialize Firebase with improved error handling
let db;

// Function to initialize Firebase
function initFirebase() {
    try {
        // Check if firebase is available
        if (typeof firebase === 'undefined') {
            throw new Error("Firebase SDK not loaded - check your internet connection");
        }
        
        // Initialize app if not already initialized
        if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        db = firebase.firestore();
        console.log("Firebase initialized successfully");
        
        return db;
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        // Display error in UI to make issues visible
        setTimeout(() => {
            if (document.getElementById("chat-box")) {
                const chatBox = document.getElementById("chat-box");
                const errorDiv = document.createElement("div");
                errorDiv.className = "status-message error";
                errorDiv.textContent = "Firebase initialization failed. Features requiring database access won't work: " + error.message;
                chatBox.appendChild(errorDiv);
            }
        }, 1000); // Small delay to ensure DOM is ready
        
        return null;
    }
}

// Session management constants
const CONVERSATION_STORAGE_KEY = "freya_current_conversation";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Track current conversation
let currentConversationId = null;

// Initialize a new conversation
async function initializeConversation() {
    try {
        if (!db) {
            console.error("Firebase database not initialized");
            return null;
        }

        const docRef = await db.collection("conversations").add({
            userId: "Sencere", // Hardcoded for now
            messages: [],
            summary: [], // Initialize as empty array for multiple summaries
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        currentConversationId = docRef.id;
        console.log("New conversation initialized:", currentConversationId);
        
        // Get the actual document to return
        const conversationDoc = await docRef.get();
        return conversationDoc;
    } catch (error) {
        console.error("Error initializing conversation:", error);
        return null;
    }
}

// Get or create current conversation
async function getCurrentConversation() {
    try {
        // Try to get stored ID first
        currentConversationId = localStorage.getItem(CONVERSATION_STORAGE_KEY);
        
        let isNewSession = false;
        
        if (currentConversationId) {
            // Check if conversation exists and isn't expired
            const conversationDoc = await db.collection("conversations")
                .doc(currentConversationId)
                .get();
                
            if (!conversationDoc.exists) {
                isNewSession = true;
            } else {
                const data = conversationDoc.data();
                // Empty conversations are new sessions
                if (!data.messages || data.messages.length === 0) {
                    isNewSession = true;
                } else {
                    const lastMessage = data.messages.slice(-1)[0];
                    const lastTimestamp = lastMessage.timestamp.toMillis();
                    // Expired sessions are new sessions
                    if (Date.now() - lastTimestamp > SESSION_TIMEOUT) {
                        isNewSession = true;
                    }
                }
            }
        } else {
            isNewSession = true;
        }
        
        if (isNewSession) {
            // Create new conversation
            const newDoc = await initializeConversation();
            currentConversationId = newDoc.id;
            localStorage.setItem(CONVERSATION_STORAGE_KEY, currentConversationId);
        }
        
        return currentConversationId;
    } catch (error) {
        console.error("Error in getCurrentConversation:", error);
        return null;
    }
}

// Save a message pair to Firebase
async function saveToFirebase(userMessage, botReply) {
    try {
        // Make sure db was initialized properly
        if (!db) {
            console.error("Firebase database not initialized");
            return;
        }

        // Get current conversation or create new one
        const conversationId = await getCurrentConversation();
        if (!conversationId) {
            throw new Error("Could not get or create conversation");
        }

        // Create message objects
        const userMessageObj = {
            role: "user",
            content: userMessage,
            timestamp: firebase.firestore.Timestamp.now(),
            imageURL: null
        };

        const botMessageObj = {
            role: "assistant",
            content: botReply,
            timestamp: firebase.firestore.Timestamp.now(),
            imageURL: null
        };

        // Update conversation with new messages
        await db.collection("conversations").doc(conversationId).update({
            messages: firebase.firestore.FieldValue.arrayUnion(userMessageObj, botMessageObj)
        });

        // Also save to old messages collection for backward compatibility
        await db.collection("messages").add({
            user: userMessage,
            freya: botReply,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("Messages saved to conversation:", conversationId);
    } catch (error) {
        console.error("Error in saveToFirebase function:", error);
    }
}

// Load chat history from Firebase with improved feedback
async function loadChatHistory(showStatus) {
    try {
        if (!db) {
            console.error("Firebase database not initialized");
            showStatus("Firebase not initialized. Check your connection.", true);
            return [];
        }
        
        // Show loading status
        showStatus("Loading conversation history...");
        
        let messages = [];
        
        // Try to load from current conversation first
        if (currentConversationId) {
            const conversationDoc = await db.collection("conversations")
                .doc(currentConversationId)
                .get();
            
            if (conversationDoc.exists) {
                const data = conversationDoc.data();
                if (data.messages && data.messages.length > 0) {
                    // Convert new format to old format for compatibility
                    messages = data.messages.reduce((acc, msg, index, array) => {
                        if (index % 2 === 0 && index + 1 < array.length) {
                            // Pair user and assistant messages
                            acc.push({
                                user: array[index].content,
                                freya: array[index + 1].content,
                                timestamp: array[index].timestamp
                            });
                        }
                        return acc;
                    }, []);
                    
                    console.log("Loaded messages from current conversation");
                    showStatus(`Loaded ${messages.length} conversation exchanges.`);
                    return messages;
                }
            }
        }
        
        // Fallback to old messages collection if no current conversation or it's empty
        const snapshot = await db.collection("messages")
            .orderBy("timestamp", "desc")
            .limit(50) // Limit to 50 most recent messages
            .get();
        
        if (snapshot.empty) {
            console.log("No messages in history");
            showStatus("No previous conversations found.");
            return [];
        }
        
        console.log("Loading chat history from legacy storage...");
        
        // Convert to array and reverse to get chronological order (oldest first)
        const docs = Array.from(snapshot.docs).reverse();
        
        docs.forEach(doc => {
            const data = doc.data();
            if (data.user && data.freya) {
                messages.push({
                    user: data.user,
                    freya: data.freya,
                    timestamp: data.timestamp
                });
            }
        });
        
        console.log("Chat history loaded from legacy storage");
        showStatus(`Loaded ${messages.length} conversation exchanges.`);
        
        return messages;
    } catch (error) {
        console.error("Error loading chat history:", error);
        showStatus("Failed to load chat history. Check console for details.", true);
        return [];
    }
}

// Get the database instance
function getDb() {
    return db;
}

// Check if Firebase is initialized
function isFirebaseInitialized() {
    return !!db;
}

// Reset conversation (create new one)
async function resetConversation() {
    currentConversationId = null;
    localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    return await initializeConversation();
}

// Get last N messages across all recent conversations
async function getLastMessages(currentConversationId, count = 7) {
    try {
        if (!db) {
            console.error("Firebase not initialized");
            return [];
        }

        // Get conversations from last 24 hours
        const cutoffTime = firebase.firestore.Timestamp.fromMillis(
            Date.now() - (24 * 60 * 60 * 1000)
        );

        // Query all recent conversations
        const conversationsSnapshot = await db.collection("conversations")
            .where("createdAt", ">=", cutoffTime)
            .orderBy("createdAt", "desc")
            .get();

        // Collect all valid messages
        let allMessages = [];
        conversationsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.messages && data.messages.length > 0) {
                // Only include user and assistant messages with timestamps
                const validMessages = data.messages.filter(msg => 
                    (msg.role === "user" || msg.role === "assistant") &&
                    msg.timestamp
                );
                allMessages = allMessages.concat(validMessages);
            }
        });

        // Sort by timestamp and get last N messages
        return allMessages
            .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis())
            .slice(-count);
    } catch (error) {
        console.error("Error getting last messages:", error);
        return [];
    }
}

// Get conversation summary if it exists
async function getConversationSummary(conversationId) {
    try {
        if (!db || !conversationId) {
            console.error("Firebase not initialized or no conversation ID provided");
            return null;
        }

        const conversationDoc = await db.collection("conversations")
            .doc(conversationId)
            .get();

        if (!conversationDoc.exists) {
            console.log("No conversation found with ID:", conversationId);
            return null;
        }

        const data = conversationDoc.data();
        if (!data.summary) return null;
        
        // If summary is an array, join with newlines
        if (Array.isArray(data.summary)) {
            return data.summary.join('\n\n');
        }
        // If it's a string (legacy format), return as-is
        return typeof data.summary === 'string' ? data.summary : null;
    } catch (error) {
        console.error("Error getting conversation summary:", error);
        return null;
    }
}

// Export Firebase-related functions and variables
export {
    initFirebase,
    saveToFirebase,
    loadChatHistory,
    getDb,
    isFirebaseInitialized,
    getCurrentConversation,
    resetConversation,
    getLastMessages,
    getConversationSummary,
    currentConversationId
};
