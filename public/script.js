// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// --- Global State ---
let allConversations = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 6;

// --- DOM Elements ---
const totalConversationsCount = document.getElementById('total-conversations-count');
const listContainer = document.getElementById('conversations-list-container');
const loadingIndicator = document.getElementById('loading-indicator');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageInfo = document.getElementById('page-info');
const analysisQuestion = document.getElementById('analysis-question');
const analyzeBtn = document.getElementById('analyze-btn');
const analysisResponseArea = document.getElementById('analysis-response-area');

// --- Functions ---

function formatTimestamp(timestamp) {
    if (!timestamp || typeof timestamp.toDate !== 'function') { return 'זמן לא זמין'; }
    const date = timestamp.toDate();
    return date.toLocaleString('he-IL', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
}

function renderPage(page) {
    listContainer.innerHTML = '';
    currentPage = page;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedItems = allConversations.slice(start, end);

    paginatedItems.forEach(conversation => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'conversation-item';
        const link = document.createElement('a');
        link.href = `view.html?id=${conversation.id}`;
        link.textContent = `שיחה: ${conversation.id}`;
        link.target = "_blank";
        const dateSpan = document.createElement('span');
        dateSpan.textContent = `עודכן לאחרונה: ${formatTimestamp(conversation.data.lastUpdatedAt)}`;
        itemDiv.appendChild(link);
        itemDiv.appendChild(dateSpan);
        listContainer.appendChild(itemDiv);
    });
    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(allConversations.length / ITEMS_PER_PAGE);
    pageInfo.textContent = `עמוד ${currentPage} מתוך ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// THIS IS THE FINAL, WORKING VERSION OF THE ANALYSIS FUNCTION
async function handleAnalysisRequest() {
    const question = analysisQuestion.value.trim();

    if (!question) {
        alert('אנא הזן שאלה לניתוח.');
        return;
    }

    // Set UI to loading state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'מנתח...';
    analysisResponseArea.innerHTML = '<p class="placeholder">שולח בקשה לניתוח כלל-השיחות, תהליך זה עשוי לקחת מספר רגעים...</p>';

    try {
        const functionUrl = 'https://us-central1-educational-bot-template.cloudfunctions.net/analyzeConversation';
        
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question 
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `שגיאת שרת: ${response.status}` }));
            throw new Error(errorData.error);
        }

        const result = await response.json();
        
        // Display result, converting line breaks to <br> tags for proper HTML rendering
        analysisResponseArea.innerHTML = result.analysis.replace(/\n/g, '<br>');

    } catch (error) {
        console.error('Error during analysis:', error);
        analysisResponseArea.innerHTML = `<p style="color: red;">אירעה שגיאה בתהליך הניתוח: ${error.message}</p>`;
    } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'נתח את כל השיחות';
    }
}

async function fetchAllConversations() {
    try {
        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, orderBy('lastUpdatedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (loadingIndicator) { loadingIndicator.style.display = 'none'; }

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p>לא נמצאו שיחות שמורות במסד הנתונים.</p>';
            totalConversationsCount.textContent = '0';
            return;
        }

        allConversations = querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        totalConversationsCount.textContent = allConversations.length;
        
        analyzeBtn.disabled = allConversations.length === 0;
        
        renderPage(1);
    } catch (error) {
        console.error("Error loading conversations: ", error);
        listContainer.innerHTML = '<p>אירעה שגיאה בטעינת השיחות.</p>';
        totalConversationsCount.textContent = 'שגיאה';
    }
}

// --- Event Listeners ---
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) renderPage(currentPage - 1);
});
nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(allConversations.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) renderPage(currentPage + 1);
});
analyzeBtn.addEventListener('click', handleAnalysisRequest);

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', fetchAllConversations);
