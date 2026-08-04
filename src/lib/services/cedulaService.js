export const CEDULA_REGEX = /^[VE]\d{5,9}$/;
export const CEDULA_MINOR_REGEX = /^[VE]\d{5,9}-\d{2}$/;

export function sanitize(raw) {
    if (!raw) return null;
    const cleaned = String(raw).toUpperCase().replace(/[\s\.]/g, '');
    if (CEDULA_REGEX.test(cleaned) || CEDULA_MINOR_REGEX.test(cleaned)) {
        return cleaned;
    }
    return null;
}

export function sanitizeMinor(rawParentCedula, suffix) {
    const parent = sanitize(rawParentCedula);
    if (!parent) return null;
    const paddedSuffix = suffix.toString().padStart(2, '0');
    return `${parent}-${paddedSuffix}`;
}

export function validate(cedula) {
    if (!cedula) return false;
    return CEDULA_REGEX.test(cedula) || CEDULA_MINOR_REGEX.test(cedula);
}

export function isMinorCedula(cedula) {
    if (!cedula) return false;
    return CEDULA_MINOR_REGEX.test(cedula);
}
