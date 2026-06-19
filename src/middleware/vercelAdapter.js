const { Request, Headers } = global;

/**
 * Express to Web API Adapter
 * Converts an Express `req` and `res` into Web Standard `Request` and `Response` objects
 * This is required for the `@supabase/server` SDK which strictly uses Web Standards.
 */
function handleWebRoute(webHandler) {
    return async (req, res) => {
        try {
            // Construct a standard Request object from the Express request
            const protocol = req.protocol || 'http';
            const host = req.get('host') || 'localhost';
            const url = `${protocol}://${host}${req.originalUrl || '/'}`;
            
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
            
            // Call the handler wrapped by withSupabase
            const webRes = await webHandler(webReq, {});

            // Send back headers
            if (webRes && webRes.headers) {
                webRes.headers.forEach((value, key) => {
                    res.set(key, value);
                });
            }

            const status = webRes ? webRes.status : 500;
            const text = webRes ? await webRes.text() : 'Internal Server Error';
            
            // Try to parse JSON output if possible
            try {
                const json = JSON.parse(text);
                res.status(status).json(json);
            } catch {
                res.status(status).send(text);
            }
        } catch (err) {
            console.error('❌ Express Adapter Handler Error:', err.message);
            res.status(500).json({ success: false, message: `Server error: ${err.message}` });
        }
    };
}

module.exports = handleWebRoute;
