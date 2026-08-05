import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

const LabResultsTab = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState('laboratorio');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    laboratorio: [],
    imagenologia: [],
    estudios: [],
    patologia: []
  });
  
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'laboratorio' && data.laboratorio.length === 0) {
          const { data: res } = await supabase
            .from('lab_results')
            .select('*')
            .eq('patient_id', patientId)
            .order('result_date', { ascending: false });
          setData(prev => ({ ...prev, laboratorio: res || [] }));
        } else if (activeTab === 'imagenologia' && data.imagenologia.length === 0) {
          const { data: res } = await supabase
            .from('imaging_reports')
            .select('*')
            .eq('patient_id', patientId)
            .order('study_date', { ascending: false });
          setData(prev => ({ ...prev, imagenologia: res || [] }));
        } else if (activeTab === 'estudios' && data.estudios.length === 0) {
          const { data: res } = await supabase
            .from('functional_studies')
            .select('*')
            .eq('patient_id', patientId)
            .order('study_date', { ascending: false });
          setData(prev => ({ ...prev, estudios: res || [] }));
        } else if (activeTab === 'patologia' && data.patologia.length === 0) {
          const { data: res } = await supabase
            .from('pathology_results')
            .select('*')
            .eq('patient_id', patientId)
            .order('report_date', { ascending: false });
          setData(prev => ({ ...prev, patologia: res || [] }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, activeTab, supabase, data]);

  // Group lab results by type
  const groupedLabResults = data.laboratorio.reduce((acc, curr) => {
    const type = curr.lab_type || 'Otros';
    if (!acc[type]) acc[type] = [];
    acc[type].push(curr);
    return acc;
  }, {});

  const renderLaboratorio = () => {
    if (loading && data.laboratorio.length === 0) return <div className="loading">Cargando resultados de laboratorio...</div>;
    if (data.laboratorio.length === 0) return <div className="empty-state">No hay resultados de laboratorio registrados.</div>;

    return (
      <div className="flex flex-col gap-4">
        {Object.entries(groupedLabResults).map(([type, results]) => (
          <div key={type} className="card border rounded-md shadow-sm">
            <div className="card-header font-bold text-lg capitalize bg-gray-100 p-3 rounded-t-md border-b text-gray-800">
              {type.replace(/_/g, ' ')}
            </div>
            <div className="card-body p-0 overflow-x-auto">
              <table className="table w-full text-left border-collapse min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 border-b text-sm font-semibold text-gray-700">Prueba</th>
                    <th className="p-3 border-b text-sm font-semibold text-gray-700">Fecha Muestra</th>
                    <th className="p-3 border-b text-sm font-semibold text-gray-700">Resultado</th>
                    <th className="p-3 border-b text-sm font-semibold text-gray-700">Unidad</th>
                    <th className="p-3 border-b text-sm font-semibold text-gray-700">Rango Ref.</th>
                    <th className="p-3 border-b text-sm font-semibold text-gray-700">Laboratorio</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(res => (
                    <tr key={res.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{res.test_name}</td>
                      <td className="p-3 text-sm text-gray-600">{res.sample_date ? new Date(res.sample_date).toLocaleDateString('es-VE') : '-'}</td>
                      <td className={`p-3 text-sm font-semibold ${res.is_abnormal ? 'text-red-600 bg-red-50' : ''}`}>
                        {res.result_value} {res.is_abnormal && <span className="badge bg-red-100 text-red-800 ml-2 px-2 py-0.5 rounded text-xs border border-red-200">Anormal</span>}
                      </td>
                      <td className="p-3 text-sm text-gray-600">{res.unit || '-'}</td>
                      <td className="p-3 text-gray-500 text-xs">{res.reference_range || '-'}</td>
                      <td className="p-3 text-xs text-gray-500">{res.laboratory_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getImagingBadgeColor = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('rayos') || t.includes('x')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (t.includes('tomografia')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (t.includes('resonancia')) return 'bg-teal-100 text-teal-800 border-teal-200';
    if (t.includes('eco')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const renderImagenologia = () => {
    if (loading && data.imagenologia.length === 0) return <div className="loading">Cargando estudios de imagenología...</div>;
    if (data.imagenologia.length === 0) return <div className="empty-state">No hay estudios de imagenología registrados.</div>;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.imagenologia.map(study => (
          <div key={study.id} className="card border rounded-md shadow-sm bg-white">
            <div className="card-header p-4 border-b flex justify-between items-start bg-gray-50 rounded-t-md">
              <div>
                <span className={`badge border px-2 py-1 rounded text-xs font-semibold ${getImagingBadgeColor(study.imaging_type)}`}>
                  {study.imaging_type || 'Estudio'}
                </span>
                <h3 className="font-bold mt-2 text-lg text-gray-800">{study.body_region || 'Región no especificada'}</h3>
              </div>
              <div className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">
                {study.study_date ? new Date(study.study_date).toLocaleDateString('es-VE') : '-'}
              </div>
            </div>
            <div className="card-body p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">Hallazgos:</h4>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{study.findings || 'Sin descripción'}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-100">
                <h4 className="font-semibold text-sm text-blue-900">Conclusión:</h4>
                <p className="text-sm font-medium mt-1 text-blue-800">{study.conclusion || 'Sin conclusión'}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Radiólogo:</span> {study.radiologist_name || 'No especificado'}
                </span>
                {study.image_url && (
                  <a href={study.image_url} target="_blank" rel="noreferrer" className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded shadow-sm transition-colors">
                    Ver Imagen (PACS)
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getFunctionalBadgeColor = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('electro')) return 'bg-red-100 text-red-800 border-red-200';
    if (t.includes('espiro')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (t.includes('encefalo')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const renderEstudios = () => {
    if (loading && data.estudios.length === 0) return <div className="loading">Cargando estudios funcionales...</div>;
    if (data.estudios.length === 0) return <div className="empty-state">No hay estudios funcionales registrados.</div>;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.estudios.map(study => (
          <div key={study.id} className="card border rounded-md shadow-sm bg-white">
            <div className="card-header p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-md">
              <span className={`badge border px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${getFunctionalBadgeColor(study.study_type)}`}>
                {study.study_type || 'Estudio Funcional'}
              </span>
              <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">
                {study.study_date ? new Date(study.study_date).toLocaleDateString('es-VE') : '-'}
              </span>
            </div>
            <div className="card-body p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">Descripción / Hallazgos:</h4>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{study.findings || '-'}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded border border-gray-200">
                <h4 className="font-semibold text-sm text-gray-800">Conclusión Diagnóstica:</h4>
                <p className="text-sm font-medium mt-1 text-gray-700">{study.conclusion || '-'}</p>
              </div>
              <div className="text-xs text-gray-500 pt-1 text-right">
                <span className="font-semibold text-gray-600">Realizado por:</span> {study.performed_by || 'No especificado'}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPatologia = () => {
    if (loading && data.patologia.length === 0) return <div className="loading">Cargando resultados de anatomía patológica...</div>;
    if (data.patologia.length === 0) return <div className="empty-state">No hay resultados de anatomía patológica registrados.</div>;

    return (
      <div className="flex flex-col gap-5">
        {data.patologia.map(report => (
          <div key={report.id} className="card border border-slate-300 rounded-md shadow-md overflow-hidden bg-white">
            <div className="bg-slate-800 text-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="badge bg-slate-600 text-slate-100 border border-slate-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                  {report.sample_type || 'Muestra'}
                </span>
                <span className="font-bold text-lg">{report.body_site || 'Sitio anatómico no especificado'}</span>
              </div>
              <div className="text-sm text-slate-300 flex gap-4 font-medium bg-slate-700 px-3 py-1.5 rounded-md border border-slate-600">
                <span>Toma: {report.sample_date ? new Date(report.sample_date).toLocaleDateString('es-VE') : '-'}</span>
                <span>Reporte: {report.report_date ? new Date(report.report_date).toLocaleDateString('es-VE') : '-'}</span>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                  <h4 className="font-bold text-sm text-slate-700 border-b border-slate-200 pb-2 mb-3">Descripción Macroscópica</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{report.macroscopic_description || 'No descrita'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                  <h4 className="font-bold text-sm text-slate-700 border-b border-slate-200 pb-2 mb-3">Descripción Microscópica</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{report.microscopic_description || 'No descrita'}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-md shadow-sm">
                <h4 className="font-bold text-yellow-800 mb-2 uppercase text-xs tracking-wider">Diagnóstico Anatomopatológico:</h4>
                <p className="font-bold text-lg text-gray-900">{report.diagnosis || 'Sin diagnóstico definitivo'}</p>
              </div>
              <div className="text-sm text-gray-500 border-t pt-3 flex justify-end items-center">
                <span className="mr-2">Patólogo(a) Responsable:</span>
                <span className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">{report.pathologist_name || 'No especificado'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="lab-results-container bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto pb-1 no-scrollbar gap-2">
        <button
          onClick={() => setActiveTab('laboratorio')}
          className={`px-4 py-2 font-semibold whitespace-nowrap rounded-t-md transition-colors ${activeTab === 'laboratorio' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          Laboratorio Clínico
        </button>
        <button
          onClick={() => setActiveTab('imagenologia')}
          className={`px-4 py-2 font-semibold whitespace-nowrap rounded-t-md transition-colors ${activeTab === 'imagenologia' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          Imagenología (PACS)
        </button>
        <button
          onClick={() => setActiveTab('estudios')}
          className={`px-4 py-2 font-semibold whitespace-nowrap rounded-t-md transition-colors ${activeTab === 'estudios' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          Estudios Funcionales
        </button>
        <button
          onClick={() => setActiveTab('patologia')}
          className={`px-4 py-2 font-semibold whitespace-nowrap rounded-t-md transition-colors ${activeTab === 'patologia' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          Anatomía Patológica
        </button>
      </div>

      <div className="tab-content relative min-h-[300px]">
        {activeTab === 'laboratorio' && renderLaboratorio()}
        {activeTab === 'imagenologia' && renderImagenologia()}
        {activeTab === 'estudios' && renderEstudios()}
        {activeTab === 'patologia' && renderPatologia()}
      </div>

      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 250px;
          color: #6b7280;
          background: #f9fafb;
          border: 2px dashed #e5e7eb;
          border-radius: 0.5rem;
          font-weight: 500;
        }
        .empty-state::before {
          content: '📄';
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 250px;
          color: #3b82f6;
          font-weight: 500;
        }
        .loading::after {
          content: '';
          width: 30px;
          height: 30px;
          margin-top: 1rem;
          border: 3px solid #bfdbfe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spinner 0.8s linear infinite;
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
        .tab-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default LabResultsTab;
