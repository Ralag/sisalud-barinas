import { createServerClient, serializeCookieHeader } from '@supabase/ssr';

export function apiHandler(handlers) {
    return async function(req, res) {
        // Create supabase client for API routes
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return Object.keys(req.cookies || {}).map(name => ({
                            name,
                            value: req.cookies[name] || ''
                        }));
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            res.appendHeader('Set-Cookie', serializeCookieHeader(name, value, options))
                        );
                    }
                }
            }
        );

        // Verify auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        // Get profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.is_active) {
            return res.status(403).json({ error: 'Usuario inactivo' });
        }

        // Check method
        const method = req.method;
        if (!handlers[method]) {
            res.setHeader('Allow', Object.keys(handlers).join(', '));
            return res.status(405).json({ error: 'Método no permitido' });
        }

        try {
            await handlers[method](req, res, supabase, user, profile);
        } catch (err) {
            console.error('API Error:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };
}
