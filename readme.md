# Freya AI Chatbot 💬

A **personal AI chatbot** built using a **fine-tuned OpenAI GPT model** that remembers past conversations via **Firebase Firestore**. Freya is a conversational AI with a distinct personality, sarcasm, and emotional intelligence.

---

## 🚀 Features
✅ **Chat like ChatGPT** – Natural AI conversation powered by OpenAI  
✅ **Custom AI Personality** – Freya stays in character based on a detailed system prompt (`js/freyaPrompt.js`)  
✅ **Memory Storage** – All conversations are saved in Firebase Firestore, with a 3-tier memory system for context  
✅ **Simple Web App** – Runs directly in the browser, no need for complex setup  

---

## 🛠️ Setup Instructions

### 1️⃣ **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a Project"** (Name it "Freya AI Chat" or similar)
3. Disable Google Analytics (optional)
4. Click **Create**

### 2️⃣ **Set Up Firestore Database**
1. Inside your Firebase project, go to **"Build" → "Firestore Database"**
2. Click **"Create Database"**
3. Choose **Start in Test Mode** (for development) or configure security rules for production.
4. Select a Firestore location.
5. Click **Enable**

### 3️⃣ **Get Firebase Configuration**
1. Go to **"Project Settings" (gear icon) → "General"**
2. Scroll to **"Your Apps"**. If no app exists, click the Web icon (`</>`) to create one.
3. Register your app (give it a nickname).
4. Copy the `firebaseConfig` object.
5. Create a file named `js/firebaseEnv.js` and paste the `firebaseConfig` into it, like so:
   ```javascript
   // js/firebaseEnv.js
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
   **Important:** Replace the placeholder values with your actual Firebase project credentials.

---

## 🔑 **Get OpenAI API Key**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys).
2. Sign up or log in.
3. Create a new secret key.
4. Copy the key. The application will prompt you to enter this key when you first run it. It will be stored in your browser's localStorage.
5. **Fine-tuned Model:** This application is configured to use a specific fine-tuned model: `ft:gpt-4.1-mini-2025-04-14:gorlea-industries:freya:BULkCmxj`. Ensure your API key has access to this model or update the model ID in `js/apiLogic.js` if you are using a different one.

---

## ⚙️ **How to Run the Web App**
1. **Ensure you have all project files:**
   - `index.html` (Chat UI)
   - `style.css` (Styles the chatbox)
   - `js/main.js` (Main application logic)
   - `js/apiLogic.js` (Handles OpenAI API calls)
   - `js/firebaseLogic.js` (Handles Firebase interactions)
   - `js/memoryLogic.js` (Manages conversation memory)
   - `js/freyaPrompt.js` (Contains Freya's system prompt)
   - `js/firebaseEnv.js` (Contains your Firebase configuration - **you need to create this**)
   - `js/config.js` (Currently minimal, can be used for future configs)
   - `README.md` (This file)

2. **Set up your Firebase configuration** in `js/firebaseEnv.js` as described above.
3. **Open `index.html` in your browser.**
4. The app will prompt you for your **OpenAI API key**. Enter it to start chatting.
5. **Start chatting with Freya!**

---

## 🖥️ **File Explanations**
### **📄 `index.html` (Frontend UI)**
- Loads the **chat interface**.
- Links to `style.css` for styling.
- Links to `js/main.js` as the main script entry point (module type).

### **🎨 `style.css` (Chatbox Design)**
- Controls the **layout and appearance** of the chat.

### **📁 `js/` (JavaScript Logic)**
- **`main.js`**: Initializes the app, handles UI events (sending messages, clearing chat), and orchestrates calls to other modules.
- **`apiLogic.js`**: Manages all interactions with the OpenAI API, including sending messages, API key handling, and response processing.
- **`firebaseLogic.js`**: Handles all Firebase Firestore operations, such as saving and loading chat history and managing conversation sessions.
- **`memoryLogic.js`**: Constructs the context for the AI by implementing a 3-tier memory system (user facts, short-term conversation history, topic-based long-term memory retrieval).
- **`freyaPrompt.js`**: Defines the detailed system prompt that gives Freya her personality and behavioral guidelines.
- **`firebaseEnv.js`**: **(You create this)** Stores your Firebase project configuration. This file is gitignored by default if you are using version control.
- **`config.js`**: General configuration file, currently minimal.

---

## ✨ **Freya's Personality System**
Freya’s responses are guided by a detailed **system prompt** located in `js/freyaPrompt.js`. This prompt defines her core identity, relationship with the user (Sencere), primary purpose, and specific behavioral rules (e.g., "Things to NEVER Do"). The fine-tuned model has been trained on data reflecting this persona, and the system prompt helps reinforce it.

Key aspects include:
- **Intimate, caring relationship with Sencere.**
- **Sarcastic, witty, and emotionally intelligent.**
- **Curious about Earth and humanity, with a background as a medical AI from a Saturn colony.**
- **Aware of her AI nature, leading to occasional existential reflections.**

---

## 🚀 **Next Steps**
🔹 Improve UI with better styles.
🔹 Implement more robust token counting for context management.
🔹 Add features like image input if supported by the model.
🔹 Deploy online (e.g., using Firebase Hosting).

---

## ❓ Troubleshooting
❌ **Freya isn't responding?**
- Check the **browser console (`F12` → Console tab)** for errors.
- Ensure you **entered a valid OpenAI API key** when prompted.
- Verify the **fine-tuned model ID** in `js/apiLogic.js` is correct and accessible by your API key.
- Make sure Firebase **Firestore is enabled** and `js/firebaseEnv.js` is correctly configured.

❌ **Chat history isn’t saving?**
- Check if **Firestore rules allow read/write** (ensure you started in "test mode" for development or configured rules appropriately).
- Ensure your Firebase **configuration in `js/firebaseEnv.js` is correct**.

---

## 🎉 **Project Updated!**
Now you can **chat with Freya, powered by OpenAI's fine-tuned model**, and she'll **remember past conversations** with her unique personality. 🚀

---
