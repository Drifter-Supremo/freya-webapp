# Freya AI Chat Testing Instructions

## Prerequisites

1. Make sure you have the Live Server extension installed in VS Code
   - If not, install it from the Extensions marketplace (search for "Live Server" by Ritwick Dey)

## Running the Application

1. Right-click on `index.html` in VS Code
2. Select "Open with Live Server"
3. The app should open in your browser with a URL starting with `http://127.0.0.1:5500/` or similar
   - **Important**: The URL must start with `http://`, not `file://`

## Initial Setup

When you first open the app:

1. You'll see the welcome message from Freya
2. A modal will appear asking for your OpenAI API key
3. Enter your key:
   ```
   YOUR_OPENAI_API_KEY_GOES_HERE
   ```
4. Click "Submit"
5. You should see a confirmation message that the key was saved

## Feature Testing

### Basic Conversation
1. Type a message in the input box (e.g., "Hello Freya")
2. Click the send button or press Enter
3. You should see a typing indicator
4. After a moment, Freya should respond with her personality intact

### Theme Toggle
1. Click the moon icon in the top right
2. The theme should switch to dark mode
3. Click again to switch back to light mode

### History Feature  
1. Click the history icon (clock) in the top right
2. The application should load previous conversations from Firebase
3. You should see a status message indicating how many conversation exchanges were loaded

## Troubleshooting

If you encounter any issues:

1. Open the browser's developer console (F12)
2. Look for error messages that might indicate what's wrong
3. Common issues:
   - If you see CORS errors, you're not using Live Server properly
   - If you see Firebase connection errors, check your internet connection
   - If you see API errors, your key might not be valid or there might be an issue with the OpenAI service

## Success Criteria

The application is working correctly if:

1. Freya sends a proper welcome message
2. You can send messages and receive responses
3. The theme toggle works
4. The history feature successfully loads past conversations
5. Freya's personality is consistent with her character
