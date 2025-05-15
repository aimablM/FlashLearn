# FlashLearn Backend API

This directory contains the backend API for FlashLearn, a RESTful service built with Node.js, Express, and MongoDB.

## Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing and security

## Core Features

- **RESTful API**: Clean, resource-oriented endpoint design
- **JWT Authentication**: Secure, stateless authentication flow
- **Data Validation**: Input validation for all API requests
- **MongoDB Integration**: Optimized schema design with indexing
- **Error Handling**: Consistent error responses and logging

## API Architecture

The backend follows a structured MVC pattern:

```
backend/
├── controllers/          # Request handlers
│   ├── authController.js       # Authentication logic
│   ├── userController.js       # User management
│   ├── setController.js        # Flashcard sets operations
│   └── flashcardController.js  # Flashcard operations
├── models/               # Database schemas
│   ├── User.js                 # User model
│   ├── FlashcardSet.js         # Set model
│   └── Flashcard.js            # Flashcard model
├── middleware/           # Express middleware
│   ├── auth.js                 # JWT verification
│   └── ...
├── routes/               # API route definitions
│   ├── auth.js                 # Auth endpoints
│   ├── users.js               # User endpoints
│   ├── sets.js                # Set endpoints
│   └── flashcards.js          # Flashcard endpoints
├── utils/                # Helper functions
│   ├── generateToken.js        # JWT utility
│   └── ...
└── server.js             # Application entry point
```

## API Endpoints

### Authentication Routes

- **POST /auth/register** - Register a new user
  ```javascript
  // Request body
  {
    "name": "User Name",
    "email": "user@example.com",
    "phone": "1234567890", // optional
    "password": "securepassword"
  }
  
  // Response
  {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "1234567890",
    "token": "jwt_token"
  }
  ```

- **POST /auth/login** - Login and get JWT token
  ```javascript
  // Request body
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  
  // Response
  {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "1234567890",
    "token": "jwt_token"
  }
  ```

### User Routes

- **GET /users/:id** - Get user profile
- **PUT /users/:id** - Update user profile
- **GET /users/:id/stats** - Get user statistics
- **GET /users/:id/sets** - Get all sets for a user

### Flashcard Sets Routes

- **GET /sets/public** - Get all public sets
- **GET /sets/:id** - Get a set by ID
- **POST /sets** - Create a new set
- **PUT /sets/:id** - Update a set
- **DELETE /sets/:id** - Delete a set and its flashcards
- **GET /sets/:setId/flashcards** - Get all flashcards for a set

### Flashcards Routes

- **POST /flashcards** - Create a new flashcard
- **DELETE /flashcards/:id** - Delete a flashcard

## Database Models

### User Schema

```javascript
{
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  }
}
```

### FlashcardSet Schema

```javascript
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Set must belong to a user']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}
```

### Flashcard Schema

```javascript
{
  setId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashcardSet',
    required: [true, 'Flashcard must belong to a set'],
    index: true
  },
  front: {
    type: String,
    required: [true, 'Front content is required'],
    trim: true
  },
  back: {
    type: String,
    required: [true, 'Back content is required'],
    trim: true
  }
}
```

## Authentication Implementation

The authentication system uses JWT tokens with middleware protection:

```javascript
// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and add to request
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
```

## Performance Optimizations

The backend implements several performance optimizations:

1. **Database Indexing**:
   ```javascript
   // Create index for faster querying by setId
   flashcardSchema.index({ setId: 1 });
   
   // Create index for faster querying by userId
   flashcardSetSchema.index({ userId: 1 });
   
   // Create index for faster querying public sets
   flashcardSetSchema.index({ isPublic: 1 });
   ```

2. **Error Handling**: Centralized error handling for consistent responses
3. **Request Validation**: Validate inputs before database operations
4. **Password Security**: bcrypt hashing with pre-save hooks
5. **Resource Ownership**: Middleware checks for resource access rights

## Development Setup

### Prerequisites

- Node.js (v14+)
- MongoDB instance (local or Atlas)

### Environment Variables

Create a `.env` file in the backend directory with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flashlearn
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### Running Locally

```bash
# Install dependencies
npm install

# Run in development mode with nodemon
npm run dev

# Run in production mode
npm start
```

### Docker Development

See the root README for Docker setup instructions. The backend is containerized for consistent environments.

## Testing API Endpoints

You can test the API using tools like Postman or curl:

```bash
# Example: Login
curl -X POST https://api.aimablem.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Example: Get user sets (with authentication)
curl -X GET https://api.aimablem.dev/users/123/sets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

The API provides standardized error responses:

```javascript
// Example error response
{
  "message": "Resource not found",
  "status": 404,
  "error": "Not Found"
}
```

## Deployment

The backend is deployed using Docker containers on AWS. See the root README for detailed deployment information.