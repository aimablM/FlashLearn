import { get, post, del } from './api.js';

// DOM Elements
const setTitleElement = document.getElementById('set-title');
const setTitleBreadcrumb = document.getElementById('set-title-breadcrumb');
const setDescriptionElement = document.getElementById('set-description');
const visibilityTag = document.getElementById('visibility-tag');
const flashcardCountElement = document.getElementById('flashcard-count');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const addCardForm = document.getElementById('add-card-form');
const flashcardForm = document.getElementById('flashcard-form');
const flashcardsContainer = document.getElementById('flashcards-container');
const flashcardsList = document.getElementById('flashcards-list');
const emptyState = document.getElementById('empty-state');
const containerFooter = document.getElementById('container-footer');
const studyLink = document.getElementById('study-link');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const addCardBtn = document.getElementById('add-card-btn');
const sortBtn = document.getElementById('sort-btn');
const retryBtn = document.getElementById('retry-btn');
const userInitials = document.getElementById('user-initials');
const userProfile = document.getElementById('user-profile');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// State variables
let setId = null;
let setData = {};
let flashcards = [];
let userData = null;
let sortByNewest = true; // Default sort order

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Verify user is logged in
    const token = localStorage.getItem('flashlearn_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get setId from URL
    const urlParams = new URLSearchParams(window.location.search);
    setId = urlParams.get('setId');
    
    if (!setId) {
        // No setId provided, redirect to create page
        window.location.href = 'create.html';
        return;
    }
    
    // Get user data
    try {
        userData = JSON.parse(localStorage.getItem('flashlearn_user'));
        if (!userData || (!userData.id && !userData._id)) {
            throw new Error('Invalid user data');
        }
        
        // Ensure id is available
        if (!userData.id && userData._id) {
            userData.id = userData._id;
        }
        
        // Update UI with user info
        updateUserInfo(userData);
        
        // Load set and flashcards
        await loadSetData(setId);
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing page:', error);
        showErrorState();
    }
});

// Update UI with user information
function updateUserInfo(userData) {
    if (userInitials && userData.name) {
        const initials = userData.name
            .split(' ')
            .map(name => name.charAt(0))
            .join('');
        userInitials.textContent = initials;
    }
}

// Load flashcard set data
async function loadSetData(setId) {
    try {
        showLoadingState();
        
        // Fetch set data
        const set = await get(`/sets/${setId}`);
        setData = set;
        
        // Update UI with set data
        document.title = `${set.title} - Edit Flashcards - FlashLearn`;
        setTitleElement.textContent = set.title;
        setTitleBreadcrumb.textContent = set.title;
        setDescriptionElement.textContent = set.description || 'No description';
        visibilityTag.textContent = set.isPublic ? 'Public' : 'Private';
        
        // Now fetch flashcards
        await loadFlashcards(setId);
        
    } catch (error) {
        console.error('Error loading set data:', error);
        showErrorState();
    }
}

// Load flashcards for the set
async function loadFlashcards(setId) {
    try {
        // Fetch flashcards
        const cards = await get(`/sets/${setId}/flashcards`);
        flashcards = Array.isArray(cards) ? cards : [];
        
        // Update flashcard count
        flashcardCountElement.textContent = `${flashcards.length} Flashcards`;
        
        // Display flashcards
        if (flashcards.length > 0) {
            displayFlashcards();
            showFlashcardsContainer();
            
            // Show study link only if there are flashcards
            containerFooter.style.display = 'flex';
            studyLink.href = `study.html?setId=${setId}`;
        } else {
            showEmptyState();
        }
        
        // Show add card form
        showAddCardForm();
        
    } catch (error) {
        console.error('Error loading flashcards:', error);
        showErrorState();
    }
}

// Display flashcards in the list
function displayFlashcards() {
    // Clear existing flashcards
    flashcardsList.innerHTML = '';
    
    // Sort flashcards
    const sortedFlashcards = sortFlashcards(flashcards, sortByNewest);
    
    // Create and append flashcard elements
    sortedFlashcards.forEach((card, index) => {
        const flashcardElement = createFlashcardElement(card, index + 1);
        flashcardsList.appendChild(flashcardElement);
    });
}

// Create a flashcard element
function createFlashcardElement(card, index) {
    const cardElement = document.createElement('div');
    cardElement.className = 'flashcard-item';
    cardElement.dataset.id = card._id;
    
    cardElement.innerHTML = `
        <div class="flashcard-content">
            <div class="flashcard-side">
                <div class="side-title">Front</div>
                <div class="side-content">${card.front}</div>
            </div>
            <div class="flashcard-side">
                <div class="side-title">Back</div>
                <div class="side-content">${card.back}</div>
            </div>
        </div>
        <div class="flashcard-footer">
            <div class="card-index">Card ${index} of ${flashcards.length}</div>
            <div class="card-actions">
                <button class="btn-icon delete-card" title="Delete Card">🗑️</button>
            </div>
        </div>
    `;
    
    // Add delete event listener
    const deleteButton = cardElement.querySelector('.delete-card');
    deleteButton.addEventListener('click', () => deleteFlashcard(card._id));
    
    return cardElement;
}

// Sort flashcards
function sortFlashcards(cards, byNewest) {
    return [...cards].sort((a, b) => {
        if (byNewest) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    });
}

// Toggle sort order
function toggleSortOrder() {
    sortByNewest = !sortByNewest;
    sortBtn.textContent = sortByNewest ? 'Sort by Recent' : 'Sort by Oldest';
    displayFlashcards();
}

// Add a new flashcard
async function addFlashcard(front, back) {
    try {
        // Create the flashcard
        const newFlashcard = {
            setId,
            front,
            back
        };
        
        // Add to API
        const createdCard = await post('/flashcards', newFlashcard);
        
        // Add to local array
        flashcards.push(createdCard);
        
        // Update count
        flashcardCountElement.textContent = `${flashcards.length} Flashcards`;
        
        // Display all flashcards
        displayFlashcards();
        
        // Show container if this is the first card
        if (flashcards.length === 1) {
            showFlashcardsContainer();
            containerFooter.style.display = 'flex';
            studyLink.href = `study.html?setId=${setId}`;
        }
        
        // Show success message
        showAlert(flashcardForm, 'Flashcard added successfully!', 'success');
        
        // Clear form
        flashcardForm.reset();
        
    } catch (error) {
        console.error('Error adding flashcard:', error);
        showAlert(flashcardForm, error.message || 'Error adding flashcard', 'error');
    }
}

// Delete a flashcard
async function deleteFlashcard(cardId) {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
        return;
    }
    
    try {
        // Delete from API
        await del(`/flashcards/${cardId}`);
        
        // Remove from local array
        flashcards = flashcards.filter(card => card._id !== cardId);
        
        // Update count
        flashcardCountElement.textContent = `${flashcards.length} Flashcards`;
        
        // Display updated flashcards
        if (flashcards.length > 0) {
            displayFlashcards();
        } else {
            showEmptyState();
            containerFooter.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error deleting flashcard:', error);
        alert('Error deleting flashcard. Please try again.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Flashcard form submission
    flashcardForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const front = document.getElementById('card-front').value.trim();
        const back = document.getElementById('card-back').value.trim();
        
        if (front && back) {
            addFlashcard(front, back);
        }
    });
    
    // Toggle form visibility
    toggleFormBtn.addEventListener('click', function() {
        const isMinimized = addCardForm.classList.toggle('minimized');
        toggleFormBtn.textContent = isMinimized ? '+' : '−';
        toggleFormBtn.title = isMinimized ? 'Expand form' : 'Minimize form';
    });
    
    // Add card button (show form if minimized)
    addCardBtn.addEventListener('click', function() {
        if (addCardForm.classList.contains('minimized')) {
            addCardForm.classList.remove('minimized');
            toggleFormBtn.textContent = '−';
            toggleFormBtn.title = 'Minimize form';
        }
        
        // Scroll to form
        addCardForm.scrollIntoView({ behavior: 'smooth' });
        
        // Focus on front field
        document.getElementById('card-front').focus();
    });
    
    // Sort button
    sortBtn.addEventListener('click', toggleSortOrder);
    
    // Retry button
    retryBtn.addEventListener('click', function() {
        loadSetData(setId);
    });
    
    // User dropdown toggle
    userProfile.addEventListener('click', function(event) {
        event.stopPropagation();
        userDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!userProfile.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Logout button
    logoutBtn.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('flashlearn_token');
        localStorage.removeItem('flashlearn_user');
        window.location.href = 'login.html';
    });
}

// Show/hide UI states
function showLoadingState() {
    loadingState.style.display = 'flex';
    errorState.style.display = 'none';
    addCardForm.style.display = 'none';
    flashcardsContainer.style.display = 'none';
}

function showErrorState() {
    errorState.style.display = 'flex';
    loadingState.style.display = 'none';
    addCardForm.style.display = 'none';
    flashcardsContainer.style.display = 'none';
}

function showEmptyState() {
    emptyState.style.display = 'flex';
    flashcardsList.style.display = 'none';
    flashcardsContainer.style.display = 'block';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
}

function showFlashcardsContainer() {
    flashcardsContainer.style.display = 'block';
    emptyState.style.display = 'none';
    flashcardsList.style.display = 'block';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
}

function showAddCardForm() {
    addCardForm.style.display = 'block';
}

// Show alert message
function showAlert(formElement, message, type) {
    // Remove any existing alerts
    const existingAlert = formElement.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    // Insert before form actions
    const formActions = formElement.querySelector('.form-actions');
    formElement.insertBefore(alert, formActions);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}