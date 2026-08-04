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
    oxygen_sat: { normal: [95, 100], warning: [90, 94], critical: [0, 89] }
};

export const SYSTEM_NAME = 'SISALUD';
export const SYSTEM_FULL_NAME = 'Sistema Informático de Salud';
