import { GENDERS } from '@/lib/utils/constants';

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PatientProfile({ patient, parent }) {
    const age = calculateAge(patient.birth_date);
    const allergies = patient.allergies || [];
    const conditions = patient.chronic_conditions || [];
    
    return (
        <div className="card patient-profile">
            <div className="card-header">
                <div>
                    <h2 className="patient-name">{patient.first_name} {patient.last_name}</h2>
                    <span className="badge badge-primary patient-cedula">{patient.cedula}</span>
                    {patient.is_minor && <span className="badge badge-warning">Menor de Edad</span>}
                </div>
            </div>
            <div className="card-body">
                <div className="patient-info-grid">
                    <div className="patient-info-item">
                        <span className="patient-info-label">Fecha de Nacimiento</span>
                        <span className="patient-info-value">{formatDate(patient.birth_date)}</span>
                    </div>
                    <div className="patient-info-item">
                        <span className="patient-info-label">Edad</span>
                        <span className="patient-info-value">{age} años</span>
                    </div>
                    <div className="patient-info-item">
                        <span className="patient-info-label">Género</span>
                        <span className="patient-info-value">{GENDERS[patient.gender]}</span>
                    </div>
                    <div className="patient-info-item">
                        <span className="patient-info-label">Tipo de Sangre</span>
                        <span className="patient-info-value text-danger">{patient.blood_type || 'No registrado'}</span>
                    </div>
                    <div className="patient-info-item">
                        <span className="patient-info-label">Teléfono</span>
                        <span className="patient-info-value">{patient.phone || 'No registrado'}</span>
                    </div>
                    <div className="patient-info-item">
                        <span className="patient-info-label">Municipio</span>
                        <span className="patient-info-value">{patient.municipality || 'No registrado'}, {patient.state}</span>
                    </div>
                    <div className="patient-info-item patient-info-item--full">
                        <span className="patient-info-label">Dirección</span>
                        <span className="patient-info-value">{patient.address || 'No registrada'}</span>
                    </div>
                    <div className="patient-info-item">
                        <span className="patient-info-label">Contacto de Emergencia</span>
                        <span className="patient-info-value">{patient.emergency_contact_name || 'No registrado'}</span>
                    </div>
                    <div className="patient-info-item">
                        <span className="patient-info-label">Teléfono de Emergencia</span>
                        <span className="patient-info-value">{patient.emergency_contact_phone || 'No registrado'}</span>
                    </div>
                </div>
                
                {patient.is_minor && parent && (
                    <div className="patient-parent-info">
                        <h4>Representante Legal</h4>
                        <p>{parent.first_name} {parent.last_name} — <span className="badge badge-primary">{parent.cedula}</span></p>
                    </div>
                )}
                
                <div className="patient-tags-section">
                    <h4>Alergias</h4>
                    <div className="patient-tags">
                        {allergies.length > 0 
                            ? allergies.map((a, i) => <span key={i} className="patient-tag patient-tag-allergy">{a}</span>)
                            : <span className="text-secondary">Ninguna registrada</span>
                        }
                    </div>
                </div>
                
                <div className="patient-tags-section">
                    <h4>Condiciones Crónicas</h4>
                    <div className="patient-tags">
                        {conditions.length > 0 
                            ? conditions.map((c, i) => <span key={i} className="patient-tag patient-tag-condition">{c}</span>)
                            : <span className="text-secondary">Ninguna registrada</span>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
