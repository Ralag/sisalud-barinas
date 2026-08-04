import { useRouter } from 'next/router';
import Head from 'next/head';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default function Login({ error }) {
    return (
        <div className="login-container">
            <Head>
                <title>Iniciar Sesión - SISALUD</title>
            </Head>
            <div className="card login-card">
                <div className="card-header">
                    <h1 className="login-title">SISALUD</h1>
                    <p className="login-subtitle">Sistema Informático de Salud</p>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-error">{error}</div>}
                    <form method="POST" action="/api/auth/login">
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">Usuario</label>
                            <input
                                className="form-input"
                                type="text"
                                id="username"
                                name="username"
                                required
                                autoCapitalize="none"
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Contraseña</label>
                            <input
                                className="form-input"
                                type="password"
                                id="password"
                                name="password"
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Iniciar Sesión
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    const supabase = createServerSupabaseClient(context);
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const { error } = context.query;

    return {
        props: {
            error: error || null,
        },
    };
}
