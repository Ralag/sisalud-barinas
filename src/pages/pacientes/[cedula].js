import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import PatientProfile from '@/components/PatientProfile';
import AlertMessage from '@/components/AlertMessage';
import { withAuth } from '@/lib/utils/withAuth';
import * as patientService from '@/lib/services/patientService';
import * as medicalRecordService from '@/lib/services/medicalRecordService';
import { ROLES } from '@/lib/utils/constants';

export default function VerPaciente({ user, profile, patient, records, error }) {
    if (error) {
        return (
            <Layout user={user} profile={profile} title="Error - SISALUD">
                <AlertMessage type="error" message={error} />
            </Layout>
        );
    }

    if (!patient) {
        return (
            <Layout user={user} profile={profile} title="No Encontrado - SISALUD">
                <AlertMessage type="warning" message="Paciente no encontrado." />
            </Layout>
        );
    }

    return (
        <Layout user={user} profile={profile} title={`Perfil de ${patient.first_name} - SISALUD`}>
            <div className="mb-4 flex gap-2">
                {profile.role === ROLES.MEDICO && (
                    <Link href={`/consultas/nueva?cedula=${patient.cedula}`} className="btn btn-primary">
                        Nueva Consulta
                    </Link>
                )}
                <Link href={`/pacientes/${patient.cedula}/editar`} className="btn btn-secondary">
                    Editar Datos
                </Link>
                {patient.is_minor && (profile.role === ROLES.ADMIN || profile.role === ROLES.MEDICO) && (
                    <button className="btn btn-warning">
                        Migrar Cédula
                    </button>
                )}
            </div>

            <PatientProfile patient={patient} />

            <div className="card mt-4">
                <div className="card-header">
                    <h2>Historial de Consultas</h2>
                </div>
                <div className="card-body">
                    {records.length === 0 ? (
                        <p className="text-secondary">No hay consultas registradas para este paciente.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Médico</th>
                                        <th>Centro de Salud</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(r => (
                                        <tr key={r.id}>
                                            <td>{new Date(r.created_at).toLocaleDateString('es-VE')}</td>
                                            <td>{r.record_type}</td>
                                            <td>{r.user_profiles?.first_name} {r.user_profiles?.last_name}</td>
                                            <td>{r.health_centers?.name}</td>
                                            <td>
                                                <Link href={`/consultas/${r.id}`} className="text-primary hover:underline">
                                                    Ver Detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export const getServerSideProps = withAuth(async (context, supabase, user, profile) => {
    const { cedula } = context.params;

    try {
        const patient = await patientService.searchByCedula(supabase, cedula);
        
        if (!patient) {
            return { props: { user, profile, patient: null, records: [] } };
        }

        const records = await medicalRecordService.getByPatient(supabase, patient.id);

        return {
            props: {
                user,
                profile,
                patient,
                records
            }
        };
    } catch (err) {
        return {
            props: {
                user,
                profile,
                patient: null,
                records: [],
                error: err.message
            }
        };
    }
});
