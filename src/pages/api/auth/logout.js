import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const supabase = createServerSupabaseClient({ req, res });
    
    await supabase.auth.signOut();

    return res.redirect(303, '/login');
}
