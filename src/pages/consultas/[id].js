import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import MedicalRecordView from '@/components/MedicalRecordView';
import AlertMessage from '@/components/AlertMessage';
import { withAuth } from '@/lib/utils/withAuth';
import * as medicalRecordService from '@/lib/services/medicalRecordService';

export default function VerConsulta({ user, profile, record, error }) {
    if (error) {
        return (
            <Layout user={user} profile={profile} title="Error - SISALUD">
                <AlertMessage type="error" message={error} />
            </Layout>
        );
    }

    if (!record) {
        return (
            <Layout user={user} profile={profile} title="No Encontrado - SISALUD">
                <AlertMessage type="warning" message="Consulta no encontrada." />
            </Layout>
        );
    }

    return (
        <Layout user={user} profile={profile} title={`Consulta de ${record.patients?.first_name} - SISALUD`}>
            <div className="mb-4">
                <Link href={`/pacientes/${record.patients?.cedula}`} className="btn btn-secondary">
                    &larr; Volver al Perfil del Paciente
                </Link>
            </div>
            
            <div className="mb-4 text-center">
                <span className="badge badge-warning" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>
                    REGISTRO MÉDICO INMUTABLE
                </span>
            </div>

            <MedicalRecordView record={record} />
        </Layout>
    );
}

export const getServerSideProps = withAuth(async (context, supabase, user, profile) => {
    const { id } = context.params;

    try {
        const record = await medicalRecordService.getById(supabase, id);
        
        return {
            props: {
                user,
                profile,
                record
            }
        };
    } catch (err) {
        return {
            props: {
                user,
                profile,
                record: null,
                error: err.message
            }
        };
    }
});
