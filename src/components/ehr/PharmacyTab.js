import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function PharmacyTab({ patientId }) {
  const supabase = createBrowserSupabaseClient();
  const [activeSubTab, setActiveSubTab] = useState('prescripciones');
  const [loading, setLoading] = useState(true);
  
  const [prescriptions, setPrescriptions] = useState([]);
  const [dispensations, setDispensations] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);

  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchPrescriptions = supabase
          .from('prescriptions')
          .select(`
            *,
            user_profiles (
              first_name,
              last_name
            )
          `)
          .eq('patient_id', patientId)
          .order('is_active', { ascending: false })
          .order('start_date', { ascending: false });

        const fetchDispensations = supabase
          .from('dispensation_history')
          .select(`
            *,
            prescriptions (
              medication_name
            )
          `)
          .eq('patient_id', patientId)
          .order('dispensation_date', { ascending: false });

        const fetchVaccinations = supabase
          .from('vaccinations')
          .select('*')
          .eq('patient_id', patientId)
          .order('application_date', { ascending: false });

        const [resPres, resDisp, resVacc] = await Promise.all([
          fetchPrescriptions,
          fetchDispensations,
          fetchVaccinations
        ]);

        if (resPres.data) setPrescriptions(resPres.data);
        if (resDisp.data) setDispensations(resDisp.data);
        if (resVacc.data) setVaccinations(resVacc.data);

      } catch (error) {
        console.error("Error fetching pharmacy data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, supabase]);

  const getRouteBadgeColor = (route) => {
    const routeLower = (route || '').toLowerCase();
    if (routeLower.includes('oral')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (routeLower.includes('intravenosa') || routeLower.includes('iv')) return 'bg-red-100 text-red-800 border-red-200';
    if (routeLower.includes('intramuscular') || routeLower.includes('im')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (routeLower.includes('tópica') || routeLower.includes('topica')) return 'bg-green-100 text-green-800 border-green-200';
    if (routeLower.includes('subcutánea') || routeLower.includes('sc')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="loading"></div>
        <span className="ml-3 text-gray-500">Cargando información farmacológica...</span>
      </div>
    );
  }

  const renderPrescriptions = () => {
    if (prescriptions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <p>No hay prescripciones registradas.</p>
        </div>
      );
    }

    const activePrescriptions = prescriptions.filter(p => p.is_active);
    const inactivePrescriptions = prescriptions.filter(p => !p.is_active);

    return (
      <div className="space-y-6">
        {activePrescriptions.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Tratamientos Activos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePrescriptions.map(p => (
                <div key={p.id} className="card border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-white rounded-lg">
                  <div className="card-body p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-gray-900 leading-tight">{p.medication_name}</h4>
                      <span className={`badge border text-xs px-2 py-1 rounded-full ${getRouteBadgeColor(p.administration_route)}`}>
                        {p.administration_route || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm flex-grow">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Dosis</p>
                        <p className="font-medium text-gray-800">{p.dosage}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Frecuencia</p>
                        <p className="font-medium text-gray-800">{p.frequency}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Duración</p>
                        <p className="font-medium text-gray-800">{p.duration}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Inicio</p>
                        <p className="font-medium text-gray-800">{p.start_date ? new Date(p.start_date).toLocaleDateString('es-VE') : '-'}</p>
                      </div>
                    </div>
                    
                    {p.instructions && (
                      <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 mb-3 border border-gray-100">
                        <span className="font-semibold text-xs text-gray-500 block mb-1">Instrucciones:</span>
                        {p.instructions}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-auto flex justify-between items-center border-t border-gray-100 pt-2">
                      <span>
                        Por: {p.user_profiles ? `${p.user_profiles.first_name} ${p.user_profiles.last_name}` : 'Médico Tratante'}
                      </span>
                      {p.end_date && <span>Fin: {new Date(p.end_date).toLocaleDateString('es-VE')}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {inactivePrescriptions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-600 mb-4 flex items-center">
              <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
              Historial de Tratamientos (Inactivos/Completados)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactivePrescriptions.map(p => (
                <div key={p.id} className="card border-l-4 border-l-gray-400 shadow-sm opacity-80 hover:opacity-100 transition-opacity bg-gray-50 rounded-lg">
                  <div className="card-body p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-md font-bold text-gray-700 leading-tight">{p.medication_name}</h4>
                      <span className={`badge border text-xs px-2 py-1 rounded-full ${getRouteBadgeColor(p.administration_route)} opacity-80`}>
                        {p.administration_route || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2 text-sm flex-grow">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Dosis</p>
                        <p className="font-medium text-gray-600">{p.dosage}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Frecuencia</p>
                        <p className="font-medium text-gray-600">{p.frequency}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-auto flex justify-between items-center border-t border-gray-200 pt-2">
                      <span>{p.start_date ? new Date(p.start_date).toLocaleDateString('es-VE') : '-'} al {p.end_date ? new Date(p.end_date).toLocaleDateString('es-VE') : '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDispensations = () => {
    if (dispensations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          <p>No hay registros de dispensación.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="table w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-3 font-semibold">Fecha</th>
              <th className="p-3 font-semibold">Medicamento</th>
              <th className="p-3 font-semibold">Cantidad</th>
              <th className="p-3 font-semibold">Farmacia</th>
              <th className="p-3 font-semibold">Dispensado por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dispensations.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="p-3 text-gray-800 whitespace-nowrap">
                  {d.dispensation_date ? new Date(d.dispensation_date).toLocaleDateString('es-VE') : '-'}
                </td>
                <td className="p-3 font-medium text-gray-900">
                  {d.prescriptions?.medication_name || d.medication_name || 'Desconocido'}
                </td>
                <td className="p-3 text-gray-700">
                  <span className="badge bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium border border-gray-200">{d.quantity}</span>
                </td>
                <td className="p-3 text-gray-700">{d.pharmacy || '-'}</td>
                <td className="p-3 text-gray-700">{d.dispensed_by || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVaccinations = () => {
    if (vaccinations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          <p>No hay vacunas registradas.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="table w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50 border-b border-blue-100 text-blue-800 text-sm">
              <th className="p-3 font-semibold">Vacuna</th>
              <th className="p-3 font-semibold">Dosis</th>
              <th className="p-3 font-semibold">Fecha de Aplicación</th>
              <th className="p-3 font-semibold">Lote</th>
              <th className="p-3 font-semibold">Fabricante</th>
              <th className="p-3 font-semibold">Centro de Vacunación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vaccinations.map(v => (
              <tr key={v.id} className="hover:bg-blue-50/50 transition-colors text-sm">
                <td className="p-3 font-medium text-gray-900">{v.vaccine_name}</td>
                <td className="p-3">
                  <span className="badge bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    {v.dose_number}
                  </span>
                </td>
                <td className="p-3 text-gray-800 whitespace-nowrap">
                  {v.application_date ? new Date(v.application_date).toLocaleDateString('es-VE') : '-'}
                </td>
                <td className="p-3 text-gray-600 font-mono text-xs">{v.lot_number || '-'}</td>
                <td className="p-3 text-gray-700">{v.manufacturer || '-'}</td>
                <td className="p-3 text-gray-700">{v.vaccination_center || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="pharmacy-tab-container">
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveSubTab('prescripciones')}
          className={`px-4 py-2 font-bold text-sm rounded-t whitespace-nowrap transition-colors ${
            activeSubTab === 'prescripciones'
              ? 'bg-white border-t border-l border-r border-gray-200 border-b-0 text-blue-600 shadow-sm'
              : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-b border-gray-200'
          }`}
          style={activeSubTab === 'prescripciones' ? { marginBottom: '-1px' } : {}}
        >
          Tratamientos Activos
        </button>
        <button
          onClick={() => setActiveSubTab('dispensacion')}
          className={`px-4 py-2 font-bold text-sm rounded-t whitespace-nowrap transition-colors ${
            activeSubTab === 'dispensacion'
              ? 'bg-white border-t border-l border-r border-gray-200 border-b-0 text-blue-600 shadow-sm'
              : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-b border-gray-200'
          }`}
          style={activeSubTab === 'dispensacion' ? { marginBottom: '-1px' } : {}}
        >
          Historial de Dispensación
        </button>
        <button
          onClick={() => setActiveSubTab('vacunas')}
          className={`px-4 py-2 font-bold text-sm rounded-t whitespace-nowrap transition-colors ${
            activeSubTab === 'vacunas'
              ? 'bg-white border-t border-l border-r border-gray-200 border-b-0 text-blue-600 shadow-sm'
              : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-b border-gray-200'
          }`}
          style={activeSubTab === 'vacunas' ? { marginBottom: '-1px' } : {}}
        >
          Carnet de Vacunación
        </button>
        <div className="flex-grow border-b border-gray-200"></div>
      </div>

      <div className="tab-content fade-in">
        {activeSubTab === 'prescripciones' && renderPrescriptions()}
        {activeSubTab === 'dispensacion' && renderDispensations()}
        {activeSubTab === 'vacunas' && renderVaccinations()}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
