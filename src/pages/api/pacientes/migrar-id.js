import { apiHandler } from '@/lib/utils/apiHandler';
import * as minorService from '@/lib/services/minorService';
import { ROLES } from '@/lib/utils/constants';

export const config = {
    api: { bodyParser: true }
};

export default apiHandler({
    POST: async (req, res, supabase, user, profile) => {
        if (profile.role !== ROLES.ADMIN && profile.role !== ROLES.MEDICO) {
            return res.status(403).json({ error: 'No autorizado para migrar cédulas' });
        }

        const { patientId, newCedula } = req.body;

        if (!patientId || !newCedula) {
            return res.status(400).json({ error: 'patientId y newCedula son requeridos' });
        }

        const migratedPatient = await minorService.migrateId(supabase, patientId, newCedula, profile.id);

        const isForm = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
        if (isForm) {
            return res.redirect(303, `/pacientes/${migratedPatient.cedula}`);
        }

        return res.status(200).json(migratedPatient);
    }
});
