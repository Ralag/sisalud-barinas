import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function UserManagement({ profile }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*, health_centers(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header flex justify-between items-center">
                <h2>Personal Médico y Administrativo</h2>
                <button className="btn btn-primary" onClick={() => alert('La creación de usuarios por panel requiere integración de Supabase Admin API. Por ahora, créalos en el panel de Supabase y asigna su perfil en la tabla user_profiles.')}>
                    + Nuevo Usuario
                </button>
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="text-center p-8"><div className="loading"></div></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Centro Asignado</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.cedula}</td>
                                        <td>{u.full_name}</td>
                                        <td>{u.username}</td>
                                        <td><span className="badge badge-primary">{u.role}</span></td>
                                        <td>{u.health_centers?.name || 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {u.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center text-secondary py-4">No hay usuarios registrados.</td>
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
