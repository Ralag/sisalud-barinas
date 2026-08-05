import { useState } from 'react';
import Link from 'next/link';
import { GENDERS } from '@/lib/utils/constants';

function calculateAge(birthDate) {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PatientProfile({ patient, parent, records = [] }) {
    const [activeTab, setActiveTab] = useState('resumen');
    
    const age = calculateAge(patient.birth_date);
    const allergies = patient.allergies || [];
    const conditions = patient.chronic_conditions || [];
    
    // Derived states for Summary
    const hasCriticalAllergies = allergies.length > 0;
    const lastConsultation = records.length > 0 ? records[0] : null;

    return (
        <div className="ehr-dashboard bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Cabecera Fija del Paciente (Sticky Header) */}
            <div className="ehr-header bg-gray-50 border-b border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                    <div className="ehr-avatar bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
                        {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 m-0 leading-tight">
                            {patient.first_name} {patient.last_name}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="badge badge-primary text-sm shadow-sm">{patient.cedula}</span>
                            <span className="badge bg-gray-200 text-gray-700 text-sm shadow-sm">{age} años</span>
                            <span className="badge bg-gray-200 text-gray-700 text-sm shadow-sm">{GENDERS[patient.gender]}</span>
                            {patient.is_minor && <span className="badge badge-warning text-sm shadow-sm">Menor de Edad</span>}
                            {patient.organ_donor && <span className="badge bg-red-500 text-white text-sm shadow-sm">❤️ Donante</span>}
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex gap-4 text-right">
                    <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Grupo Sanguíneo</p>
                        <p className={`text-xl font-black ${patient.blood_type ? 'text-red-600' : 'text-gray-400'}`}>
                            {patient.blood_type || 'Desc.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Menú de Pestañas (Tabs) */}
            <div className="ehr-tabs flex overflow-x-auto border-b border-gray-200 bg-white">
                <button 
                    className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'resumen' ? 'border-b-4 border-primary text-primary bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setActiveTab('resumen')}
                >
                    Resumen Clínico
                </button>
                <button 
                    className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'demograficos' ? 'border-b-4 border-primary text-primary bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setActiveTab('demograficos')}
                >
                    Datos Demográficos
                </button>
                <button 
                    className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'antecedentes' ? 'border-b-4 border-primary text-primary bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setActiveTab('antecedentes')}
                >
                    Antecedentes Permanentes
                </button>
                <button 
                    className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'consultas' ? 'border-b-4 border-primary text-primary bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setActiveTab('consultas')}
                >
                    Consultas ({records.length})
                </button>
            </div>

            {/* Contenido de Pestañas */}
            <div className="ehr-content p-6 bg-gray-50 min-h-[500px]">
                
                {/* === TAB 1: RESUMEN CLÍNICO === */}
                {activeTab === 'resumen' && (
                    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Columna Izquierda: Alertas y Snapshot */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <div className={`rounded-lg p-5 border shadow-sm ${hasCriticalAllergies ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <h3 className={`font-bold flex items-center gap-2 mb-3 ${hasCriticalAllergies ? 'text-red-700' : 'text-green-700'}`}>
                                    <span className="text-xl">{hasCriticalAllergies ? '⚠️' : '✅'}</span> 
                                    Estado de Alerta
                                </h3>
                                {hasCriticalAllergies ? (
                                    <div>
                                        <p className="text-sm font-bold text-red-800 mb-2">Paciente alérgico a:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {allergies.map(a => <span key={a} className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">{a}</span>)}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-green-800">No se registran alergias conocidas.</p>
                                )}
                            </div>

                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Patologías Activas</h3>
                                {conditions.length > 0 ? (
                                    <ul className="space-y-2">
                                        {conditions.map(c => (
                                            <li key={c} className="text-sm flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span className="text-gray-800 font-medium">{c}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Paciente aparentemente sano. Sin patologías crónicas reportadas.</p>
                                )}
                            </div>
                        </div>

                        {/* Columna Derecha: Última Consulta y Vitales */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm h-full">
                                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Última Interacción Clínica</h3>
                                {lastConsultation ? (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-gray-500 uppercase">{formatDate(lastConsultation.created_at)}</span>
                                            <span className="badge badge-secondary">{lastConsultation.record_type}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Atendido por: <span className="font-bold">{lastConsultation.user_profiles?.first_name} {lastConsultation.user_profiles?.last_name}</span> en {lastConsultation.health_centers?.name}
                                        </p>
                                        
                                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 mt-4">Motivo / Diagnóstico</h4>
                                        <p className="text-gray-800 bg-gray-50 p-3 rounded border text-sm">
                                            <span className="font-bold">{lastConsultation.diagnosis}</span>
                                            {lastConsultation.diagnosis_code && <span className="ml-2 badge bg-gray-200 text-xs">CIE: {lastConsultation.diagnosis_code}</span>}
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Presión Arterial</p>
                                                <p className="font-bold text-gray-800">{lastConsultation.blood_pressure_sys || '-'}/{lastConsultation.blood_pressure_dia || '-'} <span className="text-xs font-normal">mmHg</span></p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Frecuencia Card.</p>
                                                <p className="font-bold text-gray-800">{lastConsultation.heart_rate || '-'} <span className="text-xs font-normal">lpm</span></p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Temperatura</p>
                                                <p className="font-bold text-gray-800">{lastConsultation.temperature || '-'} <span className="text-xs font-normal">°C</span></p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Saturación O2</p>
                                                <p className="font-bold text-gray-800">{lastConsultation.oxygen_sat || '-'} <span className="text-xs font-normal">%</span></p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 text-right">
                                            <Link href={`/consultas/${lastConsultation.id}`} className="text-sm text-primary font-bold hover:underline">
                                                Ver historia completa →
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <span className="text-4xl mb-2">📁</span>
                                        <p>No existen registros médicos previos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* === TAB 2: DATOS DEMOGRÁFICOS === */}
                {activeTab === 'demograficos' && (
                    <div className="animate-fade-in bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-6 border-b pb-2">Información de Afiliación y Contacto</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
                            <div className="ehr-info-block">
                                <label>Fecha de Nacimiento</label>
                                <span>{formatDate(patient.birth_date)}</span>
                            </div>
                            <div className="ehr-info-block">
                                <label>Teléfono Personal</label>
                                <span>{patient.phone || 'No registrado'}</span>
                            </div>
                            <div className="ehr-info-block">
                                <label>Correo Electrónico</label>
                                <span>{patient.email || 'No registrado'}</span>
                            </div>
                            
                            <div className="ehr-info-block md:col-span-3 border-t pt-4">
                                <label>Dirección de Residencia</label>
                                <span>{patient.address || 'No registrada'} - {patient.municipality}, {patient.state}</span>
                            </div>

                            <div className="ehr-info-block border-t pt-4">
                                <label>Contacto de Emergencia</label>
                                <span>{patient.emergency_contact_name || 'No registrado'}</span>
                            </div>
                            <div className="ehr-info-block border-t pt-4">
                                <label>Teléfono de Emergencia</label>
                                <span>{patient.emergency_contact_phone || 'No registrado'}</span>
                            </div>
                            <div className="ehr-info-block border-t pt-4"></div>

                            <div className="ehr-info-block bg-gray-50 p-4 rounded border">
                                <label>N° Seguro Social / Privado</label>
                                <span className="font-bold">{patient.insurance_number || 'Ninguno'}</span>
                            </div>
                            <div className="ehr-info-block bg-gray-50 p-4 rounded border">
                                <label>Centro Asignado (Base)</label>
                                <span className="font-bold">{patient.assigned_center_id || 'Libre Elección'}</span>
                            </div>
                            <div className="ehr-info-block bg-gray-50 p-4 rounded border">
                                <label>Médico de Cabecera</label>
                                <span className="font-bold">{patient.assigned_doctor_id ? 'Asignado' : 'No Asignado'}</span>
                            </div>
                        </div>

                        {patient.is_minor && parent && (
                            <div className="mt-8 bg-yellow-50 p-4 rounded border border-yellow-200">
                                <h4 className="font-bold text-yellow-800 mb-2">Representante Legal (Paciente Menor de Edad)</h4>
                                <p className="text-yellow-900">{parent.first_name} {parent.last_name} — C.I: <span className="font-bold">{parent.cedula}</span></p>
                            </div>
                        )}
                    </div>
                )}


                {/* === TAB 3: ANTECEDENTES PERMANENTES === */}
                {activeTab === 'antecedentes' && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                <span className="text-xl">🧬</span> Discapacidades y Cond. Funcionales
                            </h3>
                            {patient.disabilities && patient.disabilities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {patient.disabilities.map(d => <span key={d} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-300">{d}</span>)}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No presenta discapacidades registradas.</p>
                            )}
                        </div>

                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                <span className="text-xl">👨‍👩‍👧‍👦</span> Antecedentes Heredofamiliares
                            </h3>
                            {patient.family_history && patient.family_history.length > 0 ? (
                                <ul className="space-y-2">
                                    {patient.family_history.map(fh => (
                                        <li key={fh} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-primary">•</span> {fh}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Sin antecedentes familiares de riesgo reportados.</p>
                            )}
                        </div>

                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm md:col-span-2">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                <span className="text-xl">🔪</span> Historial Quirúrgico e Implantes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Cirugías Previas</h4>
                                    {patient.surgeries && patient.surgeries.length > 0 ? (
                                        <ul className="space-y-2">
                                            {patient.surgeries.map(s => (
                                                <li key={s} className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">{s}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No refiere cirugías.</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Prótesis y Dispositivos</h4>
                                    {patient.implants && patient.implants.length > 0 ? (
                                        <ul className="space-y-2">
                                            {patient.implants.map(i => (
                                                <li key={i} className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">{i}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No porta implantes médicos.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}


                {/* === TAB 4: CONSULTAS === */}
                {activeTab === 'consultas' && (
                    <div className="animate-fade-in bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Línea de Tiempo de Atención Clínica</h3>
                        </div>
                        
                        {records.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No hay eventos registrados en la historia clínica del paciente.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-primary ml-8 my-8 space-y-8">
                                {records.map((r, index) => (
                                    <div key={r.id} className="relative pl-6 pr-4">
                                        {/* Timeline dot */}
                                        <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 border-4 border-white shadow"></div>
                                        
                                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-xs font-bold text-primary uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                                                        {r.record_type}
                                                    </span>
                                                    <h4 className="text-lg font-bold text-gray-800 mt-2">{r.diagnosis}</h4>
                                                </div>
                                                <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                    {formatDate(r.created_at)}
                                                </span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                <span className="font-bold text-gray-700">Motivo:</span> {r.reason}
                                            </p>
                                            
                                            <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                                                <div className="flex items-center gap-2">
                                                    <span>👨‍⚕️ Dr/a. {r.user_profiles?.first_name} {r.user_profiles?.last_name}</span>
                                                    <span>•</span>
                                                    <span>🏥 {r.health_centers?.name}</span>
                                                </div>
                                                <Link href={`/consultas/${r.id}`} className="font-bold text-primary hover:underline">
                                                    Ver Historia →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .ehr-info-block {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .ehr-info-block label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #7f8c8d;
                    font-weight: 700;
                }
                .ehr-info-block span {
                    font-size: 1rem;
                    color: #2c3e50;
                }
            `}</style>
        </div>
    );
}
