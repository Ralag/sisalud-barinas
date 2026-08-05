export const ROLES = {
    ADMIN: 'admin',
    MEDICO: 'medico',
    ENFERMERO: 'enfermero',
    RECEPCION: 'recepcion'
};

export const RECORD_TYPES = {
    CONSULTA: 'consulta',
    EMERGENCIA: 'emergencia',
    CONTROL: 'control',
    REFERENCIA: 'referencia'
};

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDERS = {
    M: 'Masculino',
    F: 'Femenino'
};

export const RECORD_TYPE_LABELS = {
    consulta: 'Consulta',
    emergencia: 'Emergencia',
    control: 'Control',
    referencia: 'Referencia'
};

export const ROLE_LABELS = {
    admin: 'Administrador',
    medico: 'Médico',
    enfermero: 'Enfermero/a',
    recepcion: 'Recepción'
};

export const VITAL_RANGES = {
    blood_pressure_sys: { normal: [90, 120], warning: [121, 140], critical: [141, 250] },
    heart_rate: { normal: [60, 100], warning: [101, 120], critical: [121, 200] },
    temperature: { normal: [36.5, 37.5], warning: [37.6, 38.5], critical: [38.6, 42.0] },
    oxygen_sat: { normal: [95, 100], warning: [90, 94], critical: [0, 89] },
    respiratory_rate: { normal: [12, 20], warning: [21, 30], critical: [31, 60] }
};

export const INSURANCE_TYPES = {
    publica: 'Cobertura Pública',
    privada: 'Seguro Privado',
    mixta: 'Mixta (Pública + Privada)',
    ninguna: 'Sin Cobertura'
};

export const ADMINISTRATION_ROUTES = {
    oral: 'Oral',
    IV: 'Intravenosa (IV)',
    IM: 'Intramuscular (IM)',
    SC: 'Subcutánea (SC)',
    topica: 'Tópica',
    inhalada: 'Inhalada',
    rectal: 'Rectal',
    sublingual: 'Sublingual',
    oftalmica: 'Oftálmica',
    otica: 'Ótica'
};

export const LAB_TYPES = {
    hematologia: 'Hematología',
    quimica_sanguinea: 'Química Sanguínea',
    uroanalisis: 'Uroanálisis',
    serologia: 'Serología',
    coagulacion: 'Coagulación',
    gases_arteriales: 'Gases Arteriales',
    hormonal: 'Hormonal',
    inmunologia: 'Inmunología',
    otro: 'Otro'
};

export const IMAGING_TYPES = {
    rayos_x: 'Rayos X',
    tomografia: 'Tomografía (TAC)',
    resonancia_magnetica: 'Resonancia Magnética (RM)',
    ecografia: 'Ecografía',
    mamografia: 'Mamografía',
    densitometria: 'Densitometría Ósea',
    otro: 'Otro'
};

export const STUDY_TYPES = {
    electrocardiograma: 'Electrocardiograma (ECG)',
    espirometria: 'Espirometría',
    encefalograma: 'Encefalograma (EEG)',
    electromiografia: 'Electromiografía (EMG)',
    ecocardiograma: 'Ecocardiograma',
    prueba_esfuerzo: 'Prueba de Esfuerzo',
    holter: 'Holter',
    otro: 'Otro'
};

export const TRIAGE_LEVELS = {
    I_resucitacion: { label: 'Nivel I — Resucitación', color: '#e74c3c' },
    II_emergencia: { label: 'Nivel II — Emergencia', color: '#f39c12' },
    III_urgencia: { label: 'Nivel III — Urgencia', color: '#f1c40f' },
    IV_menos_urgente: { label: 'Nivel IV — Menos Urgente', color: '#27ae60' },
    V_no_urgente: { label: 'Nivel V — No Urgente', color: '#3498db' }
};

export const HOSPITALIZATION_STATUS = {
    activo: { label: 'Ingresado (Activo)', color: '#27ae60' },
    alta_medica: { label: 'Alta Médica', color: '#3498db' },
    alta_voluntaria: { label: 'Alta Voluntaria', color: '#f39c12' },
    fallecido: { label: 'Fallecido', color: '#2c3e50' },
    traslado: { label: 'Trasladado', color: '#e67e22' }
};

export const MENTAL_HEALTH_TYPES = {
    evaluacion_psiquiatrica: 'Evaluación Psiquiátrica',
    evaluacion_psicologica: 'Evaluación Psicológica',
    seguimiento: 'Seguimiento',
    adiccion: 'Adicción / Dependencia',
    rehabilitacion: 'Rehabilitación'
};

export const RISK_LEVELS = {
    bajo: { label: 'Bajo', color: '#27ae60' },
    moderado: { label: 'Moderado', color: '#f1c40f' },
    alto: { label: 'Alto', color: '#e67e22' },
    critico: { label: 'Crítico', color: '#e74c3c' }
};

export const DIRECTIVE_TYPES = {
    reanimacion: 'Reanimación Cardiopulmonar (RCP)',
    cuidados_paliativos: 'Cuidados Paliativos',
    donacion_organos: 'Donación de Órganos',
    tratamiento_experimental: 'Tratamiento Experimental',
    otro: 'Otro'
};

export const SYSTEM_NAME = 'SISALUD';
export const SYSTEM_FULL_NAME = 'Sistema Informático de Salud';
