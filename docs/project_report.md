# Project Report
## Multi-Cloud Cost Monitoring Dashboard with AI-Driven FinOps Intelligence

---

## 1. Introduction

### 1.1 Project Overview
Cloud Financial Operations (FinOps) is increasingly crucial as organizations distribute their workloads across multiple cloud platforms. However, native cost management tools provided by cloud vendors (AWS, Azure, GCP) are inherently siloed. This project, VyayaDrishti, addresses this challenge by providing a unified, multi-cloud cost monitoring dashboard integrated with machine learning and agentic AI capabilities.

### 1.2 Objectives
* To aggregate simulated billing data across AWS, Azure, and GCP into a single view.
* To apply an Isolation Forest ML algorithm to detect spending anomalies autonomously.
* To provide time-series forecasting for future cloud costs.
* To implement a conversational Agentic AI FinOps assistant using Google Gemini.
* To facilitate automated budget management and alerting via email notifications.

---

## 2. System Architecture

The application is built on a microservices architecture to ensure scalability and independent deployment of the machine learning and presentation layers.

### 2.1 Technology Stack
* **Frontend Layer**: React 18, Vite, Recharts, deployed on Vercel.
* **Backend API**: Node.js, Express.js, deployed on Render.
* **Data Storage**: MongoDB Atlas (Cloud), Mongoose ODM.
* **Machine Learning**: Python 3.12, Flask, scikit-learn (Isolation Forest).
* **Agentic AI**: Google Gemini API with native function calling.
* **Alerting**: Nodemailer for automated email notifications.
* **Containerization**: Docker and Docker Compose for orchestration.

### 2.2 System Modules
1. **Data Aggregation Engine**: Simulates and normalizes 6 months of realistic billing data across 18 core services from three major cloud providers.
2. **Dashboard & Cost Explorer**: Interactive UI providing KPI summaries, daily cost trends, and drill-down capabilities by provider, service, and region.
3. **ML Anomaly Detection**: An unsupervised machine learning service that learns normal spending patterns and automatically flags unusual cost spikes without requiring manual threshold configuration.
4. **Agentic AI Chatbot**: A natural-language interface that leverages the ReAct pattern. The agent has autonomous access to database query tools, allowing it to retrieve real cost data and provide specific insights rather than generic advice.
5. **Budget & Alerting Module**: Allows creation of spending limits with color-coded gauge charts. Automated email notifications are sent via Gmail SMTP when spending thresholds are breached.
6. **Report Generation**: Facilitates the export of cost data as formatted PDF documents and CSV files for stakeholder distribution.

---

## 3. Implementation Highlights

### 3.1 Data Normalization
A significant challenge in multi-cloud cost management is the variance in billing terminology. The project successfully normalizes data from AWS (e.g., EC2), Azure (e.g., Virtual Machines), and GCP (e.g., Compute Engine) into a unified MongoDB schema, enabling seamless cross-provider aggregation.

### 3.2 Agentic AI Integration
Unlike traditional RAG (Retrieval-Augmented Generation) implementations, this project utilizes function calling. The Gemini model is provided with a schema of available APIs (e.g., `get_top_services`, `detect_anomalies`). When a user asks a question, the model determines which function to call, waits for the backend to execute the query against MongoDB, and then structures the final response based on the live data.

### 3.3 Anomaly Detection
The Isolation Forest algorithm was chosen over static rules due to its ability to identify anomalies in high-dimensional datasets without requiring labeled training data. The model effectively isolates anomalies (like simulated random cost spikes) by recognizing data points that are "few and different".

---

## 4. Limitations and Future Scope

### 4.1 Current Limitations
* **Simulated Data**: The current iteration uses programmatically generated data to simulate cloud billing.
* **Model Training Time**: The anomaly detection model requires at least 30 days of historical data to establish a reliable baseline.
* **Single Tenant**: The application architecture is designed for a single organization and lacks role-based access control.

### 4.2 Future Enhancements
* **Live API Integration**: Replacing the simulation engine with live connections to AWS Cost Explorer, Azure Cost Management, and GCP Billing APIs.
* **Container Cost Allocation**: Integrating with tools like Kubecost to provide visibility into Kubernetes namespace-level spending.
* **Action Automation**: Allowing the AI agent to not only read data but autonomously execute cost-saving measures (e.g., terminating idle EC2 instances) after requiring user confirmation.

---

## 5. Conclusion
VyayaDrishti demonstrates that enterprise-grade Cloud FinOps capabilities can be built using open-source technologies and free-tier services. By unifying data visibility, automating anomaly detection, and introducing a natural language interface for cost analysis, the system shifts cloud cost management from a reactive, manual process to a proactive, intelligent operation.

---

## 6. Architecture & Flow Diagrams

### 6.1 Overall Architecture of VyayaDrishti
```mermaid
graph TD
    User([End User / FinOps Admin]) -->|HTTP/HTTPS| FE[Frontend<br/>React + Vite + Recharts]
    
    subgraph VyayaDrishti Platform
        FE -->|REST API Request| BE[Backend API<br/>Node.js + Express]
        FE -->|Chat / Anomaly Req| ML[ML & AI Service<br/>Python + Flask]
        
        BE <-->|Read/Write| DB[(MongoDB Atlas)]
        ML -->|Fetch Aggregated Data| BE
    end
    
    ML <-->|Prompt & Response| Gemini[Google Gemini API]
    BE -->|SMTP Email Trigger| Email[Gmail SMTP / Nodemailer]
```

### 6.2 Data Flow Diagram (Level 0)
```mermaid
graph LR
    User[FinOps User] -- "Dashboard Requests, Chat Queries" --> System((VyayaDrishti System))
    System -- "Visualizations, Alerts, AI Insights" --> User
    
    System -- "Cost Context Prompt" --> Gemini[Google Gemini API]
    Gemini -- "AI Recommendations" --> System
    
    System -- "Budget Alerts" --> SMTP[Email Server]
    SMTP -- "Email Notification" --> EmailUser[User Email Inbox]
```

### 6.3 Data Flow Diagram (Level 1)
```mermaid
graph TD
    User[FinOps User] -->|Login/Register| P1(1.0 Auth Management)
    User -->|View Dashboard| P2(2.0 Cost Processing)
    User -->|Ask Cost Question| P3(3.0 AI Assistant)
    User -->|Set Budgets| P4(4.0 Budget Management)
    
    P1 <--> DB[(MongoDB)]
    P2 <--> DB
    P4 <--> DB
    
    P2 -->|Daily Aggregations| P5(5.0 Anomaly Detection)
    P5 -->|Identified Spikes| User
    
    P4 -->|Check Thresholds| P6(6.0 Alert System)
    P6 -->|Threshold Exceeded| SMTP[SMTP Server]
    
    P2 -->|Current Spend Data| P3
    P3 <-->|Context-Aware Query| Gemini[Gemini API]
    P3 -->|Optimization Response| User
```

### 6.4 Database / Data Model
```mermaid
erDiagram
    USER ||--o{ BUDGET : creates
    USER ||--o{ ALERT : receives
    
    USER {
        ObjectId _id
        String name
        String email
        String password
        Date createdAt
    }
    
    COST_RECORD {
        ObjectId _id
        String provider "AWS, Azure, GCP"
        String service "EC2, S3, etc."
        String region
        Number cost
        Date date
        Number usageQuantity
        String usageUnit
        Object tags "project, team, env"
    }
    
    BUDGET {
        ObjectId _id
        ObjectId userId
        String name
        Number amount
        Number currentSpend
        Array alertThresholds "[80, 100]"
    }
    
    ALERT {
        ObjectId _id
        ObjectId userId
        String type "BUDGET, ANOMALY"
        String title
        String message
        String severity "low, medium, high"
        Boolean isRead
    }
```

### 6.5 Synthetic Billing Data Generation Pipeline
```mermaid
graph TD
    Start([Start Generation]) --> Config[Define Services, Regions, Base Costs]
    Config --> Loop{For each day in 6 Months}
    
    Loop --> |Yes| S1[Calculate Base Cost with 30% Variance]
    S1 --> S2{Is Weekend?}
    S2 -- Yes --> S3[Apply 30-60% Cost Reduction]
    S2 -- No --> S4[Apply 8% Monthly Compound Growth]
    S3 --> S4
    
    S4 --> S5{2% Spike Probability?}
    S5 -- Yes --> S6[Inject Anomaly: Multiply Cost by 2.5x to 5x]
    S5 -- No --> S7[Assign Random Tags: Team, Project, Env]
    S6 --> S7
    
    S7 --> Add[Add to Batch Array]
    Add --> Loop
    
    Loop -- No More Days --> Batch[Insert Batches of 1000]
    Batch --> DB[(MongoDB Atlas)]
    DB --> End([End Generation])
```

### 6.6 Isolation Forest Anomaly Detection Pipeline
```mermaid
graph TD
    Req([Client Request /api/ml/anomalies]) --> Fetch[Fetch Daily Cost Array from Node Backend]
    Fetch --> Check{Count < 10 days?}
    
    Check -- Yes --> Err[Return Error: Not enough data]
    Check -- No --> DF[Convert JSON to Pandas DataFrame]
    
    DF --> Train[Initialize IsolationForest<br/>contamination=0.05, random_state=42]
    Train --> FitPredict[Fit Model and Predict Anomalies<br/>-1 = Anomaly, 1 = Normal]
    
    FitPredict --> Filter[Filter DataFrame where Prediction == -1]
    Filter --> Sort[Sort by Cost Descending]
    Sort --> Format[Convert Dates to Strings]
    Format --> Res([Return JSON List of Anomalies])
```

### 6.7 Gemini AI Assistant Processing Flow
```mermaid
graph TD
    User([User Sends Chat Message]) --> API[POST /api/ml/chat]
    API --> Validate{Is message empty?}
    Validate -- Yes --> Err[Return Error 400]
    
    Validate -- No --> Fetch[GET /api/costs/summary from Backend]
    Fetch --> BuildCtx[Extract AWS, Azure, GCP, and Total Spend]
    
    BuildCtx --> BuildPrompt[Construct System Prompt<br/>Embed live costs as context]
    BuildPrompt --> Concat[Append User Message to System Prompt]
    
    Concat --> Request[Call gemini-flash-lite-latest API]
    Request --> Response[Parse AI Generated Content]
    Response --> Return([Send Reply to Frontend UI])
```

### 6.8 Deployment Architecture
```mermaid
graph TD
    Internet((Internet / Client)) --> Vercel
    
    subgraph Vercel Cloud [Vercel Cloud]
        Vercel[Vercel Global CDN<br/>Hosts React Frontend]
    end
    
    subgraph Render Cloud [Render Application Cloud]
        Backend[Backend Web Service<br/>Node.js / Express]
        ML[ML Web Service<br/>Python / Flask]
    end
    
    subgraph MongoDB Cloud [MongoDB Atlas Cloud]
        DB[(M0 Shared Cluster<br/>MongoDB Database)]
    end
    
    Vercel -->|HTTPS API Calls| Backend
    Vercel -->|HTTPS API Calls| ML
    
    ML -->|Internal Fetch| Backend
    ML -->|External HTTPS| Gemini[Google Cloud AI<br/>Gemini API]
    
    Backend <-->|Mongoose TCP| DB
    Backend -->|SMTP| Gmail[Gmail SMTP Servers]
```
