# Teacher App Backend

Backend API service for the Teacher App with MongoDB and Supabase integration.

## Tech Stack

- **Node.js & Express:** Backend API framework
- **MongoDB:** Database for storing application data
- **Supabase:** Authentication service
- **JWT:** Token-based API authorization

## Setup Instructions

### 1. Clone the Repository

```
git clone <repository-url>
cd Teacher-Backend
```

### 2. Install Dependencies

```
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teacher-app
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

### 4. MongoDB Setup

Make sure MongoDB is installed and running. You can use a local MongoDB instance or a cloud-based service like MongoDB Atlas.

### 5. Supabase Setup

1. Create a project on [Supabase](https://supabase.io)
2. Enable authentication in your Supabase project
3. Get your Supabase URL and service key from the project settings
4. Update the `.env` file with these values

### 6. Initialize the Database

Run the initialization script to populate the database with initial data:

```
npm run init-db
```

This will create the necessary collections and add starter data for:
- Subjects (Maths, Chemistry, Physics)
- Exams (Boards, Jee Mains, Jee Advanced, Neet)
- Question Types (multiple-choice, short-answer, long-answer)
- Difficulty Levels (easy, medium, hard)

### 7. Start the Server

For development with auto-restart:
```
npm run dev
```

For production:
```
npm start
```

## API Endpoints

### User Profile
- `GET /api/users/profile` - Get current user profile (requires authentication)
- `POST /api/users/profile` - Create or update user profile (requires authentication)
- `GET /api/users/profile/check` - Check if user profile is complete (requires authentication)

### Questions
- `GET /api/questions` - Get questions with filtering
- `POST /api/questions` - Create a new question
- `PUT /api/questions/:id` - Update a question
- `DELETE /api/questions/:id` - Delete a question

### Question Sets
- `GET /api/sets` - Get all sets for the current user
- `GET /api/sets/:id` - Get a specific set with its questions
- `POST /api/sets` - Create a new set
- `PUT /api/sets/:id` - Update a set
- `POST /api/sets/:id/questions` - Add questions to a set
- `DELETE /api/sets/:id/questions/:questionId` - Remove a question from a set
- `GET /api/sets/:id/download` - Generate a downloadable version of a set

## Authentication

The API uses JWT tokens for authentication. To access protected endpoints:

1. Authenticate the user with Supabase in your frontend
2. Get the JWT token from Supabase
3. Include the token in your API requests as a Bearer token:
   ```
   Authorization: Bearer <token>
   ```

## Models

The application uses the following MongoDB collections:

1. **Users** - User profiles
2. **Subjects** - Subject categories
3. **Exams** - Exam types
4. **QuestionTypes** - Types of questions
5. **Difficulties** - Difficulty levels
6. **Questions** - Question bank
7. **QuestionSets** - Sets of questions created by teachers

## Development

To extend the application:

1. Add new models in the `src/models` directory
2. Create controller functions in the `src/controllers` directory
3. Add new routes in the `src/routes` directory
4. Register routes in `src/index.js`