# VyayaDrishti

VyayaDrishti is an advanced, AI-powered FinOps dashboard that consolidates billing data across AWS, Azure, and GCP into a single unified interface. It uses Machine Learning (Isolation Forest) for anomaly detection and Agentic AI (Google Gemini) for conversational cost optimization.

---

## Data Architecture

VyayaDrishti uses a programmatic **Seed Generator** to simulate 6 months of historical billing data across the top 3 cloud providers to effectively demonstrate its analytics, visualizations, and machine learning capabilities.

### The Data Schema (CostRecord)
Every single row in the database follows this Mongoose schema:

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

### Simulated Providers & Services
The data generator simulates **18 core services** across 3 providers:
*   **AWS:** EC2, S3, RDS, Lambda, CloudFront, EKS, DynamoDB
*   **Azure:** Virtual Machines, Blob Storage, SQL Database, Functions, AKS, Cosmos DB
*   **GCP:** Compute Engine, Cloud Storage, BigQuery, Cloud Functions, GKE

### Generation Logic & Patterns
To make the data look like a real company's billing export, the seed script applies several algorithms:
1.  **Baseline Variance:** The base cost of a service fluctuates by ±30% daily.
2.  **Weekend Drop-off:** Costs drop by 30% to 60% on Saturdays and Sundays (simulating lower compute usage).
3.  **Month-Over-Month Growth:** An 8% monthly growth trend compound interest is applied.
4.  **Anomaly Spikes:** A 2% probability that any given record will multiply its cost by 2.5x to 5.0x for a single day (crucial for training the ML Anomaly Detection model).