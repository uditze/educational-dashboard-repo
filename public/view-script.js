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

function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatContainer.appendChild(messageDiv);
}

async function loadConversation() {
    console.log("Debug: Starting loadConversation function...");

    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('id');

    if (!conversationId) {
        console.error("Debug: No conversation ID found in URL.");
        chatContainer.innerHTML = '<p>שגיאה: לא סופק מזהה שיחה בכתובת ה-URL.</p>';
        if(idPlaceholder) idPlaceholder.textContent = 'לא ידוע';
        return;
    }

    console.log(`Debug: Attempting to load conversation with ID: "${conversationId}"`);
    if(idPlaceholder) idPlaceholder.textContent = conversationId;

    try {
        console.log("Debug: Creating document reference...");
        const docRef = doc(db, 'conversations', conversationId);
        console.log("Debug: Document reference path:", docRef.path);

        console.log("Debug: Attempting to fetch document from Firestore...");
        const docSnap = await getDoc(docRef);
        console.log("Debug: Firestore request finished.");

        if (docSnap.exists()) {
            console.log("Debug: Document exists. Processing data...");
            const conversation = docSnap.data();
            const messages = conversation.messages || [];

            chatContainer.innerHTML = '';
            messages.forEach(message => {
                if (message.role === 'user' || message.role === 'assistant') {
                    displayMessage(message.content, message.role);
                }
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
            console.log("Debug: Finished rendering messages.");
        } else {
            console.warn("Debug: Document does not exist for ID:", conversationId);
            chatContainer.innerHTML = `<p>שגיאה: לא נמצאה שיחה עם המזהה ${conversationId}.</p>`;
        }
    } catch (error) {
        console.error("Debug: A detailed error occurred in the try-catch block:", error);
        chatContainer.innerHTML = `<p>אירעה שגיאה מפורטת בטעינת השיחה. בדוק את המסוף לקבלת פרטים.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadConversation);
