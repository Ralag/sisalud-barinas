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

            <PatientProfile patient={patient} records={records} profile={profile} />
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

        // --- TRAZABILIDAD Y AUDITORÍA FORENSE ---
        // Registrar el acceso en la bitácora inmutable
        try {
            await supabase.from('auditoria_accesos_medicos').insert([{
                doctor_id: user.id,
                cues_id: profile.active_cues || 'DESCONOCIDO',
                patient_id: patient.id,
                ip_address: context.req.headers['x-forwarded-for'] || context.req.connection.remoteAddress || 'unknown',
                action: 'VIEW_PROFILE',
                confidentiality_level_accessed: 'N', // Por defecto asume normal a menos que ejecute break-glass
                reason: 'Consulta rutinaria de historia clínica'
            }]);
        } catch (auditErr) {
            console.error("Error crítico de auditoría:", auditErr);
            // El sistema debe continuar incluso si falla el log temporalmente, o 
            // dependiendo de reglas estrictas, podría bloquear el acceso. Asumimos continuar por resiliencia.
        }

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
