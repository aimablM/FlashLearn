import { get } from './api.js';

// Global variables
let currentCardIndex = 0;
let flashcards = [];
let setData = {}; // Will hold the set title and description
let isFlipped = false;
let studyStartTime = null;
let cardsViewed = new Set(); // Track unique cards viewed
let timerInterval = null;

// DOM Elements
const flashcardElement = document.getElementById('flashcard');
const cardFrontElement = document.getElementById('card-front');
const cardBackElement = document.getElementById('card-back');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const flipButton = document.getElementById('flip-button');
const restartButton = document.getElementById('restart-button');
const shuffleButton = document.getElementById('shuffle-button');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const cardsViewedElement = document.getElementById('cards-viewed');
const studyTimeElement = document.getElementById('study-time');
const setTitleElement = document.getElementById('set-title');
const setDescriptionElement = document.getElementById('set-description');
const loadingOverlay = document.getElementById('loading-overlay');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const retryButton = document.getElementById('retry-button');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const userDropdown = document.getElementById('user-dropdown');

// Verify authentication and load data
document.addEventListener('DOMContentLoaded', function() {
    // Verify if user is logged in
    const token = localStorage.getItem('flashlearn_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get user data from localStorage
    const userData = getUserData();
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update UI with user info
    updateUserInfo(userData);
    
    // Get setId from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const setId = urlParams.get('setId');
    
    if (!setId) {
        // No setId provided, show error
        showError('No flashcard set specified');
        return;
    }
    
    // Load flashcard set data
    loadFlashcardSet(setId);
    
    // Setup event listeners
    setupEventListeners();
});

// Get user data from localStorage
function getUserData() {
    try {
        const userData = JSON.parse(localStorage.getItem('flashlearn_user'));
        // Ensure id field is available
        if (userData && !userData.id && userData._id) {
            userData.id = userData._id;
        }
        return userData;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

// Update UI with user information
function updateUserInfo(userData) {
    // Set user initials in avatar
    const userInitialsElement = document.getElementById('user-initials');
    if (userInitialsElement && userData.name) {
        const initials = userData.name
            .split(' ')
            .map(name => name.charAt(0))
            .join('');
        userInitialsElement.textContent = initials;
    }
}

// Load flashcard set data
async function loadFlashcardSet(setId) {
    showLoading(true);
    
    try {
        // First fetch the set details to get title and description
        const set = await get(`/sets/${setId}`);
        setData = set;
        
        // Update the page title and description
        document.title = `${set.title} - Study - FlashLearn`;
        setTitleElement.textContent = set.title;
        setDescriptionElement.textContent = set.description || 'No description';
        
        // Now fetch the flashcards
        const cards = await get(`/sets/${setId}/flashcards`);
        
        if (!Array.isArray(cards) || cards.length === 0) {
            showEmptyState(true);
            return;
        }
        
        // Store flashcards and show the first one
        flashcards = cards;
        
        // Start study session
        startStudySession();
        
        // Show the first card
        showCard(0);
        
        // Enable navigation buttons if needed
        updateNavigationButtons();
        
    } catch (error) {
        console.error('Error loading flashcard set:', error);
        showError(error.message || 'Failed to load flashcards');
    } finally {
        showLoading(false);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Card navigation buttons
    prevButton.addEventListener('click', showPreviousCard);
    nextButton.addEventListener('click', showNextCard);
    flipButton.addEventListener('click', flipCard);
    
    // Study control buttons
    restartButton.addEventListener('click', restartStudy);
    shuffleButton.addEventListener('click', shuffleCards);
    
    // Error retry button
    retryButton.addEventListener('click', retryLoading);
    
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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            // Left arrow for previous card
            showPreviousCard();
        } else if (event.key === 'ArrowRight') {
            // Right arrow for next card
            showNextCard();
        } else if (event.key === ' ' || event.key === 'Spacebar') {
            // Spacebar for flip
            event.preventDefault();
            flipCard();
        }
    });
}

// Show a specific card
function showCard(index) {
    if (index < 0 || index >= flashcards.length) {
        console.error('Invalid card index:', index);
        return;
    }
    
    currentCardIndex = index;
    const card = flashcards[currentCardIndex];
    
    // Reset flip state
    isFlipped = false;
    flashcardElement.classList.remove('flipped');
    
    // Update card content
    cardFrontElement.textContent = card.front;
    cardBackElement.textContent = card.back;
    
    // Mark card as viewed
    cardsViewed.add(currentCardIndex);
    cardsViewedElement.textContent = cardsViewed.size.toString();
    
    // Update progress indicators
    updateProgress();
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Show previous card
function showPreviousCard() {
    if (currentCardIndex > 0) {
        showCard(currentCardIndex - 1);
    }
}

// Show next card
function showNextCard() {
    if (currentCardIndex < flashcards.length - 1) {
        showCard(currentCardIndex + 1);
    }
}

// Flip the current card
function flipCard() {
    isFlipped = !isFlipped;
    flashcardElement.classList.toggle('flipped', isFlipped);
}

// Update navigation buttons based on current position
function updateNavigationButtons() {
    prevButton.disabled = currentCardIndex === 0;
    nextButton.disabled = currentCardIndex === flashcards.length - 1;
}

// Update progress indicators
function updateProgress() {
    // Update progress text
    progressText.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
    
    // Update progress bar
    const progressPercentage = ((currentCardIndex + 1) / flashcards.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

// Restart the study session
function restartStudy() {
    // Reset to the first card
    showCard(0);
    
    // Reset viewed cards tracking but keep study time running
    cardsViewed.clear();
    cardsViewedElement.textContent = '0';
}

// Shuffle the flashcards
function shuffleCards() {
    // Fisher-Yates shuffle algorithm
    for (let i = flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
    }
    
    // Reset to first card in the new shuffled order
    showCard(0);
    
    // Clear viewed cards when reshuffling
    cardsViewed.clear();
    cardsViewed.add(0); // Mark the first card as viewed
    cardsViewedElement.textContent = '1';
}

// Start the study session
function startStudySession() {
    studyStartTime = new Date();
    
    // Start timer to update study time
    timerInterval = setInterval(updateStudyTime, 1000);
    
    // Initialize viewed cards with the first card
    cardsViewed.add(0);
    cardsViewedElement.textContent = '1';
}

// Update study time display
function updateStudyTime() {
    if (!studyStartTime) return;
    
    const now = new Date();
    const elapsedSeconds = Math.floor((now - studyStartTime) / 1000);
    
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    
    studyTimeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Show loading overlay
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
    
    // Hide other states
    if (show) {
        errorMessage.style.display = 'none';
        emptyState.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    errorMessage.querySelector('p').textContent = message || 'Error loading flashcards. Please try again.';
    errorMessage.style.display = 'flex';
    
    // Hide other states
    loadingOverlay.style.display = 'none';
    emptyState.style.display = 'none';
    
    // Disable buttons
    prevButton.disabled = true;
    nextButton.disabled = true;
    flipButton.disabled = true;
}

// Show empty state when set has no cards
function showEmptyState(show) {
    emptyState.style.display = show ? 'flex' : 'none';
    
    // Hide other states
    if (show) {
        loadingOverlay.style.display = 'none';
        errorMessage.style.display = 'none';
    }
    
    // Disable buttons
    prevButton.disabled = true;
    nextButton.disabled = true;
    flipButton.disabled = true;
}

// Retry loading the flashcard set
function retryLoading() {
    const urlParams = new URLSearchParams(window.location.search);
    const setId = urlParams.get('setId');
    
    if (setId) {
        loadFlashcardSet(setId);
    } else {
        window.location.href = 'dashboard.html';
    }
}

// Clean up before page unload
window.addEventListener('beforeunload', function() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
});