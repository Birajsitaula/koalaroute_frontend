# BACKEND1

# 🐨 KoalaRoute AI

KoalaRoute AI is a full-stack web application designed to be an intelligent travel companion. It leverages modern web technologies and third-party APIs to provide users with real-time flight searches, AI-powered travel assistance, and a seamless booking experience. This project features a secure Node.js backend and a dynamic React frontend.

**Live Demo:** [**https://koalarouteai.com**](https://koalarouteai.com)

## ✨ Features

- **User Authentication**: Secure user registration and login system using JSON Web Tokens (JWT).
- **Real-time Flight Search**: Integrates with the Duffel API to find live flight offers from a global network of airlines.
- **Affiliate Booking System**: Uses Duffel Links to redirect users to a secure, airline-hosted payment page, ensuring commissions are earned without handling sensitive payment data.
- **AI Chat Assistant**: A chat interface to help users with their travel queries.
- **Contact Form**: A functional contact form for user inquiries.
- **RESTful API**: A well-structured backend API built with Express.js.

## 🛠️ Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **APIs**: Duffel API for flight data
- **Deployment**: Frontend on Vercel, Backend on Render

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

- [Node.js](https://nodejs.org/) (which includes npm)

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/koalaroute-ai.git
    cd koalaroute-ai
    ```

2.  **Backend Setup:**

    ```bash
    # Navigate to the backend folder
    cd backend

    # Install NPM packages
    npm install
    ```

3.  **Frontend Setup:**

    ```bash
    # Navigate to the frontend folder from the root directory
    cd frontend

    # Install NPM packages
    npm install
    ```

## ⚙️ Configuration

You will need to create `.env` files in both the backend and frontend directories to store your secret keys and configuration variables.

#### Backend Configuration (`/backend/.env`)

Create a file named `.env` in the `/backend` directory and add the following variables:

```env
# Your secret key for signing JWT tokens
JWT_SECRET=your_super_secret_jwt_key

# Your connection string for MongoDB
MONGO_URI=your_mongodb_connection_string

# Your Duffel API Access Token (use your test token for development)
DUFFEL_ACCESS_TOKEN=duffel_test_YourSecretTokenGoesHere

# The port your server will run on
PORT=5000
```

#### Frontend Configuration (`/frontend/.env`)

Create a file named `.env` in the `/frontend` directory and add the following variable:

```env
# The URL of your local backend server
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🏃‍♀️ Usage

#### Running the Backend

```bash
# Navigate to the backend folder
cd backend

# Start the server
npm start
```

Your backend API will be running at `http://localhost:5000`.

#### Running the Frontend

```bash
# Navigate to the frontend folder
cd frontend

# Start the development server
npm run dev
```

Your React application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 🗺️ API Endpoints

A brief overview of the main API routes:

- `/api/auth/register`: Create a new user account.
- `/api/auth/login`: Log in a user and receive a JWT.
- `/api/duffel/search`: `POST` request to search for flight offers.
- `/api/duffel/create-link`: `POST` request to create a Duffel Link for booking.
- `/api/contact`: Handles submissions from the contact form.
