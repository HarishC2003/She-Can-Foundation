const { withSupabase } = require('@supabase/server');

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

module.exports = contactHandler;
