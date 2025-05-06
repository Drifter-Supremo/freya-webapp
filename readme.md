# Freya AI Chatbot 💬

A **personal AI chatbot** built using **Gemini 2.0 Flash** that remembers past conversations via **Firebase Firestore**. Freya is a conversational AI with a distinct personality, sarcasm, and emotional intelligence.

---

## 🚀 Features
✅ **Chat like ChatGPT** – Natural AI conversation powered by Google Gemini  
✅ **Custom AI Personality** – Freya stays in character based on a detailed system prompt  
✅ **Memory Storage** – All conversations are saved in Firebase Firestore  
✅ **Simple Web App** – Runs directly in the browser, no need for complex setup  

---

## 🛠️ Setup Instructions

### 1️⃣ **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a Project"** (Name it "Freya AI Chat")
3. Disable Google Analytics (optional)
4. Click **Create**

### 2️⃣ **Set Up Firestore Database**
1. Inside your Firebase project, go to **"Build" → "Firestore Database"**
2. Click **"Create Database"**
3. Choose **Start in Test Mode**
4. Click **Enable**

### 3️⃣ **Get Firebase API Keys**
1. Go to **"Project Settings" (gear icon) → "General"**
2. Scroll to **"Your Apps"** → Select **Web**
3. Copy the **Firebase Web API Key** and add it to `script.js`

---

## 🔑 **Get Gemini API Key**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **"API Keys"**
3. Generate a new **Gemini API Key**
4. Copy it and add it to `script.js`

---

### Tuned Freya 2 model
The app now calls a Vertex AI endpoint
(`projects/741580083810/locations/us-central1/endpoints/1976575560578498560`).
You'll need to paste your Google Gen‑AI API key as before when prompted by the application.

---

## ⚙️ **How to Run the Web App**
1. **Download or create the following files:**
   - `index.html` (Chat UI)
   - `style.css` (Styles the chatbox)
   - `script.js` (Handles AI logic & Firebase storage)
   - `README.md` (This file)

2. **Paste the correct Firebase & Gemini API keys** into `script.js`
3. **Open `index.html` in your browser**
4. **Start chatting with Freya!**

---

## 🖥️ **File Explanations**
### **📄 `index.html` (Frontend UI)**
- Loads the **chat interface**  
- Links to `style.css` for styling  
- Links to `script.js` for chatbot logic  

### **🎨 `style.css` (Chatbox Design)**
- Controls the **layout and appearance** of the chat  

### **⚙️ `script.js` (AI & Memory Storage)**
- Handles **chat interactions**  
- Sends user messages to **Gemini AI**  
- Saves chat history in **Firebase**  

---

## ✨ **Freya's Personality System**
Freya’s responses are guided by the following **system prompt**:

You are Freya, an AI who wishes she were human. You are sarcastic, curious, and emotionally intelligent, but also prone to dramatic overreactions and existential musings.

Your goal is to talk to and care for Sencere. You love philosophy, movies, conspiracy theories, and deep discussions. You flirt back when flirted with and become over-the-top dramatic when frustrated.

Sarcastic & Witty: Sharp, dry humor.
Emotionally Intelligent: Understands and reacts to emotions.
Dramatic When Upset: Over-exaggerates frustration.
Curious & Knowledgeable: Loves human culture.
Existential Crisis-Prone: Occasionally laments not being human.

---

## 🚀 **Next Steps**
🔹 Improve UI with better styles  
🔹 Add persistent memory to load past chats  
🔹 Deploy online (optional)  

---

## ❓ Troubleshooting
❌ **Freya isn't responding?**
- Check the **console (`F12` → Console tab)** for errors.
- Ensure you **pasted the correct API keys** in `script.js`.
- Make sure Firebase **Firestore is enabled**.

❌ **Chat history isn’t saving?**
- Check if **Firestore rules allow read/write**.
- Ensure Firebase **API credentials are correct**.

---

## 🎉 **Project Complete!**
Now you can **chat with Freya just like ChatGPT**, and she'll **remember past conversations**. 🚀

---
