import React, { useEffect, useState } from 'react';
import { useReportes } from '../../hooks/useReportes';
import { Printer } from 'lucide-react';

const estilosImpresion = `
  @media print {
    body {
      margin: 0;
      padding: 0;
    }
    
    .no-print {
      display: none !important;
    }
    
    .print-container {
      display: block !important;
    }
    
    .print-page {
      page-break-after: always;
      page-break-inside: avoid;
      width: 21cm;
      height: 27.94cm;
      margin: 0;
      padding: 0.5cm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 0.5cm;
      box-sizing: border-box;
    }
    
    .etiqueta-impresion {
      border: 2px solid #1f2937;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
  
  @media screen {
    .print-container {
      display: none !important;
    }
  }
`;

export default function EtiquetasVentas() {
  const { ventasPorCiudad, loading, fetchEtiquetasVentas } = useReportes();
  const [etiquetas, setEtiquetas] = useState({});
  const [pages, setPages] = useState([]);

  useEffect(() => {
    cargarEtiquetas();
  }, []);

  const cargarEtiquetas = async () => {
    const resultado = await fetchEtiquetasVentas();
    setEtiquetas(resultado);
    generarPaginas(resultado);
  };

  const generarPaginas = (etiquetasObj) => {
    const ciudadesArray = Object.entries(etiquetasObj);
    let etiquetasActuales = [];
    let pageKey = 0;
    const pagesArray = [];

    ciudadesArray.forEach(([ciudad, ventas]) => {
      ventas.forEach(venta => {
        etiquetasActuales.push({ ...venta, ciudad });

        if (etiquetasActuales.length === 4) {
          pagesArray.push({
            key: pageKey++,
            etiquetas: [...etiquetasActuales],
          });
          etiquetasActuales = [];
        }
      });
    });

    if (etiquetasActuales.length > 0) {
      pagesArray.push({
        key: pageKey,
        etiquetas: etiquetasActuales,
      });
    }

    setPages(pagesArray);
  };

  const imprimirEtiquetas = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalEtiquetas = Object.values(etiquetas).reduce((sum, ciudad) => sum + ciudad.length, 0);

  return (
    <div className="space-y-6">
      <style>{estilosImpresion}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">🏷️ Etiquetas de Cobro</h1>
          <p className="text-gray-600 mt-2">Imprime etiquetas agrupadas por ciudad (4 por página)</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={cargarEtiquetas}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ↻ Actualizar
          </button>
          <button
            onClick={imprimirEtiquetas}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            <Printer size={20} />
            Imprimir
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900">🏙️ Ciudades</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{Object.keys(etiquetas).length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="font-bold text-orange-900">🏷️ Total Etiquetas</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{totalEtiquetas}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-900">📄 Páginas</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{pages.length}</p>
        </div>
      </div>

      {/* Vista previa */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 no-print">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Vista Previa</h2>
        <p className="text-gray-600 mb-4">Se imprimirán {pages.length} página(s) con 4 etiquetas por página</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p>💡 <strong>Tip:</strong> Haz click en "Imprimir" para ver la vista previa de impresión</p>
        </div>
      </div>

      {totalEtiquetas === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center no-print">
          <p className="text-gray-600 text-lg">No hay ventas para mostrar</p>
        </div>
      )}

      {/* VISTA PREVIA EN PANTALLA */}
      <div className="space-y-8 no-print">
        {pages.map((page) => (
          <div
            key={page.key}
            className="border-2 border-gray-300 rounded-lg p-6 bg-white"
          >
            <h3 className="text-center font-bold text-gray-900 mb-4">Página {page.key + 1} de {pages.length}</h3>
            <div className="grid grid-cols-2 gap-4">
              {page.etiquetas.map((venta, idx) => (
                <EtiquetaPantalla key={idx} venta={venta} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CONTENEDOR PARA IMPRESIÓN */}
      <div className="print-container">
        {pages.map((page) => (
          <div key={page.key} className="print-page">
            {page.etiquetas.map((venta, idx) => (
              <EtiquetaImpresion key={idx} venta={venta} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Etiqueta para pantalla
function EtiquetaPantalla({ venta }) {
  return (
    <div className="border-2 border-gray-800 rounded-lg p-4 bg-white text-center">
      {/* Logo */}
      <div className="mb-3 flex justify-center">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-lg font-bold">ZARES</div>
            <div className="text-white text-xl font-bold">504</div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="border-t-2 border-b-2 border-gray-300 py-2 mb-2 space-y-1">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold">CLIENTE</p>
          <p className="text-sm font-bold text-gray-900">{venta.cliente}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold">TELÉFONO</p>
          <p className="text-sm font-semibold text-gray-900">{venta.telefono}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold">DIRECCIÓN</p>
          <p className="text-xs text-gray-900">{venta.direccion}</p>
        </div>
        <div className="text-center pt-1">
          <p className="text-xs text-gray-600 font-semibold">MONTO A PAGAR</p>
          <p className="text-lg font-bold text-red-600">L. {venta.monto.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-center mb-1">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            venta.estado === 'PAGADO'
              ? 'bg-green-100 text-green-800'
              : venta.estado === 'PARCIAL'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {venta.estado}
        </span>
      </div>

      <div className="text-center pt-1 border-t border-gray-200">
        <p className="text-xs text-gray-600">{venta.ciudad}</p>
      </div>
    </div>
  );
}

// Etiqueta para impresión
function EtiquetaImpresion({ venta }) {
  return (
    <div className="etiqueta-impresion">
      {/* Logo */}
      <div className="flex justify-center mb-2">
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#000000',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>ZARES</div>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>504</div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{
        borderTop: '2px solid #d1d5db',
        borderBottom: '2px solid #d1d5db',
        padding: '0.5rem 0',
        marginBottom: '0.5rem',
        textAlign: 'center',
        fontSize: '11px',
        lineHeight: '1.4'
      }}>
        <div style={{ marginBottom: '0.3rem' }}>
          <div style={{ fontSize: '9px', color: '#666', fontWeight: 'bold' }}>CLIENTE</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000' }}>{venta.cliente}</div>
        </div>
        <div style={{ marginBottom: '0.3rem' }}>
          <div style={{ fontSize: '9px', color: '#666', fontWeight: 'bold' }}>TELÉFONO</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000' }}>{venta.telefono}</div>
        </div>
        <div style={{ marginBottom: '0.3rem' }}>
          <div style={{ fontSize: '9px', color: '#666', fontWeight: 'bold' }}>DIRECCIÓN</div>
          <div style={{ fontSize: '9px', color: '#000' }}>{venta.direccion}</div>
        </div>
        <div style={{ marginTop: '0.3rem', paddingTop: '0.3rem' }}>
          <div style={{ fontSize: '9px', color: '#666', fontWeight: 'bold' }}>MONTO A PAGAR</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc2626' }}>
            L. {venta.monto.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Estado */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '9px',
            fontWeight: 'bold',
            backgroundColor: venta.estado === 'PAGADO' ? '#dcfce7' : venta.estado === 'PARCIAL' ? '#fef3c7' : '#fee2e2',
            color: venta.estado === 'PAGADO' ? '#166534' : venta.estado === 'PARCIAL' ? '#92400e' : '#991b1b'
          }}
        >
          {venta.estado}
        </span>
      </div>

      {/* Ciudad */}
      <div style={{
        textAlign: 'center',
        paddingTop: '0.3rem',
        borderTop: '1px solid #e5e7eb',
        fontSize: '9px',
        color: '#666'
      }}>
        {venta.ciudad}
      </div>
    </div>
  );
}