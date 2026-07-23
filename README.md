# AI Admission Counsellor

AI Admission Counsellor is a complete digital admission counsellor for Indian students across all major entrance exams, built with a modern monorepo structure.

## Project Structure

This is a monorepo setup using npm workspaces containing:

- `frontend`: React application built with Vite and Tailwind CSS.
- `backend`: Node.js Express server with Prisma ORM (PostgreSQL).

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL

## Setup Instructions

1. **Install Dependencies:**
   Run the following command at the root of the project to install dependencies for both the frontend and backend:
   ```bash
   npm install
   ```

2. **Environment Variables:**
   - In the `backend` folder, duplicate `.env.example` as `.env`.
   - Update the `DATABASE_URL` with your PostgreSQL connection string.

3. **Database Setup (Prisma):**
   Navigate to the backend and initialize the database schema:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

## Running the Application

To start both the frontend and backend development servers concurrently, run the following from the root directory:

```bash
npm start
```

## Production Deployment (Docker)

This project is fully Dockerized and orchestrated via Docker Compose.

### Prerequisites
- Docker and Docker Compose installed on your server.
- A domain name pointing to your server's IP (optional, but recommended).

### Steps
1. **Clone the repository** to your server:
   ```bash
   git clone <your-repo-url>
   cd AI_Counsellor
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.production.example .env
   # Edit .env with your real PostgreSQL credentials and JWT secrets
   nano .env
   ```

3. **Deploy using Docker Compose**:
   ```bash
   # Make scripts executable
   chmod +x scripts/deploy.sh scripts/backup.sh
   
   # Run the deployment script
   ./scripts/deploy.sh
   ```

4. **Verify Deployment**:
   The frontend will be available at `http://your-server-ip/` (served by Nginx).
   The backend API will be running behind Nginx at `http://your-server-ip/api/`.

### Backups
To backup your PostgreSQL database:
```bash
./scripts/backup.sh
```

## Authors
- AI_Counsellor Team

- **Frontend Development Server**: http://localhost:5173
- **Backend API Server**: http://localhost:5000
