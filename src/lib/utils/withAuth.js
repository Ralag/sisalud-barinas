import { createServerSupabaseClient } from '@/lib/supabase/server';

export function withAuth(handler, allowedRoles) {
    return async function(context) {
        const supabase = createServerSupabaseClient(context);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { redirect: { destination: '/login', permanent: false } };
        }

        // Get user profile with role and health center
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*, health_centers(*)')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !profile.is_active) {
            return { redirect: { destination: '/login', permanent: false } };
        }

        // Check role if allowedRoles specified
        if (allowedRoles && !allowedRoles.includes(profile.role)) {
            return { redirect: { destination: '/?error=sin_permiso', permanent: false } };
        }

        return handler(context, supabase, user, profile);
    };
}
