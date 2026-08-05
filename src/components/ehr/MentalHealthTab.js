import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function MentalHealthTab({ patientId }) {
  const [activeTab, setActiveTab] = useState('evaluaciones');
  const [mentalHealthRecords, setMentalHealthRecords] = useState([]);
  const [advanceDirectives, setAdvanceDirectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function fetchData() {
      if (!patientId) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch mental health records
        const { data: mhData, error: mhError } = await supabase
          .from('mental_health_records')
          .select(`
            *,
            evaluator:user_profiles!evaluator_id(full_name)
          `)
          .eq('patient_id', patientId)
          .order('session_date', { ascending: false });

        if (mhError) throw mhError;

        // Fetch advance directives
        const { data: adData, error: adError } = await supabase
          .from('advance_directives')
          .select('*')
          .eq('patient_id', patientId)
          .order('document_date', { ascending: false });

        if (adError) throw adError;

        setMentalHealthRecords(mhData || []);
        setAdvanceDirectives(adData || []);
      } catch (err) {
        console.error('Error fetching mental health tab data:', err);
        setError('Error al cargar la información confidencial.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [patientId, supabase]);

  const getRecordTypeBadge = (type) => {
    const types = {
      'evaluacion_psiquiatrica': 'bg-purple-100 text-purple-800',
      'evaluacion_psicologica': 'bg-blue-100 text-blue-800',
      'seguimiento': 'bg-gray-100 text-gray-800',
      'adiccion': 'bg-orange-100 text-orange-800',
      'rehabilitacion': 'bg-green-100 text-green-800'
    };
    return types[type] || 'bg-gray-100 text-gray-800';
  };

  const getRecordTypeName = (type) => {
    const names = {
      'evaluacion_psiquiatrica': 'Evaluación Psiquiátrica',
      'evaluacion_psicologica': 'Evaluación Psicológica',
      'seguimiento': 'Seguimiento',
      'adiccion': 'Adicción',
      'rehabilitacion': 'Rehabilitación'
    };
    return names[type] || type;
  };

  const getRiskAssessmentBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'bajo': return 'bg-green-100 text-green-800';
      case 'moderado': return 'bg-yellow-100 text-yellow-800';
      case 'alto': return 'bg-orange-100 text-orange-800';
      case 'critico': return 'bg-red-100 text-red-800 animate-pulse font-bold';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectiveBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'reanimacion': return 'bg-red-100 text-red-800';
      case 'cuidados_paliativos': return 'bg-purple-100 text-purple-800';
      case 'donacion_organos': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-VE');
  };

  if (loading) {
    return <div className="loading p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div></div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }

  // Derived data
  const generalEvaluations = mentalHealthRecords.filter(r => !['adiccion', 'rehabilitacion'].includes(r.record_type));
  const addictionRecords = mentalHealthRecords.filter(r => ['adiccion', 'rehabilitacion'].includes(r.record_type));

  return (
    <div className="mental-health-tab space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-md shadow-sm">
        <p className="font-bold text-yellow-800 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          ⚠️ INFORMACIÓN SENSIBLE — ACCESO RESTRINGIDO
        </p>
        <p className="text-sm text-yellow-700 mt-1 ml-7">
          Esta sección contiene información protegida por ley. Su acceso queda registrado en la bitácora de auditoría del sistema.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('evaluaciones')}
            className={`${activeTab === 'evaluaciones' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Evaluaciones Psiquiátricas / Psicológicas
          </button>
          <button
            onClick={() => setActiveTab('adicciones')}
            className={`${activeTab === 'adicciones' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Historial de Adicciones
          </button>
          <button
            onClick={() => setActiveTab('voluntades')}
            className={`${activeTab === 'voluntades' ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Voluntades Anticipadas
          </button>
        </nav>
      </div>

      <div className="tab-content mt-6">
        {activeTab === 'evaluaciones' && (
          <div className="space-y-4">
            {generalEvaluations.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No hay evaluaciones</h3>
                <p className="mt-1 text-sm text-slate-500">No se han registrado evaluaciones psicológicas o psiquiátricas para este paciente.</p>
              </div>
            ) : (
              generalEvaluations.map((record) => (
                <div key={record.id} className={`card border ${record.is_confidential ? 'border-red-200 bg-red-50' : 'border-slate-200'} shadow-sm rounded-lg overflow-hidden`}>
                  <div className={`card-header px-4 py-3 border-b ${record.is_confidential ? 'bg-red-100 border-red-200' : 'bg-slate-50 border-slate-200'} flex justify-between items-center`}>
                    <div className="flex items-center gap-3">
                      <span className={`badge px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecordTypeBadge(record.record_type)}`}>
                        {getRecordTypeName(record.record_type)}
                      </span>
                      <span className="text-sm text-slate-600 font-medium">
                        Fecha: {formatDate(record.session_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.risk_assessment && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getRiskAssessmentBadge(record.risk_assessment)}`}>
                          Riesgo: {record.risk_assessment}
                        </span>
                      )}
                      {record.is_confidential && (
                        <span className="flex items-center text-red-700 text-xs font-bold bg-white px-2 py-1 rounded shadow-sm border border-red-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                          CONFIDENCIAL
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2 text-sm">
                      <span className="text-slate-500 font-medium block">Evaluador:</span>
                      <span className="text-slate-800">{record.evaluator?.full_name || 'Desconocido'}</span>
                    </div>
                    {record.presenting_problem && (
                      <div className="col-span-1 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Motivo de Consulta</h4>
                        <p className="text-sm text-slate-800 bg-white p-3 rounded border border-slate-100">{record.presenting_problem}</p>
                      </div>
                    )}
                    {record.mental_status_exam && (
                      <div className="col-span-1">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Examen Mental</h4>
                        <p className="text-sm text-slate-800 bg-white p-3 rounded border border-slate-100 whitespace-pre-wrap">{record.mental_status_exam}</p>
                      </div>
                    )}
                    {record.diagnosis && (
                      <div className="col-span-1">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Diagnóstico</h4>
                        <p className="text-sm text-slate-800 bg-white p-3 rounded border border-slate-100 font-medium">{record.diagnosis}</p>
                      </div>
                    )}
                    {record.treatment_plan && (
                      <div className="col-span-1 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plan de Tratamiento</h4>
                        <p className="text-sm text-slate-800 bg-white p-3 rounded border border-slate-100 whitespace-pre-wrap">{record.treatment_plan}</p>
                      </div>
                    )}
                    {record.medications_notes && (
                      <div className="col-span-1 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notas de Medicación</h4>
                        <p className="text-sm text-slate-800 bg-white p-3 rounded border border-slate-100 whitespace-pre-wrap">{record.medications_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'adicciones' && (
          <div className="space-y-4">
             {addictionRecords.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No hay registros</h3>
                <p className="mt-1 text-sm text-slate-500">No se ha registrado historial de adicciones o rehabilitación.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 pl-6 py-2 space-y-8">
                {addictionRecords.map((record) => (
                  <div key={record.id} className="relative">
                    <div className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-white ${record.record_type === 'rehabilitacion' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecordTypeBadge(record.record_type)}`}>
                            {getRecordTypeName(record.record_type)}
                          </span>
                          <span className="ml-2 text-sm text-slate-500">{formatDate(record.session_date)}</span>
                        </div>
                        {record.is_confidential && (
                          <span className="flex items-center text-red-700 text-xs font-bold">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                          </span>
                        )}
                      </div>
                      
                      {record.diagnosis && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Detalle:</span>
                          <p className="text-sm font-medium text-slate-800">{record.diagnosis}</p>
                        </div>
                      )}
                      
                      {record.treatment_plan && (
                        <div className="mt-3 bg-slate-50 p-3 rounded text-sm text-slate-700 border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">Plan / Intervención:</span>
                          {record.treatment_plan}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'voluntades' && (
          <div className="space-y-4">
            {advanceDirectives.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No hay voluntades anticipadas</h3>
                <p className="mt-1 text-sm text-slate-500">No se han registrado testamentos vitales o voluntades anticipadas para este paciente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advanceDirectives.map((directive) => (
                  <div key={directive.id} className={`card border ${directive.is_active ? 'border-slate-200' : 'border-red-200 bg-red-50 opacity-75'} shadow-sm rounded-lg overflow-hidden`}>
                    <div className={`px-4 py-3 border-b flex justify-between items-center ${directive.is_active ? 'bg-slate-50 border-slate-200' : 'bg-red-100 border-red-200'}`}>
                      <span className={`badge px-2.5 py-0.5 rounded-full text-xs font-medium ${getDirectiveBadge(directive.directive_type)}`}>
                        {directive.directive_type === 'donacion_organos' && '❤️ '}
                        {directive.directive_type?.replace('_', ' ').toUpperCase()}
                      </span>
                      {directive.is_active ? (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-200">ACTIVA</span>
                      ) : (
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full border border-red-200 line-through">REVOCADA</span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Fecha del Documento:</span>
                        <span className="text-sm font-medium text-slate-800">{formatDate(directive.document_date)}</span>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Declaración:</span>
                        <div className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-100 italic">
                          "{directive.directive_content}"
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between text-xs text-slate-500">
                        <div>
                          <span className="block font-semibold">Testigo:</span>
                          {directive.witness_name || 'N/A'}
                        </div>
                        <div className="text-right">
                          <span className="block font-semibold">Cédula:</span>
                          {directive.witness_cedula || 'N/A'}
                        </div>
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
        .tab-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
