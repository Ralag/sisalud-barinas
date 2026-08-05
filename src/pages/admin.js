import { useState } from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/lib/utils/withAuth';
import { ROLES } from '@/lib/utils/constants';

import UserManagement from '@/components/admin/UserManagement';
import AuditLogs from '@/components/admin/AuditLogs';
import CenterManagement from '@/components/admin/CenterManagement';

export default function AdminDashboard({ user, profile }) {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <Layout user={user} profile={profile} title="Panel de Administración - SISALUD">
            <div className="main-content">
                <div className="page-header">
                    <h1 className="page-title text-primary">Panel de Administración</h1>
                    <p className="text-secondary">Gestión de usuarios, centros y auditoría del sistema.</p>
                </div>

                <div className="tabs mb-4 flex gap-4 border-b border-gray-200">
                    <button 
                        className={`tab-btn pb-2 px-4 font-bold ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Usuarios (Personal)
                    </button>
                    <button 
                        className={`tab-btn pb-2 px-4 font-bold ${activeTab === 'centers' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}
                        onClick={() => setActiveTab('centers')}
                    >
                        Centros de Salud
                    </button>
                    <button 
                        className={`tab-btn pb-2 px-4 font-bold ${activeTab === 'audit' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}
                        onClick={() => setActiveTab('audit')}
                    >
                        Registros de Auditoría
                    </button>
                </div>

                <div className="tab-content mt-6">
                    {activeTab === 'users' && <UserManagement profile={profile} />}
                    {activeTab === 'centers' && <CenterManagement />}
                    {activeTab === 'audit' && <AuditLogs />}
                </div>
            </div>
        </Layout>
    );
}

export const getServerSideProps = withAuth(async (context, supabase, user, profile) => {
    // Solo permitir administradores
    if (profile.role !== ROLES.ADMIN) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        };
    }

    return {
        props: {
            user,
            profile
        }
    };
});
