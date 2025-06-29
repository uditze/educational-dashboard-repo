// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBerLhnW4G-ZUfwX6-h7YcMJpWIEU9hYSw",
  authDomain: "educational-bot-template.firebaseapp.com",
  projectId: "educational-bot-template",
  storageBucket: "educational-bot-template.appspot.com",
  messagingSenderId: "1098501020645",
  appId: "1:1098501020645:web:27c0e21be167c40dfc6d0c",
  measurementId: "G-5DRJVHCNYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements from view.html
const chatContainer = document.getElementById('chat-container');
const idPlaceholder = document.getElementById('conversation-id-placeholder');

// Function to add a message bubble to the page
function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    // The CSS classes 'message', 'user-message', and 'ai-message' come from view-style.css
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    // Use innerHTML to correctly render line breaks from the AI
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatContainer.appendChild(messageDiv);
}

// Main function to load a single conversation
async function loadConversation() {
    // 1. Get the conversation ID from the URL (e.g., ?id=XXXXX)
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('id');

    if (!conversationId) {
        chatContainer.innerHTML = '<p>שגיאה: לא סופק מזהה שיחה בכתובת ה-URL.</p>';
        if(idPlaceholder) idPlaceholder.textContent = 'לא ידוע';
        return;
    }

    if(idPlaceholder) idPlaceholder.textContent = conversationId;

    try {
        // 2. Create a reference to the specific document in the 'conversations' collection
        const docRef = doc(db, 'conversations', conversationId);
        
        // 3. Fetch the document data from Firestore
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const conversation = docSnap.data();
            const messages = conversation.messages || [];

            // 4. Clear any existing content and display the messages from the conversation
            chatContainer.innerHTML = '';
            messages.forEach(message => {
                // We show messages from 'user' and 'assistant' (the AI)
                if (message.role === 'user' || message.role === 'assistant') {
                    displayMessage(message.content, message.role);
                }
            });
            // Scroll to the bottom of the chat to show the latest messages
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            chatContainer.innerHTML = `<p>שגיאה: לא נמצאה שיחה עם המזהה ${conversationId}.</p>`;
        }
    } catch (error) {
        console.error("Error loading single conversation:", error);
        chatContainer.innerHTML = '<p>אירעה שגיאה בטעינת השיחה. בדוק את מסוף המפתחים (F12) לקבלת פרטים נוספים.</p>';
    }
}

// Run the main function when the page loads
document.addEventListener('DOMContentLoaded', loadConversation);
