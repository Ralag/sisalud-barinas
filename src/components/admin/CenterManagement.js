import { useState, useEffect } from 'react';
import { supabase } from '@/lib/utils/supabaseClient';

export default function CenterManagement() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            const { data, error } = await supabase
                .from('health_centers')
                .select('*')
                .order('name');

            if (error) throw error;
            setCenters(data || []);
        } catch (error) {
            console.error('Error cargando centros:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header flex justify-between items-center">
                <h2>Centros de Salud</h2>
                <button className="btn btn-primary" onClick={() => alert('Función de agregar centro en desarrollo')}>
                    + Nuevo Centro
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
                                    <th>Código ID</th>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Municipio</th>
                                    <th>Estado (Ubicación)</th>
                                    <th>Operatividad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {centers.map(c => (
                                    <tr key={c.id}>
                                        <td><span className="badge badge-secondary">{c.id}</span></td>
                                        <td className="font-bold">{c.name}</td>
                                        <td className="capitalize">{c.center_type}</td>
                                        <td>{c.municipality}</td>
                                        <td>{c.state}</td>
                                        <td>
                                            <span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {c.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {centers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center text-secondary py-4">No hay centros registrados.</td>
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
