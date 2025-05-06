# Running Freya AI Chat with Live Server

## Important: ES Modules Require a Web Server

The Freya AI Chat application now uses ES modules for better code organization. **ES modules have a security restriction that prevents them from loading when opening HTML files directly with the file:// protocol.**

## Running with Live Server

To run this application correctly:

1. In VS Code, right-click on `index.html`
2. Select "Open with Live Server"
3. The app should open in your browser with a URL like:
   - `http://127.0.0.1:5500/index.html` or similar
   - Notice the `http://` protocol instead of `file://`

## If You Don't Have Live Server

If you don't have the Live Server extension:

1. Install it from VS Code's Extensions Marketplace:
   - Search for "Live Server" by Ritwick Dey
   - Click Install
   - Reload VS Code if necessary

2. Alternative options if you don't want to use VS Code's Live Server:
   - Python: Run `python -m http.server` in the project folder
   - Node.js: Run `npx http-server` in the project folder
   - Any other local web server of your choice

## Modular Structure Benefits

The application has been refactored into a modular structure with these benefits:

1. Improved code organization with logical separation of concerns
2. Better maintainability with smaller, focused files
3. Clearer dependencies between components
4. Easier to extend with new features

## File Structure

- `js/freyaPrompt.js` - Contains Freya's system prompt
- `js/firebaseLogic.js` - Handles Firebase integration 
- `js/memoryLogic.js` - Implements the memory system
- `js/apiLogic.js` - Manages API calls and key handling
- `js/uiLogic.js` - Handles UI elements and display
- `js/eventListeners.js` - Sets up event handlers
- `js/utils.js` - Contains utility functions
- `js/main.js` - Application entry point
