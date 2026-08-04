import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

export function createServerSupabaseClient(context) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return parseCookieHeader(context.req.headers.cookie || '');
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(function(cookie) {
                        context.res.appendHeader(
                            'Set-Cookie',
                            serializeCookieHeader(cookie.name, cookie.value, cookie.options)
                        );
                    });
                }
            }
        }
    );
}
