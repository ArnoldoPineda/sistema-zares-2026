import React, { useEffect, useState } from 'react';
import { useReportes } from '../../hooks/useReportes';
import { Download, TrendingUp } from 'lucide-react';

export default function ReporteClientes() {
  const { loading } = useReportes();
  const [topClientes, setTopClientes] = useState([]);
  const [clientesConDeuda, setClientesConDeuda] = useState([]);
  const [historialClientes, setHistorialClientes] = useState({});
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    cargarReporte();
  }, []);

  const cargarReporte = async () => {
    try {
      const { supabase } = await import('../../services/supabaseClient');

      // Obtener todas las ventas con detalles
      const { data: ventas } = await supabase
        .from('ventas')
        .select(`
          id,
          fecha_venta,
          estado,
          clientes(id, nombre, ciudad, telefono, email),
          detalles_venta(subtotal),
          cobros(monto_pagado, pago_delivery)
        `)
        .order('fecha_venta', { ascending: false });

      // Procesar datos
      const clientesMap = {};
      let totalClientesUnicos = 0;
      let deudaTotal = 0;

      ventas?.forEach(venta => {
        const clienteId = venta.clientes?.id;
        const clienteNombre = venta.clientes?.nombre || 'N/A';
        const ciudad = venta.clientes?.ciudad || 'N/A';
        const telefono = venta.clientes?.telefono || 'N/A';
        const email = venta.clientes?.email || 'N/A';

        if (!clientesMap[clienteId]) {
          clientesMap[clienteId] = {
            nombre: clienteNombre,
            ciudad: ciudad,
            telefono: telefono,
            email: email,
            montoTotal: 0,
            montoCobrado: 0,
            ventas: [],
            cantidadVentas: 0,
          };
          totalClientesUnicos++;
        }

        const totalVenta = venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
        const cobrado = venta.cobros?.reduce((sum, c) => sum + (c.monto_pagado + (c.pago_delivery || 0)), 0) || 0;

        clientesMap[clienteId].montoTotal += totalVenta;
        clientesMap[clienteId].montoCobrado += cobrado;
        clientesMap[clienteId].ventas.push({
          id: venta.id,
          fecha: venta.fecha_venta,
          monto: totalVenta,
          estado: venta.estado,
        });
        clientesMap[clienteId].cantidadVentas++;
      });

      // Calcular deuda por cliente
      const conDeuda = [];
      Object.values(clientesMap).forEach(cliente => {
        cliente.montoPendiente = cliente.montoTotal - cliente.montoCobrado;
        if (cliente.montoPendiente > 0) {
          conDeuda.push(cliente);
        }
        deudaTotal += cliente.montoPendiente;
      });

      // Top clientes por monto
      const topByMonto = Object.values(clientesMap)
        .sort((a, b) => b.montoTotal - a.montoTotal)
        .slice(0, 10);

      setTopClientes(topByMonto);
      setClientesConDeuda(conDeuda.sort((a, b) => b.montoPendiente - a.montoPendiente));
      setHistorialClientes(clientesMap);
      setResumen({
        totalClientesUnicos,
        deudaTotal,
        totalVentasCount: ventas?.length || 0,
      });
    } catch (err) {
      console.error('Error al cargar reporte:', err);
    }
  };

  const descargarCSV = () => {
    let csv = 'CLIENTE,CIUDAD,TELEFONO,TOTAL_COMPRAS,COBRADO,PENDIENTE,CANTIDAD_VENTAS\n';

    Object.values(historialClientes).forEach(cliente => {
      csv += `${cliente.nombre},${cliente.ciudad},${cliente.telefono},L. ${cliente.montoTotal.toFixed(2)},L. ${cliente.montoCobrado.toFixed(2)},L. ${cliente.montoPendiente.toFixed(2)},${cliente.cantidadVentas}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_clientes_${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-4xl font-bold text-gray-900">👥 Reporte de Clientes</h1>
          <p className="text-gray-600 mt-2">Análisis de clientes, deudas e historial de compras</p>
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

      {/* Resumen KPIs */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900">👥 Total Clientes</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{resumen.totalClientesUnicos}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-bold text-red-900">⏳ Deuda Total</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">L. {resumen.deudaTotal.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-bold text-purple-900">🛒 Total Ventas</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{resumen.totalVentasCount}</p>
          </div>
        </div>
      )}

      {/* Sección: Top Clientes */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden print:page-break-inside-avoid">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 flex items-center gap-3">
          <TrendingUp size={28} />
          <h2 className="text-2xl font-bold">Top 10 Clientes por Compras</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Posición</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Ciudad</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Total Compras</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Cantidad Ventas</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Promedio por Venta</th>
              </tr>
            </thead>
            <tbody>
              {topClientes.map((cliente, idx) => (
                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-lg text-blue-600">#{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{cliente.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">{cliente.ciudad}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    L. {cliente.montoTotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">{cliente.cantidadVentas}</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    L. {(cliente.montoTotal / cliente.cantidadVentas).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección: Clientes con Deuda */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden print:page-break-inside-avoid">
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6">
          <h2 className="text-2xl font-bold">⏳ Clientes con Deuda Pendiente ({clientesConDeuda.length})</h2>
        </div>

        {clientesConDeuda.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            ✅ No hay clientes con deuda pendiente
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Ciudad</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Total Compras</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Cobrado</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Deuda Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {clientesConDeuda.map((cliente, idx) => (
                  <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{cliente.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{cliente.telefono}</td>
                    <td className="px-4 py-3 text-gray-700">{cliente.ciudad}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      L. {cliente.montoTotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">
                      L. {cliente.montoCobrado.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      L. {cliente.montoPendiente.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan="5" className="px-4 py-3 text-right font-bold text-gray-900">
                    TOTAL DEUDA:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600 text-lg">
                    L. {clientesConDeuda.reduce((sum, c) => sum + c.montoPendiente, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
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