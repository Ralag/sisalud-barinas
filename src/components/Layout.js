import Head from 'next/head';
import Header from './Header';
import { SYSTEM_NAME, SYSTEM_FULL_NAME } from '@/lib/utils/constants';

export default function Layout({ children, user, profile, title }) {
    const pageTitle = title ? `${title} | ${SYSTEM_NAME}` : `${SYSTEM_NAME} — ${SYSTEM_FULL_NAME}`;
    
    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content="Sistema Informático de Salud — Base de Datos Médicas" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </Head>
            <div className="layout">
                <Header user={user} profile={profile} />
                <main className="main-content">
                    {children}
                </main>
                <footer className="footer">
                    <p>© {new Date().getFullYear()} {SYSTEM_NAME} — {SYSTEM_FULL_NAME}</p>
                    <p className="footer-center">{profile?.health_centers?.name || ''}</p>
                </footer>
            </div>
        </>
    );
}
