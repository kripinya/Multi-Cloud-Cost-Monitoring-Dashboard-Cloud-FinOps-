const express = require('express');

const router = express.Router();
const mlServiceUrl = (process.env.ML_SERVICE_URL || 'http://ml-service:5001').replace(/\/$/, '');

const forwardToMlService = async (path, options = {}) => {
    const response = await fetch(`${mlServiceUrl}/api/ml${path}`, {
        ...options,
        signal: AbortSignal.timeout(30000),
    });
    const body = await response.text();

    return { status: response.status, body, contentType: response.headers.get('content-type') };
};

router.get('/anomalies', async (req, res) => {
    try {
        const response = await forwardToMlService('/anomalies');
        res.status(response.status).type(response.contentType || 'application/json').send(response.body);
    } catch (error) {
        console.error('ML anomalies proxy error:', error.message);
        res.status(503).json({ error: 'ML service unavailable' });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const response = await forwardToMlService('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        res.status(response.status).type(response.contentType || 'application/json').send(response.body);
    } catch (error) {
        console.error('ML chat proxy error:', error.message);
        res.status(503).json({ error: 'ML service unavailable' });
    }
});

module.exports = router;