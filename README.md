# TaskFlow API & Dashboard Platform 🚀

TaskFlow is a production-grade, highly scalable Task Management Platform designed with a modern Node.js/Express RESTful backend and an interactive, premium React/Vite frontend dashboard. The system incorporates robust JWT Authentication, Role-Based Access Control (RBAC), express-validator input sanitization, dynamic Swagger UI documentation, and high-performance MongoDB schemas.

---

## ━━━━━━━━━━━━━━━━━━━━━━━
## 1. TECHNICAL STACK
## ━━━━━━━━━━━━━━━━━━━━━━━

### 🌐 Backend Architecture
* **Node.js & Express.js**: Fast, minimalist web framework configured with strict API routing and centralized middlewares.
* **MongoDB & Mongoose**: Document database configured with model-level validation and compound query indexing.
* **JWT (JSON Web Tokens)**: Secure, stateless user authorization signatures.
* **bcryptjs**: Modern cryptographic password hashing.
* **express-validator**: Schema-based request body validation and HTML string sanitization.
* **Swagger (swagger-jsdoc & swagger-ui-express)**: Fully interactive, self-documenting OpenAPI 3.0 specs.

### 🎨 Frontend Dashboard
* **React.js (Vite)**: High-speed developer experience and optimized production bundles.
* **Axios**: Promised-based client with interceptor hook pipelines to inject auth JWT tokens and handle expired sessions.
* **React Router DOM**: Client-side single page app routing with Protected Route Guards.
* **Lucide React**: Modern, visually harmonious iconography.
* **Glassmorphism CSS Engine**: Tailored dark-mode variables, micro-animations, loading animations, and responsive grids.

---

## ━━━━━━━━━━━━━━━━━━━━━━━
## 2. KEY FEATURES & DESIGN
## ━━━━━━━━━━━━━━━━━━━━━━━

1. **Dual-Role RBAC Authorization**:
   * **Standard User**: Can register, login, and execute full CRUD operations (`Create`, `Read`, `Update`, `Delete`) exclusively on tasks they created.
   * **Admin User**: Access to the general Admin dashboard, capable of viewing ALL platform tasks across all users, deleting any task, and viewing a list of all registered users (names, emails, roles).
2. **Dynamic Task Stats Widget**: Summarizes total, pending, in-progress, and completed tasks in real time on the dashboard.
3. **Interactive Search & Status Filtering**: Real-time frontend matching on title/description and status-badge click triggers.
4. **Interactive Swagger API Documentation**: Accessible at `/api-docs` with schema examples and Bearer Auth tests.
5. **中央エラーハンドリング (Central Error Handler)**: Standardized server error response objects and custom operational error boundaries.

---

## ━━━━━━━━━━━━━━━━━━━━━━━
## 3. SECURITY DESIGN ACTIONS
## ━━━━━━━━━━━━━━━━━━━━━━━

| Security Mechanism | Technical Reason & Purpose |
| :--- | :--- |
| **bcryptjs Hashing** | Protects passwords against reverse lookup dictionaries and rainbow table attacks using 10 rounds of salt generation. |
| **Stateless JWT Tokens** | Retains authentication without storing session state in server RAM, allowing seamless horizontal autoscaling. |
| **express-validator Sanitization** | Mitigates NoSQL Injection and Cross-Site Scripting (XSS) by validating email patterns and sanitizing input tags. |
| **Centralized Error Boundaries** | Strips out system stack traces and file directories in production environments to prevent telemetry leakage. |
| **Restricted CORS Policy** | Limits allowed HTTP headers (`Content-Type`, `Authorization`) and restricts access to trusted origins only. |
| **Password Schema Protection** | Utilizes Mongoose `select: false` attribute so user password hashes are never retrieved by default queries. |

---

## ━━━━━━━━━━━━━━━━━━━━━━━
## 4. FOLDER STRUCTURES
## ━━━━━━━━━━━━━━━━━━━━━━━

```
backend/
├── src/
│   ├── config/          # db.js (DB connection), swagger.js (OpenAPI setup)
│   ├── controllers/     # authController.js, taskController.js, userController.js
│   ├── middleware/      # authMiddleware.js (JWT/RBAC), errorHandler.js (Unified errors)
│   ├── models/          # userModel.js, taskModel.js (Schemas & Pre-save Hooks)
│   ├── routes/          # authRoutes.js, taskRoutes.js, userRoutes.js (OpenAPI v1 Routes)
│   ├── validators/      # authValidator.js, taskValidator.js (express-validator rules)
│   ├── services/        # authService.js, taskService.js (Decoupled business logic)
│   ├── utils/           # appError.js (Custom operational error class)
│   └── app.js           # Core express configuration & middleware setup
├── server.js            # Node runtime entrypoint and crash monitors
├── .env.example         # Template configuration variables
├── package.json         # Backend dependencies & command scripts
└── README.md            # Master instructions file

frontend/
├── src/
│   ├── components/      # ProtectedRoute.jsx (Authentication guard)
│   ├── context/         # AuthContext.jsx (Global user session manager)
│   ├── services/        # api.js (Axios instance + request interceptor)
│   ├── pages/           # Login.jsx, Register.jsx, Dashboard.jsx
│   ├── App.jsx          # Router paths mapper
│   ├── index.css        # Glassmorphism design tokens & styles
│   └── main.jsx         # App mounting entrypoint
├── index.html           # Document wrapper with Google Fonts loader
├── package.json         # Frontend packages & Vite command scripts
└── vite.config.js       # Vite bundler parameters config
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━
## 5. LOCAL INSTALLATION & STARTUP
## ━━━━━━━━━━━━━━━━━━━━━━━

### Prerequisite Checklist
* **Node.js**: `v18.x` or above recommended
* **MongoDB**: A running local server instance (`mongodb://127.0.0.1:27017/taskflow`) or a MongoDB Atlas Cloud URI connection string.

---

### Step 1: Clone and Set Up Backend
1. Open your terminal inside the project directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set up environment configurations:
   * Copy the example environment template:
     ```bash
     cp .env.example .env
     ```
   * Open the new `.env` file and review key mappings:
     ```env
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
     JWT_SECRET=your_super_secret_jwt_high_entropy_key_12345!
     JWT_EXPIRES_IN=7d
     CLIENT_URL=http://localhost:5173
     ```
4. Run the backend development server:
   ```bash
   npm run dev
   ```
   * The server will print: `[Server] Running in development mode on port 5000`
   * The DB will print: `[Database] MongoDB Connected: 127.0.0.1`

---

### Step 2: Clone and Set Up Frontend
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
   * Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ━━━━━━━━━━━━━━━━━━━━━━━
## 6. TESTING WORKFLOW GUIDE
## ━━━━━━━━━━━━━━━━━━━━━━━

### 📚 Option A: API documentation (Swagger UI)
1. Ensure the backend server is running.
2. Visit [http://localhost:5000/api-docs](http://localhost:5000/api-docs) in your browser.
3. Test authentication endpoints (`POST /api/v1/auth/register` or `POST /api/v1/auth/login`) directly in the UI.
4. Copy the dynamic `data.token` response value.
5. Click **Authorize** at the top right, paste your token, and click **Authorize**.
6. You can now execute and test all protected `/api/v1/tasks` endpoints directly in the browser!

### 🧪 Option B: Importable Postman Collection
1. Open Postman.
2. Click **Import** at the top left.
3. Drag and drop the `TaskFlow_Postman_Collection.json` file located in the root of the project.
4. Once imported, select the collection.
5. Run the **Login User** or **Login Admin** request. A dynamic Postman Test Script automatically extracts the returned JWT and saves it as a dynamic global variable (`{{jwt_token}}`).
6. Run any request inside the **Tasks** folder! The auth Bearer header automatically inherits `{{jwt_token}}`.

---

## ━━━━━━━━━━━━━━━━━━━━━━━
## 7. CLOUD DEPLOYMENT BLUEPRINTS
## ━━━━━━━━━━━━━━━━━━━━━━━

### 🚀 Backend Deployment: Render
1. Register/Login at [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the project.
4. Configure the following runtime options:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Click **Advanced** and add the required environment variables:
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: *[Your MongoDB Atlas cloud connection URI]*
   * `JWT_SECRET`: *[A long, high-entropy random key string]*
   * `JWT_EXPIRES_IN`: `7d`
   * `CLIENT_URL`: *[Your Vercel Frontend URL]*
6. Click **Deploy Web Service**. Render will assign a public URL (e.g. `https://taskflow-api.onrender.com`).

---

### 🎨 Frontend Deployment: Vercel
1. Register/Login at [Vercel.com](https://vercel.com).
2. Click **Add New** and choose **Project**.
3. Import your GitHub repository.
4. Configure build options:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Click **Deploy**. Vercel will host your static files and give you a public domain name (e.g., `https://taskflow.vercel.app`).
6. *Note*: In `frontend/src/services/api.js`, update `API_BASE_URL` to point to your new Render backend URL (`https://your-app.onrender.com/api/v1`) before deploying to production.

---

## ━━━━━━━━━━━━━━━━━━━━━━━
## 8. SYSTEM SCALABILITY (HIGHLIGHT)
## ━━━━━━━━━━━━━━━━━━━━━━━

For a deep systems architecture analysis explaining how TaskFlow scales to **100,000+ active users**, please refer to our comprehensive systems design notes in [scalability_architecture.md](file:///a:/project/New%20folder%20%282%29/scalability_architecture.md). It details:
* Database Indexing strategies (`IXSCAN` optimization).
* Redis Caching opportunities for task listings and JWT blacklisting.
* Horizontal Autoscaling using Kubernetes and PM2.
* Load Balancing reverse proxy setups (Nginx, SSL offloading).
* Microservice migration paths and asynchronous queues (RabbitMQ, BullMQ).
* Grafana and Prometheus monitoring setups.
