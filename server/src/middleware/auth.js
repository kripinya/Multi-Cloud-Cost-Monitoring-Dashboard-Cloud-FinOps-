const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        // Format: "Bearer eyJhbGciOi..."
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user ID to the request object — now every route handler can access req.userId
        req.userId = decoded.userId;

        // Continue to the actual route handler
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
