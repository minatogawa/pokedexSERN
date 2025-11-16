# Pokedex CRUD Application

This project is a full-stack CRUD application for managing a Pokedex. It allows users to register, log in, and manage their own collection of Pokemon.

## Tech Stack

-   **Backend:** Node.js, Express
-   **Frontend:** React
-   **Database:** SQLite
-   **Authentication:** JWT (JSON Web Tokens)

## Project Structure

```
/
├── backend/         # Node.js API
├── frontend/        # React SPA
├── .gitignore
├── API_CONTRACT.md  # API Specification
└── README.md        # This file
```

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   Node.js (v14 or later)
-   npm

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd pokedex-project
    ```

2.  **Install Backend Dependencies:**
    ```sh
    cd backend
    npm install
    cd ..
    ```

3.  **Install Frontend Dependencies:**
    ```sh
    cd frontend
    npm install
    cd ..
    ```

4.  **Initialize and Seed the Database:**
    Run the seed script from the root directory to create the database (`backend/pokedex.db`) and populate it with initial data.
    ```sh
    node backend/seed.js
    ```

### Running the Application

1.  **Start the Backend Server:**
    Open a terminal and run the following command from the `/backend` directory. The server will start on `http://localhost:3001` (or as configured).
    ```sh
    cd backend
    npm start
    ```

2.  **Start the Frontend Development Server:**
    Open a second terminal and run the following command from the `/frontend` directory. The React app will open in your browser at `http://localhost:3000`.
    ```sh
    cd frontend
    npm start
    ```
