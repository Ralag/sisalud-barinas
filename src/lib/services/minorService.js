import { sanitize, sanitizeMinor } from './cedulaService';

export async function generateMinorCedula(supabase, parentCedula) {
    const cleanParentCedula = sanitize(parentCedula);
    if (!cleanParentCedula) throw new Error('Cédula de representante inválida');

    const { data, error } = await supabase
        .from('patients')
        .select('cedula')
        .like('cedula', `${cleanParentCedula}-%`)
        .order('cedula', { ascending: false })
        .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
        const lastCedula = data[0].cedula;
        const parts = lastCedula.split('-');
        if (parts.length === 2) {
            const nextSuffix = parseInt(parts[1], 10) + 1;
            return sanitizeMinor(cleanParentCedula, nextSuffix);
        }
    }

    return sanitizeMinor(cleanParentCedula, 1);
}

export async function migrateId(supabase, patientId, newRawCedula, userId) {
    const cleanNewCedula = sanitize(newRawCedula);
    if (!cleanNewCedula) throw new Error('Nueva cédula inválida');

    const { data: currentPatient, error: fetchError } = await supabase
        .from('patients')
        .select('cedula')
        .eq('id', patientId)
        .single();

    if (fetchError || !currentPatient) throw new Error('Paciente no encontrado');

    const oldCedula = currentPatient.cedula;

    const { data: updateData, error: updateError } = await supabase
        .from('patients')
        .update({
            cedula: cleanNewCedula,
            is_minor: false,
            parent_id: null
        })
        .eq('id', patientId)
        .select()
        .single();

    if (updateError) throw updateError;

    const { error: logError } = await supabase
        .from('id_migration_log')
        .insert([{
            patient_id: patientId,
            old_cedula: oldCedula,
            new_cedula: cleanNewCedula,
            migrated_by: userId
        }]);

    if (logError) {
        console.error('Error logging ID migration:', logError);
    }

    return { success: true, data: updateData };
}
