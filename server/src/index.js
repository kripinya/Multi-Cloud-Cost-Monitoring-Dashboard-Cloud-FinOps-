//env var loading
const dotenv = require('dotenv');
dotenv.config();
//importing libraries
const express = require('express');
const cors = require('cors');
//import database connection function
const connectDB = require('./config/db');

//importing route files
const costRoutes = require('./routes/costRoutes');
const alertRoutes = require('./routes/alertRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const authRoutes = require('./routes/authRoutes');

//create the express app
const app = express();

//middleware
app.use(cors());//cors allows reactfrontend(3000) port to call (port5000)
app.use(express.json()); //parses JSON request bodies so req.body works

//test route
app.get('/', (req, res) => {
    res.json({ message: 'VyayaDrishti API is running' });
});

//routes- any request to /api/costs/* will go to costRoutes
app.use('/api/costs', costRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/auth', authRoutes);

//start the server
const PORT = process.env.PORT || 5000;

//connect to MongoDB first, then start listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
