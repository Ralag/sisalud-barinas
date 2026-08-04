import { apiHandler } from '@/lib/utils/apiHandler';
import * as medicalRecordService from '@/lib/services/medicalRecordService';

export default apiHandler({
    GET: async (req, res, supabase) => {
        const { id } = req.query;
        
        try {
            const record = await medicalRecordService.getById(supabase, id);
            return res.status(200).json(record);
        } catch (error) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }
    }
});
