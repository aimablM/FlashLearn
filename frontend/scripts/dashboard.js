import { get } from './api.js';

// Verify if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('flashlearn_token');
    
    // Get user data - be more careful about parsing
    let userData;
    try {
        userData = JSON.parse(localStorage.getItem('flashlearn_user'));
    } catch (error) {
        console.error('Error parsing user data:', error);
        // Continue with null userData
    }
    
    // Check if token exists
    if (!token) {
        console.log('User not authenticated, redirecting to login page');
        window.location.href = 'login.html';
        return;
    }
    
    // Check if userData exists and has an id
    if (!userData || (!userData.id && !userData._id)) {
        console.error('User data missing or invalid');
        // If no valid ID, redirect to login
        console.log('No valid user ID found, redirecting to login page');
        window.location.href = 'login.html';
        return;
    }
    
    // Ensure id is available (use _id as fallback)
    if (!userData.id && userData._id) {
        userData.id = userData._id;
    }
    
    // Update UI with user info
    updateUserInfo(userData);
    
    // Load dashboard data
    loadDashboardData(userData.id);
    
    // Set up UI interactions
    setupUIInteractions();
});

// Update UI elements with user information
function updateUserInfo(userData) {
    // Set user name in welcome message
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && userData && userData.name) {
        userNameElement.textContent = userData.name;
    }
    
    // Set user initials in avatar
    const userInitialsElement = document.getElementById('user-initials');
    if (userInitialsElement && userData && userData.name) {
        const initials = userData.name
            .split(' ')
            .map(name => name.charAt(0))
            .join('');
        userInitialsElement.textContent = initials;
    }
}

// Load all dashboard data
async function loadDashboardData(userId) {
    try {
        // Fetch user sets
        const userSets = await getUserSets(userId);
        
        // Fetch public sets
        const publicSets = await getPublicSets();
        
        // Fetch user stats
        const stats = await getUserStats(userId);
        
        // Update UI with fetched data
        updateStatsDisplay(stats);
        displayUserSets(userSets);
        displayPublicSets(publicSets);
        
        // Update progress bars
        updateProgressBars(stats);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Show error message to user
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert error';
            errorMessage.textContent = 'Failed to load dashboard data. Please refresh the page or try again later.';
            mainContainer.prepend(errorMessage);
        }
    }
}

// Fetch user's sets
async function getUserSets(userId) {
    try {
        const sets = await get(`/users/${userId}/sets`);
        return Array.isArray(sets) ? sets : [];
    } catch (error) {
        console.error('Error fetching user sets:', error);
        return [];
    }
}

// Fetch public sets
async function getPublicSets() {
    try {
        const sets = await get('/sets/public');
        return Array.isArray(sets) ? sets : [];
    } catch (error) {
        console.error('Error fetching public sets:', error);
        return [];
    }
}

// Fetch user stats
async function getUserStats(userId) {
    try {
        const stats = await get(`/users/${userId}/stats`);
        return stats || { totalSets: 0, publicSets: 0, totalFlashcards: 0 };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return { totalSets: 0, publicSets: 0, totalFlashcards: 0 };
    }
}

// Update stats display with real data
function updateStatsDisplay(stats) {
    // Update total sets
    const totalSetsElement = document.getElementById('total-sets');
    if (totalSetsElement) {
        totalSetsElement.textContent = stats.totalSets;
    }
    
    // Update total flashcards
    const totalFlashcardsElement = document.getElementById('total-flashcards');
    if (totalFlashcardsElement) {
        totalFlashcardsElement.textContent = stats.totalFlashcards;
    }
    
    // Calculate completion percentage (placeholder for now - would be based on actual study progress)
    // For now, we'll use a random percentage between the flashcard count value
    const completionPercentage = stats.totalFlashcards > 0 
        ? Math.floor(Math.random() * 100) 
        : 0;
    
    const completionPercentageElement = document.getElementById('completion-percentage');
    if (completionPercentageElement) {
        completionPercentageElement.textContent = `${completionPercentage}%`;
    }
}

// Update progress bars
function updateProgressBars(stats) {
    // Calculate overall progress (mock value for now)
    const overallProgress = 65; // Hardcoded 65% for demonstration
    const overallProgressElement = document.getElementById('overall-progress');
    if (overallProgressElement) {
        overallProgressElement.style.width = `${overallProgress}%`;
    }
    
    // Update completion text
    const completionTextElement = document.getElementById('completion-text');
    if (completionTextElement) {
        completionTextElement.textContent = `${overallProgress}% Complete`;
    }
    
    // Update sets mastered
    const setsMasteredElement = document.getElementById('sets-mastered');
    if (setsMasteredElement && stats.totalSets > 0) {
        const setsMastered = Math.ceil(stats.totalSets * (overallProgress / 100));
        setsMasteredElement.textContent = `${setsMastered}/${stats.totalSets} Sets Mastered`;
    }
}

// Display user's recent sets
function displayUserSets(sets) {
    const container = document.getElementById('user-sets-container');
    if (!container) return;
    
    // Clear loading message
    container.innerHTML = '';
    
    if (sets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <p>You haven't created any flashcard sets yet.</p>
                <a href="create.html" class="btn" style="margin-top: 15px;">Create Your First Set</a>
            </div>
        `;
        return;
    }
    
    // Sort sets by updated date (newest first)
    const sortedSets = [...sets].sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    // Take only the 5 most recent sets
    const recentSets = sortedSets.slice(0, 5);
    
    // Display each set
    recentSets.forEach(set => {
        const setElement = createSetCard(set);
        container.appendChild(setElement);
    });
}

// Display public sets
function displayPublicSets(sets) {
    const container = document.getElementById('public-sets-container');
    if (!container) return;
    
    // Clear loading message
    container.innerHTML = '';
    
    if (sets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌎</div>
                <p>No public flashcard sets available yet.</p>
            </div>
        `;
        return;
    }
    
    // Sort sets by updated date (newest first)
    const sortedSets = [...sets].sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    // Take only the 10 most recent public sets
    const recentPublicSets = sortedSets.slice(0, 10);
    
    // Display each set
    recentPublicSets.forEach(set => {
        const setElement = createSetCard(set, true);
        container.appendChild(setElement);
    });
}

// Create a flashcard set card element
function createSetCard(set, isPublic = false) {
    const setElement = document.createElement('div');
    setElement.className = 'flashcard-set';
    
    // Format the date
    const setDate = new Date(set.updatedAt);
    const formattedDate = setDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create tags HTML if the set has tags
    let tagsHtml = '';
    if (set.tags && set.tags.length > 0) {
        tagsHtml = `
            <div class="set-tags">
                ${set.tags.map(tag => `<span class="set-tag">${tag}</span>`).join('')}
            </div>
        `;
    }
    
    // Create the HTML for the set card
    setElement.innerHTML = `
        <div class="set-header">
            <div class="set-title">${set.title}</div>
            <div class="set-count">Cards: ${set.cardCount || 'Unknown'}</div>
        </div>
        <div class="set-body">
            <div class="set-description">${set.description || 'No description'}</div>
            ${tagsHtml}
        </div>
        <div class="set-footer">
            <div class="set-date">Updated: ${formattedDate}</div>
            ${isPublic && set.userId && set.userId.name ? 
                `<div class="set-author">By: ${set.userId.name}</div>` : ''}
            <a href="study.html?setId=${set._id}" class="btn btn-small">Study</a>
        </div>
    `;
    
    // Add click event to navigate to the set details (excluding the Study button)
    setElement.addEventListener('click', (e) => {
        // Only navigate if not clicking the Study button
        if (!e.target.classList.contains('btn')) {
            window.location.href = `study.html?setId=${set._id}`;
        }
    });
    
    return setElement;
}

// Setup UI interactions
function setupUIInteractions() {
    // User dropdown toggle
    const userProfile = document.getElementById('user-profile');
    const userDropdown = document.getElementById('user-dropdown');
    
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
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Clear local storage
            localStorage.removeItem('flashlearn_token');
            localStorage.removeItem('flashlearn_user');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
    
    // Handle search form submission (placeholder functionality)
    const searchForm = document.querySelector('.search');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchTerm = document.querySelector('.searchTerm').value;
            alert(`Search functionality would find: "${searchTerm}"`);
        });
    }
}