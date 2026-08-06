import { createServerSupabaseClient } from '@/lib/supabase/server';

export function withAuth(handler, allowedRoles) {
    return async function(context) {
        const supabase = createServerSupabaseClient(context);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { redirect: { destination: '/login', permanent: false } };
        }

        // Get user profile (Legacy fields preserved for fallback)
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !profile.is_active) {
            return { redirect: { destination: '/login', permanent: false } };
        }

        // Get practitioner roles (Multi-center assignments)
        const { data: practitionerRoles } = await supabase
            .from('practitioner_roles')
            .select('*, health_centers(*)')
            .eq('user_id', user.id)
            .eq('is_active', true);

        // Determine active role based on active_cues cookie
        const activeCuesId = context.req.cookies['active_cues'];
        let activeRole = null;

        if (practitionerRoles && practitionerRoles.length > 0) {
            activeRole = activeCuesId ? practitionerRoles.find(r => r.health_center_id === activeCuesId) : null;
            if (!activeRole) activeRole = practitionerRoles[0]; // Fallback to first available role
        }

        // Attach resolved role and center to profile object for backwards compatibility in UI
        if (activeRole) {
            profile.role = activeRole.role;
            profile.health_centers = activeRole.health_centers;
            profile.active_cues = activeRole.health_center_id;
            profile.practitioner_roles = practitionerRoles;
        } else if (profile.health_center_id) {
            // Legacy fallback if migration hasn't run or user hasn't been migrated
            const { data: hc } = await supabase.from('health_centers').select('*').eq('id', profile.health_center_id).single();
            profile.health_centers = hc;
            profile.active_cues = profile.health_center_id;
            profile.practitioner_roles = [];
        }

        // Check role if allowedRoles specified
        if (allowedRoles && !allowedRoles.includes(profile.role)) {
            return { redirect: { destination: '/?error=sin_permiso', permanent: false } };
        }

        return handler(context, supabase, user, profile);
    };
}
