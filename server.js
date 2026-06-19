const express = require('express');
const cors = require('cors');
const path = require('path');
const { withSupabase } = require('@supabase/server');
require('dotenv').config({ override: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsing middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the current directory
app.use(express.static(path.join(__dirname)));

// -------------------------------------------------------------
// EXPRESS TO WEB API ADAPTER
// -------------------------------------------------------------
function handleWebRoute(webHandler) {
    return async (req, res) => {
        // Construct a standard Request object from the Express request
        const protocol = req.protocol;
        const host = req.get('host');
        const url = `${protocol}://${host}${req.originalUrl}`;
        
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach(v => headers.append(key, v));
                } else {
                    headers.set(key, value);
                }
            }
        }

        const requestInit = {
            method: req.method,
            headers: headers
        };

        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            requestInit.body = JSON.stringify(req.body);
            headers.set('content-type', 'application/json');
        }

        const webReq = new Request(url, requestInit);
        
        try {
            // Call the handler wrapped by withSupabase
            const webRes = await webHandler(webReq, {});

            // Send back headers
            webRes.headers.forEach((value, key) => {
                res.set(key, value);
            });

            const status = webRes.status;
            const text = await webRes.text();
            
            // Try to parse JSON output if possible
            try {
                const json = JSON.parse(text);
                res.status(status).json(json);
            } catch {
                res.status(status).send(text);
            }
        } catch (err) {
            console.error('❌ Express Adapter Handler Error:', err.message);
            res.status(500).json({ success: false, message: err.message });
        }
    };
}

// -------------------------------------------------------------
// @SUPABASE/SERVER HANDLERS
// -------------------------------------------------------------

// Asynchronous handler wrapping withSupabase for volunteers list
const volunteerHandler = withSupabase({ auth: 'none' }, async (req, ctx) => {
    try {
        const { name, email, skill, note } = await req.json();

        // Server-side validation
        if (!name || !email || !skill) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: 'Name, email, and skill are required fields.' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Write row using ctx.supabaseAdmin (bypasses Row-Level Security)
        const { data, error } = await ctx.supabaseAdmin
            .from('volunteers')
            .insert([{ name, email, skill, note: note || null }])
            .select();

        if (error) {
            throw error;
        }

        console.log(`✨ New volunteer registered via SDK: ${name} (ID: ${data[0].id})`);

        return new Response(JSON.stringify({
            success: true,
            message: 'Volunteer successfully registered in database!',
            id: data[0].id
        }), { 
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('❌ SDK Insert Volunteer Error:', err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            message: `Database error: ${err.message}` 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// Asynchronous handler wrapping withSupabase for contact messages
const contactHandler = withSupabase({ auth: 'none' }, async (req, ctx) => {
    try {
        const { name, email, message } = await req.json();

        // Validation
        if (!name || !email || !message) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: 'Name, email, and message are required fields.' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Write row using ctx.supabaseAdmin (bypasses Row-Level Security)
        const { data, error } = await ctx.supabaseAdmin
            .from('contacts')
            .insert([{ name, email, message }])
            .select();

        if (error) {
            throw error;
        }

        console.log(`✉️ New contact message received via SDK: ${name} (ID: ${data[0].id})`);

        return new Response(JSON.stringify({
            success: true,
            message: 'Contact form message successfully saved in database!',
            id: data[0].id
        }), { 
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('❌ SDK Insert Contact Error:', err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            message: `Database error: ${err.message}` 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// -------------------------------------------------------------
// EXPRESS ROUTING & LISTEN
// -------------------------------------------------------------

// Post routes routed through the Web API handlers adapter
app.post('/api/volunteer', handleWebRoute(volunteerHandler));
app.post('/api/contact', handleWebRoute(contactHandler));

// Fallback index.html route for single page app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server successfully running at http://localhost:${PORT}`);
    console.log(`📡 Ready to receive frontend form requests targeting Supabase.`);
});
