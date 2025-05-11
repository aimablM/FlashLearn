# FlashLearn API Backend

This is the backend for the FlashLearn flashcard learning application, built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Create, read, update, and delete flashcard sets
- Create and delete flashcards within sets
- Browse public flashcard sets from all users
- User profile management
- User statistics

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd flashlearn-backend

Install dependencies
bashnpm install

Create a .env file in the root directory and add the following:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flashlearn
JWT_SECRET=your_super_secret_key

Start the server
bash# Development with nodemon
npm run dev

# Production
npm start


API Endpoints
Authentication

POST /auth/register - Register a new user
POST /auth/login - Login and get JWT token

Users

GET /users/:id - Get user profile
PUT /users/:id - Update user profile
GET /users/:id/stats - Get user statistics
GET /users/:id/sets - Get all sets for a user

Flashcard Sets

GET /sets/public - Get all public sets
GET /sets/:id - Get a set by ID
POST /sets - Create a new set
PUT /sets/:id - Update a set
DELETE /sets/:id - Delete a set and its flashcards
GET /sets/:setId/flashcards - Get all flashcards for a set

Flashcards

POST /flashcards - Create a new flashcard
DELETE /flashcards/:id - Delete a flashcard

Usage Notes

All API requests except registration and login require a JWT token in the Authorization header:
Authorization: Bearer <your_token>

The API returns all sets and flashcards, sorting and limiting is done client-side