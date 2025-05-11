import { get } from './api.js';

// DOM Elements
const publicSetsBtn = document.getElementById('public-sets-btn');
const mySetsBtn = document.getElementById('my-sets-btn');
const filterInput = document.getElementById('filter-input');
const filterBtn = document.getElementById('filter-btn');
const sortSelect = document.getElementById('sort-select');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const retryBtn = document.getElementById('retry-btn');
const publicSetsContainer = document.getElementById('public-sets-container');
const mySetsContainer = document.getElementById('my-sets-container');
const publicSetsGrid = document.getElementById('public-sets-grid');
const mySetsGrid = document.getElementById('my-sets-grid');
const publicEmptyState = document.getElementById('public-empty-state');
const myEmptyState = document.getElementById('my-empty-state');
const publicSetsCount = document.getElementById('public-sets-count');
const mySetsCount = document.getElementById('my-sets-count');
const userInitials = document.getElementById('user-initials');
const userProfile = document.getElementById('user-profile');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// State variables
let publicSets = [];
let userSets = [];
let filteredPublicSets = [];
let filteredUserSets = [];
let currentView = 'public'; // Default view
let userData = null;
let filterText = '';
let sortOption = 'newest'; // Default sort

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
        
        // Load all sets
        showLoadingState();
        await Promise.all([
            loadPublicSets(),
            loadUserSets(userData.id)
        ]);
        
        // Show the default view
        showPublicSetsView();
        
        // Hide loading state
        hideLoadingState();
        
        // Setup event listeners
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

// Load public sets
async function loadPublicSets() {
    try {
        const sets = await get('/sets/public');
        publicSets = Array.isArray(sets) ? sets : [];
        filteredPublicSets = [...publicSets];
        updatePublicSetsView();
    } catch (error) {
        console.error('Error loading public sets:', error);
        throw error;
    }
}

// Load user sets
async function loadUserSets(userId) {
    try {
        const sets = await get(`/users/${userId}/sets`);
        userSets = Array.isArray(sets) ? sets : [];
        filteredUserSets = [...userSets];
        updateUserSetsView();
    } catch (error) {
        console.error('Error loading user sets:', error);
        throw error;
    }
}

// Update public sets view
function updatePublicSetsView() {
    // Update count
    publicSetsCount.textContent = `${filteredPublicSets.length} sets`;
    
    // Clear existing content
    publicSetsGrid.innerHTML = '';
    
    // Check if empty
    if (filteredPublicSets.length === 0) {
        publicEmptyState.style.display = 'flex';
        return;
    }
    
    // Hide empty state
    publicEmptyState.style.display = 'none';
    
    // Sort sets
    const sortedSets = sortSets(filteredPublicSets, sortOption);
    
    // Create and append set cards
    sortedSets.forEach(set => {
        const setCard = createSetCard(set, true);
        publicSetsGrid.appendChild(setCard);
    });
}

// Update user sets view
function updateUserSetsView() {
    // Update count
    mySetsCount.textContent = `${filteredUserSets.length} sets`;
    
    // Clear existing content
    mySetsGrid.innerHTML = '';
    
    // Check if empty
    if (filteredUserSets.length === 0) {
        myEmptyState.style.display = 'flex';
        return;
    }
    
    // Hide empty state
    myEmptyState.style.display = 'none';
    
    // Sort sets
    const sortedSets = sortSets(filteredUserSets, sortOption);
    
    // Create and append set cards
    sortedSets.forEach(set => {
        const setCard = createSetCard(set, false);
        mySetsGrid.appendChild(setCard);
    });
}

// Create a set card element
function createSetCard(set, isPublic) {
    const setElement = document.createElement('div');
    setElement.className = 'set-card';
    
    // Format date
    const setDate = new Date(set.updatedAt || set.createdAt);
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
            <div class="set-count">Cards: ${set.cardCount || '—'}</div>
        </div>
        <div class="set-body">
            <div class="set-description">${set.description || 'No description'}</div>
            ${tagsHtml}
            <div class="set-meta">
                ${isPublic && set.userId && set.userId.name ? 
                    `<span class="set-author">Created by: ${set.userId.name}</span>` : ''}
                <span class="set-date">Updated: ${formattedDate}</span>
            </div>
        </div>
        <div class="set-footer">
            <div class="set-actions">
                <a href="study.html?setId=${set._id}" class="btn btn-small">Study</a>
                ${!isPublic ? `<a href="edit-set.html?setId=${set._id}" class="btn btn-small btn-outline">Edit</a>` : ''}
            </div>
        </div>
    `;
    
    return setElement;
}

// Filter sets based on search text
function filterSets() {
    const searchText = filterText.toLowerCase();
    
    // Filter public sets
    if (searchText) {
        filteredPublicSets = publicSets.filter(set => {
            const titleMatch = set.title.toLowerCase().includes(searchText);
            const descMatch = set.description && set.description.toLowerCase().includes(searchText);
            const tagsMatch = set.tags && set.tags.some(tag => tag.toLowerCase().includes(searchText));
            return titleMatch || descMatch || tagsMatch;
        });
    } else {
        filteredPublicSets = [...publicSets];
    }
    
    // Filter user sets
    if (searchText) {
        filteredUserSets = userSets.filter(set => {
            const titleMatch = set.title.toLowerCase().includes(searchText);
            const descMatch = set.description && set.description.toLowerCase().includes(searchText);
            const tagsMatch = set.tags && set.tags.some(tag => tag.toLowerCase().includes(searchText));
            return titleMatch || descMatch || tagsMatch;
        });
    } else {
        filteredUserSets = [...userSets];
    }
    
    // Update views
    updatePublicSetsView();
    updateUserSetsView();
}

// Sort sets based on selected option
function sortSets(sets, option) {
    return [...sets].sort((a, b) => {
        switch (option) {
            case 'newest':
                return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
            case 'oldest':
                return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
            case 'az':
                return a.title.localeCompare(b.title);
            case 'za':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // View toggle buttons
    publicSetsBtn.addEventListener('click', function() {
        showPublicSetsView();
    });
    
    mySetsBtn.addEventListener('click', function() {
        showUserSetsView();
    });
    
    // Filter input
    filterBtn.addEventListener('click', function() {
        filterText = filterInput.value.trim();
        filterSets();
    });
    
    // Filter on Enter key
    filterInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            filterText = filterInput.value.trim();
            filterSets();
        }
    });
    
    // Sort select
    sortSelect.addEventListener('change', function() {
        sortOption = this.value;
        updatePublicSetsView();
        updateUserSetsView();
    });
    
    // Retry button
    // Retry button
    retryBtn.addEventListener('click', async function() {
        try {
            showLoadingState();
            await Promise.all([
                loadPublicSets(),
                loadUserSets(userData.id)
            ]);
            
            if (currentView === 'public') {
                showPublicSetsView();
            } else {
                showUserSetsView();
            }
            
            hideLoadingState();
        } catch (error) {
            console.error('Error retrying data load:', error);
            showErrorState();
        }
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

// Show public sets view
function showPublicSetsView() {
    currentView = 'public';
    
    // Toggle button states
    publicSetsBtn.classList.add('active');
    mySetsBtn.classList.remove('active');
    
    // Show/hide containers
    publicSetsContainer.style.display = 'block';
    mySetsContainer.style.display = 'none';
}

// Show user sets view
function showUserSetsView() {
    currentView = 'user';
    
    // Toggle button states
    publicSetsBtn.classList.remove('active');
    mySetsBtn.classList.add('active');
    
    // Show/hide containers
    publicSetsContainer.style.display = 'none';
    mySetsContainer.style.display = 'block';
}

// Show/hide UI states
function showLoadingState() {
    loadingState.style.display = 'flex';
    errorState.style.display = 'none';
    publicSetsContainer.style.display = 'none';
    mySetsContainer.style.display = 'none';
}

function hideLoadingState() {
    loadingState.style.display = 'none';
}

function showErrorState() {
    errorState.style.display = 'flex';
    loadingState.style.display = 'none';
    publicSetsContainer.style.display = 'none';
    mySetsContainer.style.display = 'none';
}