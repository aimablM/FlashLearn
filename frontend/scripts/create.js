import { get, post } from './api.js';

// DOM Elements
const createSetForm = document.getElementById('create-set-form');
const setForm = document.getElementById('set-form');
const newSetBtn = document.getElementById('new-set-btn');
const closeFormBtn = document.getElementById('close-form-btn');
const cancelSetBtn = document.getElementById('cancel-set-btn');
const setsContainer = document.getElementById('sets-container');
const setsGrid = document.getElementById('sets-grid');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const retryBtn = document.getElementById('retry-btn');
const userInitials = document.getElementById('user-initials');
const userProfile = document.getElementById('user-profile');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// State variables
let userSets = [];
let userData = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Verify user is logged in
    const token = localStorage.getItem('flashlearn_token');
    if (!token) {
        window.location.href = 'login.html';
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
        
        // Load user's sets
        await loadUserSets(userData.id);
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error loading user data:', error);
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

// Load user's flashcard sets
async function loadUserSets(userId) {
    try {
        showLoadingState();
        
        // Fetch user sets
        const sets = await get(`/users/${userId}/sets`);
        userSets = Array.isArray(sets) ? sets : [];
        
        // Display sets
        if (userSets.length > 0) {
            displayUserSets();
            showSetsContainer();
        } else {
            showEmptyState();
            // If no sets, show the create form by default
            showCreateForm();
        }
    } catch (error) {
        console.error('Error loading user sets:', error);
        showErrorState();
    }
}

// Display user's sets in the grid
function displayUserSets() {
    // Clear existing content
    setsGrid.innerHTML = '';
    
    // Sort sets by updated date (newest first)
    const sortedSets = [...userSets].sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    // Create and append set cards
    sortedSets.forEach(set => {
        const setCard = createSetCard(set);
        setsGrid.appendChild(setCard);
    });
}

// Create a set card element
function createSetCard(set) {
    const setElement = document.createElement('div');
    setElement.className = 'set-card';
    
    // Format date
    const setDate = new Date(set.updatedAt);
    const formattedDate = setDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create tags HTML
    let tagsHtml = '';
    if (set.tags && set.tags.length > 0) {
        tagsHtml = `
            <div class="set-tags">
                ${set.tags.map(tag => `<span class="set-tag">${tag}</span>`).join('')}
            </div>
        `;
    }
    
    // Create HTML for set card
    setElement.innerHTML = `
        <div class="set-header">
            <div class="set-title">${set.title}</div>
            <div class="set-count">Cards: ${set.cardCount || 0}</div>
        </div>
        <div class="set-body">
            <div class="set-description">${set.description || 'No description'}</div>
            ${tagsHtml}
        </div>
        <div class="set-footer">
            <div class="set-date">Updated: ${formattedDate}</div>
            <div class="set-actions">
                <a href="study.html?setId=${set._id}" class="btn btn-small">Study</a>
                <a href="edit-set.html?setId=${set._id}" class="btn btn-small">Edit Cards</a>
            </div>
        </div>
    `;
    
    return setElement;
}

// Setup event listeners
function setupEventListeners() {
    // New set button
    newSetBtn.addEventListener('click', showCreateForm);
    
    // Close form button
    closeFormBtn.addEventListener('click', hideCreateForm);
    
    // Cancel button in form
    cancelSetBtn.addEventListener('click', hideCreateForm);
    
    // Set form submission
    setForm.addEventListener('submit', handleSetFormSubmit);
    
    // Retry button
    retryBtn.addEventListener('click', () => loadUserSets(userData.id));
    
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

// Handle set form submission
async function handleSetFormSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const title = document.getElementById('set-title').value.trim();
    const description = document.getElementById('set-description').value.trim();
    const tagsInput = document.getElementById('set-tags').value.trim();
    const isPublic = document.getElementById('set-public').checked;
    
    // Parse tags (comma separated)
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Create set object
    const newSet = {
        title,
        description,
        tags,
        isPublic
    };
    
    try {
        // Show loading state in button
        const submitBtn = setForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating...';
        submitBtn.disabled = true;
        
        // Create set in API
        const createdSet = await post('/sets', newSet);
        
        // Reset form
        setForm.reset();
        
        // Hide the form
        hideCreateForm();
        
        // Redirect to edit page to add flashcards
        window.location.href = `edit-set.html?setId=${createdSet._id}`;
        
    } catch (error) {
        console.error('Error creating set:', error);
        
        // Create and show error alert
        const alert = document.createElement('div');
        alert.className = 'alert error';
        alert.textContent = error.message || 'Error creating flashcard set. Please try again.';
        
        // Insert alert before form actions
        const formActions = setForm.querySelector('.form-actions');
        setForm.insertBefore(alert, formActions);
        
        // Remove alert after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
        
        // Reset button
        const submitBtn = setForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Show/hide UI states
function showCreateForm() {
    createSetForm.style.display = 'block';
    newSetBtn.style.display = 'none';
}

function hideCreateForm() {
    createSetForm.style.display = 'none';
    newSetBtn.style.display = 'block';
    setForm.reset();
    
    // Remove any existing alerts
    const alerts = setForm.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
}

function showEmptyState() {
    emptyState.style.display = 'flex';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    setsContainer.style.display = 'none';
}

function showLoadingState() {
    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    errorState.style.display = 'none';
    setsContainer.style.display = 'none';
}

function showErrorState() {
    errorState.style.display = 'flex';
    emptyState.style.display = 'none';
    loadingState.style.display = 'none';
    setsContainer.style.display = 'none';
}

function showSetsContainer() {
    setsContainer.style.display = 'block';
    emptyState.style.display = 'none';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
}