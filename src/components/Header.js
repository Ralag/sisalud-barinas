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
                    <div className="flex flex-col text-right mr-4">
                        <span className="header-user-name font-bold">{profile?.full_name}</span>
                        <div className="flex items-center gap-2 justify-end mt-1">
                            <span className={`badge badge-${profile?.role === 'medico_tratante' ? 'primary' : profile?.role === 'admin' ? 'warning' : 'success'} text-[10px]`}>
                                {ROLE_LABELS[profile?.role] || profile?.role}
                            </span>
                            
                            {/* CUES Selector if multiple roles exist */}
                            {profile?.practitioner_roles && profile.practitioner_roles.length > 1 && (
                                <select 
                                    className="text-xs bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-gray-700 max-w-[150px] truncate"
                                    value={profile.active_cues || ''}
                                    onChange={async (e) => {
                                        await fetch('/api/auth/set-cues', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ cuesId: e.target.value })
                                        });
                                        window.location.reload();
                                    }}
                                    title="Cambiar centro de salud activo"
                                >
                                    {profile.practitioner_roles.map(r => (
                                        <option key={r.health_center_id} value={r.health_center_id}>
                                            {r.health_centers?.name} ({r.role})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {(!profile?.practitioner_roles || profile.practitioner_roles.length <= 1) && (
                                <span className="text-xs text-gray-500 truncate max-w-[150px]" title={profile?.health_centers?.name}>
                                    📍 {profile?.health_centers?.name || 'Sin Centro'}
                                </span>
                            )}
                        </div>
                    </div>
                    
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
