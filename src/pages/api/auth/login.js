import { createServerSupabaseClient } from '@/lib/supabase/server';

export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.redirect(303, '/login?error=Usuario y contraseña son requeridos');
    }

    const supabase = createServerSupabaseClient({ req, res });

    // Allow logging in with full email, or append @sisalud.local for short usernames
    const email = username.includes('@') ? username : `${username}@sisalud.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.redirect(303, `/login?error=Credenciales incorrectas`);
    }

    return res.redirect(303, '/');
}
