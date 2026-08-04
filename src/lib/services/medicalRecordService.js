export async function create(supabase, recordData) {
    if (!recordData.reason || !recordData.diagnosis) {
        throw new Error('Motivo y diagnóstico son campos obligatorios');
    }
    
    const { data, error } = await supabase
        .from('medical_records')
        .insert([recordData])
        .select()
        .single();
        
    if (error) throw error;
    return data;
}

export async function getById(supabase, id) {
    const { data, error } = await supabase
        .from('medical_records')
        .select(`
            *,
            patients (*)
        `)
        .eq('id', id)
        .single();
        
    if (error) throw error;
    return data;
}

export async function getByPatient(supabase, patientId, options = {}) {
    let query = supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (options.record_type) {
        query = query.eq('record_type', options.record_type);
    }
    if (options.limit) {
        query = query.limit(options.limit);
    }
    if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getByCenter(supabase, centerId, options = {}) {
    let query = supabase
        .from('medical_records')
        .select('*, patients(*)')
        .eq('health_center_id', centerId)
        .order('created_at', { ascending: false });

    if (options.date_from) {
        query = query.gte('created_at', options.date_from);
    }
    if (options.date_to) {
        query = query.lte('created_at', options.date_to);
    }
    if (options.limit) {
        query = query.limit(options.limit);
    }
    if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getRecentByCenter(supabase, centerId, limit = 10) {
    const { data, error } = await supabase
        .from('medical_records')
        .select('*, patients(*)')
        .eq('health_center_id', centerId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
    if (error) throw error;
    return data;
}
