import { useState } from 'react';

export default function SearchBar({ initialValue = '', action = '/pacientes/buscar' }) {
    const [value, setValue] = useState(initialValue);
    
    return (
        <div className="search-container">
            <form method="GET" action={action} className="search-bar">
                <input
                    type="text"
                    name="cedula"
                    className="search-input"
                    placeholder="Buscar por cédula (ej: V12345678)"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoComplete="off"
                    aria-label="Cédula del paciente"
                />
                <button type="submit" className="search-btn btn btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="search-btn-text">Buscar</span>
                </button>
            </form>
        </div>
    );
}
