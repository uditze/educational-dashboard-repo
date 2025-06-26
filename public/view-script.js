import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =================================================================================
// TODO: Replace with your actual Firebase project configuration
// =================================================================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// =================================================================================
// Application Logic
// =================================================================================

// Firebase Initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const idPlaceholder = document.getElementById('conversation-id-placeholder');

function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    // For presentation, roles 'assistant' and 'system' are both shown as 'ai-message'
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
}

async function loadConversation() {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('id'); // Using 'id' to match the link from script.js
    
    if (!conversationId) {
        chatContainer.innerHTML = '<p>שגיאה: לא סופק מזהה שיחה.</p>';
        idPlaceholder.textContent = 'לא ידוע';
        return;
    }
    
    idPlaceholder.textContent = conversationId;
    
    try {
        const docRef = doc(db, 'conversations', conversationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const conversation = docSnap.data();
            // Filter out the system message for display
            const messagesToDisplay = (conversation.messages || []).filter(msg => msg.role !== 'system');
            
            messagesToDisplay.forEach(message => {
                displayMessage(message.content, message.role);
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            chatContainer.innerHTML = '<p>שגיאה: שיחה עם מזהה זה לא נמצאה.</p>';
        }
    } catch (error) {
        console.error("Error loading single conversation:", error);
        chatContainer.innerHTML = '<p>אירעה שגיאה בטעינת השיחה.</p>';
    }
}

// Main execution
document.addEventListener('DOMContentLoaded', loadConversation);