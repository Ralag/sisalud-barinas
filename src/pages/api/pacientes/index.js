import { apiHandler } from '@/lib/utils/apiHandler';
import * as patientService from '@/lib/services/patientService';
import * as minorService from '@/lib/services/minorService';
import * as cedulaService from '@/lib/services/cedulaService';
import { ROLES } from '@/lib/utils/constants';

export const config = {
    api: { bodyParser: true }
};

export default apiHandler({
    GET: async (req, res, supabase) => {
        const { q, cedula, nombre } = req.query;
        // Simple search placeholder if needed
        return res.status(200).json([]);
    },

    POST: async (req, res, supabase, user, profile) => {
        const allowedRoles = [ROLES.ADMIN, ROLES.MEDICO, ROLES.ENFERMERO, ROLES.RECEPCION];
        if (!allowedRoles.includes(profile.role)) {
            return res.status(403).json({ error: 'No autorizado para registrar pacientes' });
        }

        let patientData = { ...req.body };
        
        // Handle boolean conversion for checkbox
        patientData.is_minor = patientData.is_minor === 'on' || patientData.is_minor === true;

        if (patientData.is_minor) {
            if (!patientData.parent_cedula) {
                return res.status(400).json({ error: 'Cédula del representante es requerida para menores' });
            }
            
            const parentCedulaClean = cedulaService.sanitize(patientData.parent_cedula);
            if (!parentCedulaClean) {
                return res.status(400).json({ error: 'Cédula del representante inválida' });
            }
            
            // Find parent ID
            const { data: parentDataResult } = await supabase
                .from('patients')
                .select('id')
                .eq('cedula', parentCedulaClean)
                .single();
                
            if (!parentDataResult) {
                return res.status(400).json({ error: 'Representante no encontrado en el sistema. Debe registrarlo primero.' });
            }
            
            patientData.parent_id = parentDataResult.id;
            patientData.cedula = await minorService.generateMinorCedula(supabase, parentCedulaClean);
        } else {
            if (!patientData.cedula) {
                return res.status(400).json({ error: 'Cédula es requerida' });
            }
            patientData.cedula = cedulaService.sanitize(patientData.cedula);
        }

        // Convert empty strings to null to avoid breaking CHECK constraints (like blood_type)
        Object.keys(patientData).forEach(key => {
            if (patientData[key] === '') {
                patientData[key] = null;
            }
        });

        // Clean up virtual fields that don't exist in the database table
        delete patientData.parent_cedula;

        // Format allergies and chronic conditions
        if (patientData.allergies && typeof patientData.allergies === 'string') {
            patientData.allergies = patientData.allergies.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (patientData.chronic_conditions && typeof patientData.chronic_conditions === 'string') {
            patientData.chronic_conditions = patientData.chronic_conditions.split(',').map(s => s.trim()).filter(Boolean);
        }

        const newPatient = await patientService.create(supabase, patientData, profile.id);

        // Content-Type based response
        const isForm = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
        if (isForm) {
            return res.redirect(303, `/pacientes/${newPatient.cedula}`);
        }
        
        return res.status(201).json(newPatient);
    }
});
