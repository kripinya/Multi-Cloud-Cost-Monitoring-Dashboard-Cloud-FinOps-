# VyayaDrishti

**Multi-Cloud Cost Monitoring Dashboard — Cloud FinOps**

VyayaDrishti is an advanced, AI-powered FinOps dashboard that consolidates billing data across **AWS, Azure, and GCP** into a single unified interface. It uses Machine Learning (Isolation Forest) for anomaly detection and Agentic AI (Google Gemini) for conversational cost optimization.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB Atlas (Cloud) |
| **Auth** | JWT (JSON Web Tokens), bcrypt.js |
| **ML Service** | Python, Flask, scikit-learn (Isolation Forest) — *Coming Soon* |
| **AI Chat** | Google Gemini API — *Coming Soon* |

---

## Project Structure

```
Multi-Cloud-Cost-Monitoring-Dashboard-Cloud-FinOps-/
├── server/                     # Express.js Backend
│   ├── src/
│   │   ├── config/db.js        # MongoDB Atlas connection
│   │   ├── controllers/        # Route handlers (auth, costs, budgets, alerts)
│   │   ├── middleware/auth.js   # JWT verification middleware
│   │   ├── models/             # Mongoose schemas (User, CostRecord, Budget, Alert)
│   │   ├── routes/             # API route definitions
│   │   └── index.js            # Express app entry point
│   ├── seed/                   # Database seeding scripts
│   ├── .env                    # Environment variables (PORT, MONGODB_URI, JWT_SECRET)
│   └── package.json
│
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── api/axios.js        # Centralized Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute (route guard)
│   │   │   ├── charts/         # CostChart (Recharts bar chart)
│   │   │   ├── layout/         # Sidebar, Header
│   │   │   └── ui/             # MetricCard
│   │   ├── pages/
│   │   │   ├── Auth/           # Login, Signup
│   │   │   ├── Dashboard/      # Overview with live metric cards + charts
│   │   │   ├── CostExplorer/   # Filterable cost-by-service table
│   │   │   ├── Budgets/        # Budget cards with progress bars
│   │   │   ├── Alerts/         # Color-coded alert list
│   │   │   ├── Forecasts/      # Line chart with 3-month projections
│   │   │   └── Settings/       # Profile, connected providers, logout
│   │   ├── App.jsx             # Root component with routing
│   │   └── index.css           # Tailwind v4 theme + custom CSS variables
│   └── package.json
│
└── README.MD
```

---

## Features

### Dashboard
- **4 Metric Cards** — Total Spend, AWS, Azure, GCP (live data from MongoDB)
- **6-Month Cost Trend Chart** — Grouped bar chart by provider using Recharts

### Cost Explorer
- **Service Breakdown Table** — Every cloud service ranked by cost
- **Provider Filter** — Toggle between All / AWS / Azure / GCP
- **Progress Bars** — Visual percentage indicators per service

### Budgets
- **Budget Cards** — Each budget displays current spend vs. limit
- **Color-coded Progress** — Green → Amber → Red based on usage percentage

### Alerts
- **Status-based Alerts** — Triggered (red), Active (amber), Resolved (green)
- **Icon + Color System** — Instant visual identification of alert severity

### Forecasts
- **Historical Line Chart** — Actual spend over the last 6 months
- **Projected Spend** — Dashed forecast line for the next 3 months (5% monthly growth model)

### Authentication
- **JWT-based Login/Signup** — Secure token-based authentication
- **Protected Routes** — Dashboard pages inaccessible without valid token
- **Auto-attach Token** — Axios interceptor adds `Authorization` header to every API call

### Settings
- **Profile Display** — Decoded from JWT payload
- **Connected Providers** — AWS, Azure, GCP status indicators
- **Danger Zone** — Logout with token clearing

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone https://github.com/kripinya/Multi-Cloud-Cost-Monitoring-Dashboard-Cloud-FinOps-.git
cd Multi-Cloud-Cost-Monitoring-Dashboard-Cloud-FinOps-
```

### 2. Set Up the Backend
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
PORT=4000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
```

Seed the database with simulated cloud billing data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```
The API will be running at `http://localhost:4000`.

### 3. Set Up the Frontend
```bash
cd ../frontend
npm install
npm run dev
```
The app will be running at `http://localhost:5173`.

### 4. Use the App
1. Go to `http://localhost:5173/signup` and create an account
2. You'll be redirected to the Dashboard with live data
3. Explore all pages via the sidebar navigation

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Costs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/costs/summary` | Total + per-provider spend (current month) |
| GET | `/api/costs/daily` | Daily cost data (filterable by provider, date range) |
| GET | `/api/costs/by-service` | Cost breakdown by service |
| GET | `/api/costs/by-provider` | Cost breakdown by provider |
| GET | `/api/costs/by-region` | Cost breakdown by region |
| GET | `/api/costs/trend` | Monthly trend data (default: 6 months) |

### Budgets & Alerts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets` | List all budgets |
| GET | `/api/alerts` | List all alerts |

---

## Data Architecture

VyayaDrishti uses a programmatic **Seed Generator** to simulate 6 months of historical billing data across the top 3 cloud providers.

### CostRecord Schema

| Field | Type | Description |
|---|---|---|
| `provider` | String (Enum) | The cloud vendor (`AWS`, `Azure`, `GCP`) |
| `service` | String | The specific cloud service (`EC2`, `Blob Storage`) |
| `region` | String | Data center location |
| `cost` | Number | The monetary cost for that day |
| `currency` | String | Base currency (`USD`) |
| `date` | Date | The day the cost was incurred |
| `usageQuantity`| Number | The volume of usage |
| `usageUnit` | String | The metric for usage (`hours`, `GB`) |
| `tags` | Object | Metadata (`project`, `team`, `environment`) |

### Simulated Providers & Services (CSPs)
The data generator specifically simulates **18 core services** across the top 3 Cloud Service Providers to represent a realistic, modern enterprise architecture:

**1. AWS (Amazon Web Services)**
*   **EC2** (Compute)
*   **S3** (Storage)
*   **RDS** (Database)
*   **Lambda** (Serverless)
*   **CloudFront** (CDN)
*   **EKS** (Kubernetes)
*   **DynamoDB** (NoSQL)

**2. Azure (Microsoft)**
*   **Virtual Machines** (Compute)
*   **Blob Storage** (Storage)
*   **SQL Database** (Database)
*   **Functions** (Serverless)
*   **AKS** (Kubernetes)
*   **Cosmos DB** (NoSQL)

**3. GCP (Google Cloud Platform)**
*   **Compute Engine** (Compute)
*   **Cloud Storage** (Storage)
*   **BigQuery** (Data Warehouse)
*   **Cloud Functions** (Serverless)
*   **GKE** (Kubernetes)

### Generation Logic & Patterns
To make the data look like a real company's billing export, the seed script applies several algorithms:
1.  **Baseline Variance:** The base cost of a service fluctuates by ±30% daily.
2.  **Weekend Drop-off:** Costs drop by 30% to 60% on Saturdays and Sundays (simulating lower compute usage).
3.  **Month-Over-Month Growth:** An 8% monthly growth trend compound interest is applied.
4.  **Anomaly Spikes:** A 2% probability that any given record will multiply its cost by 2.5x to 5.0x for a single day (crucial for training the ML Anomaly Detection model).

---

## Roadmap

- [x] Backend API (Express + MongoDB)
- [x] JWT Authentication
- [x] Database Seeding (6 months of simulated data)
- [x] Frontend Dashboard with live data
- [x] Cost Explorer with provider filters
- [x] Budgets & Alerts pages
- [x] Forecasts with projections
- [x] Settings & Logout
- [ ] ML Anomaly Detection (Python + Isolation Forest)
- [ ] AI Chat Assistant (Google Gemini API)
- [ ] Email/Slack Alert Notifications

---

## Author

**Ananya Karn** — [@kripinya](https://github.com/kripinya)

---

## License

This project is open source and available under the [MIT License](LICENSE).