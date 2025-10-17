# EDUVERSE LMS

A comprehensive Learning Management System with role-based dashboards for students, teachers, and administrators.

## Features

- **User Authentication**: Secure login and registration with role-based access control
- **Student Dashboard**: Course enrollment, assignment submission, progress tracking
- **Teacher Dashboard**: Course management, assignment creation, student grading
- **Admin Dashboard**: User management, system monitoring, reporting

## Tech Stack

- **Frontend**: React, React Router, Bootstrap, React Icons
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd EDUVERSE-lms
```

### 2. Install server dependencies

```bash
npm install
```

### 3. Install client dependencies

```bash
cd client
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/EDUVERSE
JWT_SECRET=your_jwt_secret
```

## Running the Application

### Development Mode

To run both the server and client concurrently:

```bash
npm run dev-full
```

To run the server only:

```bash
npm run dev
```

To run the client only:

```bash
npm run client
```

### Production Mode

Build the client:

```bash
cd client
npm run build
cd ..
```

Start the server:

```bash
npm start
```

## Default User Accounts

For testing purposes, you can use these accounts:

- **Admin**: admin@EDUVERSE.com / password123
- **Teacher**: teacher@EDUVERSE.com / password123
- **Student**: student@EDUVERSE.com / password123

## API Documentation

The API endpoints are organized as follows:

- `/api/auth` - Authentication routes
- `/api/courses` - Course management
- `/api/assignments` - Assignment management
- `/api/users` - User management (admin only)

## License

MIT