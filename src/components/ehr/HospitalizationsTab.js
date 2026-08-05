import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function HospitalizationsTab({ patientId }) {
  const [activeTab, setActiveTab] = useState('hospitalizaciones');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    hospitalizaciones: [],
    emergencias: [],
    cirugias: [],
    notas: []
  });
  const [error, setError] = useState(null);
  
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Hospitalizaciones
        const { data: hospData, error: hospError } = await supabase
          .from('hospitalizations')
          .select(`
            *,
            health_centers:health_center_id(name),
            attending_doctor:attending_doctor_id(full_name)
          `)
          .eq('patient_id', patientId)
          .order('admission_date', { ascending: false });
        if (hospError) throw hospError;

        // Fetch Emergencias
        const { data: emergData, error: emergError } = await supabase
          .from('emergency_records')
          .select('*')
          .eq('patient_id', patientId)
          .order('arrival_time', { ascending: false });
        if (emergError) throw emergError;

        // Fetch Cirugias
        const { data: surgData, error: surgError } = await supabase
          .from('surgical_protocols')
          .select(`
            *,
            surgeon:surgeon_id(full_name)
          `)
          .eq('patient_id', patientId)
          .order('surgery_date', { ascending: false });
        if (surgError) throw surgError;

        // Fetch Notas
        // First try to fetch notes directly by patient_id
        let finalNotes = [];
        const { data: notesData, error: notesError } = await supabase
          .from('evolution_notes')
          .select(`
            *,
            author:author_id(full_name)
          `)
          .eq('patient_id', patientId)
          .order('note_date', { ascending: false });
          
        if (notesError) {
          // If evolution_notes doesn't have patient_id, fallback to using hospitalization IDs
          const hospIds = hospData?.map(h => h.id) || [];
          if (hospIds.length > 0) {
             const { data: fallbackNotes, error: fallbackError } = await supabase
                .from('evolution_notes')
                .select(`
                  *,
                  author:author_id(full_name)
                `)
                .in('hospitalization_id', hospIds)
                .order('note_date', { ascending: false });
             if (!fallbackError) {
               finalNotes = fallbackNotes;
             }
          }
        } else {
            finalNotes = notesData;
        }

        setData({
          hospitalizaciones: hospData || [],
          emergencias: emergData || [],
          cirugias: surgData || [],
          notas: finalNotes || []
        });

      } catch (err) {
        console.error("Error fetching category 6 data:", err);
        setError("Error al cargar los datos. Intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, supabase]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute:'2-digit'
    });
  };

  const calculateElapsed = (start, end) => {
    if (!start || !end) return null;
    const diffMs = new Date(end) - new Date(start);
    if (diffMs < 0) return '0h 0m';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'activo':
        return (
          <span className="badge flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Activo
          </span>
        );
      case 'alta_medica':
        return <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded">Alta Médica</span>;
      case 'fallecido':
        return <span className="badge bg-gray-800 text-white px-2 py-1 rounded">Fallecido</span>;
      case 'traslado':
        return <span className="badge bg-orange-100 text-orange-800 px-2 py-1 rounded">Traslado</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-800 px-2 py-1 rounded">{status}</span>;
    }
  };

  const renderTriageBadge = (color, text) => {
    const colors = {
      rojo: 'bg-red-500 text-white',
      naranja: 'bg-orange-500 text-white',
      amarillo: 'bg-yellow-400 text-black',
      verde: 'bg-green-500 text-white',
      azul: 'bg-blue-500 text-white'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${colors[color?.toLowerCase()] || 'bg-gray-200 text-black'}`}>
        {text}
      </span>
    );
  };

  const triageBorders = {
    rojo: 'border-l-[#e74c3c]',
    naranja: 'border-l-[#f39c12]',
    amarillo: 'border-l-[#f1c40f]',
    verde: 'border-l-[#27ae60]',
    azul: 'border-l-[#3498db]'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tabs Header */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        <button
          className={`py-2 px-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'hospitalizaciones' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('hospitalizaciones')}
        >
          Ingresos Hospitalarios
        </button>
        <button
          className={`py-2 px-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'emergencias' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('emergencias')}
        >
          Emergencias / Triaje
        </button>
        <button
          className={`py-2 px-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'cirugias' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('cirugias')}
        >
          Protocolos Quirúrgicos
        </button>
        <button
          className={`py-2 px-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'notas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('notas')}
        >
          Notas de Evolución (SOAP)
        </button>
      </div>

      {/* Sub-tab Content: Hospitalizaciones */}
      {activeTab === 'hospitalizaciones' && (
        <div className="flex flex-col gap-4">
          {data.hospitalizaciones.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>No se encontraron registros de hospitalización.</p>
            </div>
          ) : (
            data.hospitalizaciones.map((hosp) => (
              <div key={hosp.id} className="card bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="card-header bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{hosp.health_centers?.name || 'Centro de Salud Desconocido'}</h3>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <span>{formatDate(hosp.admission_date)}</span>
                      <span>→</span>
                      <span>{hosp.discharge_date ? formatDate(hosp.discharge_date) : 'En curso'}</span>
                    </div>
                  </div>
                  <div>
                    {renderStatusBadge(hosp.status)}
                  </div>
                </div>
                
                <div className="card-body p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Motivo de Ingreso</p>
                      <p className="text-gray-800">{hosp.admission_reason || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Médico Tratante</p>
                      <p className="text-gray-800">{hosp.attending_doctor?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Ubicación</p>
                      <p className="text-gray-800">
                        {hosp.ward ? `Sala: ${hosp.ward}` : ''}
                        {hosp.bed_number ? ` - Cama: ${hosp.bed_number}` : ''}
                        {!hosp.ward && !hosp.bed_number && 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tipo de Ingreso</p>
                      <span className="inline-block mt-1 bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200">
                        {hosp.admission_type || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {hosp.discharge_summary && (
                    <details className="mt-4 border border-gray-200 rounded-md">
                      <summary className="p-3 bg-blue-50 cursor-pointer font-semibold text-blue-800 select-none flex justify-between items-center">
                        Epicrisis / Resumen de Alta
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="p-4 bg-white text-sm text-gray-700 whitespace-pre-wrap">
                        {hosp.discharge_summary}
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Condición al Alta:</p>
                            <p className="mt-1">{hosp.discharge_condition || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Instrucciones / Plan:</p>
                            <p className="mt-1">{hosp.discharge_instructions || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-tab Content: Emergencias */}
      {activeTab === 'emergencias' && (
        <div className="flex flex-col gap-4">
          {data.emergencias.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p>No se encontraron registros de emergencia.</p>
            </div>
          ) : (
            data.emergencias.map((em) => (
              <div 
                key={em.id} 
                className={`card bg-white shadow rounded-lg border-y border-r border-gray-200 border-l-4 ${triageBorders[em.triage_color?.toLowerCase()] || 'border-l-gray-300'}`}
              >
                <div className="p-4 flex flex-col md:flex-row gap-4 justify-between md:items-start border-b border-gray-100 bg-gray-50/50">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-800 text-lg">Atención de Emergencia</h3>
                      {em.triage_level && renderTriageBadge(em.triage_color, em.triage_level)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span>Ingreso: {formatDate(em.arrival_time)}</span>
                      {em.discharge_time && (
                        <>
                          <span className="mx-2">|</span>
                          <span>Egreso: {formatDate(em.discharge_time)}</span>
                          <span className="mx-2">|</span>
                          <span className="font-medium text-gray-700">Tiempo: {calculateElapsed(em.arrival_time, em.discharge_time)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Modo de Llegada</p>
                    <p className="font-semibold text-gray-700">{em.arrival_mode || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Motivo de Consulta</h4>
                    <p className="text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-100">{em.chief_complaint || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Evaluación Inicial</h4>
                    <p className="text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-100">{em.initial_assessment || 'N/A'}</p>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Evolución en Sala</h4>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap p-2">{em.evolution_notes || 'Sin notas registradas'}</p>
                  </div>

                  <div className="md:col-span-2 border-t border-gray-100 pt-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Resolución / Destino</h4>
                    <p className="text-gray-800 text-sm font-medium">{em.resolution || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-tab Content: Cirugías */}
      {activeTab === 'cirugias' && (
        <div className="flex flex-col gap-4">
          {data.cirugias.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <p>No se encontraron protocolos quirúrgicos.</p>
            </div>
          ) : (
            data.cirugias.map((surg) => (
              <div key={surg.id} className="card bg-white shadow rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-2 rounded-t-lg">
                  <div>
                    <h3 className="font-bold text-xl text-blue-900">{surg.procedure_name || 'Procedimiento no especificado'}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>{formatDate(surg.surgery_date)}</span>
                      {surg.duration_minutes && <span className="ml-3 font-medium">Duración: {surg.duration_minutes} min</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="badge bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded border border-purple-200 font-medium">
                      Anestesia: {surg.anesthesia_type || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700">Cirujano Principal:</p>
                    <p className="text-gray-900">{surg.surgeon?.full_name || 'N/A'}</p>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-bold text-gray-700 mb-1 border-b border-gray-100 pb-1">Descripción de Técnica Quirúrgica</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{surg.technique_description || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-700 mb-1 border-b border-gray-100 pb-1">Hallazgos Quirúrgicos</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{surg.surgical_findings || 'N/A'}</p>
                    </div>

                    {surg.complications && (
                      <div className="bg-red-50 p-3 rounded-md border border-red-100">
                        <h4 className="font-bold text-red-800 mb-1">Complicaciones</h4>
                        <p className="text-red-700 whitespace-pre-wrap">{surg.complications}</p>
                      </div>
                    )}

                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-4">
                      <h4 className="font-bold text-blue-800 mb-1">Indicaciones Post-Operatorias</h4>
                      <p className="text-blue-900 whitespace-pre-wrap">{surg.post_op_instructions || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-tab Content: Notas de Evolución */}
      {activeTab === 'notas' && (
        <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-8 py-2">
          {data.notas.length === 0 ? (
            <div className="text-center p-8 text-gray-500 -ml-10">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p>No se encontraron notas de evolución.</p>
            </div>
          ) : (
            data.notas.map((nota) => (
              <div key={nota.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[33px] top-2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                
                <div className="card bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center rounded-t-lg">
                    <div>
                      <span className="font-bold text-gray-800 block md:inline">{formatDate(nota.note_date)}</span>
                      <span className="hidden md:inline mx-2 text-gray-400">|</span>
                      <span className="text-sm text-gray-600 block md:inline mt-1 md:mt-0">Por: {nota.author?.full_name || 'Desconocido'}</span>
                    </div>
                    <span className="badge bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded border border-indigo-200">SOAP</span>
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <h5 className="text-xs font-bold text-blue-600 mb-2 uppercase flex items-center gap-1">
                        <span>S</span> - Subjetivo
                      </h5>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{nota.subjective || 'Sin información'}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <h5 className="text-xs font-bold text-green-600 mb-2 uppercase flex items-center gap-1">
                        <span>O</span> - Objetivo
                      </h5>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{nota.objective || 'Sin información'}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <h5 className="text-xs font-bold text-purple-600 mb-2 uppercase flex items-center gap-1">
                        <span>A</span> - Evaluación (Assessment)
                      </h5>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{nota.assessment || 'Sin información'}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <h5 className="text-xs font-bold text-orange-600 mb-2 uppercase flex items-center gap-1">
                        <span>P</span> - Plan
                      </h5>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{nota.plan || 'Sin información'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      <style jsx>{`
        .loading {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
