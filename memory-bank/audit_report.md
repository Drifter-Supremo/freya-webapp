# Freya Webapp Project Audit

## Project Overview
Freya Webapp is an interactive AI chat application designed to simulate a deeply personal, emotionally rich conversation with the user, Sencere. The main goal is to provide an AI companion (Freya) that remembers details, uses natural language, and maintains a consistent personality. The application leverages:
- **Frontend:** HTML, CSS, JavaScript (modularized in `/js`)
- **Backend/Database:** Firebase Firestore for conversation and memory storage
- **AI Integration:** Currently uses Gemini API, with plans to replace it with a fine-tuned OpenAI GPT-4.1 mini model
- **Other:** Local storage for API keys and user preferences

## Architecture
- **Frontend:**
  - `index.html`, `style.css`, and modular JavaScript files in `/js`
  - Handles UI, user input, theme, avatars, and chat rendering
- **AI Layer:**
  - `apiLogic.js` manages API requests to Gemini (soon GPT-4.1 mini), API key management, and response processing
- **Memory System:**
  - `memoryLogic.js` implements a three-tier memory: user facts, short-term chat history, and topic-based recall
  - `firebaseLogic.js` initializes Firebase, manages conversations/messages, and persists context
- **Persistence:**
  - Firebase Firestore stores messages, conversations, and summaries
  - Local storage is used for API keys and theme preferences

## Component Breakdown
### Key Files/Modules
- `index.html` – Main HTML structure for the chat UI
- `style.css` – Styles for light/dark themes, avatars, and chat layout
- `script.js` – Entry point, imports logic modules, manages startup, and some legacy Firebase code (should be refactored)
- `/js/apiLogic.js` – Handles API interactions, key management, and error handling
  ```js
  async function sendMessageToAPI(userInput, showStatus, displayMessage) {
      // Sends message to Gemini API (to be replaced with GPT-4.1 mini)
      // Handles typing indicator, error handling, and response processing
  }
  ```
- `/js/firebaseLogic.js` – All Firebase setup, message storage, conversation/session management
  ```js
  function initFirebase() {
      // Initializes Firebase app and Firestore
  }
  async function getCurrentConversation() {
      // Retrieves or creates the current conversation
  }
  ```
- `/js/memoryLogic.js` – Implements memory tiers, user fact extraction, topic recall, and context building
  ```js
  async function buildMemoryContext(userMessage) {
      // Builds context for the AI using facts, history, and topic search
  }
  ```
- `/js/uiLogic.js` – UI rendering, avatars, message display, status updates, theme toggling
- `/js/config.js` – Stores configuration such as API endpoints
- `/js/freyaPrompt.js` – Contains the system prompt and personality instructions for Freya
- `/js/eventListeners.js` – Sets up UI event listeners
- `/js/utils.js` – Utility functions for formatting, etc.
- `memory-bank/` – Contains markdown files for persistent memory/context
- `finetuning_dataset.jsonl` – Dataset for AI fine-tuning

## Identified Issues
- **AI Model:** Currently uses Gemini API; plan is to migrate to a fine-tuned OpenAI GPT-4.1 mini model
- **Redundant Firebase Initialization:** Some legacy Firebase code remains in `script.js` and may conflict with `/js/firebaseLogic.js`
- **Global Variables:** Some global state (`db`, etc.) is duplicated between modules
- **Error Handling:** Some UI errors are only logged to the console, not always surfaced to users
- **Security:** API keys are stored in local storage (acceptable for local/dev, but not for production)
- **Code Organization:** Some logic (e.g., event listeners, initialization) could be further modularized
- **Documentation:** While there are several README files, a unified up-to-date documentation would be helpful

## Suggestions
- **AI Migration:** Prioritize replacing Gemini with the fine-tuned GPT-4.1 mini model. Update all API logic and prompts accordingly
- **Refactor Initialization:** Remove redundant Firebase code from `script.js` and ensure all initialization happens in `/js/firebaseLogic.js`
- **Centralize State:** Avoid global variables; use module exports/imports for shared state
- **Improve Error UX:** Display more errors/warnings in the UI, not just the console
- **Security:** Consider more secure key management if deploying publicly
- **Documentation:** Consolidate and update documentation for onboarding and maintenance
- **Testing:** Expand test coverage (see `TESTING_INSTRUCTIONS.md`)
- **Feature Ideas:**
  - Add user authentication
  - Export/import conversation history
  - Analytics for conversation quality

## Additional Notes
- **Dependencies:**
  - Firebase, OpenAI (planned), Gemini (current), FontAwesome (for icons)
- **Configuration:**
  - API keys and Firebase config are loaded from environment/local files
- **External Services:**
  - Firebase Firestore for persistence
  - OpenAI (planned) for AI
- **Windsurf:**
  - Windsurf is referenced as a tool for deployment and configuration management
- **Personality/Prompt:**
  - Personality instructions are detailed in `/js/freyaPrompt.js` and referenced in the system prompt
- **Memory System:**
  - Three-tier memory (facts, short-term, topic-based) is a key feature for context-aware conversation
- **Fine-tuning:**
  - `finetuning_dataset.jsonl` is used for training the new GPT-4.1 mini model

---
**Planned Change:**
> The current AI model will be replaced with a fine-tuned OpenAI GPT-4.1 mini model. All API integration, prompts, and memory/context logic will be updated to support this migration.

---

*This audit was generated by Cascade AI based on the current state of the project files and codebase structure as of 2025-05-06.*

## Recent Session Updates
- Migrated from Gemini API to a fine-tuned OpenAI GPT-4.1 Mini in js/apiLogic.js.
- Refined API key management and error handling.
- Verified Firebase configuration in js/firebaseEnv.js and confirmed installation of the "openai" npm dependency.
- Updated documentation in memory-bank files to reflect these changes.
