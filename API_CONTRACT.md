
# Pokedex Application - System Architecture Specification

This document outlines the complete system architecture for the Pokedex CRUD application. It is intended to be used by implementation agents to build the backend and frontend components.

## 1. Project Structure

The project will be organized into a monorepo structure as follows:

```
/pokedex-project
  ├── backend/         // Node.js, Express, SQLite
  ├── frontend/        // React
  └── API_CONTRACT.md  // This file
```

## 2. Database Schema (SQLite)

The application will use a single SQLite database file located at `backend/database.db`.

### Table: `Users`

Stores user information for authentication.

| Column          | Data Type         | Constraints                      | Description                   |
|-----------------|-------------------|----------------------------------|-------------------------------|
| `id`            | `INTEGER`         | `PRIMARY KEY AUTOINCREMENT`      | Unique identifier for the user. |
| `email`         | `TEXT`            | `UNIQUE`, `NOT NULL`             | User's email address.         |
| `password_hash` | `TEXT`            | `NOT NULL`                       | Hashed user password.         |

### Table: `Pokemon`

Stores Pokedex entries created by users.

| Column       | Data Type | Constraints                        | Description                                     |
|--------------|-----------|------------------------------------|-------------------------------------------------|
| `id`         | `INTEGER` | `PRIMARY KEY AUTOINCREMENT`        | Unique identifier for the Pokemon entry.        |
| `name`       | `TEXT`    | `NOT NULL`                         | The name of the Pokemon.                        |
| `types`      | `TEXT`    | `NOT NULL`                         | JSON string array of the Pokemon's types.       |
| `sprites`    | `TEXT`    | `NOT NULL`                         | JSON string object of the Pokemon's sprites.    |
| `trainer_id` | `INTEGER` | `NOT NULL`, `FOREIGN KEY(trainer_id) REFERENCES Users(id)` | The ID of the user who "owns" this Pokemon entry. |

**Note on JSON Data:**
-   **`types`**: This column will store a JSON array of strings. Example: `'["grass", "poison"]'`.
-   **`sprites`**: This column will store a JSON object containing URLs to sprite images. Example: `'{"front_default": "http://example.com/sprite.png", "back_default": "http://example.com/sprite_back.png"}'`.

---

## 3. API Contract (RESTful)

The backend will expose a RESTful API. All communication will be in JSON format.

**Base URL:** `/api`

### Authentication

Authentication will be handled using JSON Web Tokens (JWT). The token should be sent in the `Authorization` header of protected requests as `Bearer <token>`.

#### `POST /api/auth/register`
-   **Description:** Registers a new user.
-   **Authentication:** Public.
-   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "a_strong_password"
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
      "message": "User registered successfully.",
      "token": "your_jwt_here"
    }
    ```
-   **Error Response (400 Bad Request):**
    ```json
    {
      "error": "Email already in use."
    }
    ```

#### `POST /api/auth/login`
-   **Description:** Logs in an existing user.
-   **Authentication:** Public.
-   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "a_strong_password"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "token": "your_jwt_here"
    }
    ```
-   **Error Response (401 Unauthorized):**
    ```json
    {
      "error": "Invalid credentials."
    }
    ```

### Pokemon (CRUD)

These endpoints are protected and require a valid JWT.

#### `GET /api/pokemon`
-   **Description:** Retrieves all Pokemon entries for the authenticated user.
-   **Authentication:** JWT Required.
-   **Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "name": "Bulbasaur",
        "types": ["grass", "poison"],
        "sprites": { "front_default": "url_to_sprite" },
        "trainer_id": 123
      }
    ]
    ```

#### `POST /api/pokemon`
-   **Description:** Creates a new Pokemon entry for the authenticated user.
-   **Authentication:** JWT Required.
-   **Request Body:**
    ```json
    {
      "name": "Charmander",
      "types": ["fire"],
      "sprites": { "front_default": "url_to_sprite" }
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
      "id": 2,
      "name": "Charmander",
      "types": ["fire"],
      "sprites": { "front_default": "url_to_sprite" },
      "trainer_id": 123
    }
    ```

#### `GET /api/pokemon/:id`
-   **Description:** Retrieves a single Pokemon entry by its ID. The user must be the owner.
-   **Authentication:** JWT Required.
-   **Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "name": "Bulbasaur",
      "types": ["grass", "poison"],
      "sprites": { "front_default": "url_to_sprite" },
      "trainer_id": 123
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "error": "Pokemon not found."
    }
    ```

#### `PUT /api/pokemon/:id`
-   **Description:** Updates an existing Pokemon entry. The user must be the owner.
-   **Authentication:** JWT Required.
-   **Request Body (include only fields to be updated):**
    ```json
    {
      "name": "Bulbasaur EX",
      "types": ["grass", "poison", "legendary"]
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "name": "Bulbasaur EX",
      "types": ["grass", "poison", "legendary"],
      "sprites": { "front_default": "url_to_sprite" },
      "trainer_id": 123
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "error": "Pokemon not found."
    }
    ```

#### `DELETE /api/pokemon/:id`
-   **Description:** Deletes a Pokemon entry. The user must be the owner.
-   **Authentication:** JWT Required.
-   **Success Response (200 OK):**
    ```json
    {
      "message": "Pokemon deleted successfully."
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    {
      "error": "Pokemon not found."
    }
    ```
