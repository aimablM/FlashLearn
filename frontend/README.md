# FlashLearn Frontend

This directory contains the frontend application for FlashLearn, an interactive flashcard learning platform.

## Technologies Used

- **Vanilla JavaScript**: Core functionality without frameworks
- **HTML5/CSS3**: Modern, responsive design patterns
- **LocalStorage API**: Client-side data persistence for user sessions
- **Fetch API**: REST API communication with backend

## Key Features

- **Responsive Design**: Mobile-first approach for all device compatibility
- **Interactive Interface**: Card flipping animations and study tracking
- **Session Management**: JWT-based authentication flow
- **Offline Capabilities**: Basic functionality when network is unavailable

## Architecture

The frontend follows a modular JavaScript pattern:

```
frontend/
├── assets/              # Static assets like logo and images
├── styles/              # CSS stylesheets for components
│   ├── auth.css         # Authentication pages styling
│   ├── dashboard.css    # Dashboard interface styling
│   ├── create.css       # Flashcard creation styling
│   ├── study.css        # Study mode styling
│   └── ...
├── scripts/             # JavaScript functionality
│   ├── api.js           # API client with fetch wrappers
│   ├── auth.js          # Authentication logic
│   ├── dashboard.js     # Dashboard functionality
│   ├── create.js        # Flashcard creation
│   ├── study.js         # Study mode functionality
│   └── ...
└── *.html               # Page templates
```

## Core Components

### API Client

The API client (`api.js`) provides a unified interface for communicating with the backend:

```javascript
// Base URL for the API
const BASE_URL = 'https://api.aimablem.dev';

// Creates headers with proper authentication
const createHeaders = (includeContent = true) => {
    const headers = new Headers();
    if (includeContent) {
        headers.append('Content-Type', 'application/json');
    }
    const token = localStorage.getItem('flashlearn_token');
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
};

// Standardized request handlers
export const get = async (endpoint) => { /* ... */ }
export const post = async (endpoint, data = {}) => { /* ... */ }
export const put = async (endpoint, data = {}) => { /* ... */ }
export const del = async (endpoint) => { /* ... */ }
```

### Authentication Flow

The authentication module (`auth.js`) handles user login, registration, and session management:

```javascript
// Form submissions for login/registration
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Form validation and API call
    try {
        const data = await post('/auth/login', { 
            email, password 
        });
        
        // Store authentication token
        localStorage.setItem('flashlearn_token', data.token);
        
        // Store user data
        localStorage.setItem('flashlearn_user', JSON.stringify({
            id: data._id,
            name: data.name,
            email: data.email
        }));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        // Error handling
    }
});
```

### Study Mode

The study mode (`study.js`) provides interactive flashcard functionality:

```javascript
// Flashcard flip animation
function flipCard() {
    isFlipped = !isFlipped;
    flashcardElement.classList.toggle('flipped', isFlipped);
}

// Study session tracking
function updateStudyTime() {
    if (!studyStartTime) return;
    
    const now = new Date();
    const elapsedSeconds = Math.floor((now - studyStartTime) / 1000);
    
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    
    studyTimeElement.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
```

## Development Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js and npm (for development server)

### Local Development

```bash
# Install http-server for local development
npm install -g http-server

# Start a development server
http-server -p 3000

# Visit http://localhost:3000 in your browser
```

### Building for Production

The frontend is built using a Docker container with NGINX (see root README for details) but you can also build manually:

```bash
# Create a production build directory
mkdir -p dist
cp -r assets styles scripts *.html dist/

# Optionally, minify assets for production
# (Requires additional tools like minify-html, csso, terser)
```

## Integration with Backend

The frontend communicates with the backend API using RESTful endpoints. All API calls go through the centralized API client (`api.js`) which handles:

- Authentication token management
- Request/response formatting
- Error handling

See the backend README for detailed API documentation.

## Code Standards

This project follows these coding standards:

- Meaningful variable and function names
- Modular JavaScript with clear separation of concerns
- Consistent error handling and user feedback
- Regular comments for non-obvious functionality
- Progressive enhancement for broader browser support