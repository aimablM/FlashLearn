import { get } from './api.js';

// DOM Elements
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const profileContainer = document.getElementById('profile-container');
const retryBtn = document.getElementById('retry-btn');
const userNameElement = document.getElementById('user-name');
const userEmailElement = document.getElementById('user-email');
const userPhoneElement = document.getElementById('user-phone');
const userJoinedElement = document.getElementById('user-joined');
const totalSetsElement = document.getElementById('total-sets');
const totalFlashcardsElement = document.getElementById('total-flashcards');
const publicSetsElement = document.getElementById('public-sets');
const userInitials = document.getElementById('user-initials');
const userProfile = document.getElementById('user-profile');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// State variables
let userData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Verify user is logged in
    const token = localStorage.getItem('flashlearn_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get user data from localStorage
    try {
        userData = JSON.parse(localStorage.getItem('flashlearn_user'));
        if (!userData || (!userData.id && !userData._id)) {
            throw new Error('Invalid user data');
        }
        
        // Ensure id is available
        if (!userData.id && userData._id) {
            userData.id = userData._id;
        }
        
        // Update initials in avatar
        updateUserAvatar(userData);
        
        // Setup dropdown toggle
        setupUserDropdown();
        
        // Setup logout functionality
        setupLogout();
        
        // Load user profile data
        await loadUserProfile(userData.id);
        
        // Load user stats
        await loadUserStats(userData.id);
        
        // Hide loading state and show profile
        showProfile();
        
        // Setup retry button
        setupRetryButton();
        
    } catch (error) {
        console.error('Error initializing profile page:', error);
        showError();
    }
});

// Update user avatar with initials
function updateUserAvatar(userData) {
    if (userInitials && userData.name) {
        const initials = userData.name
            .split(' ')
            .map(name => name.charAt(0))
            .join('');
        userInitials.textContent = initials;
    }
}

// Setup user dropdown toggle
function setupUserDropdown() {
    if (userProfile && userDropdown) {
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
    }
}

// Setup logout functionality
function setupLogout() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.removeItem('flashlearn_token');
            localStorage.removeItem('flashlearn_user');
            window.location.href = 'login.html';
        });
    }
}

// Setup retry button
function setupRetryButton() {
    if (retryBtn) {
        retryBtn.addEventListener('click', async function() {
            try {
                showLoading();
                await loadUserProfile(userData.id);
                await loadUserStats(userData.id);
                showProfile();
            } catch (error) {
                console.error('Error retrying data load:', error);
                showError();
            }
        });
    }
}

// Load user profile data
async function loadUserProfile(userId) {
    try {
        const userProfile = await get(`/users/${userId}`);
        
        // Update UI with user data
        userNameElement.textContent = userProfile.name || 'Not provided';
        userEmailElement.textContent = userProfile.email || 'Not provided';
        userPhoneElement.textContent = userProfile.phone || 'Not provided';
        
        // Format and display join date
        if (userProfile.createdAt) {
            const joinDate = new Date(userProfile.createdAt);
            userJoinedElement.textContent = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            userJoinedElement.textContent = 'Not available';
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        throw error;
    }
}

// Load user stats
async function loadUserStats(userId) {
    try {
        const stats = await get(`/users/${userId}/stats`);
        
        // Update UI with stats
        totalSetsElement.textContent = stats.totalSets || '0';
        totalFlashcardsElement.textContent = stats.totalFlashcards || '0';
        publicSetsElement.textContent = stats.publicSets || '0';
        
    } catch (error) {
        console.error('Error loading user stats:', error);
        // Don't throw error here, still show profile without stats
        
        // Set default stats values
        totalSetsElement.textContent = '0';
        totalFlashcardsElement.textContent = '0';
        publicSetsElement.textContent = '0';
    }
}

// Show/hide UI states
function showLoading() {
    loadingState.style.display = 'flex';
    errorState.style.display = 'none';
    profileContainer.style.display = 'none';
}

function showError() {
    errorState.style.display = 'flex';
    loadingState.style.display = 'none';
    profileContainer.style.display = 'none';
}

function showProfile() {
    profileContainer.style.display = 'block';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
}