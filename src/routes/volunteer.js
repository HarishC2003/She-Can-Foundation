const { withSupabase } = require('@supabase/server');

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

module.exports = volunteerHandler;
