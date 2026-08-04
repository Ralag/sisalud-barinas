import { sanitize } from './cedulaService';

export async function searchByCedula(supabase, rawCedula) {
    const cedula = sanitize(rawCedula);
    if (!cedula) return null;
    
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('cedula', cedula)
        .single();
        
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function searchByName(supabase, query) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(20);
        
    if (error) throw error;
    return data;
}

export async function getById(supabase, id) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
        
    if (error) throw error;
    return data;
}

export async function create(supabase, patientData) {
    const cedula = sanitize(patientData.cedula);
    if (!cedula) throw new Error('Cédula inválida');
    
    const { data, error } = await supabase
        .from('patients')
        .insert([{ ...patientData, cedula }])
        .select()
        .single();
        
    if (error) throw error;
    return data;
}

export async function update(supabase, id, updateData) {
    // Remove cedula from update payload just in case - demographics only
    const { cedula, ...safeUpdateData } = updateData;
    
    const { data, error } = await supabase
        .from('patients')
        .update(safeUpdateData)
        .eq('id', id)
        .select()
        .single();
        
    if (error) throw error;
    return data;
}

export async function getMinorsByParent(supabase, parentId) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('parent_id', parentId);
        
    if (error) throw error;
    return data;
}
