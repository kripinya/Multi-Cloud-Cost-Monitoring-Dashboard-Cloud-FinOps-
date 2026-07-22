# VyayaDrishti Data Architecture Record
**Document Version:** 2.0
**Date:** July 22, 2026

---

## 1. Overview
VyayaDrishti requires a large volume of realistic, multi-cloud billing data to effectively demonstrate its analytics, visualizations, and machine learning capabilities.

Since real-world cloud billing datasets are proprietary and highly confidential, we use a programmatic **Seed Generator** (`server/seed/generateData.js`) to simulate 6 months of historical billing data across the top 3 cloud providers.

The database currently holds approximately **19,800 records** generated for the past 6 months across 18 cloud services, 10 regions, and 3 providers.

---

## 2. The Data Schema (CostRecord)
Every single row in the database follows this strict Mongoose schema, defined in `server/src/models/CostRecord.js`:

| Field | Type | Description | Example |
|---|---|---|---|
| `provider` | String (Enum) | The cloud vendor | `"AWS"`, `"Azure"`, `"GCP"` |
| `service` | String | The specific cloud service | `"EC2"`, `"Blob Storage"` |
| `region` | String | Data center location | `"us-east-1"`, `"westeurope"` |
| `cost` | Number | The monetary cost for that day | `142.50` |
| `currency` | String | Base currency | `"USD"` (Default) |
| `date` | Date | The day the cost was incurred | `ISODate("2026-06-15T00:00:00Z")` |
| `usageQuantity`| Number | The volume of usage | `450` |
| `usageUnit` | String | The metric for usage | `"hours"`, `"GB"`, `"executions"` |
| `tags.project` | String | Assigned project | `"ml-platform"` |
| `tags.team` | String | Assigned team | `"engineering"` |
| `tags.environment`| String (Enum) | Deployment stage | `"production"`, `"staging"`, `"development"` |
| `createdAt` | Date | Auto-generated timestamp | `ISODate("2026-07-01T12:00:00Z")` |
| `updatedAt` | Date | Auto-generated timestamp | `ISODate("2026-07-01T12:00:00Z")` |

---

## 3. Database Indexes
The following composite indexes are defined on the CostRecord collection to ensure fast query performance:

| Index | Fields | Purpose |
|---|---|---|
| Provider + Date | `{ provider: 1, date: -1 }` | Speeds up provider-filtered time-range queries used by Cost Explorer and Dashboard |
| Date | `{ date: -1 }` | Speeds up all date-sorted queries used by Trend charts and Forecasts |

These indexes ensure that MongoDB can efficiently serve the aggregation queries without performing full collection scans, even as the dataset grows.

---

## 4. Simulated Providers and Services
The data generator simulates **18 core services** across 3 providers to give a realistic, enterprise-grade dataset.

### AWS (Amazon Web Services) — 7 Services
| Service | Category | Base Cost | Unit | Region |
|---|---|---|---|---|
| EC2 | Compute | $150 | hours | us-east-1 |
| S3 | Storage | $15 | GB | us-east-1 |
| RDS | Database | $80 | hours | us-east-1 |
| Lambda | Serverless | $8 | requests | us-west-2 |
| CloudFront | CDN | $25 | GB | us-west-2 |
| EKS | Kubernetes | $120 | hours | eu-west-1 |
| DynamoDB | NoSQL | $20 | RCU | eu-west-1 |

### Microsoft Azure — 6 Services
| Service | Category | Base Cost | Unit | Region |
|---|---|---|---|---|
| Virtual Machines | Compute | $130 | hours | eastus |
| Blob Storage | Storage | $12 | GB | eastus |
| SQL Database | Database | $70 | DTU-hours | westeurope |
| Functions | Serverless | $6 | executions | westeurope |
| AKS | Kubernetes | $100 | hours | southeastasia |
| Cosmos DB | NoSQL | $45 | RU | southeastasia |

### GCP (Google Cloud Platform) — 5 Services
| Service | Category | Base Cost | Unit | Region |
|---|---|---|---|---|
| Compute Engine | Compute | $140 | hours | us-central1 |
| Cloud Storage | Storage | $10 | GB | us-central1 |
| BigQuery | Data Warehouse | $50 | TB-scanned | europe-west1 |
| Cloud Functions | Serverless | $5 | invocations | europe-west1 |
| GKE | Kubernetes | $110 | hours | asia-east1 |

---

## 5. Generation Logic and Patterns
To make the data look like a real company's billing export, the seed script (`server/seed/generateData.js`) applies several mathematical algorithms:

### A. Baseline Variance
Every day, the base cost of a service fluctuates by **+/-30%**.
Formula: `baseCost * random(0.7, 1.3)`

### B. Weekend Drop-off
In real companies, engineers go home on weekends, so compute usage drops. The script detects Saturdays and Sundays and slashes costs by **30% to 60%** on those days.
Formula: `cost * random(0.4, 0.7)`

### C. Month-Over-Month Growth
Cloud bills naturally grow as a company scales. The script applies an **8% monthly growth trend** using compound interest across the 6-month period.
Formula: `growthMultiplier = 1 + (monthsFromStart * 0.08)`

### D. Anomaly Spikes (Crucial for ML)
To give the Isolation Forest ML model meaningful anomalies to detect, the script injects cost spikes. There is a **2% probability** that any given record will multiply its cost by **2.5x to 5.0x** for a single day.

### E. Batch Insertion
Records are inserted in batches of 1,000 documents using `insertMany()` to avoid memory issues and maximize write throughput.

---

## 6. Organizational Tags
Every record is randomly assigned metadata tags to allow the user to filter and group costs by department:

| Tag Category | Possible Values |
|---|---|
| **Projects** | `web-app`, `mobile-api`, `data-pipeline`, `ml-platform` |
| **Teams** | `engineering`, `data-science`, `devops`, `platform` |
| **Environments** | `production`, `staging`, `development` |

---

## 7. Data Flow — End-to-End Pipeline

### 7.1 Seed to Dashboard
```
generateData.js  -->  MongoDB Atlas  -->  Express API (Aggregation)  -->  React Frontend (Recharts)
```
1. **Seed Script** (`server/seed/generateData.js`) generates 19,800+ records and pushes them to MongoDB Atlas via Mongoose.
2. **Express API** (`server/src/controllers/costController.js`) uses MongoDB Aggregation Pipelines (`$match`, `$group`, `$sort`, `$project`) to transform raw records into structured summaries (e.g., total by provider, daily costs, service breakdown, trend data).
3. **React Frontend** fetches the aggregated JSON from the API using Axios and renders it with Recharts (BarChart, LineChart, AreaChart).

### 7.2 Data to ML Pipeline
```
Express API (/api/costs/daily)  -->  Python ML Service  -->  pandas DataFrame  -->  Isolation Forest  -->  Anomaly Results
```
1. The Python ML service (`ml-service/app.py`) calls the backend's `/api/costs/daily` endpoint to fetch all daily cost data.
2. The response is loaded into a pandas DataFrame.
3. The Isolation Forest model (`contamination=0.05`, `random_state=42`) is trained on the `cost` column.
4. Records predicted as `-1` (anomalies) are filtered, sorted by cost descending, and returned to the frontend.

### 7.3 Data to AI Chat Pipeline
```
Express API (/api/costs/summary)  -->  Python ML Service  -->  System Prompt (with live data)  -->  Google Gemini  -->  AI Response
```
1. When a user sends a chat message, the ML service first calls the backend's `/api/costs/summary` endpoint.
2. The current spend data (Total, AWS, Azure, GCP) is injected into a system prompt.
3. The prompt is sent to Google Gemini (`gemini-flash-lite-latest`) along with the user's question.
4. Gemini generates a context-aware response grounded in real cost data.

### 7.4 Budget Alert Email Pipeline
```
Budget Check (/api/budgets)  -->  Threshold Comparison  -->  Nodemailer (Gmail SMTP)  -->  User Email Inbox
```
1. When budgets are fetched, the controller compares current spend against each budget's limit.
2. If utilization crosses 80% (warning) or 100% (critical), the `sendAlertEmail()` function is triggered.
3. Nodemailer sends an HTML-formatted email via Gmail SMTP to the user's registered email address.

---

## 8. Deployment Data Architecture

| Component | Host | URL |
|---|---|---|
| **Database** | MongoDB Atlas (M0 Free Cluster) | Cloud-hosted, 512 MB storage |
| **Backend API** | Render (Free Tier) | https://vyayadrishti-backend.onrender.com |
| **ML/AI Service** | Render (Free Tier) | Deployed as separate web service |
| **Frontend** | Vercel (Free Tier) | https://vyayadrishti.vercel.app |

Environment variables (`VITE_API_URL` and `VITE_ML_API_URL`) on Vercel connect the frontend to the deployed backend and ML services. The ML service uses `EXPRESS_API_URL` to communicate with the backend.
