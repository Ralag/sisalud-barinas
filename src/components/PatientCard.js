import Link from 'next/link';
import { GENDERS } from '@/lib/utils/constants';

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export default function PatientCard({ patient }) {
    const age = calculateAge(patient.birth_date);
    
    return (
        <Link href={`/pacientes/${patient.cedula}`} className="patient-card card">
            <div className="patient-header">
                <h3 className="patient-name">{patient.last_name}, {patient.first_name}</h3>
                <span className="badge badge-primary patient-cedula">{patient.cedula}</span>
            </div>
            <div className="patient-info-summary">
                <span>{age} años</span>
                <span className="patient-info-divider">•</span>
                <span>{GENDERS[patient.gender]}</span>
                {patient.blood_type && (
                    <>
                        <span className="patient-info-divider">•</span>
                        <span className="text-danger">{patient.blood_type}</span>
                    </>
                )}
                {patient.is_minor && (
                    <span className="badge badge-warning">Menor</span>
                )}
            </div>
        </Link>
    );
}
