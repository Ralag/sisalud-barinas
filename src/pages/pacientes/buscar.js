import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import PatientCard from '@/components/PatientCard';
import { withAuth } from '@/lib/utils/withAuth';
import * as cedulaService from '@/lib/services/cedulaService';
import * as patientService from '@/lib/services/patientService';

export default function BuscarPaciente({ user, profile, query, results, error }) {
    return (
        <Layout user={user} profile={profile} title="Buscar Paciente - SISALUD">
            <div className="mb-4">
                <SearchBar 
                    initialValue={query}
                    action="/pacientes/buscar" 
                    name="cedula"
                    placeholder="Buscar por cédula o nombre..." 
                />
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            {query && results && results.length === 0 && !error && (
                <div className="card text-center p-8">
                    <p className="mb-4 text-secondary">No se encontraron pacientes con: "{query}"</p>
                    <Link href={`/pacientes/registrar?cedula=${query}`} className="btn btn-primary">
                        Registrar Nuevo Paciente
                    </Link>
                </div>
            )}

            {results && results.length > 0 && (
                <div className="grid gap-4">
                    <h2 className="mb-2">Resultados de Búsqueda ({results.length})</h2>
                    {results.map(patient => (
                        <PatientCard key={patient.id} patient={patient} />
                    ))}
                </div>
            )}
        </Layout>
    );
}

export const getServerSideProps = withAuth(async (context, supabase, user, profile) => {
    const { q, cedula, cedula_prefix, cedula_number } = context.query;
    let searchQuery = cedula || q;
    
    // Combine if separated
    if (!searchQuery && cedula_prefix && cedula_number) {
        searchQuery = `${cedula_prefix}${cedula_number}`;
    }

    if (!searchQuery) {
        return { props: { user, profile, query: '', results: null } };
    }

    try {
        const cleanQuery = cedulaService.sanitize(searchQuery);
        
        // Exact match by cedula
        const exactMatch = await patientService.searchByCedula(supabase, cleanQuery);
        
        if (exactMatch) {
            return {
                redirect: {
                    destination: `/pacientes/${exactMatch.cedula}`,
                    permanent: false,
                }
            };
        }

        // If no exact match, return empty array for now
        const results = [];

        return {
            props: {
                user,
                profile,
                query: searchQuery,
                results
            }
        };
    } catch (err) {
        return {
            props: {
                user,
                profile,
                query: searchQuery,
                results: null,
                error: err.message
            }
        };
    }
});
