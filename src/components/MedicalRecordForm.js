import Link from 'next/link';
import VitalSignsInput from './VitalSignsInput';

export default function MedicalRecordForm({ patient, action, profile }) {
    return (
        <form method="POST" action={action} className="medical-record-form">
            <input type="hidden" name="patient_id" value={patient.id} />
            <input type="hidden" name="health_center_id" value={profile.health_center_id} />
            <input type="hidden" name="attending_user_id" value={profile.id} />

            <div className="form-section">
                <h3 className="form-section-title">Tipo de Atención</h3>
                <div className="form-group">
                    <label className="form-label" htmlFor="record_type">Tipo de Registro</label>
                    <select id="record_type" name="record_type" className="form-select" required>
                        <option value="consulta">Consulta General</option>
                        <option value="emergencia">Emergencia</option>
                        <option value="control">Control</option>
                        <option value="referencia">Referencia</option>
                    </select>
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Signos Vitales</h3>
                <VitalSignsInput />
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Evaluación Clínica</h3>
                
                <div className="form-group">
                    <label className="form-label" htmlFor="reason_for_visit">Motivo de Consulta <span className="text-danger">*</span></label>
                    <textarea id="reason_for_visit" name="reason_for_visit" className="form-textarea" required rows="3"></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="current_illness">Enfermedad Actual</label>
                    <textarea id="current_illness" name="current_illness" className="form-textarea" rows="4"></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="physical_exam">Examen Físico</label>
                    <textarea id="physical_exam" name="physical_exam" className="form-textarea" rows="4"></textarea>
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Diagnóstico y Tratamiento</h3>

                <div className="form-group">
                    <label className="form-label" htmlFor="diagnosis">Diagnóstico <span className="text-danger">*</span></label>
                    <textarea id="diagnosis" name="diagnosis" className="form-textarea" required rows="3"></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="icd10_code">Código CIE-10</label>
                    <input type="text" id="icd10_code" name="icd10_code" className="form-input" placeholder="Ej: J00" />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="treatment">Tratamiento</label>
                    <textarea id="treatment" name="treatment" className="form-textarea" rows="4"></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="observations">Observaciones</label>
                    <textarea id="observations" name="observations" className="form-textarea" rows="3"></textarea>
                </div>
            </div>

            <div className="alert alert-warning animate-slide-up">
                <span className="alert-icon">⚠</span>
                <span className="alert-message">Una vez guardada, esta consulta NO podrá ser modificada ni eliminada.</span>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary">Guardar Consulta</button>
                <Link href={`/pacientes/${patient.cedula}`} className="btn btn-secondary">Cancelar</Link>
            </div>
        </form>
    );
}
