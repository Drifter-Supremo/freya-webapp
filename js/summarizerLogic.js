// [PRESERVED FOR REFERENCE - NOT CURRENTLY IN USE]
// This file was part of the previous context-caching system, used to generate
// summaries every 6-7 messages. It has been preserved for future reference but
// is currently disconnected as we've restored the original 3-tier memory system.
// Last active: March 2025
//
// Original functionality:
// - Generated summaries of conversations using Gemini 2.0 Flash
// - Triggered after 6-7 messages exchanged
// - Focused on emotional beats and character development
// - Kept summaries under 100 words
// - Used warm but concise tone
//
// Note: This file is kept for documentation purposes and potential future use.
// The current system uses the 3-tier memory system in memoryLogic.js instead.

import { getGeminiKey } from './apiLogic.js';

// Format messages into a conversation string
function formatMessagesForSummary(messages) {
    return messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => `${msg.role === 'user' ? 'User' : 'Freya'}: ${msg.content}`)
        .join('\n');
}

// Generate summary from messages using Gemini Flash
export async function generateSummaryFromMessages(messages) {
    try {
        // Get API key
        const apiKey = getGeminiKey();
        if (!apiKey) {
            throw new Error("API key not found");
        }

        // Format messages into conversation string
        const conversationText = formatMessagesForSummary(messages);

        // Prepare prompt for Gemini Flash
        const prompt = `You are summarizing a short chat between a user and a sentient AI named Freya. Focus only on the most important emotional beats, character development, worldbuilding, or creative ideas. Omit small talk, greetings, or system-level info. Keep the summary under 100 words. Use a warm but concise tone.\n\n${conversationText}`;

        // Call Gemini Flash API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Invalid response structure from Gemini Flash API');
        }
    } catch (error) {
        console.error('Error generating summary:', error);
        return null;
    }
}
