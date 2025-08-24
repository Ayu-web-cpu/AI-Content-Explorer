# AI-Powered Content Explorer

A full-stack web application with authentication, search, image generation, and a dashboard.
Built with React + TailwindCSS + React Router (frontend) and FastAPI (backend).

## Features

User authentication (Login/Register with JWT)

Protected routes

Search functionality

Image generation module

Dashboard for user data

Clean light theme UI

## MCP Server

The project includes an MCP (Model Control Protocol) server that handles search and image operations.

MCP Search → Provides search results using DuckDuckGo and maintains search history.

MCP Image → Allows users to generate images and stores image history.

Dashboard (Admin only) → Admin can view user activity, manage items, and update data.

Why MCP Server?

Provides a clear separation between core API (auth, dashboard) and content APIs (search, image).

Keeps search and image workflows modular and easy to extend in future.

Ensures secure access using JWT tokens and role-based permissions.

## Setup & Run Instructions
1. Clone the Repository
git clone https://github.com/<your-username>/AI-Content-Explorer.git
cd AI-Content-Explorer

## 2. Backend Setup
cd backend

python -m venv venv

## Activate virtual environment
### Windows:
venv\Scripts\activate
### Linux/Mac:
source venv/bin/activate

### Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload



## 3. Frontend Setup
cd frontend

npm install

npm run dev


Frontend will run at: http://localhost:5173

API Documentation

The backend provides interactive API documentation:

Swagger UI → http://localhost:8000/docs

ReDoc → http://localhost:8000/redoc

# Endpoints
## API Endpoints

### Auth
- POST `/auth/register` → Register
- POST `/auth/login` → Login
- POST `/auth/refresh` → Refresh

### MCP Search
- GET `/search/` → Search DuckDuckGo
- GET `/search/history` → Get Search History
- DELETE `/search/history/{search_id}` → Delete Search History

### MCP Image
- POST `/image/` → Generate Image
- GET `/image/history` → Get Image History
- DELETE `/image/history/{image_id}` → Delete Image History

### Dashboard
- GET `/dashboard/admin/{user_id}` → List User Items (Admin)
- GET `/dashboard/admin/users/all` → List All Items (Admin)
- PUT `/dashboard/admin/{item_id}` → Update Item (Admin)

## Running Tests
Backend Tests (pytest)

cd backend
pytest -vv --disable-warnings

## Frontend Tests (Playwright)
cd frontend 

npx playwright test







