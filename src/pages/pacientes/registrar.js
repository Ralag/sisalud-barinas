import Head from 'next/head';
import Layout from '@/components/Layout';
import { withAuth } from '@/lib/utils/withAuth';
import { ROLES, GENDERS, BLOOD_TYPES } from '@/lib/utils/constants';

export default function RegistrarPaciente({ user, profile, initialCedula, error }) {
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
                            <legend className="font-bold text-lg mb-2">Datos Personales</legend>
                            
                            <div className="form-group">
                                <label className="form-label" htmlFor="is_minor">
                                    <input type="checkbox" id="is_minor" name="is_minor" className="mr-2" />
                                    Es menor de edad (sin cédula propia)
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="cedula">Cédula</label>
                                    <input className="form-input" type="text" id="cedula" name="cedula" defaultValue={initialCedula} required />
                                </div>
                                <div className="form-group" style={{ display: 'none' }} id="parent_cedula_group">
                                    <label className="form-label" htmlFor="parent_cedula">Cédula del Representante</label>
                                    <input className="form-input" type="text" id="parent_cedula" name="parent_cedula" />
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
                            <legend className="font-bold text-lg mb-2">Información Médica Base</legend>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="blood_type">Grupo Sanguíneo</label>
                                    <select className="form-select" id="blood_type" name="blood_type">
                                        <option value="">Seleccione...</option>
                                        {Object.values(BLOOD_TYPES).map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="allergies">Alergias (separadas por coma)</label>
                                    <input className="form-input" type="text" id="allergies" name="allergies" placeholder="Ej: Penicilina, Maní" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="chronic_conditions">Condiciones Crónicas (separadas por coma)</label>
                                    <input className="form-input" type="text" id="chronic_conditions" name="chronic_conditions" placeholder="Ej: Hipertensión, Asma" />
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
    
    return {
        props: {
            user,
            profile,
            initialCedula: cedula || '',
            error: error || null
        }
    };
});
