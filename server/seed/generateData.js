// This script generates ~19,800 fake billing records and inserts them into MongoDB.
// Run with: node seed/generateData.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load .env from the server root
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const CostRecord = require('../src/models/CostRecord');

// ----- CONFIGURATION -----

// All the cloud services we're simulating (from our SRS appendix)
const SERVICES = {
    AWS: [
        { name: 'EC2', region: 'us-east-1', baseCost: 150, unit: 'hours' },
        { name: 'S3', region: 'us-east-1', baseCost: 15, unit: 'GB' },
        { name: 'RDS', region: 'us-east-1', baseCost: 80, unit: 'hours' },
        { name: 'Lambda', region: 'us-west-2', baseCost: 8, unit: 'requests' },
        { name: 'CloudFront', region: 'us-west-2', baseCost: 25, unit: 'GB' },
        { name: 'EKS', region: 'eu-west-1', baseCost: 120, unit: 'hours' },
        { name: 'DynamoDB', region: 'eu-west-1', baseCost: 20, unit: 'RCU' }
    ],
    Azure: [
        { name: 'Virtual Machines', region: 'eastus', baseCost: 130, unit: 'hours' },
        { name: 'Blob Storage', region: 'eastus', baseCost: 12, unit: 'GB' },
        { name: 'SQL Database', region: 'westeurope', baseCost: 70, unit: 'DTU-hours' },
        { name: 'Functions', region: 'westeurope', baseCost: 6, unit: 'executions' },
        { name: 'AKS', region: 'southeastasia', baseCost: 100, unit: 'hours' },
        { name: 'Cosmos DB', region: 'southeastasia', baseCost: 45, unit: 'RU' }
    ],
    GCP: [
        { name: 'Compute Engine', region: 'us-central1', baseCost: 140, unit: 'hours' },
        { name: 'Cloud Storage', region: 'us-central1', baseCost: 10, unit: 'GB' },
        { name: 'BigQuery', region: 'europe-west1', baseCost: 50, unit: 'TB-scanned' },
        { name: 'Cloud Functions', region: 'europe-west1', baseCost: 5, unit: 'invocations' },
        { name: 'GKE', region: 'asia-east1', baseCost: 110, unit: 'hours' }
    ]
};

const PROJECTS = ['web-app', 'mobile-api', 'data-pipeline', 'ml-platform'];
const TEAMS = ['engineering', 'data-science', 'devops', 'platform'];
const ENVIRONMENTS = ['production', 'staging', 'development'];

// ----- HELPER FUNCTIONS -----

// Returns a random number between min and max
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// Returns a random item from an array
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ----- MAIN GENERATOR -----

async function generateData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear old data first
        await CostRecord.deleteMany({});
        console.log('Cleared existing cost records');

        const records = [];
        const today = new Date();
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Loop through every day for 6 months
        let currentDate = new Date(sixMonthsAgo);
        while (currentDate <= today) {
            const dayOfWeek = currentDate.getDay(); // 0=Sunday, 6=Saturday
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            // Calculate how many months from start (for growth trend)
            const monthsFromStart = (currentDate - sixMonthsAgo) / (1000 * 60 * 60 * 24 * 30);
            const growthMultiplier = 1 + (monthsFromStart * 0.08); // 8% monthly growth

            // For each provider and each service
            for (const [provider, services] of Object.entries(SERVICES)) {
                for (const service of services) {
                    // Base cost with some randomness (±30%)
                    let cost = service.baseCost * randomBetween(0.7, 1.3);

                    // Weekends are cheaper (less compute usage)
                    if (isWeekend) {
                        cost *= randomBetween(0.4, 0.7);
                    }

                    // Apply monthly growth trend
                    cost *= growthMultiplier;

                    // 2% chance of an anomaly spike (for testing anomaly detection)
                    const isSpike = Math.random() < 0.02;
                    if (isSpike) {
                        cost *= randomBetween(2.5, 5.0); // 2.5x to 5x normal cost
                    }

                    // Create the record
                    records.push({
                        provider,
                        service: service.name,
                        region: service.region,
                        cost: Math.round(cost * 100) / 100, // round to 2 decimals
                        currency: 'USD',
                        date: new Date(currentDate),
                        usageQuantity: Math.round(randomBetween(100, 1000)),
                        usageUnit: service.unit,
                        tags: {
                            project: randomChoice(PROJECTS),
                            team: randomChoice(TEAMS),
                            environment: randomChoice(ENVIRONMENTS)
                        }
                    });
                }
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Insert all records in bulk (much faster than one-by-one)
        console.log(`Inserting ${records.length} records...`);

        // Insert in batches of 1000 to avoid memory issues
        const batchSize = 1000;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await CostRecord.insertMany(batch);
            console.log(`  Inserted ${Math.min(i + batchSize, records.length)} / ${records.length}`);
        }

        console.log(`\nDone! Generated ${records.length} cost records.`);
        console.log('You can now check your MongoDB Atlas dashboard to see the data.');

        // Disconnect
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('Error generating data:', error);
        process.exit(1);
    }
}

// Run it
generateData();
