-- ==============================================================================
-- Sistema Informático de Salud (SISALUD) - Venezuela
-- Archivo: 003_ehr_full.sql
-- Fecha: 2026-08-04
-- Descripción: Implementación completa de las 8 categorías HCEN
--              (Historia Clínica Electrónica Nacional)
-- ==============================================================================

-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORÍA 1: Datos Demográficos — Columnas faltantes en patients          ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS birth_name TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS gender_identity TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
    ADD COLUMN IF NOT EXISTS insurance_type TEXT DEFAULT 'ninguna'
        CHECK (insurance_type IN ('publica', 'privada', 'mixta', 'ninguna'));


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORÍA 3: Consultas — Columnas faltantes en medical_records            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

ALTER TABLE medical_records
    ADD COLUMN IF NOT EXISTS department TEXT,
    ADD COLUMN IF NOT EXISTS respiratory_rate INT,
    ADD COLUMN IF NOT EXISTS secondary_diagnoses JSONB DEFAULT '[]'::jsonb;


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORÍA 4: Farmacología y Prescripciones                                ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- 4a. Receta Electrónica
CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    medical_record_id BIGINT REFERENCES medical_records(id),
    prescribed_by UUID NOT NULL REFERENCES user_profiles(id),
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    administration_route TEXT NOT NULL CHECK (administration_route IN (
        'oral', 'IV', 'IM', 'SC', 'topica', 'inhalada', 'rectal', 'sublingual', 'oftalmica', 'otica'
    )),
    frequency TEXT NOT NULL,
    duration TEXT,
    instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_active ON prescriptions(patient_id, is_active) WHERE is_active = true;

-- 4b. Historial de Dispensación (Farmacia)
CREATE TABLE dispensation_history (
    id BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL REFERENCES prescriptions(id),
    dispensed_by TEXT,
    dispensed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pharmacy_location TEXT,
    quantity TEXT,
    notes TEXT
);

CREATE INDEX idx_dispensation_prescription ON dispensation_history(prescription_id);

-- 4c. Esquema de Vacunación
CREATE TABLE vaccinations (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    vaccine_name TEXT NOT NULL,
    dose_number INT NOT NULL DEFAULT 1,
    application_date DATE NOT NULL,
    lot_number TEXT,
    manufacturer TEXT,
    vaccination_center TEXT,
    administered_by UUID REFERENCES user_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_patient ON vaccinations(patient_id);


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORÍA 5: Pruebas Diagnósticas y Resultados                            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- 5a. Laboratorio Clínico
CREATE TABLE lab_results (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    medical_record_id BIGINT REFERENCES medical_records(id),
    ordered_by UUID REFERENCES user_profiles(id),
    lab_type TEXT NOT NULL CHECK (lab_type IN (
        'hematologia', 'quimica_sanguinea', 'uroanalisis', 'serologia',
        'coagulacion', 'gases_arteriales', 'hormonal', 'inmunologia', 'otro'
    )),
    test_name TEXT NOT NULL,
    result_value TEXT,
    unit TEXT,
    reference_range TEXT,
    is_abnormal BOOLEAN DEFAULT false,
    notes TEXT,
    sample_date DATE,
    result_date DATE,
    laboratory_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX idx_lab_results_date ON lab_results(result_date DESC);

-- 5b. Imagenología (PACS/DICOM)
CREATE TABLE imaging_reports (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    medical_record_id BIGINT REFERENCES medical_records(id),
    ordered_by UUID REFERENCES user_profiles(id),
    imaging_type TEXT NOT NULL CHECK (imaging_type IN (
        'rayos_x', 'tomografia', 'resonancia_magnetica', 'ecografia', 'mamografia', 'densitometria', 'otro'
    )),
    body_region TEXT,
    findings TEXT NOT NULL,
    conclusion TEXT,
    radiologist_name TEXT,
    study_date DATE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_imaging_patient ON imaging_reports(patient_id);

-- 5c. Estudios Funcionales
CREATE TABLE functional_studies (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    study_type TEXT NOT NULL CHECK (study_type IN (
        'electrocardiograma', 'espirometria', 'encefalograma', 'electromiografia',
        'ecocardiograma', 'prueba_esfuerzo', 'holter', 'otro'
    )),
    findings TEXT NOT NULL,
    conclusion TEXT,
    performed_by TEXT,
    study_date DATE NOT NULL,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_functional_patient ON functional_studies(patient_id);

-- 5d. Anatomía Patológica
CREATE TABLE pathology_results (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    sample_type TEXT NOT NULL CHECK (sample_type IN ('biopsia', 'citologia', 'autopsia', 'otro')),
    body_site TEXT,
    macroscopic_description TEXT,
    microscopic_description TEXT,
    diagnosis TEXT NOT NULL,
    pathologist_name TEXT,
    sample_date DATE,
    result_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pathology_patient ON pathology_results(patient_id);


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORÍA 6: Hospitalizaciones, Urgencias y Cirugías                      ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- 6a. Ingresos Hospitalarios
CREATE TABLE hospitalizations (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    health_center_id TEXT NOT NULL REFERENCES health_centers(id),
    admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharge_date TIMESTAMPTZ,
    admission_reason TEXT NOT NULL,
    admission_type TEXT NOT NULL CHECK (admission_type IN ('programada', 'urgencia', 'traslado')),
    bed_number TEXT,
    ward TEXT,
    attending_doctor_id UUID NOT NULL REFERENCES user_profiles(id),
    status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN (
        'activo', 'alta_medica', 'alta_voluntaria', 'fallecido', 'traslado'
    )),
    discharge_summary TEXT,
    discharge_condition TEXT,
    discharge_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hospitalizations_patient ON hospitalizations(patient_id);
CREATE INDEX idx_hospitalizations_active ON hospitalizations(patient_id, status) WHERE status = 'activo';

-- 6b. Registros de Emergencias / Triaje
CREATE TABLE emergency_records (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    health_center_id TEXT NOT NULL REFERENCES health_centers(id),
    triage_level TEXT NOT NULL CHECK (triage_level IN (
        'I_resucitacion', 'II_emergencia', 'III_urgencia', 'IV_menos_urgente', 'V_no_urgente'
    )),
    triage_color TEXT NOT NULL CHECK (triage_color IN ('rojo', 'naranja', 'amarillo', 'verde', 'azul')),
    arrival_mode TEXT CHECK (arrival_mode IN ('caminando', 'ambulancia', 'referido', 'otro')),
    chief_complaint TEXT NOT NULL,
    initial_assessment TEXT,
    evolution_notes TEXT,
    resolution TEXT,
    arrival_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharge_time TIMESTAMPTZ,
    triaged_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_patient ON emergency_records(patient_id);

-- 6c. Protocolos Operatorios (Cirugías)
CREATE TABLE surgical_protocols (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    hospitalization_id BIGINT REFERENCES hospitalizations(id),
    surgery_date TIMESTAMPTZ NOT NULL,
    procedure_name TEXT NOT NULL,
    surgical_findings TEXT,
    technique_description TEXT,
    complications TEXT,
    surgeon_id UUID NOT NULL REFERENCES user_profiles(id),
    anesthesiologist_name TEXT,
    anesthesia_type TEXT CHECK (anesthesia_type IN ('general', 'regional', 'local', 'sedacion')),
    surgical_team JSONB DEFAULT '[]'::jsonb,
    duration_minutes INT,
    post_op_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_surgical_patient ON surgical_protocols(patient_id);

-- 6d. Notas de Evolución Intrahospitalaria (SOAP)
CREATE TABLE evolution_notes (
    id BIGSERIAL PRIMARY KEY,
    hospitalization_id BIGINT NOT NULL REFERENCES hospitalizations(id),
    note_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    author_id UUID NOT NULL REFERENCES user_profiles(id),
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evolution_hospitalization ON evolution_notes(hospitalization_id);


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORÍA 7: Salud Mental y Documentos Sensibles                          ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- 7a. Registros de Salud Mental (CONFIDENCIAL)
CREATE TABLE mental_health_records (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    record_type TEXT NOT NULL CHECK (record_type IN (
        'evaluacion_psiquiatrica', 'evaluacion_psicologica', 'seguimiento', 'adiccion', 'rehabilitacion'
    )),
    evaluator_id UUID NOT NULL REFERENCES user_profiles(id),
    session_date DATE NOT NULL,
    presenting_problem TEXT,
    mental_status_exam TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    risk_assessment TEXT CHECK (risk_assessment IN ('bajo', 'moderado', 'alto', 'critico')),
    medications_notes TEXT,
    is_confidential BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mental_health_patient ON mental_health_records(patient_id);

-- 7b. Voluntades Anticipadas / Testamento Vital
CREATE TABLE advance_directives (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    directive_type TEXT NOT NULL CHECK (directive_type IN (
        'reanimacion', 'cuidados_paliativos', 'donacion_organos', 'tratamiento_experimental', 'otro'
    )),
    directive_content TEXT NOT NULL,
    witness_name TEXT,
    witness_cedula TEXT,
    document_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_directives_patient ON advance_directives(patient_id);


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORÍA 8: Seguridad, Auditoría y Control de Acceso                     ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- 8a. Consentimientos del Paciente
CREATE TABLE patient_consents (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    consent_type TEXT NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT false,
    granted_to_user_id UUID REFERENCES user_profiles(id),
    details TEXT,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ
);

CREATE INDEX idx_consents_patient ON patient_consents(patient_id);

-- 8b. Firmas Digitales
CREATE TABLE digital_signatures (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    entity_type TEXT NOT NULL,
    entity_id BIGINT NOT NULL,
    signature_hash TEXT NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signatures_entity ON digital_signatures(entity_type, entity_id);
CREATE INDEX idx_signatures_user ON digital_signatures(user_id);

-- Ampliar los tipos permitidos en audit_log
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check
    CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'SEARCH', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT'));

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_entity_type_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_entity_type_check
    CHECK (entity_type IN (
        'patient', 'medical_record', 'user', 'prescription', 'vaccination',
        'lab_result', 'imaging', 'hospitalization', 'emergency', 'surgery',
        'mental_health', 'consent', 'directive'
    ));
