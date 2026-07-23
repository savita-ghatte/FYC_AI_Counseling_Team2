# Complete Production Deployment Guide

This guide will explain the core concepts of deploying the AI Counsellor application to production environments. We have configured this project to run seamlessly using a **unified server architecture** where the Node.js backend natively serves the compiled React SPA.

## 1. Development vs. Production Mode

### Development Mode (`npm run dev`)
- **How it works:** You run two servers. Vite runs on port `5173` with Hot Module Replacement (instant updates when you save a file). Express runs on port `5000`. Vite acts as a proxy for API calls.
- **Why it breaks on direct browser opening:** Browsers cannot natively understand TypeScript or React JSX files. Vite compiles them dynamically in memory when you visit `http://localhost:5173`. Without Vite running, the browser refuses to connect.

### Production Mode (`npm run build` && `npm start`)
- **How it works:** You run a single server. 
  1. The React app is "compiled" (`npm run build`) into highly optimized, pure Javascript, HTML, and CSS static files located in `frontend/dist`.
  2. The Express backend is configured to statically serve these files from the same server (port `5000`).
- **Benefits:** You only need to deploy one server, there are no CORS proxy issues, and it works natively on any device.

---

## 2. Deploying on Various Platforms

### Requirements for all deployments:
1. Ensure `NODE_ENV=production` is set in your environment variables.
2. Generate the Prisma schema: `npx prisma generate` and apply migrations.

### A. Deploying to Render or Railway (PaaS - Recommended)
Since we merged the frontend into the backend, deploying to a PaaS is incredibly easy.

1. Create a new "Web Service".
2. Connect your GitHub repository.
3. **Build Command:** `npm run build` (This runs our root package.json build script, which builds both frontend and backend).
4. **Start Command:** `npm start` (This starts the Express server).
5. Add your `.env` variables (e.g., `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`).

### B. Deploying to a VPS (Ubuntu/Linux)
1. SSH into your VPS and install Node.js and PostgreSQL.
2. Clone the repository: `git clone <repo-url> && cd AI_Counsellor`
3. Install dependencies: `npm install`
4. Set your `.env` file.
5. Build the project: `npm run build`
6. Start the app as a background service using PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "ai-counsellor" -- start
   pm2 save
   ```

### C. Deploying to Windows (IIS or local network)
1. Open PowerShell as Administrator.
2. Navigate to your project folder and run `npm run build`.
3. Start the server via `npm start`.
4. Open the Windows Defender Firewall and create an Inbound Rule allowing **TCP Port 5000**.
5. Your application is now accessible to any device on your local network using your machine's local IP address (e.g., `http://192.168.1.5:5000`).

### D. Docker (Advanced)
If you prefer containerization, refer to the `Dockerfile` and `docker-compose.yml` we created in Phase 13.
1. Run `docker-compose up -d --build`
2. Nginx will automatically handle serving the frontend and proxying API requests to the backend.

### E. Split Deployment (Vercel/Netlify for Frontend)
If you wish to split them again in the future:
1. **Frontend (Vercel/Netlify):** Set the build command to `npm run build -w frontend`. Set an environment variable `VITE_API_URL` to point to your live backend domain.
2. **Backend (Render/VPS):** Deploy only the backend server and ensure CORS in `backend/src/index.ts` allows your new Vercel domain.
