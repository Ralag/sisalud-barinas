import { apiHandler } from '@/lib/utils/apiHandler';
import * as medicalRecordService from '@/lib/services/medicalRecordService';
import { ROLES } from '@/lib/utils/constants';

export const config = {
    api: { bodyParser: true }
};

export default apiHandler({
    POST: async (req, res, supabase, user, profile) => {
        if (profile.role !== ROLES.MEDICO) {
            return res.status(403).json({ error: 'Solo los médicos pueden crear consultas' });
        }

        const recordData = { ...req.body };
        
        // Parse vitals if it's form data
        if (typeof recordData.vital_signs === 'string') {
            try {
                recordData.vital_signs = JSON.parse(recordData.vital_signs);
            } catch (e) {
                // If it fails, we assume it's flat form data and need to build the object
                recordData.vital_signs = {
                    temperature: parseFloat(recordData.temp) || null,
                    blood_pressure_sys: parseInt(recordData.bp_sys) || null,
                    blood_pressure_dia: parseInt(recordData.bp_dia) || null,
                    heart_rate: parseInt(recordData.hr) || null,
                    respiratory_rate: parseInt(recordData.rr) || null,
                    oxygen_saturation: parseInt(recordData.spo2) || null,
                    weight: parseFloat(recordData.weight) || null,
                    height: parseFloat(recordData.height) || null
                };
            }
        }

        // Clean up flat vital fields if they were sent
        ['temp', 'bp_sys', 'bp_dia', 'hr', 'rr', 'spo2', 'weight', 'height'].forEach(field => delete recordData[field]);

        const newRecord = await medicalRecordService.create(supabase, recordData, profile.id, profile.health_center_id);

        const isForm = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
        if (isForm) {
            return res.redirect(303, `/consultas/${newRecord.id}`);
        }

        return res.status(201).json(newRecord);
    }
});
