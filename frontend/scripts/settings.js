import { get, put } from './api.js';

// DOM Elements
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const settingsContainer = document.getElementById('settings-container');
const settingsForm = document.getElementById('settings-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const settingsAlert = document.getElementById('settings-alert');
const retryBtn = document.getElementById('retry-btn');
const cancelBtn = document.getElementById('cancel-btn');
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
        
        // Setup dropdown toggle
        setupUserDropdown();
        
        // Setup logout functionality
        setupLogout();
        
        // Update initials in avatar
        updateUserAvatar(userData);
        
        // Load user profile data
        await loadUserProfile(userData.id);
        
        // Hide loading state and show settings
        showSettings();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing settings page:', error);
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

// Load user profile data
async function loadUserProfile(userId) {
    try {
        const userProfile = await get(`/users/${userId}`);
        
        // Prefill form fields
        nameInput.value = userProfile.name || '';
        emailInput.value = userProfile.email || '';
        phoneInput.value = userProfile.phone || '';
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        throw error;
    }
}

// Update user profile data
async function updateUserProfile(userId, userData) {
    try {
        const updatedUser = await put(`/users/${userId}`, userData);
        return updatedUser;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Settings form submission
    settingsForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Clear any existing alerts
        hideAlert();
        
        // Validate form
        const validationResult = validateForm();
        if (!validationResult.valid) {
            showAlert(validationResult.message, 'error');
            return;
        }
        
        // Prepare update data
        const updateData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim()
        };
        
        // Add password if provided
        if (newPasswordInput.value) {
            updateData.password = newPasswordInput.value;
        }
        
        try {
            // Show loading state in submit button
            const submitBtn = settingsForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;
            
            // Update profile
            const updatedUser = await updateUserProfile(userData.id, updateData);
            
            // Update localStorage with new user data
            localStorage.setItem('flashlearn_user', JSON.stringify({
                id: updatedUser._id,
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone || ''
            }));
            
            // Show success message
            showAlert('Profile updated successfully!', 'success');
            
            // Reset password fields
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Update avatar with new name if changed
            if (updatedUser.name !== userData.name) {
                userData.name = updatedUser.name;
                updateUserAvatar(userData);
            }
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert(error.message || 'Error updating profile. Please try again.', 'error');
            
            // Reset button
            const submitBtn = settingsForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        }
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', function() {
        window.location.href = 'profile.html';
    });
    
    // Retry button
    retryBtn.addEventListener('click', async function() {
        try {
            // Show loading state
            showLoading();
            
            // Reload data
            await loadUserProfile(userData.id);
            
            // Show settings
            showSettings();
        } catch (error) {
            console.error('Error retrying data load:', error);
            showError();
        }
    });
}

// Validate form inputs
function validateForm() {
    // Check if name is provided
    if (!nameInput.value.trim()) {
        return { valid: false, message: 'Name is required' };
    }
    
    // Check if email is provided and valid
    if (!emailInput.value.trim()) {
        return { valid: false, message: 'Email is required' };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        return { valid: false, message: 'Please enter a valid email address' };
    }
    
    // If new password is provided, validate
    if (newPasswordInput.value) {
        // Check if current password is provided
        if (!currentPasswordInput.value) {
            return { valid: false, message: 'Current password is required to set a new password' };
        }
        
        // Check password length
        if (newPasswordInput.value.length < 6) {
            return { valid: false, message: 'New password must be at least 6 characters long' };
        }
        
        // Check if passwords match
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            return { valid: false, message: 'New passwords do not match' };
        }
    }
    
    return { valid: true };
}

// Show alert message
function showAlert(message, type = 'error') {
    settingsAlert.textContent = message;
    settingsAlert.className = `alert ${type}`;
    settingsAlert.style.display = 'block';
    
    // Scroll to alert
    settingsAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Hide alert message
function hideAlert() {
    settingsAlert.style.display = 'none';
    settingsAlert.textContent = '';
}

// Show/hide UI states
function showLoading() {
    loadingState.style.display = 'flex';
    errorState.style.display = 'none';
    settingsContainer.style.display = 'none';
}

function showError() {
    errorState.style.display = 'flex';
    loadingState.style.display = 'none';
    settingsContainer.style.display = 'none';
}

function showSettings() {
    settingsContainer.style.display = 'block';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
}