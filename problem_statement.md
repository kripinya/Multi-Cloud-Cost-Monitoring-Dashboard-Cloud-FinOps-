# Problem Statement

## Multi-Cloud Cost Monitoring Dashboard with AI-Driven FinOps Intelligence

---

### 1. Problem Domain

Cloud computing adoption has grown rapidly over the past decade, and most enterprises today operate in a multi-cloud environment — running workloads simultaneously on Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP). Flexera's 2025 State of the Cloud Report notes that roughly 89% of enterprises follow a multi-cloud strategy. At the same time, cloud waste — money spent on unused or underutilized resources — eats up approximately 28 to 32 percent of total cloud budgets.

### 2. Problem Definition

When an organization uses multiple cloud providers, cost visibility becomes fragmented. AWS, Azure, and GCP each have their own billing console, their own pricing models, and their own cost management dashboards. This creates data silos that make it hard for finance and operations teams to answer basic questions about their spending. Specifically, these teams struggle to:

1. Get a single, unified view of what the company is spending across all three providers without manually logging into each console and stitching numbers together in a spreadsheet
2. Spot cost anomalies quickly — a misconfigured autoscaling rule or an accidental deployment to a premium region can run up thousands of dollars before anyone notices, often taking 3 to 7 days to surface
3. Forecast upcoming costs with any confidence, which means budgets are set based on guesswork rather than data-driven projections
4. Identify concrete optimization opportunities, since manual audits happen infrequently and tend to miss things like idle resources sitting in non-production accounts
5. Allow non-technical stakeholders (managers, finance leads) to ask questions about cost data without needing expertise in each provider's API or query language

The real-world consequences are significant. Gartner (2025) reports that organizations routinely exceed planned cloud budgets by 13 to 18 percent. FinOps teams spend upwards of 10 hours per week just aggregating and formatting cost data from multiple consoles. Optimization opportunities — switching to reserved instances, shutting down idle resources, moving workloads to cheaper regions — go unaddressed simply because nobody has the time or tooling to catch them.

### 3. Gap in Existing Solutions

| Existing Tool | What It Lacks |
|---|---|
| AWS Cost Explorer | Only covers AWS; no visibility into Azure or GCP spending |
| Azure Cost Management | Only covers Azure; no visibility into AWS or GCP spending |
| GCP Billing Console | Only covers GCP; no visibility into AWS or Azure spending |
| CloudHealth (VMware) | Enterprise-grade pricing (often $50K+/year); no conversational AI interface |
| Spot.io (NetApp) | Narrowly focused on compute optimization; does not address holistic FinOps |
| Kubecost | Specific to Kubernetes workloads; not a general-purpose cloud cost tool |

What we found through our research is that none of these existing tools combine multi-cloud aggregation, ML-driven anomaly detection, time-series cost forecasting, and an agentic AI chatbot into a single, open, accessible platform. Enterprise tools come close on some fronts but are prohibitively expensive for small and mid-size teams, and the native cloud consoles are inherently limited to a single provider.

### 4. Proposed Solution

We propose CloudFinOps — a web-based Multi-Cloud Cost Monitoring Dashboard that brings together three technology domains to address the gaps outlined above:

```
+------------------------------------------------------------+
|                       CloudFinOps                          |
+------------------+--------------------+--------------------+
|     CLOUD        |      ML / AI       |    AGENTIC AI      |
|                  |                    |                    |
| Multi-cloud data | Isolation Forest   | LLM-based chatbot |
| aggregation      | for anomaly        | with function     |
| across AWS,      | detection; time-   | calling (tool use) |
| Azure, and GCP   | series forecasting | for natural lang.  |
| billing data     | with confidence    | queries, data      |
|                  | intervals          | retrieval & actions|
+------------------+--------------------+--------------------+
```

The Cloud layer handles data ingestion and normalization — pulling billing records from all three providers into a unified schema so that costs can be compared and analyzed side by side. The ML layer applies an Isolation Forest model to learn what "normal" spending looks like for a given organization and flags deviations automatically, while a forecasting module projects costs forward using historical trends. The Agentic AI layer wraps everything in a conversational interface powered by a large language model (Google Gemini, free tier) with function-calling capabilities — so a user can type "Why did our AWS bill spike last Tuesday?" and the agent will fetch the relevant data, analyze it, and respond in plain English.

### 5. Objectives

| # | Objective |
|---|---|
| O1 | Build a responsive web dashboard that aggregates cloud cost data from AWS, Azure, and GCP into a single, unified interface with interactive visualizations |
| O2 | Implement anomaly detection using an Isolation Forest model that identifies unusual cost patterns without requiring manually configured thresholds |
| O3 | Develop a time-series forecasting module that predicts monthly cloud expenditure for the next 1 to 3 months, complete with upper and lower confidence bounds |
| O4 | Create an agentic AI chatbot with function-calling capabilities, allowing users to query, analyze, and take action on cost data through natural language |
| O5 | Build a recommendation engine that combines rule-based heuristics with AI analysis to suggest specific cost optimization strategies, each with an estimated dollar savings |
| O6 | Implement budget tracking with configurable alert thresholds so that teams are notified before they exceed their spending limits |
| O7 | Provide report generation and export functionality (PDF and CSV) for stakeholder communication and record-keeping |

### 6. Scope

**In Scope:**
- Multi-cloud cost data aggregation using simulated billing data for AWS, Azure, and GCP
- Six core dashboard pages: Overview, Cost Explorer, Budgets and Alerts, Recommendations, Reports, and Settings
- A Python-based ML microservice handling anomaly detection and cost forecasting
- An agentic AI chatbot backed by Gemini API with tool-use (function calling)
- Budget management with multi-threshold alerting
- Report generation with PDF and CSV export
- JWT-based user authentication
- Dark-themed, responsive web design

**Out of Scope:**
- Live API integration with real cloud provider billing systems (we use simulated data for the demonstration)
- Multi-tenant or multi-organization architecture
- Infrastructure provisioning or Terraform cost estimation
- Native mobile applications (though the web app is responsive)
- Real-time streaming data ingestion

### 7. Expected Outcomes

1. A fully functional, publicly deployed web application that demonstrates enterprise-grade FinOps capabilities across three cloud providers
2. Anomaly detection that surfaces cost spikes within seconds of data ingestion, compared to the typical 3-to-7-day lag of manual monitoring
3. Cost forecasts that fall within plus or minus 15 percent of actual simulated spending over a 1-month horizon
4. An AI agent that can correctly handle at least 90 percent of common FinOps questions (e.g., "What is our biggest cost driver?", "Are there any anomalies this week?") with data-backed responses
5. A minimum of 5 actionable cost optimization recommendations, each showing estimated monthly savings in dollar terms

---

**Technology Note**: This project is built entirely on free-tier and open-source technologies — Google Gemini API (free tier) for the agentic AI chatbot, scikit-learn (open-source) for ML anomaly detection, MongoDB Atlas (free M0 cluster) for data storage, and Vercel + Render (free tiers) for deployment. This demonstrates that enterprise-grade FinOps capabilities can be delivered without expensive proprietary tooling, making intelligent cloud cost management accessible to teams of any size.
