import { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils/supabaseClient';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('audit_log')
                .select('*, user_profiles(first_name, last_name, role)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error cargando logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        switch(action) {
            case 'CREATE': return 'badge-success';
            case 'UPDATE': return 'badge-warning';
            case 'READ': return 'badge-primary';
            case 'SEARCH': return 'badge-secondary';
            case 'LOGIN': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="card">
            <div className="card-header flex justify-between items-center">
                <h2>Registros de Auditoría (Últimos 50 eventos)</h2>
                <button className="btn btn-secondary" onClick={fetchLogs}>
                    Actualizar
                </button>
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="text-center p-8"><div className="loading"></div></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table" style={{ fontSize: '0.875rem' }}>
                            <thead>
                                <tr>
                                    <th>Fecha y Hora</th>
                                    <th>Usuario</th>
                                    <th>Acción</th>
                                    <th>Entidad</th>
                                    <th>ID Entidad</th>
                                    <th>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="whitespace-nowrap">{new Date(log.created_at).toLocaleString('es-VE')}</td>
                                        <td>
                                            {log.user_profiles ? 
                                                `${log.user_profiles.first_name} ${log.user_profiles.last_name} (${log.user_profiles.role})` 
                                                : 'Sistema / No identificado'
                                            }
                                        </td>
                                        <td><span className={`badge ${getActionColor(log.action)}`}>{log.action}</span></td>
                                        <td>{log.entity_type}</td>
                                        <td>{log.entity_id}</td>
                                        <td className="text-xs text-secondary truncate max-w-[200px]" title={JSON.stringify(log.details)}>
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center text-secondary py-4">No hay registros de auditoría.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
