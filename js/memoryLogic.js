// Memory Logic
// This file handles the three-tier memory system, user facts extraction,
// topic-based retrieval, and conversation context building

import SYSTEM_PROMPT from './freyaPrompt.js';
import { getDb } from './firebaseLogic.js';

// Topic extraction - Common topics and their related keywords
const commonTopics = {
    work: ['job', 'work', 'career', 'company', 'boss', 'office', 'colleague', 'coworker', 'project', 'deadline', 'meeting', 'interview', 'promotion', 'salary', 'profession'],
    health: ['health', 'sick', 'illness', 'disease', 'doctor', 'hospital', 'symptom', 'medicine', 'pain', 'injury', 'exercise', 'diet', 'sleep', 'stress', 'anxiety', 'depression'],
    family: ['family', 'parent', 'father', 'mother', 'dad', 'mom', 'brother', 'sister', 'sibling', 'child', 'son', 'daughter', 'grandparent', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin', 'niece', 'nephew'],
    relationships: ['relationship', 'friend', 'girlfriend', 'boyfriend', 'partner', 'spouse', 'husband', 'wife', 'date', 'dating', 'marriage', 'wedding', 'divorce', 'love', 'breakup'],
    hobbies: ['hobby', 'interest', 'game', 'sport', 'book', 'movie', 'music', 'art', 'travel', 'cook', 'cooking', 'photography', 'garden', 'gardening', 'fishing', 'hiking', 'camping', 'painting', 'drawing', 'craft'],
    education: ['school', 'college', 'university', 'class', 'course', 'degree', 'study', 'student', 'professor', 'teacher', 'exam', 'test', 'grade', 'education', 'learn', 'learning', 'homework', 'assignment'],
    technology: ['technology', 'computer', 'phone', 'laptop', 'app', 'software', 'hardware', 'internet', 'website', 'code', 'programming', 'data', 'tech', 'digital', 'device', 'gadget'],
    finance: ['money', 'finance', 'financial', 'bank', 'invest', 'investment', 'save', 'savings', 'spend', 'spending', 'budget', 'debt', 'loan', 'mortgage', 'rent', 'tax', 'taxes', 'income', 'expense', 'expenses'],
    travel: ['travel', 'trip', 'vacation', 'holiday', 'flight', 'hotel', 'city', 'country', 'destination', 'tour', 'tourist', 'passport', 'journey', 'visit', 'beach', 'mountain', 'hiking'],
    food: ['food', 'eat', 'eating', 'restaurant', 'meal', 'breakfast', 'lunch', 'dinner', 'snack', 'cook', 'cooking', 'recipe', 'ingredient', 'dish', 'taste', 'flavor', 'cuisine', 'diet'],
    housing: ['house', 'home', 'apartment', 'flat', 'rent', 'mortgage', 'room', 'living', 'move', 'moving', 'roommate', 'neighbor', 'neighborhood', 'furniture', 'decorate', 'decoration', 'renovation'],
    entertainment: ['movie', 'film', 'tv', 'television', 'show', 'series', 'book', 'novel', 'read', 'reading', 'music', 'song', 'concert', 'game', 'gaming', 'video game', 'play', 'stream', 'streaming'],
    personal: ['feel', 'feeling', 'emotion', 'happy', 'sad', 'angry', 'excited', 'worried', 'stress', 'stressed', 'anxious', 'depressed', 'lonely', 'tired', 'exhausted', 'overwhelmed', 'confident', 'proud', 'guilty', 'shame'],
    future: ['future', 'plan', 'planning', 'goal', 'dream', 'aspiration', 'hope', 'change', 'decision', 'choice', 'opportunity', 'challenge', 'obstacle', 'problem', 'solution']
};

// Topic extraction - Extract main topics from a message
function extractTopicsFromMessage(message) {
    if (!message) return [];
    
    // Lowercase for easier matching
    const lowercaseMessage = message.toLowerCase();
    
    // Track matched topics and their score
    const topicScores = {};
    
    // Check for each topic's keywords in the message
    for (const [topic, keywords] of Object.entries(commonTopics)) {
        topicScores[topic] = 0;
        
        for (const keyword of keywords) {
            // Check if the keyword is in the message as a whole word
            // This uses word boundary checks to avoid partial matches
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(lowercaseMessage)) {
                topicScores[topic] += 1;
            }
        }
    }
    
    // Filter to topics that had at least one keyword match
    const matchedTopics = Object.entries(topicScores)
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1]) // Sort by score, highest first
        .map(([topic]) => topic);
    
    // Return top 3 topics, or fewer if less than 3 were matched
    return matchedTopics.slice(0, 3);
}

// Tier 1: User Facts Database - Pattern definitions for fact extraction
const userFactPatterns = {
    job: [
        /(?:I|me|my)\s+(?:work|job)\s+(?:as|is|at)\s+(?:an?\s+)?([^,.]+)/i,
        /(?:I|me|my)\s+(?:am|be)\s+(?:an?\s+)?([^,.]+?)\s+(?:by\s+profession|by\s+trade|for\s+(?:a\s+)?living|for\s+work)/i,
        /(?:I|me|my)\s+(?:profession|occupation|career)\s+(?:is|as)\s+(?:an?\s+)?([^,.]+)/i
    ],
    location: [
        /(?:I|me|my)\s+(?:live|stay|reside)\s+in\s+([^,.]+)/i,
        /(?:I|me|my)\s+(?:am|be)\s+from\s+([^,.]+)/i,
        /(?:I|me|my)\s+(?:home|house|apartment|flat)\s+(?:is|in)\s+([^,.]+)/i
    ],
    interests: [
        /(?:I|me|my)\s+(?:like|love|enjoy|interested in)\s+([^,.]+)/i,
        /(?:I|me|my)\s+(?:hobby|hobbies|passion|pastime)\s+(?:is|are|be)\s+([^,.]+)/i,
        /(?:I|me|my)\s+(?:favorite|fav)\s+(?:thing|activity|pastime)\s+(?:is|be)\s+([^,.]+)/i
    ],
    family: [
        /(?:my|I have a)\s+(?:wife|husband|spouse|partner|girlfriend|boyfriend|son|daughter|child|children|kid|kids|mom|mother|dad|father|parents|sibling|brother|sister)\s+(?:named|called)?\s+(?:is|are)?\s*([^,.]+)?/i,
        /([^,.]+)\s+(?:is|are)\s+my\s+(?:wife|husband|spouse|partner|girlfriend|boyfriend|son|daughter|child|kid|mom|mother|dad|father|parents|sibling|brother|sister)/i
    ],
    pets: [
        /(?:my|I have a)\s+(?:pet|dog|cat|bird|hamster|rabbit|fish)\s+(?:named|called)?\s+(?:is)?\s*([^,.]+)?/i,
        /([^,.]+)\s+(?:is|be)\s+my\s+(?:pet|dog|cat|bird|hamster|rabbit|fish)/i
    ],
    preferences: [
        /(?:I|me|my)\s+(?:prefer|like|love|enjoy|hate|dislike|avoid)\s+([^,.]+)/i,
        /(?:I|me|my)\s+(?:favorite|fav)\s+([^,.]+?)\s+(?:is|be)\s+([^,.]+)/i,
        /([^,.]+)\s+(?:is|are|be)\s+my\s+(?:favorite|fav)/i
    ]
};

// Tier 3: Topic-based Memory - Pattern definitions for memory queries
const memoryQueryPatterns = [
    /(?:do\s+you\s+)?(?:remember|recall|know)\s+(?:when|what|how|where|why|who|if|that|about|our|my|the)\s+([^?]+)/i,
    /(?:what|who|where|when|how)\s+(?:did|do|does|is|was|were)\s+(?:I|we|my|you|us|our)\s+([^?]+?)(?:\s+again|\s+before)?/i,
    /(?:tell|ask|talk)\s+(?:to|with)?\s+(?:me|us|you)\s+(?:again|more)?\s+(?:about|regarding|concerning|on)\s+([^?]+)/i,
    /(?:have\s+I|did\s+I|I've)\s+(?:ever|already|previously|before)\s+(?:told|mentioned|said|talked|spoke|discussed)\s+(?:to\s+you)?\s+(?:about|regarding|concerning|on)\s+([^?]+)/i,
    /(?:have|has|did)\s+(?:we|you|I)\s+(?:ever|already|previously|before)\s+(?:discussed|talked|spoken|had\s+a\s+conversation)\s+(?:about|regarding|concerning|on)\s+([^?]+)/i
];

// Convert Firebase messages to conversation format for API context (Tier 2: Short-term Memory)
async function getConversationHistory() {
    const db = getDb();
    if (!db) {
        console.error("Firebase not initialized for conversation history");
        return [];
    }
    
    try {
        // Try to get messages from current conversation first
        const { getCurrentConversation } = await import('./firebaseLogic.js');
        const conversationId = await getCurrentConversation();
        
        if (conversationId) {
            const conversationDoc = await db.collection("conversations")
                .doc(conversationId)
                .get();
            
            if (conversationDoc.exists) {
                const data = conversationDoc.data();
                if (data.messages && data.messages.length > 0) {
                    // Messages are already in the correct format
                    const messages = data.messages.slice(-40); // Get last 40 messages (20 pairs)
                    
                    // Extract user facts from user messages
                    for (const msg of messages) {
                        if (msg.role === "user") {
                            await extractAndStoreUserFacts(msg.content);
                        }
                    }
                    
                    console.log("Added conversation context from current conversation:", messages.length/2, "exchanges");
                    return messages;
                }
            }
        }
        
        // Fallback to old messages collection
        const snapshot = await db.collection("messages")
            .orderBy("timestamp", "desc")
            .limit(20)
            .get();
        
        if (snapshot.empty) {
            console.log("No previous messages found for context");
            return [];
        }
        
        // Convert to proper conversation format - reversed to get chronological order
        const messagesArray = [];
        const docs = snapshot.docs.reverse();
        
        for (const doc of docs) {
            const data = doc.data();
            // Add user message
            messagesArray.push({
                role: "user",
                content: data.user
            });
            
            // Add Freya's response
            messagesArray.push({
                role: "assistant",
                content: data.freya
            });
            
            // Extract and store user facts from this message (Tier 1)
            await extractAndStoreUserFacts(data.user);
        }
        
        console.log("Added conversation context from legacy storage:", messagesArray.length/2, "exchanges");
        return messagesArray;
    } catch (error) {
        console.error("Error getting conversation history:", error);
        return []; // Return empty array on error
    }
}

// Tier 1: User Facts Database - Extract and store user facts from message
async function extractAndStoreUserFacts(userMessage) {
    const db = getDb();
    if (!db || !userMessage) return;
    
    try {
        // Loop through each fact type and its associated patterns
        for (const [factType, patterns] of Object.entries(userFactPatterns)) {
            // Try each pattern for this fact type
            for (const pattern of patterns) {
                const match = userMessage.match(pattern);
                
                // If we found a match and it has a capture group
                if (match && match[1]) {
                    const factValue = match[1].trim();
                    
                    // Skip very short or likely meaningless facts
                    if (factValue.length < 3 || /^(a|an|the|this|that|these|those|it|its)$/i.test(factValue)) {
                        continue;
                    }
                    
                    // Create a unique ID based on fact type and value to prevent duplicates
                    const factId = `${factType}_${factValue.toLowerCase().replace(/\s+/g, '_')}`;
                    
                    // Store the fact in Firebase
                    await db.collection("userFacts").doc(factId).set({
                        type: factType,
                        value: factValue,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true }); // Use merge to update existing facts if they exist
                    
                    console.log(`Stored user fact: ${factType} - ${factValue}`);
                }
            }
        }
    } catch (error) {
        console.error("Error extracting user facts:", error);
    }
}

// Tier 1: User Facts Database - Retrieve facts for context
async function getUserFacts() {
    const db = getDb();
    if (!db) {
        console.error("Firebase not initialized for user facts");
        return [];
    }
    
    try {
        const snapshot = await db.collection("userFacts")
            .orderBy("timestamp", "desc")
            .limit(15) // Limit to most recent/important facts
            .get();
        
        if (snapshot.empty) {
            console.log("No user facts found");
            return [];
        }
        
        const facts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            facts.push({
                type: data.type,
                value: data.value
            });
        });
        
        console.log("Retrieved user facts:", facts.length);
        return facts;
    } catch (error) {
        console.error("Error getting user facts:", error);
        return [];
    }
}

// Tier 3: Topic-based Memory - Detect if user is asking about memories
function isMemoryQuery(userMessage) {
    for (const pattern of memoryQueryPatterns) {
        if (pattern.test(userMessage)) {
            return true;
        }
    }
    return false;
}

// Tier 3: Topic-based Memory - Extract topic from memory query
function extractTopicFromQuery(userMessage) {
    // Try each memory query pattern
    for (const pattern of memoryQueryPatterns) {
        const match = userMessage.match(pattern);
        if (match && match[1]) {
            return match[1].trim().toLowerCase();
        }
    }
    
    // Fallback to basic extraction if patterns don't match
    return userMessage
        .toLowerCase()
        .replace(/^(?:do you remember|what do you know about|tell me about|have we talked about)\s+/i, '')
        .replace(/[?,!.]/g, '')
        .trim();
}

// Tier 3: Topic-based Memory - Search for relevant past conversations
async function searchConversationHistory(topic) {
    const db = getDb();
    if (!db || !topic) {
        console.error("Firebase not initialized or no topic provided");
        return [];
    }
    
    try {
        // Create search terms from the topic
        const searchTerms = topic
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !/^(and|the|but|or|a|an|in|on|at|to|for|with|about|from)$/i.test(word));
        
        // Try searching in current conversation first
        const { getCurrentConversation } = await import('./firebaseLogic.js');
        const conversationId = await getCurrentConversation();
        let results = [];
        
        if (conversationId) {
            const conversationDoc = await db.collection("conversations")
                .doc(conversationId)
                .get();
            
            if (conversationDoc.exists) {
                const data = conversationDoc.data();
                if (data.messages && data.messages.length > 0) {
                    // Score each message pair
                    for (let i = 0; i < data.messages.length - 1; i += 2) {
                        const userMsg = data.messages[i];
                        const freyaMsg = data.messages[i + 1];
                        
                        if (userMsg && freyaMsg) {
                            const combinedText = (userMsg.content + " " + freyaMsg.content).toLowerCase();
                            let score = 0;
                            
                            // Score based on term matches
                            for (const term of searchTerms) {
                                if (combinedText.includes(term)) {
                                    const regex = new RegExp(term, 'gi');
                                    const count = (combinedText.match(regex) || []).length;
                                    score += count;
                                }
                            }
                            
                            if (score > 0) {
                                results.push({
                                    messages: [userMsg, freyaMsg],
                                    score: score
                                });
                            }
                        }
                    }
                }
            }
        }
        
        // Also search in legacy messages
        const snapshot = await db.collection("messages")
            .orderBy("timestamp", "desc")
            .limit(200)
            .get();
        
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                const data = doc.data();
                let score = 0;
                
                const combinedText = (data.user + " " + data.freya).toLowerCase();
                
                for (const term of searchTerms) {
                    if (combinedText.includes(term)) {
                        const regex = new RegExp(term, 'gi');
                        const count = (combinedText.match(regex) || []).length;
                        score += count;
                    }
                }
                
                if (score > 0) {
                    results.push({
                        messages: [
                            { role: "user", content: data.user, timestamp: data.timestamp },
                            { role: "assistant", content: data.freya, timestamp: data.timestamp }
                        ],
                        score: score
                    });
                }
            });
        }
        
        // Sort by relevance score (highest first)
        results.sort((a, b) => b.score - a.score);
        
        // Take top 5 results and flatten the messages array
        const topMessages = results
            .slice(0, 5)
            .flatMap(result => result.messages);
        
        console.log(`Found ${topMessages.length/2} relevant past conversations for topic: ${topic}`);
        return topMessages;
    } catch (error) {
        console.error("Error searching conversation history:", error);
        return [];
    }
}

// Find relevant facts for a list of topics
async function findRelevantFacts(topics) {
    const db = getDb();
    if (!db || !topics || topics.length === 0) {
        return [];
    }
    
    // Get all user facts
    const userFacts = await getUserFacts();
    if (userFacts.length === 0) {
        return [];
    }
    
    // Score each fact's relevance to the topics
    const scoredFacts = userFacts.map(fact => {
        let relevanceScore = 0;
        
        // Check if the fact type relates to any topic
        for (const topic of topics) {
            // Direct type matches (e.g., if topic is "work" and fact type is "job")
            const relatedTypes = {
                work: ['job'],
                health: ['health'],
                family: ['family'],
                relationships: ['family', 'relationships'],
                hobbies: ['interests', 'preferences', 'hobbies'],
                education: ['education'],
                technology: ['technology'],
                finance: ['finance'],
                travel: ['travel', 'location'],
                food: ['food', 'preferences'],
                housing: ['location', 'housing'],
                entertainment: ['interests', 'preferences', 'entertainment'],
                personal: ['preferences', 'personal'],
                pets: ['pets']
            };
            
            // Check for type relationship
            if (relatedTypes[topic] && relatedTypes[topic].includes(fact.type)) {
                relevanceScore += 3; // Strong relevance for type match
            }
            
            // Check if the fact value contains any topic keywords
            if (commonTopics[topic]) {
                for (const keyword of commonTopics[topic]) {
                    if (fact.value.toLowerCase().includes(keyword.toLowerCase())) {
                        relevanceScore += 2; // Moderate relevance for content match
                    }
                }
            }
        }
        
        return {
            ...fact,
            relevanceScore
        };
    });
    
    // Filter to relevant facts and sort by relevance
    return scoredFacts
        .filter(fact => fact.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10) // Limit to top 10 most relevant facts
        .map(({ type, value }) => ({ type, value })); // Remove the score property
}

// Find relevant past conversations for non-memory queries
async function findRelevantConversations(topics) {
    const db = getDb();
    if (!db || !topics || topics.length === 0) {
        return [];
    }
    
    try {
        // Create keywords from topics
        const keywords = [];
        for (const topic of topics) {
            if (commonTopics[topic]) {
                // Take the top 5 most relevant keywords from each topic
                keywords.push(...commonTopics[topic].slice(0, 5));
            }
        }
        
        let results = [];
        
        // Try searching in current conversation first
        const { getCurrentConversation } = await import('./firebaseLogic.js');
        const conversationId = await getCurrentConversation();
        
        if (conversationId) {
            const conversationDoc = await db.collection("conversations")
                .doc(conversationId)
                .get();
            
            if (conversationDoc.exists) {
                const data = conversationDoc.data();
                if (data.messages && data.messages.length > 0) {
                    // Score each message pair
                    for (let i = 0; i < data.messages.length - 1; i += 2) {
                        const userMsg = data.messages[i];
                        const freyaMsg = data.messages[i + 1];
                        
                        if (userMsg && freyaMsg) {
                            const combinedText = (userMsg.content + " " + freyaMsg.content).toLowerCase();
                            let score = 0;
                            
                            // Score based on keyword matches
                            for (const keyword of keywords) {
                                if (combinedText.includes(keyword.toLowerCase())) {
                                    const regex = new RegExp(keyword, 'gi');
                                    const count = (combinedText.match(regex) || []).length;
                                    score += count;
                                }
                            }
                            
                            if (score > 0) {
                                results.push({
                                    messages: [userMsg, freyaMsg],
                                    score: score
                                });
                            }
                        }
                    }
                }
            }
        }
        
        // Also search in legacy messages
        const snapshot = await db.collection("messages")
            .orderBy("timestamp", "desc")
            .limit(100)
            .get();
        
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                const data = doc.data();
                let score = 0;
                
                const combinedText = (data.user + " " + data.freya).toLowerCase();
                
                // Score based on keyword matches
                for (const keyword of keywords) {
                    if (combinedText.includes(keyword.toLowerCase())) {
                        const regex = new RegExp(keyword, 'gi');
                        const count = (combinedText.match(regex) || []).length;
                        score += count;
                    }
                }
                
                if (score > 0) {
                    results.push({
                        messages: [
                            { role: "user", content: data.user, timestamp: data.timestamp },
                            { role: "assistant", content: data.freya, timestamp: data.timestamp }
                        ],
                        score: score
                    });
                }
            });
        }
        
        // Sort by relevance score (highest first)
        results.sort((a, b) => b.score - a.score);
        
        // Take top 5 results and flatten the messages array
        const topMessages = results
            .slice(0, 5)
            .flatMap(result => result.messages);
        
        console.log(`Found ${topMessages.length/2} relevant conversations for topics: ${topics.join(", ")}`);
        return topMessages;
    } catch (error) {
        console.error("Error finding relevant conversations:", error);
        return [];
    }
}

// Enhanced memory context builder
async function buildMemoryContext(userMessage) {
    // Initialize context with system message
    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        }
    ];
    
    // Add memory instruction for natural recall
    messages.push({
        role: "system",
        content: `MEMORY GUIDELINES:
- You have access to facts about the user and relevant past conversations
- Naturally reference these memories in your responses when relevant
- Don't explicitly mention "According to my memory" or "As I recall" - just incorporate the information naturally
- If you don't have information about something, don't make it up - just admit you don't know
- When referencing past facts, do so in a casual, conversational way as a friend would`
    });
    
    // Tier 2: Add recent conversation history
    const recentHistory = await getConversationHistory();
    if (recentHistory.length > 0) {
        messages.push(...recentHistory);
    }
    
    // Extract topics from current user message
    const topics = extractTopicsFromMessage(userMessage);
    console.log("Extracted topics from message:", topics);
    
    // Handle different paths based on message type
    if (isMemoryQuery(userMessage)) {
        // MEMORY QUERY PATH
        console.log("Memory query detected");
        const topic = extractTopicFromQuery(userMessage);
        console.log("Extracted memory topic:", topic);
        
        // Add memory search results
        const relevantHistory = await searchConversationHistory(topic);
        
        if (relevantHistory.length > 0) {
            // Add a separator to distinguish memory search results
            messages.push({
                role: "system",
                content: `Related past conversations about "${topic}" are included below. If these don't answer the user's question, be honest and say you don't recall that information.`
            });
            
            // Add the relevant history
            messages.push(...relevantHistory);
        } else {
            // Add guidance when no relevant history found
            messages.push({
                role: "system",
                content: `No past conversations about "${topic}" were found in memory. Be honest and tell the user you don't recall discussing this topic before.`
            });
        }
    } else if (topics.length > 0) {
        // SMART RECALL PATH FOR REGULAR MESSAGES
        // Find facts related to the current topics
        const relevantFacts = await findRelevantFacts(topics);
        
        // Find conversations related to the current topics
        const relevantConversations = await findRelevantConversations(topics);
        
        if (relevantFacts.length > 0) {
            // Format relevant facts into a structured message
            let factsMessage = "Relevant facts about the user that relate to the current topic:";
            
            // Group facts by type
            const factsByType = {};
            for (const fact of relevantFacts) {
                if (!factsByType[fact.type]) {
                    factsByType[fact.type] = [];
                }
                factsByType[fact.type].push(fact.value);
            }
            
            // Add each type with its values
            for (const [type, values] of Object.entries(factsByType)) {
                factsMessage += `\n- ${type}: ${values.join(", ")}`;
            }
            
            // Add the facts to context
            messages.push({
                role: "system",
                content: factsMessage
            });
        }
        
        if (relevantConversations.length > 0) {
            const topicsString = topics.join(", ");
            messages.push({
                role: "system",
                content: `The following are relevant past conversations about ${topicsString}. Reference this information naturally in your response where appropriate:`
            });
            
            // Add relevant conversations
            messages.push(...relevantConversations);
        }
    }
    
    // Tier 1: Add ALL user facts if we haven't already added relevant ones
    // This ensures we always have access to important facts regardless of immediate relevance
    const allUserFacts = await getUserFacts();
    if (allUserFacts.length > 0) {
        // Format facts into a structured message
        let factsMessage = "All known facts about the user:";
        
        // Group facts by type
        const factsByType = {};
        for (const fact of allUserFacts) {
            if (!factsByType[fact.type]) {
                factsByType[fact.type] = [];
            }
            factsByType[fact.type].push(fact.value);
        }
        
        // Add each type with its values
        for (const [type, values] of Object.entries(factsByType)) {
            factsMessage += `\n- ${type}: ${values.join(", ")}`;
        }
        
        // Add the facts to context
        messages.push({
            role: "system",
            content: factsMessage
        });
    }
    
    // Add current user message
    messages.push({
        role: "user",
        content: userMessage
    });
    
    return messages;
}

// Export memory-related functions
export {
    extractTopicsFromMessage,
    isMemoryQuery,
    extractTopicFromQuery,
    getConversationHistory,
    extractAndStoreUserFacts,
    getUserFacts,
    searchConversationHistory,
    findRelevantFacts,
    findRelevantConversations,
    buildMemoryContext
};
