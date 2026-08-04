import Head from 'next/head';
import Layout from '@/components/Layout';
import MedicalRecordForm from '@/components/MedicalRecordForm';
import AlertMessage from '@/components/AlertMessage';
import { withAuth } from '@/lib/utils/withAuth';
import * as patientService from '@/lib/services/patientService';
import { ROLES } from '@/lib/utils/constants';

export default function NuevaConsulta({ user, profile, patient, error }) {
    if (error) {
        return (
            <Layout user={user} profile={profile} title="Error - SISALUD">
                <AlertMessage type="error" message={error} />
            </Layout>
        );
    }

    if (!patient) {
        return (
            <Layout user={user} profile={profile} title="Paciente no encontrado - SISALUD">
                <AlertMessage type="warning" message="Debe especificar un paciente válido." />
            </Layout>
        );
    }

    return (
        <Layout user={user} profile={profile} title="Nueva Consulta - SISALUD">
            <div className="card mb-4 bg-gray-50">
                <div className="card-body">
                    <h3 className="mb-2">Resumen del Paciente</h3>
                    <p><strong>Paciente:</strong> {patient.first_name} {patient.last_name}</p>
                    <p><strong>Cédula:</strong> {patient.cedula}</p>
                    {patient.allergies && patient.allergies.length > 0 && (
                        <p className="text-danger mt-2">
                            <strong>¡ALERGIAS!:</strong> {patient.allergies.join(', ')}
                        </p>
                    )}
                </div>
            </div>

            <MedicalRecordForm patientId={patient.id} />
        </Layout>
    );
}

export const getServerSideProps = withAuth(async (context, supabase, user, profile) => {
    if (profile.role !== ROLES.MEDICO) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    const { cedula } = context.query;

    if (!cedula) {
        return { props: { user, profile, patient: null, error: 'Cédula no proporcionada.' } };
    }

    try {
        const patient = await patientService.searchByCedula(supabase, cedula);
        
        return {
            props: {
                user,
                profile,
                patient
            }
        };
    } catch (err) {
        return {
            props: {
                user,
                profile,
                patient: null,
                error: err.message
            }
        };
    }
});
