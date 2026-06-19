const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ override: true });

// Import Controllers and Middleware
const handleWebRoute = require('./middleware/vercelAdapter');
const volunteerHandler = require('./routes/volunteer');
const contactHandler = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsing middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express routes routed through the Web API handlers adapter
app.post('/api/volunteer', handleWebRoute(volunteerHandler));
app.post('/api/contact', handleWebRoute(contactHandler));

// Export the app for serverless environments (like Vercel)
module.exports = app;

// Start the server locally only if not running inside a serverless handler
if (require.main === module) {
    // Serve static frontend files from the public directory locally
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Fallback index.html route for single page app locally
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server successfully running at http://localhost:${PORT}`);
        console.log(`📡 Ready to receive frontend form requests targeting Supabase.`);
    });
}
