import Head from 'next/head';
import Layout from '@/components/Layout';
import { withAuth } from '@/lib/utils/withAuth';
import { ROLES, GENDERS, BLOOD_TYPES } from '@/lib/utils/constants';

export default function RegistrarPaciente({ user, profile, initialCedula, error, centers, doctors }) {
    return (
        <Layout user={user} profile={profile} title="Registrar Paciente - SISALUD">
            <div className="card">
                <div className="card-header">
                    <h2>Registrar Nuevo Paciente</h2>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-error mb-4">{error}</div>}
                    <form method="POST" action="/api/pacientes">
                        <fieldset className="mb-4">
                            <legend className="font-bold text-lg mb-2">Datos Personales y Demográficos</legend>
                            
                            <div className="form-group">
                                <label className="form-label" htmlFor="is_minor">
                                    <input type="checkbox" id="is_minor" name="is_minor" className="mr-2" />
                                    Es menor de edad (sin cédula propia)
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cedula">Cédula</label>
                                    <div className="input-group">
                                        <select name="cedula_prefix" className="form-select input-group-prefix" defaultValue={initialCedula ? initialCedula.charAt(0).toUpperCase() : 'V'}>
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                        </select>
                                        <input className="form-input input-group-input" type="text" id="cedula" name="cedula_number" defaultValue={initialCedula.replace(/^[VE]/i, '')} required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ display: 'none' }} id="parent_cedula_group">
                                    <label className="form-label" htmlFor="parent_cedula">Cédula del Representante</label>
                                    <div className="input-group">
                                        <select name="parent_cedula_prefix" className="form-select input-group-prefix">
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                        </select>
                                        <input className="form-input input-group-input" type="text" id="parent_cedula" name="parent_cedula_number" />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label" htmlFor="first_name">Nombres</label>
                                    <input className="form-input" type="text" id="first_name" name="first_name" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="last_name">Apellidos</label>
                                    <input className="form-input" type="text" id="last_name" name="last_name" required />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label" htmlFor="birth_date">Fecha de Nacimiento</label>
                                    <input className="form-input" type="date" id="birth_date" name="birth_date" required />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label" htmlFor="gender">Género</label>
                                    <select className="form-select" id="gender" name="gender" required>
                                        <option value="">Seleccione...</option>
                                        {Object.entries(GENDERS).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="mb-4">
                            <legend className="font-bold text-lg mb-2">Contacto y Residencia</legend>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="phone">Teléfono</label>
                                    <input className="form-input" type="tel" id="phone" name="phone" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="municipality">Municipio</label>
                                    <input className="form-input" type="text" id="municipality" name="municipality" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="address">Dirección</label>
                                <textarea className="form-textarea" id="address" name="address" rows="2"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="emergency_contact_name">Contacto de Emergencia (Nombre)</label>
                                    <input className="form-input" type="text" id="emergency_contact_name" name="emergency_contact_name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="emergency_contact_phone">Contacto de Emergencia (Teléfono)</label>
                                    <input className="form-input" type="tel" id="emergency_contact_phone" name="emergency_contact_phone" />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="mb-4">
                            <legend className="font-bold text-lg mb-2">Datos de Afiliación y Sistema</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="insurance_number">N° Seguro/Seguridad Social</label>
                                    <input className="form-input" type="text" id="insurance_number" name="insurance_number" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="assigned_center_id">Centro de Salud Asignado</label>
                                    <select className="form-select" id="assigned_center_id" name="assigned_center_id">
                                        <option value="">Ninguno (Por Defecto)</option>
                                        {centers && centers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="assigned_doctor_id">Médico de Cabecera Asignado</label>
                                    <select className="form-select" id="assigned_doctor_id" name="assigned_doctor_id">
                                        <option value="">Ninguno</option>
                                        {doctors && doctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.full_name} ({d.cedula})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="mb-4">
                            <legend className="font-bold text-lg mb-2">Antecedentes y Perfil de Salud Permanente</legend>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="blood_type">Grupo Sanguíneo</label>
                                    <select className="form-select" id="blood_type" name="blood_type">
                                        <option value="">Seleccione...</option>
                                        {Object.values(BLOOD_TYPES).map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '14px' }}>
                                    <label className="checkbox-label" htmlFor="organ_donor">
                                        <input type="checkbox" id="organ_donor" name="organ_donor" className="form-checkbox" />
                                        Donante de Órganos Registrado
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="allergies">Alergias / Reacciones Adversas</label>
                                    <input className="form-input" type="text" id="allergies" name="allergies" placeholder="Ej: Penicilina, Maní (separadas por coma)" />
                                    <span className="form-hint">Incluya medicamentos, alimentos, látex, etc.</span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="chronic_conditions">Condiciones Crónicas / Patologías de base</label>
                                    <input className="form-input" type="text" id="chronic_conditions" name="chronic_conditions" placeholder="Ej: Diabetes Tipo 2, Hipertensión" />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label" htmlFor="disabilities">Discapacidades / Cond. Funcionales</label>
                                    <input className="form-input" type="text" id="disabilities" name="disabilities" placeholder="Ej: Discapacidad visual, Motora" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="surgeries">Historial de Cirugías</label>
                                    <input className="form-input" type="text" id="surgeries" name="surgeries" placeholder="Ej: Apendicectomía (2015)" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="implants">Dispositivos e Implantes</label>
                                    <input className="form-input" type="text" id="implants" name="implants" placeholder="Ej: Marcapasos, Malla abdominal" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="family_history">Antecedentes Familiares</label>
                                    <input className="form-input" type="text" id="family_history" name="family_history" placeholder="Ej: Madre con Cáncer de Mama" />
                                </div>
                            </div>
                        </fieldset>

                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">Guardar Paciente</button>
                            <button type="reset" className="btn btn-secondary">Limpiar</button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export const getServerSideProps = withAuth(async (context, supabase, user, profile) => {
    const { cedula, error } = context.query;
    
    // Fetch centers and doctors for assignment dropdowns
    let centers = [];
    let doctors = [];
    
    try {
        const { data: centersData } = await supabase.from('health_centers').select('id, name').order('name');
        if (centersData) centers = centersData;
        
        const { data: doctorsData } = await supabase.from('user_profiles').select('id, full_name, cedula').eq('role', 'medico').order('full_name');
        if (doctorsData) doctors = doctorsData;
    } catch (e) {
        console.error('Error fetching centers/doctors for registration form', e);
    }
    
    return {
        props: {
            user,
            profile,
            initialCedula: cedula || '',
            error: error || null,
            centers,
            doctors
        }
    };
});
