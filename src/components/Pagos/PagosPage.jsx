import React, { useState, useEffect } from 'react';
import { useVentas } from '../../hooks/useVentas';
import { Calendar, TrendingUp, DollarSign, Clock, Truck } from 'lucide-react';

export default function PagosPage() {
  const { fetchVentas, ventas } = useVentas();

  const [filtro, setFiltro] = useState('hoy');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pagosFiltrados, setPagosFiltrados] = useState([]);
  const [ventasPendientesFiltradas, setVentasPendientesFiltradas] = useState([]);

  // Cargar datos al montar
  useEffect(() => {
    fetchVentas(1, '', 1000);
  }, []);

  // Filtrar pagos por fecha
  useEffect(() => {
    let inicio, fin;
    const hoy = new Date();

    switch (filtro) {
      case 'hoy':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
        break;
      case 'esta_semana':
        const primerDiaSemana = new Date(hoy);
        primerDiaSemana.setDate(hoy.getDate() - hoy.getDay());
        inicio = primerDiaSemana;
        fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
        break;
      case 'semana_pasada':
        const primerDiaSemanaP = new Date(hoy);
        primerDiaSemanaP.setDate(hoy.getDate() - hoy.getDay() - 7);
        const ultimoDiaSemanaP = new Date(primerDiaSemanaP);
        ultimoDiaSemanaP.setDate(primerDiaSemanaP.getDate() + 7);
        inicio = primerDiaSemanaP;
        fin = ultimoDiaSemanaP;
        break;
      case 'este_mes':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
        break;
      case 'mes_pasado':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        fin = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'total':
        inicio = new Date(0);
        fin = new Date();
        break;
      case 'rango_custom':
        if (!fechaInicio || !fechaFin) return;
        inicio = new Date(fechaInicio);
        fin = new Date(fechaFin);
        fin.setDate(fin.getDate() + 1);
        break;
      default:
        inicio = new Date(0);
        fin = new Date();
    }

    // Filtrar solo ventas PAGADAS
    const pagados = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha_venta);
      return venta.estado === 'PAGADO' && fechaVenta >= inicio && fechaVenta < fin;
    });

    // Filtrar solo ventas PENDIENTES
    const pendientes = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha_venta);
      return venta.estado === 'PENDIENTE' && fechaVenta >= inicio && fechaVenta < fin;
    });

    setPagosFiltrados(pagados);
    setVentasPendientesFiltradas(pendientes);
  }, [filtro, fechaInicio, fechaFin, ventas]);

  // Calcular estadísticas de pagos
  const totalPagado = pagosFiltrados.reduce((sum, venta) => {
    const detalles = venta.detalles_venta || [];
    return sum + detalles.reduce((s, d) => s + (d.subtotal || 0), 0);
  }, 0);

  const totalPendiente = ventasPendientesFiltradas.reduce((sum, venta) => {
    const detalles = venta.detalles_venta || [];
    return sum + detalles.reduce((s, d) => s + (d.subtotal || 0), 0);
  }, 0);

  // Análisis por método de pago (liquidación + banco)
  const metodoPagoAnalisis = {};
  
  pagosFiltrados.forEach(venta => {
    if (venta.cobros && Array.isArray(venta.cobros)) {
      venta.cobros.forEach(cobro => {
        // Crear clave: si es BANCOS, agrupar por banco; si no, solo por liquidación
        let metodo;
        if (cobro.liquidacion === 'BANCOS' && cobro.banco) {
          metodo = cobro.banco; // Solo el nombre del banco
        } else {
          metodo = cobro.liquidacion || 'SIN ESPECIFICAR';
        }
        
        if (!metodoPagoAnalisis[metodo]) {
          metodoPagoAnalisis[metodo] = {
            cantidad: 0,
            monto: 0,
            delivery: 0,
            tipo: cobro.liquidacion, // Guardar el tipo de liquidación
          };
        }
        metodoPagoAnalisis[metodo].cantidad += 1;
        metodoPagoAnalisis[metodo].monto += parseFloat(cobro.monto_pagado) || 0;
        metodoPagoAnalisis[metodo].delivery += parseFloat(cobro.pago_delivery) || 0;
      });
    }
  });

  // Ordenar por tipo de liquidación (BANCOS primero, luego otros)
  const metodoPagoOrdenado = Object.entries(metodoPagoAnalisis)
    .sort(([keyA, valA], [keyB, valB]) => {
      const tipoA = valA.tipo || '';
      const tipoB = valB.tipo || '';
      // BANCOS primero
      if (tipoA === 'BANCOS' && tipoB !== 'BANCOS') return -1;
      if (tipoA !== 'BANCOS' && tipoB === 'BANCOS') return 1;
      return keyA.localeCompare(keyB);
    })
    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

  console.log('=== PagosPage DEBUG ===');
  console.log('pagosFiltrados:', pagosFiltrados);
  console.log('metodoPagoAnalisis:', metodoPagoOrdenado);

  const totalDelivery = pagosFiltrados.reduce((sum, venta) => {
    return (
      sum +
      (venta.cobros?.reduce((s, c) => s + (c.pago_delivery || 0), 0) || 0)
    );
  }, 0);

  const etiquetaFiltro = {
    hoy: 'Hoy',
    esta_semana: 'Esta semana',
    semana_pasada: 'Semana pasada',
    este_mes: 'Este mes',
    mes_pasado: 'Mes pasado',
    total: 'Total',
    rango_custom: 'Rango personalizado',
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">💰 Pagos y Cobranza</h1>
        <p className="text-gray-600 mt-2">Gestión de pagos registrados y análisis de cobranza</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🔍 Filtrar por período</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
          <button
            onClick={() => setFiltro('hoy')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'hoy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setFiltro('esta_semana')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'esta_semana'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Esta semana
          </button>
          <button
            onClick={() => setFiltro('semana_pasada')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'semana_pasada'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semana pasada
          </button>
          <button
            onClick={() => setFiltro('este_mes')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'este_mes'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Este mes
          </button>
          <button
            onClick={() => setFiltro('mes_pasado')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'mes_pasado'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes pasado
          </button>
          <button
            onClick={() => setFiltro('total')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'total'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setFiltro('rango_custom')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'rango_custom'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar size={16} className="inline mr-1" />
            Rango
          </button>
        </div>

        {/* Rango personalizado */}
        {filtro === 'rango_custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Período seleccionado */}
      <div className="text-sm text-gray-600 font-medium">
        Mostrando datos de: <span className="text-green-600">{etiquetaFiltro[filtro]}</span>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total pagado */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold uppercase">Total Pagado</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">L. {totalPagado.toFixed(2)}</h3>
              <p className="text-xs text-green-500 mt-2">{pagosFiltrados.length} cobros</p>
            </div>
            <div className="text-5xl">✅</div>
          </div>
        </div>

        {/* Total pendiente */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-lg p-6 border-l-4 border-orange-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-semibold uppercase">Total Pendiente</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">L. {totalPendiente.toFixed(2)}</h3>
              <p className="text-xs text-orange-500 mt-2">{ventasPendientesFiltradas.length} ventas</p>
            </div>
            <div className="text-5xl">⏳</div>
          </div>
        </div>

        {/* Total delivery */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase">Delivery</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">L. {totalDelivery.toFixed(2)}</h3>
              <p className="text-xs text-blue-500 mt-2">Cobrado</p>
            </div>
            <div className="text-5xl">🚚</div>
          </div>
        </div>

        {/* Total general */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold uppercase">Total General</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                L. {(totalPagado + totalPendiente).toFixed(2)}
              </h3>
              <p className="text-xs text-purple-500 mt-2">Pagado + Pendiente</p>
            </div>
            <div className="text-5xl">💷</div>
          </div>
        </div>
      </div>

      {/* Análisis por método de pago */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
        <h2 className="text-xl font-bold text-gray-900 mb-6">📊 Análisis por Método de Pago</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Método</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Transacciones</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Monto</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Delivery</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metodoPagoOrdenado).length > 0 ? (
                Object.entries(metodoPagoOrdenado).map(([metodo, datos]) => (
                  <tr key={metodo} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {datos.tipo === 'BANCOS' ? `🏦 ${metodo}` : metodo}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">{datos.cantidad}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      L. {datos.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                      L. {datos.delivery.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                      L. {(datos.monto + datos.delivery).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No hay pagos registrados en este período
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-6 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                <td className="px-6 py-3 text-sm text-center font-bold text-gray-900">
                  {Object.values(metodoPagoOrdenado).reduce((sum, d) => sum + d.cantidad, 0)}
                </td>
                <td className="px-6 py-3 text-sm text-right font-bold text-gray-900">
                  L. {Object.values(metodoPagoOrdenado).reduce((sum, d) => sum + d.monto, 0).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-sm text-right font-bold text-gray-900">
                  L. {Object.values(metodoPagoOrdenado).reduce((sum, d) => sum + d.delivery, 0).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-sm text-right font-bold text-green-600">
                  L. {(Object.values(metodoPagoOrdenado).reduce((sum, d) => sum + d.monto + d.delivery, 0)).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tabla de pagos registrados */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
        <h2 className="text-xl font-bold text-gray-900 mb-6">✅ Pagos Registrados ({pagosFiltrados.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Método</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Monto</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Delivery</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((venta) => (
                  <tr key={venta.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(venta.fecha_venta).toLocaleDateString('es-HN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {venta.clientes?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {venta.cobros?.map((c) => c.liquidacion).join(', ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                      L. {venta.cobros?.reduce((s, c) => s + (c.monto_pagado || 0), 0).toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                      L. {venta.cobros?.reduce((s, c) => s + (c.pago_delivery || 0), 0).toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                      L.{' '}
                      {(
                        venta.cobros?.reduce((s, c) => s + (c.monto_pagado || 0) + (c.pago_delivery || 0), 0) || 0
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay pagos registrados en este período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de ventas pendientes */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-600">
        <h2 className="text-xl font-bold text-gray-900 mb-6">⏳ Ventas Pendientes ({ventasPendientesFiltradas.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Artículos</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Días</th>
              </tr>
            </thead>
            <tbody>
              {ventasPendientesFiltradas.length > 0 ? (
                ventasPendientesFiltradas.map((venta) => {
                  const totalArticulos = venta.detalles_venta?.reduce((s, d) => s + (d.cantidad || 0), 0) || 0;
                  const totalVenta = venta.detalles_venta?.reduce((s, d) => s + (d.subtotal || 0), 0) || 0;
                  const dias = Math.floor(
                    (new Date() - new Date(venta.fecha_venta)) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={venta.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(venta.fecha_venta).toLocaleDateString('es-HN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {venta.clientes?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">{totalArticulos}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-orange-600">
                        L. {totalVenta.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            dias <= 7
                              ? 'bg-yellow-100 text-yellow-800'
                              : dias <= 30
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {dias} días
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No hay ventas pendientes en este período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}