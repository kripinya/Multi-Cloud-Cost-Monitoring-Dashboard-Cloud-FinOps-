from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import pandas as pd
from sklearn.ensemble import IsolationForest
from google import genai
import requests
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Express backend URL (your Node.js server)
# Use 'server' instead of localhost for internal Docker network communication
EXPRESS_API = os.getenv("EXPRESS_API_URL", "http://server:4000/api")

# Configure Gemini
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# ──────────────────────────────────────────────
# ENDPOINT 1: Anomaly Detection (Isolation Forest)
# ──────────────────────────────────────────────
@app.route("/api/ml/anomalies", methods=["GET"])
def detect_anomalies():
    try:
        # Get data from Express API (no MongoDB connection needed!)
        response = requests.get(f"{EXPRESS_API}/costs/daily")
        records = response.json()

        if len(records) < 10:
            return jsonify({"error": "Not enough data to detect anomalies"}), 400

        df = pd.DataFrame(records)

        # Train Isolation Forest on the 'cost' column
        model = IsolationForest(contamination=0.05, random_state=42)
        df["anomaly"] = model.fit_predict(df[["cost"]])

        # Filter anomalies (Isolation Forest marks anomalies as -1)
        anomalies = df[df["anomaly"] == -1].drop(columns=["anomaly"])

        # Convert date to string for JSON serialization
        anomalies["date"] = anomalies["date"].astype(str)

        # Sort by cost descending (biggest spikes first)
        anomalies = anomalies.sort_values("cost", ascending=False)

        return jsonify(anomalies.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ──────────────────────────────────────────────
# ENDPOINT 2: AI Chat (Google Gemini)
# ──────────────────────────────────────────────
@app.route("/api/ml/chat", methods=["POST"])
def chat():
    try:
        user_message = request.json.get("message", "")

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Get cost summary from Express API
        summary_response = requests.get(f"{EXPRESS_API}/costs/summary")
        summary = summary_response.json()
        cost_context = f"Total: ${summary.get('totalSpend', 0):.2f}, AWS: ${summary.get('aws', 0):.2f}, Azure: ${summary.get('azure', 0):.2f}, GCP: ${summary.get('gcp', 0):.2f}"

        # Build the prompt
        system_prompt = (
            "You are VyayaDrishti AI, a cloud cost optimization assistant. "
            "You help users understand and reduce their multi-cloud spending across AWS, Azure, and GCP. "
            f"Here is the user's current total spend by provider: {cost_context}. "
            "Give actionable, specific advice. Keep responses concise (under 200 words)."
        )

        response = gemini_client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=f"{system_prompt}\n\nUser: {user_message}"
        )

        return jsonify({"reply": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ──────────────────────────────────────────────
# Run the server
# ──────────────────────────────────────────────
if __name__ == "__main__":
    # Use ML_PORT to avoid collision with Node's PORT=4000 in .env
    port = int(os.getenv("ML_PORT", 5001))
    print(f"ML Service running on http://0.0.0.0:{port}")
    # host="0.0.0.0" is required for Docker to expose the port outside the container
    app.run(host="0.0.0.0", debug=True, port=port)
