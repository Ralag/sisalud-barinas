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

        // Get profile (Legacy fields preserved for fallback)
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.is_active) {
            return res.status(403).json({ error: 'Usuario inactivo' });
        }

        // Get practitioner roles (Multi-center assignments)
        const { data: practitionerRoles } = await supabase
            .from('practitioner_roles')
            .select('*, health_centers(*)')
            .eq('user_id', user.id)
            .eq('is_active', true);

        // Determine active role based on active_cues cookie
        const activeCuesId = req.cookies['active_cues'];
        let activeRole = null;

        if (practitionerRoles && practitionerRoles.length > 0) {
            activeRole = activeCuesId ? practitionerRoles.find(r => r.health_center_id === activeCuesId) : null;
            if (!activeRole) activeRole = practitionerRoles[0]; // Fallback to first available role
        }

        // Attach resolved role and center to profile object
        if (activeRole) {
            profile.role = activeRole.role;
            profile.health_centers = activeRole.health_centers;
            profile.active_cues = activeRole.health_center_id;
            profile.health_center_id = activeRole.health_center_id; // CRITICAL for API writes
            profile.practitioner_roles = practitionerRoles;
        } else if (profile.health_center_id) {
            // Legacy fallback if migration hasn't run or user hasn't been migrated
            const { data: hc } = await supabase.from('health_centers').select('*').eq('id', profile.health_center_id).single();
            profile.health_centers = hc;
            profile.active_cues = profile.health_center_id;
            profile.practitioner_roles = [];
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
            
            // Handle form submissions gracefully by redirecting back with error
            const isForm = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
            if (isForm) {
                const referer = req.headers.referer || '/';
                try {
                    // Try to parse referer as a full URL (if absolute)
                    const url = new URL(referer, `http://${req.headers.host}`);
                    url.searchParams.set('error', err.message);
                    return res.redirect(303, url.toString());
                } catch (e) {
                    return res.redirect(303, referer);
                }
            }
            
            return res.status(400).json({ error: err.message || 'Error interno del servidor' });
        }
    };
}
