import Link from 'next/link';
import VitalSignsDisplay from './VitalSignsDisplay';

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('es-VE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const TYPE_LABELS = {
    'consulta': 'Consulta General',
    'emergencia': 'Emergencia',
    'control': 'Control',
    'referencia': 'Referencia'
};

export default function MedicalRecordView({ record }) {
    if (!record) return null;

    return (
        <div className="record-view card">
            <div className="record-immutable-badge badge badge-warning">
                🔒 Registro Inmutable
            </div>
            
            <div className="record-header card-header">
                <h2>{TYPE_LABELS[record.record_type] || 'Consulta'}</h2>
                <p className="text-secondary">{formatDate(record.created_at)}</p>
            </div>

            <div className="card-body">
                <div className="record-section">
                    <h3>Signos Vitales</h3>
                    <VitalSignsDisplay vitals={record} />
                </div>

                <div className="record-section">
                    <h3>Motivo de Consulta</h3>
                    <p>{record.reason_for_visit}</p>
                </div>

                {record.current_illness && (
                    <div className="record-section">
                        <h3>Enfermedad Actual</h3>
                        <p>{record.current_illness}</p>
                    </div>
                )}

                {record.physical_exam && (
                    <div className="record-section">
                        <h3>Examen Físico</h3>
                        <p>{record.physical_exam}</p>
                    </div>
                )}

                <div className="record-section">
                    <h3>Diagnóstico</h3>
                    <p>{record.diagnosis}</p>
                    {record.icd10_code && (
                        <p><span className="badge badge-primary">CIE-10: {record.icd10_code}</span></p>
                    )}
                </div>

                {record.treatment && (
                    <div className="record-section">
                        <h3>Tratamiento</h3>
                        <p>{record.treatment}</p>
                    </div>
                )}

                {record.observations && (
                    <div className="record-section">
                        <h3>Observaciones</h3>
                        <p>{record.observations}</p>
                    </div>
                )}

                <div className="record-meta">
                    <p><strong>Atendido por:</strong> {record.user_profiles?.full_name}</p>
                    <p><strong>Centro:</strong> {record.health_centers?.name}</p>
                    <p><strong>Fecha:</strong> {formatDate(record.created_at)}</p>
                </div>

                <div className="record-actions" style={{ marginTop: '20px' }}>
                    <Link href={`/pacientes/${record.patient?.cedula}`} className="btn btn-secondary">
                        Volver al Paciente
                    </Link>
                </div>
            </div>
        </div>
    );
}
