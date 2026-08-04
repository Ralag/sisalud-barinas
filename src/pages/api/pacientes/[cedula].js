import { apiHandler } from '@/lib/utils/apiHandler';
import * as patientService from '@/lib/services/patientService';
import { ROLES } from '@/lib/utils/constants';

export const config = {
    api: { bodyParser: true }
};

export default apiHandler({
    GET: async (req, res, supabase) => {
        const { cedula } = req.query;
        const patient = await patientService.searchByCedula(supabase, cedula);
        
        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        
        return res.status(200).json(patient);
    },

    PUT: async (req, res, supabase, user, profile) => {
        const { cedula } = req.query;
        const allowedRoles = [ROLES.ADMIN, ROLES.MEDICO, ROLES.ENFERMERO, ROLES.RECEPCION];
        
        if (!allowedRoles.includes(profile.role)) {
            return res.status(403).json({ error: 'No autorizado para editar pacientes' });
        }

        // Get patient first
        const patient = await patientService.searchByCedula(supabase, cedula);
        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        let updateData = { ...req.body };
        
        // Format arrays
        if (updateData.allergies && typeof updateData.allergies === 'string') {
            updateData.allergies = updateData.allergies.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (updateData.chronic_conditions && typeof updateData.chronic_conditions === 'string') {
            updateData.chronic_conditions = updateData.chronic_conditions.split(',').map(s => s.trim()).filter(Boolean);
        }

        const updated = await patientService.update(supabase, patient.id, updateData, profile.id);

        const isForm = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
        if (isForm) {
            return res.redirect(303, `/pacientes/${updated.cedula}`);
        }

        return res.status(200).json(updated);
    }
});
