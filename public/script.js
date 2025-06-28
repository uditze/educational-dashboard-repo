// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration object (using the same one from the bot project)
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

// DOM Elements
const listContainer = document.getElementById('conversations-list-container');
const loadingIndicator = document.getElementById('loading-indicator');

// Function to format Firestore Timestamps for display
function formatTimestamp(timestamp) {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        return 'זמן לא זמין';
    }
    // Convert Firestore Timestamp to JavaScript Date object
    const date = timestamp.toDate();
    // Format the date and time for the Hebrew locale
    return date.toLocaleString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Main function to load and display conversations
async function loadConversations() {
    try {
        // Create a query to get all documents from the 'conversations' collection,
        // ordered by the last update time in descending order (newest first).
        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, orderBy('lastUpdatedAt', 'desc'));

        // Execute the query
        const querySnapshot = await getDocs(q);

        // Clear the loading indicator
        if (loadingIndicator) {
            listContainer.innerHTML = '';
        }

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p>לא נמצאו שיחות שמורות במסד הנתונים.</p>';
            return;
        }

        // Loop through each conversation document
        querySnapshot.forEach(doc => {
            const conversationData = doc.data();
            const conversationId = doc.id;

            // Create the HTML elements for the conversation item
            const itemDiv = document.createElement('div');
            itemDiv.className = 'conversation-item';

            const link = document.createElement('a');
            // This link points to the view.html page, passing the unique ID of the conversation in the URL
            link.href = `view.html?id=${conversationId}`;
            link.textContent = `שיחה: ${conversationId}`;
            link.target = "_blank"; // Open in a new tab

            const dateSpan = document.createElement('span');
            dateSpan.textContent = `עודכן לאחרונה: ${formatTimestamp(conversationData.lastUpdatedAt)}`;

            // Append the elements to the container
            itemDiv.appendChild(link);
            itemDiv.appendChild(dateSpan);
            listContainer.appendChild(itemDiv);
        });

    } catch (error) {
        console.error("Error loading conversations: ", error);
        if (loadingIndicator) {
            loadingIndicator.textContent = 'אירעה שגיאה בטעינת השיחות.';
        }
        listContainer.innerHTML = '<p>אירעה שגיאה בטעינת השיחות. ודא שהבוט פעל לפחות פעם אחת ושמר שיחה, ובדוק את הגדרות האבטחה של Firestore.</p>';
    }
}

// Run the main function when the page's content has finished loading
document.addEventListener('DOMContentLoaded', loadConversations);
