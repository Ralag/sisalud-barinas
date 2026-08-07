import { useState } from 'react';
import Link from 'next/link';
import { GENDERS, INSURANCE_TYPES } from '@/lib/utils/constants';
import PharmacyTab from '@/components/ehr/PharmacyTab';
import LabResultsTab from '@/components/ehr/LabResultsTab';
import HospitalizationsTab from '@/components/ehr/HospitalizationsTab';
import MentalHealthTab from '@/components/ehr/MentalHealthTab';

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
    const social = patient.social_determinants || {};
    const programs = patient.health_programs || {};
    const sensitive = patient.sensitive_programs || {};
    
    const hasCriticalAllergies = allergies.length > 0;
    const lastConsultation = records.length > 0 ? records[0] : null;

    const tabs = [
        { id: 'resumen', label: 'Resumen Clínico', icon: '📋', num: null },
        { id: 'demograficos', label: 'Demográficos', icon: '👤', num: null },
        { id: 'determinantes', label: 'DTS', icon: '🏡', num: null },
        { id: 'programas', label: 'Programas', icon: '❤', num: null },
        { id: 'antecedentes', label: 'Antecedentes', icon: '🧬', num: null },
        { id: 'consultas', label: 'Historia Médica', icon: '🩺', num: records.length },
        { id: 'farmacia', label: 'Farmacia', icon: '💊', num: null },
        { id: 'laboratorio', label: 'Laboratorio', icon: '🔬', num: null },
        { id: 'hospitalizaciones', label: 'Hospitalización', icon: '🏥', num: null },
        { id: 'salud_mental', label: 'Salud Mental', icon: '🧠', num: null },
    ];

    return (
        <div className="max-w-7xl mx-auto mb-16 animate-fade-in">
            
            {/* Cabecera Premium */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 border border-white/40">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light z-0"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-3xl z-0"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl z-0"></div>
                
                <div className="relative z-10 p-8 md:p-10 backdrop-blur-sm bg-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-4xl font-extrabold text-primary border-4 border-white/50 backdrop-blur-md transform transition-transform hover:scale-105">
                            {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">
                                {patient.first_name} {patient.last_name}
                            </h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-3 py-1 bg-white/20 text-white font-bold text-sm rounded-lg backdrop-blur-md border border-white/30 shadow-sm">{patient.cedula}</span>
                                <span className="px-3 py-1 bg-black/20 text-white text-sm rounded-lg backdrop-blur-md">{age} años</span>
                                <span className="px-3 py-1 bg-black/20 text-white text-sm rounded-lg backdrop-blur-md">{GENDERS[patient.gender]}</span>
                                {patient.is_minor && <span className="px-3 py-1 bg-yellow-400/90 text-yellow-900 font-bold text-sm rounded-lg shadow-sm">Menor de Edad</span>}
                                {patient.organ_donor && <span className="px-3 py-1 bg-rose-500/90 text-white font-bold text-sm rounded-lg shadow-sm">❤️ Donante</span>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                        <div className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-white/50 w-full md:w-auto flex justify-between md:flex-col md:justify-center items-center md:items-end transform transition-transform hover:scale-105">
                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Grupo Sanguíneo</span>
                            <span className={`text-3xl font-black ${patient.blood_type ? 'text-red-600' : 'text-gray-300'}`}>
                                {patient.blood_type || 'Desc.'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="flex overflow-x-auto bg-gray-50/80 backdrop-blur-md border-b border-gray-100 px-4 pt-4" style={{scrollbarWidth:'thin'}}>
                    <div className="flex space-x-2 pb-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2
                                    ${activeTab === tab.id 
                                        ? 'bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 transform -translate-y-1' 
                                        : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'
                                    }
                                `}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                                {tab.num !== null && (
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                                        {tab.num}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 md:p-10 min-h-[600px] bg-white">
                    
                    {/* === TAB 1: RESUMEN CLÍNICO === */}
                    <div className={`transition-all duration-500 ${activeTab === 'resumen' ? 'opacity-100 translate-y-0 block' : 'hidden opacity-0 translate-y-4'}`}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-8">
                                <div className={`relative overflow-hidden rounded-3xl p-6 border-2 transition-all ${hasCriticalAllergies ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
                                    {hasCriticalAllergies && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>}
                                    <h3 className={`font-extrabold flex items-center gap-2 mb-4 text-lg ${hasCriticalAllergies ? 'text-red-700' : 'text-emerald-700'}`}>
                                        <span className="text-2xl">{hasCriticalAllergies ? '⚠️' : '✅'}</span> 
                                        {hasCriticalAllergies ? 'Alertas Críticas' : 'Sin Alertas'}
                                    </h3>
                                    {hasCriticalAllergies ? (
                                        <div>
                                            <p className="text-xs font-bold text-red-800/70 mb-3 uppercase tracking-wider">Alergias Registradas</p>
                                            <div className="flex flex-wrap gap-2">
                                                {allergies.map(a => <span key={a} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm">{a}</span>)}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-emerald-800/80 font-medium">Paciente sin alergias medicamentosas ni alimentarias reportadas.</p>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-extrabold text-gray-800 mb-4 border-b border-gray-200 pb-3 flex items-center gap-2">
                                        <span className="text-xl">🦠</span> Patologías Activas
                                    </h3>
                                    {conditions.length > 0 ? (
                                        <ul className="space-y-3">
                                            {conditions.map(c => (
                                                <li key={c} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                    <span className="text-gray-700 font-semibold text-sm">{c}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400">
                                            <span className="text-3xl block mb-2">🌿</span>
                                            <p className="text-sm font-medium">Paciente aparentemente sano.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-110"></div>
                                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 relative z-10">
                                        <h3 className="font-extrabold text-xl text-gray-800">Última Interacción Clínica</h3>
                                    </div>
                                    {lastConsultation ? (
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">👨‍⚕️</div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 font-medium leading-tight">Atendido por</p>
                                                        <p className="font-bold text-gray-800 leading-tight">{lastConsultation.user_profiles?.first_name} {lastConsultation.user_profiles?.last_name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500 font-medium leading-tight">{formatDate(lastConsultation.created_at)}</p>
                                                    <p className="text-xs text-gray-400 font-bold mt-0.5">{lastConsultation.health_centers?.name}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-2">Diagnóstico Principal</p>
                                                <p className="text-lg text-gray-800 font-bold">
                                                    {lastConsultation.diagnosis}
                                                    {lastConsultation.diagnosis_code && <span className="ml-3 inline-block bg-white text-gray-500 text-xs px-2 py-0.5 rounded border shadow-sm">CIE: {lastConsultation.diagnosis_code}</span>}
                                                </p>
                                            </div>

                                            <div className="mt-8 text-right">
                                                <Link href={`/consultas/${lastConsultation.id}`} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-[0_4px_14px_rgba(26,82,118,0.3)]">
                                                    Ver historia completa →
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 relative z-10">
                                            <span className="text-4xl mb-4">📁</span>
                                            <p className="font-bold text-gray-500">Sin historial clínico</p>
                                            <p className="text-sm mt-1">No existen registros médicos previos.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === TAB 2: DEMOGRÁFICOS === */}
                    <div className={`transition-all duration-500 ${activeTab === 'demograficos' ? 'opacity-100 translate-y-0 block' : 'hidden opacity-0 translate-y-4'}`}>
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="text-2xl font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4">Información de Afiliación y Contacto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Fecha de Nacimiento</p>
                                    <p className="text-lg font-bold text-gray-800">{formatDate(patient.birth_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Identidad de Género</p>
                                    <p className="text-lg font-semibold text-gray-800">{patient.gender_identity || GENDERS[patient.gender]}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Teléfono</p>
                                    <p className="text-lg font-semibold text-gray-800">{patient.phone || 'No registrado'}</p>
                                </div>
                                <div className="space-y-1 md:col-span-3 border-t border-gray-100 pt-6">
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Dirección de Residencia</p>
                                    <p className="text-lg font-semibold text-gray-800">{patient.address || 'No registrada'} — {patient.municipality}, {patient.state}</p>
                                </div>

                                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mt-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest">Cobertura de Salud</p>
                                        <p className="text-lg font-bold text-gray-800">{INSURANCE_TYPES[patient.insurance_type] || 'Sin Cobertura'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest">Centro de Salud Asignado</p>
                                        <p className="text-lg font-bold text-gray-800">{patient.assigned_center_id || 'Libre Elección'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === TAB 3: DETERMINANTES SOCIALES === */}
                    <div className={`transition-all duration-500 ${activeTab === 'determinantes' ? 'opacity-100 translate-y-0 block' : 'hidden opacity-0 translate-y-4'}`}>
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="font-extrabold text-2xl text-gray-800 mb-8 border-b border-gray-100 pb-4">Determinantes Sociales de la Salud (DSS)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><span className="text-xl">🏘️</span> Entorno y Vivienda</h4>
                                    <div><p className="text-xs font-bold text-gray-400 uppercase">Tipo de Vivienda</p><p className="text-lg font-medium text-gray-800">{social.housing || 'No especificado'}</p></div>
                                    <div><p className="text-xs font-bold text-gray-400 uppercase">Acceso a Agua Potable</p><p className="text-lg font-medium text-gray-800">{social.water || 'No especificado'}</p></div>
                                </div>
                                <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><span className="text-xl">💼</span> Nivel Socioeconómico</h4>
                                    <div><p className="text-xs font-bold text-gray-400 uppercase">Ocupación</p><p className="text-lg font-medium text-gray-800">{social.occupation || 'No especificada'}</p></div>
                                    <div><p className="text-xs font-bold text-gray-400 uppercase">Nivel de Ingresos</p><p className="text-lg font-medium text-gray-800">{social.income || 'No especificado'}</p></div>
                                </div>
                                <div className="md:col-span-2 space-y-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                    <h4 className="font-bold text-primary text-lg mb-4 flex items-center gap-2"><span className="text-xl">🚬</span> Hábitos Psicobiológicos</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div><p className="text-xs font-bold text-blue-400 uppercase">Tabaquismo</p><p className="text-lg font-bold text-gray-800">{social.smoking || 'No'}</p></div>
                                        <div><p className="text-xs font-bold text-blue-400 uppercase">Alcoholismo</p><p className="text-lg font-bold text-gray-800">{social.alcohol || 'No'}</p></div>
                                        <div><p className="text-xs font-bold text-blue-400 uppercase">Drogas Ilícitas</p><p className="text-lg font-bold text-gray-800">{social.drugs || 'No'}</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === TAB 4: PROGRAMAS DE SALUD === */}
                    <div className={`transition-all duration-500 ${activeTab === 'programas' ? 'opacity-100 translate-y-0 block' : 'hidden opacity-0 translate-y-4'}`}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className={`p-8 rounded-3xl border-2 transition-all ${programs.caremt_enrolled ? 'bg-white border-blue-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-70'}`}>
                                <h3 className="font-extrabold text-xl text-gray-800 mb-2 flex items-center gap-2"><span className="text-2xl">❤️</span> Prog. CAREMT</h3>
                                <p className="text-sm text-gray-500 mb-6">Enfermedades Cardiovasculares, Renales y Endocrinas.</p>
                                {programs.caremt_enrolled ? (
                                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl font-bold border border-blue-100 flex justify-between">
                                        <span>Estado: Inscrito</span>
                                        <span>Nivel Riesgo: {programs.caremt_risk}</span>
                                    </div>
                                ) : (
                                    <p className="font-bold text-gray-400 bg-gray-100 p-4 rounded-xl text-center">No Inscrito</p>
                                )}
                            </div>

                            {patient.gender === 'F' && (
                                <div className={`p-8 rounded-3xl border-2 transition-all ${programs.maternal_enrolled ? 'bg-pink-50 border-pink-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-70'}`}>
                                    <h3 className="font-extrabold text-xl text-pink-800 mb-2 flex items-center gap-2"><span className="text-2xl">👩‍👧</span> Salud Materno-Infantil</h3>
                                    <p className="text-sm text-gray-500 mb-6">Planificación familiar y control prenatal.</p>
                                    {programs.maternal_enrolled ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm"><p className="text-xs text-pink-500 font-bold uppercase">Gestas</p><p className="font-bold text-lg">{programs.pregnancies}</p></div>
                                            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm"><p className="text-xs text-pink-500 font-bold uppercase">FUR</p><p className="font-bold text-lg">{programs.last_menstruation || 'N/A'}</p></div>
                                            <div className="col-span-2 bg-white p-4 rounded-xl border border-pink-100 shadow-sm"><p className="text-xs text-pink-500 font-bold uppercase">Anticonceptivo</p><p className="font-bold text-lg">{programs.contraceptive}</p></div>
                                        </div>
                                    ) : (
                                        <p className="font-bold text-gray-400 bg-gray-100 p-4 rounded-xl text-center">No Inscrita</p>
                                    )}
                                </div>
                            )}

                            {/* Programas Sensibles */}
                            <div className="lg:col-span-2 bg-red-50 p-8 rounded-3xl border border-red-200">
                                <h3 className="font-extrabold text-xl text-red-800 mb-6 flex items-center gap-2"><span className="text-2xl">🔒</span> Programas Confidenciales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className={`p-4 rounded-2xl border ${sensitive.vih_enrolled ? 'bg-white border-red-300 shadow-md' : 'bg-red-50 border-red-100'}`}>
                                        <h4 className="font-bold text-red-900 mb-2">ITS / VIH / SIDA</h4>
                                        {sensitive.vih_enrolled ? <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">Paciente Adscrito</span> : <span className="text-sm text-red-400">No Adscrito</span>}
                                    </div>
                                    <div className={`p-4 rounded-2xl border ${sensitive.tb_enrolled ? 'bg-white border-orange-300 shadow-md' : 'bg-red-50 border-red-100'}`}>
                                        <h4 className="font-bold text-orange-900 mb-2">Tuberculosis (TB)</h4>
                                        {sensitive.tb_enrolled ? <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">Paciente Adscrito</span> : <span className="text-sm text-red-400">No Adscrito</span>}
                                    </div>
                                    <div className={`p-4 rounded-2xl border ${sensitive.mental_health_enrolled ? 'bg-white border-purple-300 shadow-md' : 'bg-red-50 border-red-100'}`}>
                                        <h4 className="font-bold text-purple-900 mb-2">Salud Mental</h4>
                                        {sensitive.mental_health_enrolled ? (
                                            <div>
                                                <span className="inline-block px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full mb-2">Paciente Adscrito</span>
                                                <p className="text-xs text-gray-500"><strong>DX:</strong> {sensitive.mental_health_dx}</p>
                                            </div>
                                        ) : <span className="text-sm text-red-400">No Adscrito</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === TAB 5: ANTECEDENTES === */}
                    <div className={`transition-all duration-500 ${activeTab === 'antecedentes' ? 'opacity-100 translate-y-0 block' : 'hidden opacity-0 translate-y-4'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <h3 className="font-extrabold text-xl text-gray-800 mb-6 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-xl">🦽</span> Discapacidades
                                </h3>
                                {patient.disabilities?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {patient.disabilities.map(d => <span key={d} className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-xl text-sm font-bold border border-yellow-200">{d}</span>)}
                                    </div>
                                ) : <p className="text-gray-400 font-medium">Ninguna registrada.</p>}
                            </div>
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <h3 className="font-extrabold text-xl text-gray-800 mb-6 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">👨‍👩‍👧‍👦</span> Antecedentes Familiares
                                </h3>
                                {patient.family_history?.length > 0 ? (
                                    <ul className="space-y-3">
                                        {patient.family_history.map(fh => <li key={fh} className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{fh}</li>)}
                                    </ul>
                                ) : <p className="text-gray-400 font-medium">Ninguno registrado.</p>}
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Cirugías</h4>
                                    <p className="text-gray-700 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">{patient.surgeries || 'Ninguna registrada'}</p>
                                </div>
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Implantes / Prótesis</h4>
                                    <p className="text-gray-700 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">{patient.implants || 'Ninguno registrado'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={activeTab === 'consultas' ? 'block' : 'hidden'}>
                        {records.length === 0 ? (
                            <div className="p-16 text-center text-gray-400"><p className="font-bold text-lg">No hay eventos registrados.</p></div>
                        ) : (
                            <div className="space-y-4">
                                {records.map(r => (
                                    <div key={r.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center">
                                        <div><p className="font-bold text-lg text-gray-800">{r.diagnosis}</p><p className="text-sm text-gray-500">{formatDate(r.created_at)}</p></div>
                                        <Link href={`/consultas/${r.id}`} className="btn btn-primary btn-sm">Ver Detalle</Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={activeTab === 'farmacia' ? 'block' : 'hidden'}><PharmacyTab patientId={patient.id} /></div>
                    <div className={activeTab === 'laboratorio' ? 'block' : 'hidden'}><LabResultsTab patientId={patient.id} /></div>
                    <div className={activeTab === 'hospitalizaciones' ? 'block' : 'hidden'}><HospitalizationsTab patientId={patient.id} /></div>
                    <div className={activeTab === 'salud_mental' ? 'block' : 'hidden'}><MentalHealthTab patientId={patient.id} /></div>
                </div>
            </div>
        </div>
    );
}
