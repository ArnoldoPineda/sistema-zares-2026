import React, { useEffect, useState } from 'react';
import { useReportes } from '../../hooks/useReportes';
import { Download, Filter } from 'lucide-react';

export default function ReporteVentas() {
  const { loading } = useReportes();
  const [ventasPorCiudad, setVentasPorCiudad] = useState({});
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    cargarReporte();
  }, [filtroEstado]);

  const cargarReporte = async () => {
    try {
      const { supabase } = await import('../../services/supabaseClient');
      
      let query = supabase
        .from('ventas')
        .select(`
          id,
          fecha_venta,
          estado,
          clientes(id, nombre_completo, ciudad),
          detalles_venta(
            id,
            cantidad,
            precio_unitario,
            subtotal,
            articulos(codigo, nombre)
          ),
          cobros(monto_pagado, pago_delivery)
        `)
        .order('fecha_venta', { ascending: false });

      if (filtroEstado !== 'TODOS') {
        query = query.eq('estado', filtroEstado);
      }

      const { data: ventas } = await query;

      // Procesar datos
      const porCiudad = {};
      let totalVentas = 0;
      let totalCobrado = 0;
      let totalPendiente = 0;

      ventas?.forEach(venta => {
        const ciudad = venta.clientes?.ciudad || 'Sin Ciudad';
        const cliente = venta.clientes?.nombre_completo || 'N/A';

        if (!porCiudad[ciudad]) {
          porCiudad[ciudad] = {};
        }

        if (!porCiudad[ciudad][cliente]) {
          porCiudad[ciudad][cliente] = {
            ventas: [],
            totalCliente: 0,
            cobrado: 0,
            estado: venta.estado,
          };
        }

        const totalVenta = venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
        const cobrado = venta.cobros?.reduce((sum, c) => sum + (c.monto_pagado + (c.pago_delivery || 0)), 0) || 0;

        porCiudad[ciudad][cliente].ventas.push({
          id: venta.id,
          fecha: venta.fecha_venta,
          estado: venta.estado,
          detalles: venta.detalles_venta || [],
          total: totalVenta,
        });

        porCiudad[ciudad][cliente].totalCliente += totalVenta;
        porCiudad[ciudad][cliente].cobrado += cobrado;

        totalVentas += totalVenta;
        totalCobrado += cobrado;
      });

      totalPendiente = totalVentas - totalCobrado;

      setVentasPorCiudad(porCiudad);
      setResumen({
        totalVentas,
        totalCobrado,
        totalPendiente,
        totalVentasCount: ventas?.length || 0,
      });
    } catch (err) {
      console.error('Error al cargar reporte:', err);
    }
  };

  const descargarCSV = () => {
    let csv = 'CIUDAD,CLIENTE,ARTICULO,CANTIDAD,PRECIO_UNITARIO,SUBTOTAL,TOTAL_CLIENTE\n';

    Object.entries(ventasPorCiudad).forEach(([ciudad, clientes]) => {
      Object.entries(clientes).forEach(([cliente, data]) => {
        data.ventas.forEach(venta => {
          venta.detalles.forEach((det, idx) => {
            csv += `${ciudad},${cliente},${det.articulos?.nombre || 'N/A'},${det.cantidad},L. ${det.precio_unitario.toFixed(2)},L. ${det.subtotal.toFixed(2)},${idx === 0 ? 'L. ' + data.totalCliente.toFixed(2) : ''}\n`;
          });
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const imprimirReporte = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">📊 Reporte de Ventas</h1>
          <p className="text-gray-600 mt-2">Análisis detallado de ventas por ciudad y cliente</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={cargarReporte}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ↻ Actualizar
          </button>
          <button
            onClick={descargarCSV}
            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
          >
            <Download size={20} />
            Descargar CSV
          </button>
          <button
            onClick={imprimirReporte}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 no-print">
        <Filter size={20} className="text-gray-600 mt-1" />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="PARCIAL">PARCIAL</option>
          <option value="PAGADO">PAGADO</option>
        </select>
      </div>

      {/* Resumen KPIs */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900">🛒 Total Ventas</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{resumen.totalVentasCount}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-green-900">💰 Total Monto</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">L. {resumen.totalVentas.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-bold text-purple-900">✅ Cobrado</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">L. {resumen.totalCobrado.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-bold text-red-900">⏳ Pendiente</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">L. {resumen.totalPendiente.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Reporte por ciudad */}
      <div className="space-y-8">
        {Object.entries(ventasPorCiudad).map(([ciudad, clientes]) => {
          const totalCiudad = Object.values(clientes).reduce((sum, data) => sum + data.totalCliente, 0);

          return (
            <div key={ciudad} className="bg-white border border-gray-200 rounded-lg overflow-hidden print:page-break-inside-avoid">
              {/* Header ciudad */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <h2 className="text-2xl font-bold">🏙️ {ciudad}</h2>
                <p className="text-blue-100 mt-1">Total: L. {totalCiudad.toFixed(2)}</p>
              </div>

              {/* Contenedor de clientes */}
              <div className="space-y-6 p-6">
                {Object.entries(clientes).map(([cliente, data], clienteIdx) => (
                  <div key={clienteIdx} className="border-b pb-6 last:border-b-0">
                    {/* Header del cliente */}
                    <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-gray-300">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{cliente}</h3>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                            data.estado === 'PAGADO'
                              ? 'bg-green-100 text-green-800'
                              : data.estado === 'PARCIAL'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {data.estado}
                        </span>
                      </div>
                    </div>

                    {/* Tabla de artículos */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Artículo</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Cantidad</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700">Precio Unit.</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.ventas.map((venta, ventaIdx) =>
                            venta.detalles.map((det, detIdx) => (
                              <tr key={`${ventaIdx}-${detIdx}`} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-900">
                                  {det.articulos?.codigo} - {det.articulos?.nombre}
                                </td>
                                <td className="px-3 py-2 text-center text-gray-900">{det.cantidad}</td>
                                <td className="px-3 py-2 text-right text-gray-900">
                                  L. {det.precio_unitario.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                  L. {det.subtotal.toFixed(2)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Total del cliente */}
                    <div className="text-right mt-3 pt-3 border-t-2 border-gray-300">
                      <p className="text-lg font-bold text-gray-900">
                        Total {cliente}: <span className="text-green-600">L. {data.totalCliente.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total ciudad */}
              <div className="bg-gray-50 px-6 py-4 text-right border-t-2 border-gray-300">
                <p className="text-xl font-bold text-gray-900">
                  Total {ciudad}: <span className="text-blue-600">L. {totalCiudad.toFixed(2)}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          table {
            font-size: 10px;
          }
          td, th {
            padding: 0.3rem !important;
          }
        }
      `}</style>
    </div>
  );
}