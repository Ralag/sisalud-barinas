import { useState } from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/lib/utils/withAuth';
import { ROLES, GENDERS, BLOOD_TYPES } from '@/lib/utils/constants';
import { useRouter } from 'next/router';

// Constants for Selection Cards
const COMMON_ALLERGIES = ['Penicilina', 'AINEs', 'Sulfamidas', 'Látex', 'Maní', 'Mariscos', 'Polvo/Ácaros'];
const COMMON_CONDITIONS = ['Hipertensión Arterial', 'Diabetes Mellitus 1', 'Diabetes Mellitus 2', 'Asma', 'Hipotiroidismo', 'Enf. Renal Crónica'];
const COMMON_DISABILITIES = ['Visual', 'Auditiva', 'Motora', 'Cognitiva', 'Trastorno Espectro Autista'];
const COMMON_FAMILY_HISTORY = ['HTA Padre/Madre', 'Diabetes Padre/Madre', 'Cáncer de Mama', 'Cardiopatía Isquémica', 'Alzheimer'];

// Sub-component for clickable selection cards
const SelectionCard = ({ label, isSelected, onChange, value }) => (
    <label className={`
        relative flex flex-col justify-center items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
        ${isSelected 
            ? 'border-primary bg-blue-50/70 shadow-[0_0_15px_rgba(26,82,118,0.15)] transform scale-[1.02]' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }
    `}>
        <input 
            type="checkbox" 
            className="absolute opacity-0 w-0 h-0" 
            value={value} 
            checked={isSelected} 
            onChange={onChange} 
        />
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center mb-2 transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
            {isSelected && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className={`text-sm text-center font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-gray-600'}`}>
            {label}
        </span>
    </label>
);

export default function RegistrarPaciente({ user, profile, initialCedula, error, centers, doctors }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(error || null);

    const [formData, setFormData] = useState({
        // Step 1: Identidad
        is_minor: false,
        parent_cedula_prefix: 'V',
        parent_cedula_number: '',
        cedula_prefix: 'V',
        cedula_number: initialCedula ? initialCedula.substring(1) : '',
        first_name: '',
        last_name: '',
        birth_name: '',
        birth_date: '',
        gender: '',
        gender_identity: '',
        email: '',
        phone: '',
        state: 'Barinas',
        municipality: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        
        // Step 2: Cobertura
        insurance_type: 'ninguna',
        insurance_number: '',
        assigned_center_id: '',
        assigned_doctor_id: '',

        // Step 3: Determinantes Sociales (JSONB)
        sd_housing: '',
        sd_water: '',
        sd_electricity: '',
        sd_income: '',
        sd_occupation: '',
        sd_smoking: 'No',
        sd_alcohol: 'No',
        sd_drugs: 'No',

        // Step 4: Perfil Clínico Base
        blood_type: '',
        organ_donor: false,
        allergies: [],
        other_allergies: '',
        chronic_conditions: [],
        other_conditions: '',
        disabilities: [],
        other_disabilities: '',
        family_history: [],
        other_family_history: '',
        surgeries: '',
        implants: '',

        // Step 5: Programas de Salud Pública (JSONB)
        hp_caremt: false,
        hp_caremt_risk: 'Bajo',
        hp_maternal: false,
        hp_pregnancies: '0',
        hp_last_menstruation: '',
        hp_contraceptive: 'Ninguno',
        hp_oncology: false,
        hp_nutrition: false,

        // Step 6: Programas Sensibles (JSONB)
        sp_mental_health: false,
        sp_mental_dx: '',
        sp_vih: false,
        sp_tb: false,
        sp_severe_disability: false
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
        if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        const payload = { ...formData };
        
        // Merge arrays with "Other" text
        const mergeArrayWithText = (arr, text) => {
            let res = [...arr];
            if (text && text.trim()) {
                res = res.concat(text.split(',').map(s => s.trim()).filter(Boolean));
            }
            return res; // Keep as array
        };

        payload.allergies = mergeArrayWithText(formData.allergies, formData.other_allergies);
        payload.chronic_conditions = mergeArrayWithText(formData.chronic_conditions, formData.other_conditions);
        payload.disabilities = mergeArrayWithText(formData.disabilities, formData.other_disabilities);
        payload.family_history = mergeArrayWithText(formData.family_history, formData.other_family_history);
        
        // Structure JSONB fields
        payload.social_determinants = {
            housing: formData.sd_housing,
            water: formData.sd_water,
            electricity: formData.sd_electricity,
            income: formData.sd_income,
            occupation: formData.sd_occupation,
            smoking: formData.sd_smoking,
            alcohol: formData.sd_alcohol,
            drugs: formData.sd_drugs,
        };

        payload.health_programs = {
            caremt_enrolled: formData.hp_caremt,
            caremt_risk: formData.hp_caremt_risk,
            maternal_enrolled: formData.hp_maternal,
            pregnancies: formData.hp_pregnancies,
            last_menstruation: formData.hp_last_menstruation,
            contraceptive: formData.hp_contraceptive,
            oncology_enrolled: formData.hp_oncology,
            nutrition_enrolled: formData.hp_nutrition
        };

        payload.sensitive_programs = {
            mental_health_enrolled: formData.sp_mental_health,
            mental_health_dx: formData.sp_mental_dx,
            vih_enrolled: formData.sp_vih,
            tb_enrolled: formData.sp_tb,
            severe_disability_enrolled: formData.sp_severe_disability
        };

        // Clean up flat keys that were nested
        const keysToRemove = [
            'other_allergies', 'other_conditions', 'other_disabilities', 'other_family_history',
            'sd_housing', 'sd_water', 'sd_electricity', 'sd_income', 'sd_occupation', 'sd_smoking', 'sd_alcohol', 'sd_drugs',
            'hp_caremt', 'hp_caremt_risk', 'hp_maternal', 'hp_pregnancies', 'hp_last_menstruation', 'hp_contraceptive', 'hp_oncology', 'hp_nutrition',
            'sp_mental_health', 'sp_mental_dx', 'sp_vih', 'sp_tb', 'sp_severe_disability'
        ];
        keysToRemove.forEach(k => delete payload[k]);

        try {
            const res = await fetch('/api/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || data.error || 'Error al registrar');
            }

            const cedulaCompleta = payload.is_minor ? 'MENOR' : `${payload.cedula_prefix}${payload.cedula_number}`;
            // If minor, the API generates a cedula, we should extract it from response
            const responseData = await res.json();
            router.push(`/pacientes/${responseData.cedula || cedulaCompleta}?registered=true`);
        } catch (err) {
            setSubmitError(err.message);
            setIsSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const inputClass = "w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary block p-3.5 transition-all duration-300 outline-none hover:border-gray-300 shadow-sm";
    const labelClass = "block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider";

    const steps = [
        { num: 1, title: 'Identidad', icon: '👤' },
        { num: 2, title: 'Cobertura', icon: '📄' },
        { num: 3, title: 'Determinantes', icon: '🏡' },
        { num: 4, title: 'Clínica Base', icon: '🧬' },
        { num: 5, title: 'Programas Salud', icon: '❤' },
        { num: 6, title: 'Área Sensible', icon: '🔒' }
    ];

    return (
        <Layout user={user} profile={profile} title="Registrar Paciente HCEN - SISALUD">
            <div className="max-w-6xl mx-auto mb-16">
                
                {/* Cabecera Premium */}
                <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Registro Maestro HCEN</h1>
                            <p className="text-blue-100 font-medium">Historia Clínica Electrónica Nacional - Perfil Integral del Ciudadano.</p>
                        </div>
                        <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                            <span className="text-4xl">🏥</span>
                            <div>
                                <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Centro Operativo</p>
                                <p className="font-bold text-sm">{profile?.health_centers?.name || 'Sistema Global'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stepper */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                    <div className="p-4 overflow-x-auto" style={{scrollbarWidth:'none'}}>
                        <div className="flex justify-between items-center relative min-w-[700px] px-8 py-4">
                            <div className="absolute top-1/2 left-10 right-10 h-1 bg-gray-100 -z-10 rounded-full transform -translate-y-1/2"></div>
                            <div 
                                className="absolute top-1/2 left-10 h-1 bg-primary -z-10 rounded-full transform -translate-y-1/2 transition-all duration-500 ease-in-out"
                                style={{ width: `calc(${(currentStep - 1) / (steps.length - 1)} * (100% - 5rem))` }}
                            ></div>
                            
                            {steps.map((step) => (
                                <div key={step.num} className="flex flex-col items-center gap-2">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-500 border-4 shadow-sm
                                        ${currentStep === step.num ? 'bg-primary text-white border-white scale-110 shadow-primary/30' : 
                                          currentStep > step.num ? 'bg-primary-light text-white border-white' : 'bg-gray-100 text-gray-400 border-white'}`}>
                                        {step.icon}
                                    </div>
                                    <span className={`text-xs font-bold ${currentStep === step.num ? 'text-primary' : 'text-gray-400'}`}>{step.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Formulario Principal */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8 md:p-12 relative min-h-[600px]">
                    
                    {submitError && (
                        <div className="alert alert-error mb-8">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <h4 className="font-bold">Error en el registro</h4>
                                <p className="text-sm">{submitError}</p>
                            </div>
                        </div>
                    )}

                    {/* === PASO 1: IDENTIDAD === */}
                    <div className={`transition-all duration-500 ${currentStep === 1 ? 'opacity-100 block' : 'hidden opacity-0'}`}>
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                            <span className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl">👤</span>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-800">Datos Personales del Ciudadano</h2>
                                <p className="text-gray-500 text-sm">Información demográfica básica obligatoria.</p>
                            </div>
                        </div>

                        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-3">
                            <input type="checkbox" id="is_minor" name="is_minor" checked={formData.is_minor} onChange={handleInputChange} className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary" />
                            <div>
                                <label htmlFor="is_minor" className="font-bold text-gray-800">Paciente Menor de Edad sin Cédula</label>
                                <p className="text-sm text-gray-500">Requiere vincular la cédula de un representante legal previamente registrado.</p>
                            </div>
                        </div>

                        {formData.is_minor && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                <div>
                                    <label className={labelClass}>Cédula del Representante *</label>
                                    <div className="flex">
                                        <select name="parent_cedula_prefix" value={formData.parent_cedula_prefix} onChange={handleInputChange} className={`${inputClass} w-24 rounded-r-none border-r-0`}>
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                        </select>
                                        <input type="text" name="parent_cedula_number" value={formData.parent_cedula_number} onChange={handleInputChange} className={`${inputClass} rounded-l-none`} required={formData.is_minor} placeholder="Ej: 12345678" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {!formData.is_minor && (
                                <div>
                                    <label className={labelClass}>Documento de Identidad *</label>
                                    <div className="flex">
                                        <select name="cedula_prefix" value={formData.cedula_prefix} onChange={handleInputChange} className={`${inputClass} w-24 rounded-r-none border-r-0`}>
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                        </select>
                                        <input type="text" name="cedula_number" value={formData.cedula_number} onChange={handleInputChange} className={`${inputClass} rounded-l-none`} required={!formData.is_minor} placeholder="12345678" />
                                    </div>
                                </div>
                            )}
                            <div className={formData.is_minor ? 'md:col-span-2' : ''}>
                                <label className={labelClass}>Nombres *</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Apellidos *</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className={inputClass} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-t border-gray-100 pt-6">
                            <div>
                                <label className={labelClass}>Fecha de Nacimiento *</label>
                                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className={inputClass} required />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Nombre Registrado al Nacer</label>
                                <input type="text" name="birth_name" value={formData.birth_name} onChange={handleInputChange} className={inputClass} placeholder="Opcional. Dejar en blanco si es igual al actual." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div>
                                <label className={labelClass}>Sexo Biológico *</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectionCard label="👦 Masculino" value="M" isSelected={formData.gender === 'M'} onChange={() => setFormData({...formData, gender: 'M'})} />
                                    <SelectionCard label="👧 Femenino" value="F" isSelected={formData.gender === 'F'} onChange={() => setFormData({...formData, gender: 'F'})} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Identidad de Género</label>
                                <input type="text" name="gender_identity" value={formData.gender_identity} onChange={handleInputChange} className={`${inputClass} mt-4`} placeholder="Transgénero, No Binario..." />
                                <p className="text-xs text-gray-400 mt-2">Solo llenar si difiere del sexo biológico.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className={labelClass}>Correo Electrónico</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="ejemplo@correo.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Teléfono Móvil</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="0414-0000000" />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Dirección de Residencia Habitual</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputClass} placeholder="Urbanización, Calle, Casa/Apto, Parroquia..." />
                            </div>
                        </div>

                        <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 mb-6">
                            <h3 className="font-bold text-rose-700 mb-4 flex items-center gap-2"><span className="text-xl">🚑</span> Contacto de Emergencia</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Nombre Completo</label>
                                    <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleInputChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Teléfono</label>
                                    <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleInputChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Parentesco</label>
                                    <input type="text" name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleInputChange} className={inputClass} placeholder="Madre, Esposo, Hermano..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === PASO 2: COBERTURA === */}
                    <div className={`transition-all duration-500 ${currentStep === 2 ? 'opacity-100 block' : 'hidden opacity-0'}`}>
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                            <span className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">📄</span>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-800">Seguridad Social y Cobertura</h2>
                                <p className="text-gray-500 text-sm">Adscripción a redes de salud y seguros.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className={labelClass}>Tipo de Seguro Médico</label>
                                <select name="insurance_type" value={formData.insurance_type} onChange={handleInputChange} className={inputClass}>
                                    <option value="ninguna">Ninguno (Libre Demanda)</option>
                                    <option value="publica">Seguridad Social Pública (IVSS)</option>
                                    <option value="privada">Seguro Privado</option>
                                    <option value="mixta">Mixta</option>
                                </select>
                                
                                {formData.insurance_type !== 'ninguna' && (
                                    <div className="mt-4">
                                        <label className={labelClass}>Número de Póliza o Afiliación</label>
                                        <input type="text" name="insurance_number" value={formData.insurance_number} onChange={handleInputChange} className={inputClass} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                <label className={labelClass}>Centro de Salud de Adscripción (ASIC)</label>
                                <select name="assigned_center_id" value={formData.assigned_center_id} onChange={handleInputChange} className={inputClass}>
                                    <option value="">-- No Asignado (Libre Elección) --</option>
                                    {centers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                
                                <div className="mt-4">
                                    <label className={labelClass}>Médico de Cabecera (Opcional)</label>
                                    <select name="assigned_doctor_id" value={formData.assigned_doctor_id} onChange={handleInputChange} className={inputClass}>
                                        <option value="">-- No Asignado --</option>
                                        {doctors?.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === PASO 3: DETERMINANTES SOCIALES === */}
                    <div className={`transition-all duration-500 ${currentStep === 3 ? 'opacity-100 block' : 'hidden opacity-0'}`}>
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                            <span className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">🏡</span>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-800">Determinantes Sociales de la Salud</h2>
                                <p className="text-gray-500 text-sm">Factores del entorno y hábitos que influyen en la salud.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Entorno Habitacional</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Tipo de Vivienda</label>
                                        <select name="sd_housing" value={formData.sd_housing} onChange={handleInputChange} className={inputClass}>
                                            <option value="">-- Seleccionar --</option>
                                            <option value="Adecuada (Materiales sólidos)">Adecuada (Materiales sólidos)</option>
                                            <option value="Inadecuada (Rancho/Materiales frágiles)">Inadecuada (Rancho/Materiales frágiles)</option>
                                            <option value="Hacinamiento">Hacinamiento</option>
                                            <option value="En situación de calle">En situación de calle</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Servicio de Agua</label>
                                        <select name="sd_water" value={formData.sd_water} onChange={handleInputChange} className={inputClass}>
                                            <option value="">-- Seleccionar --</option>
                                            <option value="Agua potable por tubería regular">Agua potable por tubería regular</option>
                                            <option value="Cisterna / Irregular">Cisterna / Irregular</option>
                                            <option value="Agua no tratada (Pozo/Río)">Agua no tratada (Pozo/Río)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Ocupación y Economía</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Ocupación / Oficio</label>
                                        <input type="text" name="sd_occupation" value={formData.sd_occupation} onChange={handleInputChange} className={inputClass} placeholder="Ej: Docente, Comerciante, Desempleado..." />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Nivel de Ingresos</label>
                                        <select name="sd_income" value={formData.sd_income} onChange={handleInputChange} className={inputClass}>
                                            <option value="">-- Seleccionar --</option>
                                            <option value="Estable / Suficiente">Estable / Suficiente</option>
                                            <option value="Salario Mínimo / Subempleo">Salario Mínimo / Subempleo</option>
                                            <option value="Pobreza Extrema / Sin ingresos">Pobreza Extrema / Sin ingresos</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="font-bold text-gray-700 mb-4">Hábitos Psicobiológicos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className={labelClass}>Tabaquismo</label>
                                        <select name="sd_smoking" value={formData.sd_smoking} onChange={handleInputChange} className={inputClass}>
                                            <option value="No">No Fumador</option>
                                            <option value="Ocasional">Ocasional</option>
                                            <option value="Frecuente">Frecuente (Activo)</option>
                                            <option value="Ex-fumador">Ex-fumador</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Consumo de Alcohol</label>
                                        <select name="sd_alcohol" value={formData.sd_alcohol} onChange={handleInputChange} className={inputClass}>
                                            <option value="No">No / Abstemio</option>
                                            <option value="Social">Social / Ocasional</option>
                                            <option value="Frecuente">Frecuente</option>
                                            <option value="Dependencia">Dependencia (Alcoholismo)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Drogas Ilícitas</label>
                                        <select name="sd_drugs" value={formData.sd_drugs} onChange={handleInputChange} className={inputClass}>
                                            <option value="No">No</option>
                                            <option value="Si">Sí</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === PASO 4: CLÍNICA BASE === */}
                    <div className={`transition-all duration-500 ${currentStep === 4 ? 'opacity-100 block' : 'hidden opacity-0'}`}>
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                            <span className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">🧬</span>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-800">Perfil Clínico Base</h2>
                                <p className="text-gray-500 text-sm">Antecedentes médicos vitales.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                                <label className="block mb-2 text-xs font-bold text-red-700 uppercase tracking-wider">Grupo Sanguíneo</label>
                                <select name="blood_type" value={formData.blood_type} onChange={handleInputChange} className={inputClass}>
                                    <option value="">Desconocido</option>
                                    {BLOOD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex items-center">
                                <input type="checkbox" id="organ_donor" name="organ_donor" checked={formData.organ_donor} onChange={handleInputChange} className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500 mr-4" />
                                <div>
                                    <label htmlFor="organ_donor" className="font-extrabold text-emerald-800 text-lg cursor-pointer">Donante de Órganos</label>
                                    <p className="text-sm text-emerald-600">Voluntad expresa de donación.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Alergias */}
                            <div>
                                <h3 className="font-extrabold text-gray-800 mb-4 border-b pb-2">Alergias Conocidas</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {COMMON_ALLERGIES.map(allergy => (
                                        <SelectionCard key={allergy} label={allergy} value={allergy} isSelected={formData.allergies.includes(allergy)} onChange={(e) => handleArrayCheckbox(e, 'allergies')} />
                                    ))}
                                </div>
                                <input type="text" name="other_allergies" value={formData.other_allergies} onChange={handleInputChange} className={inputClass} placeholder="Otras alergias (separadas por coma)..." />
                            </div>

                            {/* Patologías Crónicas */}
                            <div>
                                <h3 className="font-extrabold text-gray-800 mb-4 border-b pb-2">Patologías Crónicas Permanentes</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {COMMON_CONDITIONS.map(cond => (
                                        <SelectionCard key={cond} label={cond} value={cond} isSelected={formData.chronic_conditions.includes(cond)} onChange={(e) => handleArrayCheckbox(e, 'chronic_conditions')} />
                                    ))}
                                </div>
                                <input type="text" name="other_conditions" value={formData.other_conditions} onChange={handleInputChange} className={inputClass} placeholder="Otras enfermedades (separadas por coma)..." />
                            </div>

                            {/* Quirúrgicos */}
                            <div>
                                <h3 className="font-extrabold text-gray-800 mb-4 border-b pb-2">Antecedentes Quirúrgicos e Implantes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <textarea name="surgeries" value={formData.surgeries} onChange={handleInputChange} className={inputClass} rows="2" placeholder="Describa cirugías previas..."></textarea>
                                    <textarea name="implants" value={formData.implants} onChange={handleInputChange} className={inputClass} rows="2" placeholder="Prótesis, marcapasos, material de osteosíntesis..."></textarea>
                                </div>
                            </div>

                            {/* Discapacidades y Familiares */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-extrabold text-gray-800 mb-4 border-b pb-2">Discapacidades</h3>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {COMMON_DISABILITIES.map(d => (
                                            <SelectionCard key={d} label={d} value={d} isSelected={formData.disabilities.includes(d)} onChange={(e) => handleArrayCheckbox(e, 'disabilities')} />
                                        ))}
                                    </div>
                                    <input type="text" name="other_disabilities" value={formData.other_disabilities} onChange={handleInputChange} className={inputClass} placeholder="Otras..." />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-gray-800 mb-4 border-b pb-2">Historial Familiar de Riesgo</h3>
                                    <div className="space-y-2 mb-4">
                                        {COMMON_FAMILY_HISTORY.map(fh => (
                                            <SelectionCard key={fh} label={fh} value={fh} isSelected={formData.family_history.includes(fh)} onChange={(e) => handleArrayCheckbox(e, 'family_history')} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === PASO 5: PROGRAMAS DE SALUD === */}
                    <div className={`transition-all duration-500 ${currentStep === 5 ? 'opacity-100 block' : 'hidden opacity-0'}`}>
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                            <span className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-2xl">❤</span>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-800">Programas Nacionales de Salud Pública</h2>
                                <p className="text-gray-500 text-sm">Adscripción a programas preventivos y de control (MPPS).</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* CAREMT */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800">Programa CAREMT (Cardiovascular, Renal, Endocrino)</h3>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="hp_caremt" checked={formData.hp_caremt} onChange={handleInputChange} className="w-5 h-5 text-primary" />
                                        <span className="font-bold text-primary">Inscrito</span>
                                    </label>
                                </div>
                                {formData.hp_caremt && (
                                    <div>
                                        <label className={labelClass}>Nivel de Riesgo Evaluado</label>
                                        <select name="hp_caremt_risk" value={formData.hp_caremt_risk} onChange={handleInputChange} className={inputClass}>
                                            <option value="Bajo">Bajo (Prevención primaria)</option>
                                            <option value="Moderado">Moderado</option>
                                            <option value="Alto">Alto (Patología base + Comorbilidades)</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Materno-Infantil */}
                            {formData.gender === 'F' && (
                                <div className="bg-pink-50/30 p-6 rounded-2xl border border-pink-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-pink-800">Programa Materno, Salud Reproductiva y Planificación Familiar</h3>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="hp_maternal" checked={formData.hp_maternal} onChange={handleInputChange} className="w-5 h-5 text-pink-600" />
                                            <span className="font-bold text-pink-700">Inscrita</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className={labelClass}>Embarazos Previos (Gestas)</label>
                                            <input type="number" name="hp_pregnancies" value={formData.hp_pregnancies} onChange={handleInputChange} className={inputClass} min="0" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Fecha Última Regla (FUR)</label>
                                            <input type="date" name="hp_last_menstruation" value={formData.hp_last_menstruation} onChange={handleInputChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Método Anticonceptivo Actual</label>
                                            <select name="hp_contraceptive" value={formData.hp_contraceptive} onChange={handleInputChange} className={inputClass}>
                                                <option value="Ninguno">Ninguno</option>
                                                <option value="Oral (Pastillas)">Oral (Pastillas)</option>
                                                <option value="DIU (T de Cobre/Mirena)">DIU</option>
                                                <option value="Implante Subdérmico">Implante Subdérmico</option>
                                                <option value="Inyectable">Inyectable</option>
                                                <option value="Esterilización (Quirúrgica)">Esterilización (Quirúrgica)</option>
                                                <option value="Barrera">Barrera (Preservativo)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Otros Programas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800">Programa de Oncología</h3>
                                        <input type="checkbox" name="hp_oncology" checked={formData.hp_oncology} onChange={handleInputChange} className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800">Programa de Nutrición (INN)</h3>
                                        <input type="checkbox" name="hp_nutrition" checked={formData.hp_nutrition} onChange={handleInputChange} className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === PASO 6: PROGRAMAS SENSIBLES === */}
                    <div className={`transition-all duration-500 ${currentStep === 6 ? 'opacity-100 block' : 'hidden opacity-0'}`}>
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                            <span className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl">🔒</span>
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-800">Programas de Manejo Sensible y Confidencial</h2>
                                <p className="text-gray-500 text-sm">Información bajo estrictas normas de privacidad médica.</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl mb-8">
                            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">⚠️ AVISO LEGAL Y DE CONFIDENCIALIDAD</h3>
                            <p className="text-sm text-amber-700">
                                El registro en estos programas está protegido por leyes de confidencialidad. 
                                La información clínica detallada (Evolución, Carga Viral, etc.) NO debe capturarse en esta pantalla general. 
                                **Solo marque la adscripción** para habilitar los módulos especializados correspondientes en la HCEN, los cuales solo serán visibles por médicos especialistas autorizados.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* ITS / VIH */}
                            <div className="bg-white border-2 border-gray-100 p-6 rounded-2xl flex justify-between items-center hover:border-red-200 transition-colors">
                                <div>
                                    <h3 className="font-extrabold text-gray-800 text-lg">Programa Nacional ITS / VIH / SIDA</h3>
                                    <p className="text-sm text-gray-500">Manejo antirretroviral y control epidemiológico cerrado.</p>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                                    <input type="checkbox" name="sp_vih" checked={formData.sp_vih} onChange={handleInputChange} className="w-6 h-6 text-red-600 rounded" />
                                    <span className="font-bold">Paciente Inscrito</span>
                                </label>
                            </div>

                            {/* Tuberculosis */}
                            <div className="bg-white border-2 border-gray-100 p-6 rounded-2xl flex justify-between items-center hover:border-orange-200 transition-colors">
                                <div>
                                    <h3 className="font-extrabold text-gray-800 text-lg">Programa de Tuberculosis (TB) / Salud Respiratoria</h3>
                                    <p className="text-sm text-gray-500">Tratamiento DOTS y aislamiento epidemiológico.</p>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                                    <input type="checkbox" name="sp_tb" checked={formData.sp_tb} onChange={handleInputChange} className="w-6 h-6 text-orange-600 rounded" />
                                    <span className="font-bold">Paciente Inscrito</span>
                                </label>
                            </div>

                            {/* Salud Mental */}
                            <div className="bg-white border-2 border-gray-100 p-6 rounded-2xl hover:border-purple-200 transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-extrabold text-gray-800 text-lg">Programa de Salud Mental y Psiquiatría</h3>
                                        <p className="text-sm text-gray-500">Manejo de trastornos psiquiátricos mayores, adicciones severas o riesgo suicida.</p>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                                        <input type="checkbox" name="sp_mental_health" checked={formData.sp_mental_health} onChange={handleInputChange} className="w-6 h-6 text-purple-600 rounded" />
                                        <span className="font-bold">Paciente Inscrito</span>
                                    </label>
                                </div>
                                {formData.sp_mental_health && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <label className={labelClass}>Diagnóstico Base Reportado al Ingreso (Solo si el paciente accede a compartirlo)</label>
                                        <input type="text" name="sp_mental_dx" value={formData.sp_mental_dx} onChange={handleInputChange} className={inputClass} placeholder="Ej: Esquizofrenia, Trastorno Bipolar, Depresión Mayor..." />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Action Bar Flotante */}
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 flex justify-between items-center rounded-b-3xl">
                        <button 
                            type="button"
                            onClick={() => {
                                if (currentStep > 1) {
                                    setCurrentStep(currentStep - 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            className={`btn btn-secondary ${currentStep === 1 ? 'invisible' : ''}`}
                        >
                            ← Volver
                        </button>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`btn ${currentStep === 6 ? 'btn-success btn-lg shadow-[0_4px_20px_rgba(39,174,96,0.3)]' : 'btn-primary'} flex items-center gap-2`}
                        >
                            {isSubmitting ? (
                                <>Procesando <span className="animate-spin text-xl">⏳</span></>
                            ) : currentStep === 6 ? (
                                <>Guardar HCEN Integral <span className="text-xl">✅</span></>
                            ) : (
                                <>Siguiente Fase <span className="text-xl">→</span></>
                            )}
                        </button>
                    </div>

                    {/* Espaciador para la barra flotante */}
                    <div className="h-16"></div>
                </form>

            </div>
        </Layout>
    );
}

export const getServerSideProps = withAuth(async (ctx, supabase, user, profile) => {
    const { cedula } = ctx.query;

    const { data: centers } = await supabase
        .from('health_centers')
        .select('id, name')
        .order('name');

    const { data: doctors } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('role', ['medico', 'especialista', 'medico_jefe'])
        .order('first_name');

    return {
        props: {
            user,
            profile,
            centers: centers || [],
            doctors: doctors || [],
            initialCedula: cedula || null
        }
    };
});
