import { useState } from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/lib/utils/withAuth';
import { ROLES, GENDERS, BLOOD_TYPES } from '@/lib/utils/constants';
import { useRouter } from 'next/router';

// Listas de selección rápida comunes
const COMMON_ALLERGIES = ['Penicilina', 'AINEs (Ibuprofeno/Aspirina)', 'Sulfamidas', 'Látex', 'Maní', 'Mariscos', 'Polvo/Ácaros'];
const COMMON_CONDITIONS = ['Hipertensión Arterial', 'Diabetes Mellitus Tipo 1', 'Diabetes Mellitus Tipo 2', 'Asma Bronquial', 'Hipotiroidismo', 'Enfermedad Renal Crónica', 'Artritis Reumatoide'];
const COMMON_DISABILITIES = ['Discapacidad Visual', 'Discapacidad Auditiva', 'Discapacidad Motora', 'Discapacidad Cognitiva'];
const COMMON_FAMILY_HISTORY = ['Padre/Madre con Hipertensión', 'Padre/Madre con Diabetes', 'Antecedentes de Cáncer de Mama', 'Antecedentes de Infarto (Cardiopatía)', 'Enfermedad de Alzheimer'];

export default function RegistrarPaciente({ user, profile, initialCedula, error, centers, doctors }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(error || null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        is_minor: false,
        parent_cedula_prefix: 'V',
        parent_cedula_number: '',
        cedula_prefix: 'V',
        cedula_number: initialCedula ? initialCedula.substring(1) : '',
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        phone: '',
        state: 'Barinas',
        municipality: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        
        // Step 2
        insurance_number: '',
        assigned_center_id: '',
        assigned_doctor_id: '',

        // Step 3
        blood_type: '',
        organ_donor: false,
        
        // Multi-select arrays
        allergies: [],
        other_allergies: '',
        chronic_conditions: [],
        other_conditions: '',
        disabilities: [],
        other_disabilities: '',
        family_history: [],
        other_family_history: '',
        
        // Text arrays
        surgeries: '',
        implants: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayCheckbox = (e, arrayName) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentArray = [...prev[arrayName]];
            if (checked) {
                currentArray.push(value);
            } else {
                const index = currentArray.indexOf(value);
                if (index > -1) currentArray.splice(index, 1);
            }
            return { ...prev, [arrayName]: currentArray };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        // Preparamos los datos fusionando los checkboxes con el texto "otros"
        const payload = { ...formData };
        
        // Helper para fusionar arrays con texto
        const mergeArrayWithText = (arr, text) => {
            let res = [...arr];
            if (text && text.trim()) {
                res = res.concat(text.split(',').map(s => s.trim()).filter(Boolean));
            }
            return res.join(', '); // Lo enviamos como string separado por comas para la API actual
        };

        payload.allergies = mergeArrayWithText(formData.allergies, formData.other_allergies);
        payload.chronic_conditions = mergeArrayWithText(formData.chronic_conditions, formData.other_conditions);
        payload.disabilities = mergeArrayWithText(formData.disabilities, formData.other_disabilities);
        payload.family_history = mergeArrayWithText(formData.family_history, formData.other_family_history);
        
        // Cleanup extra fields not in DB
        delete payload.other_allergies;
        delete payload.other_conditions;
        delete payload.other_disabilities;
        delete payload.other_family_history;

        try {
            const res = await fetch('/api/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al registrar');
            }

            // Éxito, redirigir al perfil del paciente
            const cedulaCompleta = `${payload.cedula_prefix}${payload.cedula_number}`;
            router.push(`/pacientes/${cedulaCompleta}?registered=true`);
        } catch (err) {
            setSubmitError(err.message);
            setIsSubmitting(false);
            window.scrollTo(0, 0);
        }
    };

    return (
        <Layout user={user} profile={profile} title="Registrar Paciente - SISALUD">
            <div className="card max-w-4xl mx-auto shadow-xl border-t-4 border-t-primary">
                <div className="card-header bg-gray-50 border-b pb-4">
                    <h2 className="text-2xl text-center text-primary font-bold">Registro Clínico de Paciente</h2>
                    
                    {/* Stepper Progress */}
                    <div className="flex justify-between items-center mt-6 px-4 relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded"></div>
                        <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 transform -translate-y-1/2 rounded transition-all duration-300" style={{ width: currentStep === 1 ? '10%' : currentStep === 2 ? '50%' : '90%' }}></div>
                        
                        <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep >= 1 ? 'bg-primary text-white shadow-lg' : 'bg-gray-200'}`}>1</div>
                            <span className="text-xs font-bold mt-2 bg-white px-2 rounded">Identificación</span>
                        </div>
                        <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep >= 2 ? 'bg-primary text-white shadow-lg' : 'bg-gray-200'}`}>2</div>
                            <span className="text-xs font-bold mt-2 bg-white px-2 rounded">Afiliación</span>
                        </div>
                        <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep >= 3 ? 'bg-primary text-white shadow-lg' : 'bg-gray-200'}`}>3</div>
                            <span className="text-xs font-bold mt-2 bg-white px-2 rounded">Perfil Clínico</span>
                        </div>
                    </div>
                </div>

                <div className="card-body p-6">
                    {submitError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
                            <p className="text-red-700 font-bold">Error de Registro</p>
                            <p className="text-red-600">{submitError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        
                        {/* ================= STEP 1 ================= */}
                        <div style={{ display: currentStep === 1 ? 'block' : 'none' }} className="animate-fade-in">
                            <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">1. Identificación y Contacto</h3>
                            
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" name="is_minor" checked={formData.is_minor} onChange={handleInputChange} className="w-5 h-5 text-primary rounded focus:ring-primary" />
                                    <span className="font-bold text-blue-900">El paciente es menor de edad (sin cédula propia)</span>
                                </label>
                            </div>

                            {formData.is_minor && (
                                <div className="grid grid-cols-1 gap-4 p-4 border border-dashed border-gray-300 rounded mb-4 bg-gray-50">
                                    <label className="form-label font-bold text-primary">Cédula del Representante Legal</label>
                                    <div className="input-group" style={{maxWidth: '300px'}}>
                                        <select className="search-select font-bold" name="parent_cedula_prefix" value={formData.parent_cedula_prefix} onChange={handleInputChange}>
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                        </select>
                                        <input className="form-input" type="text" name="parent_cedula_number" value={formData.parent_cedula_number} onChange={handleInputChange} placeholder="Ej: 12345678" />
                                    </div>
                                    <span className="text-sm text-gray-500">El representante debe estar registrado en el sistema previamente.</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="form-group md:col-span-1">
                                    <label className="form-label font-bold text-gray-700">Cédula del Paciente</label>
                                    <div className="input-group">
                                        <select className="search-select font-bold" name="cedula_prefix" value={formData.cedula_prefix} onChange={handleInputChange}>
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                        </select>
                                        <input className="form-input" type="text" name="cedula_number" value={formData.cedula_number} onChange={handleInputChange} required={!formData.is_minor} placeholder="Ej: 12345678" />
                                    </div>
                                </div>
                                <div className="form-group md:col-span-1">
                                    <label className="form-label font-bold text-gray-700">Nombres</label>
                                    <input className="form-input" type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group md:col-span-1">
                                    <label className="form-label font-bold text-gray-700">Apellidos</label>
                                    <input className="form-input" type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div className="form-group">
                                    <label className="form-label font-bold text-gray-700">Fecha de Nacimiento</label>
                                    <input className="form-input" type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label font-bold text-gray-700">Sexo Biológico</label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded border hover:bg-gray-100">
                                            <input type="radio" name="gender" value="M" checked={formData.gender === 'M'} onChange={handleInputChange} className="text-primary focus:ring-primary" required />
                                            <span>Masculino</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded border hover:bg-gray-100">
                                            <input type="radio" name="gender" value="F" checked={formData.gender === 'F'} onChange={handleInputChange} className="text-primary focus:ring-primary" required />
                                            <span>Femenino</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="form-group md:col-span-1">
                                    <label className="form-label text-gray-700">Teléfono Personal</label>
                                    <input className="form-input" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="0414-0000000" />
                                </div>
                                <div className="form-group md:col-span-2">
                                    <label className="form-label text-gray-700">Dirección Completa</label>
                                    <input className="form-input" type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Calle, Casa/Apto, Sector..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border">
                                <div className="form-group">
                                    <label className="form-label text-gray-700">Nombre Contacto Emergencia</label>
                                    <input className="form-input" type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleInputChange} placeholder="Familiar, amigo..." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-gray-700">Teléfono Emergencia</label>
                                    <input className="form-input" type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleInputChange} placeholder="0414-0000000" />
                                </div>
                            </div>
                        </div>

                        {/* ================= STEP 2 ================= */}
                        <div style={{ display: currentStep === 2 ? 'block' : 'none' }} className="animate-fade-in">
                            <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">2. Sistema y Afiliación</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div className="bg-gray-50 p-6 rounded-lg border">
                                    <h4 className="font-bold text-gray-700 mb-4 flex items-center"><span className="text-2xl mr-2">🏥</span> Centro de Salud Base</h4>
                                    <p className="text-sm text-gray-500 mb-4">Seleccione el ambulatorio u hospital principal de este paciente.</p>
                                    <select className="form-select w-full" name="assigned_center_id" value={formData.assigned_center_id} onChange={handleInputChange}>
                                        <option value="">Ninguno específico</option>
                                        {centers && centers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg border">
                                    <h4 className="font-bold text-gray-700 mb-4 flex items-center"><span className="text-2xl mr-2">👨‍⚕️</span> Médico de Cabecera</h4>
                                    <p className="text-sm text-gray-500 mb-4">Asigne un médico tratante principal para seguimiento.</p>
                                    <select className="form-select w-full" name="assigned_doctor_id" value={formData.assigned_doctor_id} onChange={handleInputChange}>
                                        <option value="">Ninguno</option>
                                        {doctors && doctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.full_name} ({d.cedula})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group max-w-md">
                                <label className="form-label font-bold text-gray-700">N° de Seguro Social o Póliza Privada</label>
                                <input className="form-input text-lg" type="text" name="insurance_number" value={formData.insurance_number} onChange={handleInputChange} placeholder="Dejar en blanco si no aplica" />
                            </div>
                        </div>

                        {/* ================= STEP 3 ================= */}
                        <div style={{ display: currentStep === 3 ? 'block' : 'none' }} className="animate-fade-in">
                            <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">3. Perfil Clínico Permanente (EHR)</h3>
                            
                            <div className="flex flex-wrap gap-8 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="form-group mb-0">
                                    <label className="form-label font-bold text-gray-700">Grupo Sanguíneo</label>
                                    <select className="form-select font-bold text-lg" name="blood_type" value={formData.blood_type} onChange={handleInputChange}>
                                        <option value="">Desconocido</option>
                                        {Object.values(BLOOD_TYPES).map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center space-x-3 cursor-pointer bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                                        <input type="checkbox" name="organ_donor" checked={formData.organ_donor} onChange={handleInputChange} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                                        <span className="font-bold">Es Donante de Órganos Registrado ❤️</span>
                                    </label>
                                </div>
                            </div>

                            {/* Alergias */}
                            <div className="mb-8">
                                <h4 className="font-bold text-lg text-primary mb-3">Alergias Conocidas</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    {COMMON_ALLERGIES.map(allergy => (
                                        <label key={allergy} className="flex items-center space-x-2 cursor-pointer bg-white p-2 border rounded hover:bg-gray-50">
                                            <input type="checkbox" value={allergy} checked={formData.allergies.includes(allergy)} onChange={(e) => handleArrayCheckbox(e, 'allergies')} className="text-primary rounded focus:ring-primary" />
                                            <span className="text-sm">{allergy}</span>
                                        </label>
                                    ))}
                                </div>
                                <input type="text" name="other_allergies" value={formData.other_allergies} onChange={handleInputChange} className="form-input" placeholder="Otras alergias (escribir separadas por coma)..." />
                            </div>

                            {/* Condiciones Crónicas */}
                            <div className="mb-8 border-t pt-6">
                                <h4 className="font-bold text-lg text-primary mb-3">Condiciones Crónicas / Patologías Base</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                    {COMMON_CONDITIONS.map(cond => (
                                        <label key={cond} className="flex items-center space-x-2 cursor-pointer bg-white p-2 border rounded hover:bg-gray-50">
                                            <input type="checkbox" value={cond} checked={formData.chronic_conditions.includes(cond)} onChange={(e) => handleArrayCheckbox(e, 'chronic_conditions')} className="text-primary rounded focus:ring-primary" />
                                            <span className="text-sm">{cond}</span>
                                        </label>
                                    ))}
                                </div>
                                <input type="text" name="other_conditions" value={formData.other_conditions} onChange={handleInputChange} className="form-input" placeholder="Otras condiciones crónicas..." />
                            </div>

                            {/* Discapacidades */}
                            <div className="mb-8 border-t pt-6">
                                <h4 className="font-bold text-lg text-primary mb-3">Discapacidades / Funcionalidad</h4>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {COMMON_DISABILITIES.map(dis => (
                                        <label key={dis} className="flex items-center space-x-2 cursor-pointer bg-white p-2 border rounded hover:bg-gray-50">
                                            <input type="checkbox" value={dis} checked={formData.disabilities.includes(dis)} onChange={(e) => handleArrayCheckbox(e, 'disabilities')} className="text-primary rounded focus:ring-primary" />
                                            <span className="text-sm">{dis}</span>
                                        </label>
                                    ))}
                                </div>
                                <input type="text" name="other_disabilities" value={formData.other_disabilities} onChange={handleInputChange} className="form-input" placeholder="Especifique otras discapacidades o detalles..." />
                            </div>

                            {/* Antecedentes Familiares */}
                            <div className="mb-8 border-t pt-6">
                                <h4 className="font-bold text-lg text-primary mb-3">Antecedentes Heredofamiliares</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    {COMMON_FAMILY_HISTORY.map(fam => (
                                        <label key={fam} className="flex items-center space-x-2 cursor-pointer bg-white p-2 border rounded hover:bg-gray-50">
                                            <input type="checkbox" value={fam} checked={formData.family_history.includes(fam)} onChange={(e) => handleArrayCheckbox(e, 'family_history')} className="text-primary rounded focus:ring-primary" />
                                            <span className="text-sm">{fam}</span>
                                        </label>
                                    ))}
                                </div>
                                <input type="text" name="other_family_history" value={formData.other_family_history} onChange={handleInputChange} className="form-input" placeholder="Otros antecedentes familiares de importancia..." />
                            </div>

                            {/* Cirugías e Implantes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                                <div className="form-group">
                                    <h4 className="font-bold text-lg text-primary mb-2">Historial Quirúrgico (Cirugías)</h4>
                                    <textarea name="surgeries" value={formData.surgeries} onChange={handleInputChange} className="form-input h-24 resize-none" placeholder="Escriba las cirugías previas y el año aproximado (separadas por coma)"></textarea>
                                </div>
                                <div className="form-group">
                                    <h4 className="font-bold text-lg text-primary mb-2">Prótesis, Dispositivos e Implantes</h4>
                                    <textarea name="implants" value={formData.implants} onChange={handleInputChange} className="form-input h-24 resize-none" placeholder="Ej: Marcapasos, Stent, Prótesis de cadera derecha, Lentes intraoculares..."></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
                            {currentStep > 1 ? (
                                <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="btn btn-secondary px-6">
                                    ← Volver
                                </button>
                            ) : (
                                <div></div> /* Spacer */
                            )}

                            {currentStep < 3 ? (
                                <button type="button" onClick={() => setCurrentStep(currentStep + 1)} className="btn btn-primary px-10 text-lg shadow-lg">
                                    Continuar →
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary px-10 text-lg shadow-lg bg-green-600 hover:bg-green-700 border-green-600">
                                    {isSubmitting ? 'Guardando...' : 'Guardar Ficha Médica Completa'}
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
            
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
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
