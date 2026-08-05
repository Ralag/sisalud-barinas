import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import { withAuth } from '@/lib/utils/withAuth';
import { ROLES } from '@/lib/utils/constants';

export default function Dashboard({ user, profile, stats, recentConsultations }) {
    return (
        <Layout user={user} profile={profile} title="Inicio - SISALUD">
            <div className="main-content">
                <h1 className="text-primary mb-4">Bienvenido, {profile?.first_name} {profile?.last_name}</h1>
                
                <div className="card mb-4">
                    <div className="card-body">
                        <SearchBar 
                            action="/pacientes/buscar" 
                            placeholder="Buscar paciente por cédula o nombre..." 
                        />
                    </div>
                </div>

                <div className="stats-grid mb-4">
                    <div className="card text-center p-4 stat-card">
                        <h3 className="text-secondary vital-label">Pacientes Hoy</h3>
                        <p className="text-3xl font-bold vital-value">{stats.patientsToday}</p>
                    </div>
                    <div className="card text-center p-4 stat-card">
                        <h3 className="text-secondary vital-label">Consultas Hoy</h3>
                        <p className="text-3xl font-bold vital-value">{stats.consultationsToday}</p>
                    </div>
                    <div className="card text-center p-4 stat-card">
                        <h3 className="text-secondary vital-label">Total Pacientes</h3>
                        <p className="text-3xl font-bold vital-value">{stats.totalPatients}</p>
                    </div>
                    <div className="card text-center p-4 stat-card">
                        <h3 className="text-secondary vital-label">Total Consultas</h3>
                        <p className="text-3xl font-bold vital-value">{stats.totalConsultations}</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <Link href="/pacientes/registrar" className="btn btn-primary">
                        Registrar Paciente
                    </Link>
                    {profile?.role === ROLES.MEDICO && (
                        <Link href="/pacientes/buscar" className="btn btn-secondary">
                            Nueva Consulta
                        </Link>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Consultas Recientes</h2>
                    </div>
                    <div className="card-body">
                        {recentConsultations.length === 0 ? (
                            <p className="text-secondary">No hay consultas recientes.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table history-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Paciente</th>
                                            <th>Tipo</th>
                                            <th>Médico</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentConsultations.map(c => (
                                            <tr key={c.id}>
                                                <td>{new Date(c.created_at).toLocaleDateString('es-VE')}</td>
                                                <td>{c.patients?.first_name} {c.patients?.last_name}</td>
                                                <td>{c.record_type}</td>
                                                <td>{c.user_profiles?.first_name} {c.user_profiles?.last_name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export const getServerSideProps = withAuth(async (context, supabase, user, profile) => {
    // Get start of today in ISO string for queries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const stats = {
        patientsToday: 0,
        consultationsToday: 0,
        totalPatients: 0,
        totalConsultations: 0
    };

    try {
        // Fetch total patients
        const { count: totalPatients } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true });
            
        // Fetch patients today
        const { count: patientsToday } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayISO);

        // Fetch total consultations
        const { count: totalConsultations } = await supabase
            .from('medical_records')
            .select('*', { count: 'exact', head: true });

        // Fetch consultations today
        const { count: consultationsToday } = await supabase
            .from('medical_records')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayISO);

        stats.totalPatients = totalPatients || 0;
        stats.patientsToday = patientsToday || 0;
        stats.totalConsultations = totalConsultations || 0;
        stats.consultationsToday = consultationsToday || 0;

    } catch (e) {
        console.error('Error fetching stats:', e);
    }

    // Fetch recent consultations
    let recentConsultations = [];
    try {
        const { data } = await supabase
            .from('medical_records')
            .select('id, created_at, record_type, patients(first_name, last_name), user_profiles(first_name, last_name)')
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (data) {
            recentConsultations = data;
        }
    } catch (e) {
        console.error('Error fetching recent consultations:', e);
    }

    return {
        props: {
            user,
            profile,
            stats,
            recentConsultations
        }
    };
});
