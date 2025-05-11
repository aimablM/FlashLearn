import { post } from './api.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginAlert = document.getElementById('loginAlert');
const signupAlert = document.getElementById('signupAlert');
const tabs = document.querySelectorAll('.tab');
const forms = document.querySelectorAll('.auth-form');

// Tab switching functionality
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        // Toggle active class on tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Toggle active class on forms
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tabName}Form`) {
                form.classList.add('active');
            }
        });
        
        // Clear any visible alerts
        loginAlert.className = 'alert';
        loginAlert.textContent = '';
        signupAlert.className = 'alert';
        signupAlert.textContent = '';
    });
});

// Check for email in localStorage (from landing page CTA)
const savedEmail = localStorage.getItem('flashlearn_email');
if (savedEmail) {
    // If email exists, pre-fill signup form and switch to signup tab
    document.getElementById('signupEmail').value = savedEmail;
    tabs[1].click(); // Click on signup tab
    // Clear email from localStorage
    localStorage.removeItem('flashlearn_email');
}

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        // Clear previous error message
        loginAlert.className = 'alert';
        loginAlert.textContent = '';
        
        // Send login request to API
        const data = await post('/auth/login', { email, password });
        
        // Store token in localStorage
        localStorage.setItem('flashlearn_token', data.token);
        
        // Store user data in localStorage if "remember me" is checked
        if (rememberMe) {
            localStorage.setItem('flashlearn_user', JSON.stringify({
                id: data._id,
                name: data.name,
                email: data.email
            }));
        }
        
        // Show success message
        loginAlert.className = 'alert success';
        loginAlert.textContent = 'Login successful! Redirecting...';
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        // Display error message
        loginAlert.className = 'alert error';
        loginAlert.textContent = error.message || 'Invalid email or password';
    }
});

// Signup Form Submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;
    
    // Basic validation
    if (password !== confirmPassword) {
        signupAlert.className = 'alert error';
        signupAlert.textContent = 'Passwords do not match';
        return;
    }
    
    try {
        // Clear previous error message
        signupAlert.className = 'alert';
        signupAlert.textContent = '';
        
        // Send signup request to API
        const data = await post('/auth/register', {
            name,
            email,
            phone,
            password
        });
        
        // Store token in localStorage
        localStorage.setItem('flashlearn_token', data.token);
        
        // Store basic user info for future use
        localStorage.setItem('flashlearn_user', JSON.stringify({
            id: data._id,
            name: data.name,
            email: data.email
        }));
        
        // Show success message
        signupAlert.className = 'alert success';
        signupAlert.textContent = 'Account created successfully! Redirecting...';
        
        // Redirect to dashboard after successful signup
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        // Display error message
        signupAlert.className = 'alert error';
        signupAlert.textContent = error.message || 'Error creating account';
    }
});

// Handle "Forgot Password" functionality (placeholder)
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset functionality would be implemented here.');
});