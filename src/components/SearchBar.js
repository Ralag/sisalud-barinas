import { useState } from 'react';

export default function SearchBar({ initialValue = '', action = '/pacientes/buscar' }) {
    const [value, setValue] = useState(initialValue);
    
    return (
        <div className="search-container">
            <form method="GET" action={action} className="search-bar">
                <select name="cedula_prefix" className="search-select">
                    <option value="V">V</option>
                    <option value="E">E</option>
                </select>
                <input
                    type="text"
                    name="cedula_number"
                    className="search-input"
                    placeholder="Número de cédula (ej: 12345678)"
                    value={value.replace(/^[VE]/i, '')}
                    onChange={(e) => setValue(e.target.value)}
                    autoComplete="off"
                    aria-label="Número de cédula"
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
