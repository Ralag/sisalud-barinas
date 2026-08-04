export default function AlertMessage({ type = 'info', message, onClose }) {
    if (!message) return null;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    return (
        <div className={`alert alert-${type} animate-slide-up`} role="alert">
            <span className="alert-icon">{icons[type]}</span>
            <span className="alert-message">{message}</span>
            {onClose && (
                <button className="alert-close" onClick={onClose} aria-label="Cerrar">×</button>
            )}
        </div>
    );
}
