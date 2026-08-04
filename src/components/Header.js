import { useState } from 'react';
import Link from 'next/link';
import { SYSTEM_NAME, ROLE_LABELS } from '@/lib/utils/constants';

export default function Header({ user, profile }) {
    const [menuOpen, setMenuOpen] = useState(false);
    
    return (
        <header className="header">
            <div className="header-inner">
                <Link href="/" className="header-brand">
                    <img src="/img/logo.svg" alt={SYSTEM_NAME} className="header-logo" width="36" height="36" />
                    <span className="header-brand-text">{SYSTEM_NAME}</span>
                </Link>
                
                <nav className={`header-nav ${menuOpen ? 'header-nav--open' : ''}`}>
                    <Link href="/" className="header-nav-link">Inicio</Link>
                    <Link href="/pacientes/registrar" className="header-nav-link">Registrar Paciente</Link>
                    {profile?.role === 'admin' && (
                        <Link href="/admin" className="header-nav-link">Admin</Link>
                    )}
                </nav>
                
                <div className="header-user">
                    <span className="header-user-name">{profile?.full_name}</span>
                    <span className={`badge badge-${profile?.role === 'medico' ? 'primary' : profile?.role === 'admin' ? 'warning' : 'success'}`}>
                        {ROLE_LABELS[profile?.role] || profile?.role}
                    </span>
                    <form method="POST" action="/api/auth/logout" style={{display:'inline'}}>
                        <button type="submit" className="btn btn-sm btn-secondary header-logout-btn">Salir</button>
                    </form>
                </div>
                
                <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
                    <span className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}></span>
                </button>
            </div>
        </header>
    );
}
