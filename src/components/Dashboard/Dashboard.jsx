import React, { useState, useEffect } from 'react';
import { useVentas } from '../../hooks/useVentas';
import { useArticulos } from '../../hooks/useArticulos';
import { Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { fetchVentas, ventas } = useVentas();
  const { fetchArticulos, articulos } = useArticulos();

  const [filtro, setFiltro] = useState('hoy');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ventasFiltradas, setVentasFiltradas] = useState([]);

  // Cargar datos al montar
  useEffect(() => {
    fetchVentas(1, '', 1000);
    fetchArticulos(1, '', 1000);
  }, []);

  // Filtrar ventas por fecha
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

    const filtradas = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha_venta);
      return fechaVenta >= inicio && fechaVenta < fin;
    });

    setVentasFiltradas(filtradas);
  }, [filtro, fechaInicio, fechaFin, ventas]);

  // Calcular estadísticas
  const ventasPendientes = ventasFiltradas.filter(v => v.estado === 'PENDIENTE');
  const ventasPagadas = ventasFiltradas.filter(v => v.estado === 'PAGADO');

  const totalVentasPendientes = ventasPendientes.reduce((sum, v) => {
    const detalles = v.detalles_venta || [];
    return sum + detalles.reduce((s, d) => s + (d.subtotal || 0), 0);
  }, 0);

  const totalVentasPagadas = ventasPagadas.reduce((sum, v) => {
    const detalles = v.detalles_venta || [];
    return sum + detalles.reduce((s, d) => s + (d.subtotal || 0), 0);
  }, 0);

  const totalVentas = totalVentasPendientes + totalVentasPagadas;

  // Calcular artículos vendidos
  const articulosVendidos = ventasPagadas.reduce((sum, venta) => {
    const detalles = venta.detalles_venta || [];
    return sum + detalles.reduce((s, d) => s + (d.cantidad || 0), 0);
  }, 0);

  const totalArticulos = articulos.reduce((sum, a) => {
    const stock = parseInt(a.cantidad_stock) || 0;
    return sum + stock;
  }, 0);
  
  const articulosDisponibles = totalArticulos - articulosVendidos;

  const etiquetaFiltro = {
    hoy: 'Hoy',
    esta_semana: 'Esta semana',
    semana_pasada: 'Semana pasada',
    este_mes: 'Este mes',
    mes_pasado: 'Mes pasado',
    rango_custom: 'Rango personalizado',
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido al Sistema de Gestión de Ventas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🔍 Filtrar por período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2">
          <button
            onClick={() => setFiltro('hoy')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'hoy'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setFiltro('esta_semana')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'esta_semana'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Esta semana
          </button>
          <button
            onClick={() => setFiltro('semana_pasada')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'semana_pasada'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semana pasada
          </button>
          <button
            onClick={() => setFiltro('este_mes')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'este_mes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Este mes
          </button>
          <button
            onClick={() => setFiltro('mes_pasado')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'mes_pasado'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes pasado
          </button>
          <button
            onClick={() => setFiltro('rango_custom')}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              filtro === 'rango_custom'
                ? 'bg-blue-600 text-white'
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Período seleccionado */}
      <div className="text-sm text-gray-600 font-medium">
        Mostrando datos de: <span className="text-blue-600">{etiquetaFiltro[filtro]}</span>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total vendido */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase">Total Vendido</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">L. {totalVentas.toFixed(2)}</h3>
              <p className="text-xs text-blue-500 mt-2">{ventasFiltradas.length} transacciones</p>
            </div>
            <div className="text-5xl">💰</div>
          </div>
        </div>

        {/* Ventas pagadas */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold uppercase">Pagado</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">L. {totalVentasPagadas.toFixed(2)}</h3>
              <p className="text-xs text-green-500 mt-2">{ventasPagadas.length} pagadas</p>
            </div>
            <div className="text-5xl">✅</div>
          </div>
        </div>

        {/* Ventas pendientes */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-lg p-6 border-l-4 border-orange-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-semibold uppercase">Pendiente</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">L. {totalVentasPendientes.toFixed(2)}</h3>
              <p className="text-xs text-orange-500 mt-2">{ventasPendientes.length} pendientes</p>
            </div>
            <div className="text-5xl">⏳</div>
          </div>
        </div>

        {/* Artículos disponibles */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold uppercase">Disponibles</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{articulosDisponibles}</h3>
              <p className="text-xs text-purple-500 mt-2">de {totalArticulos} artículos</p>
            </div>
            <div className="text-5xl">📦</div>
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumen ventas pagadas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
          <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Ventas Pagadas</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total pagado</p>
              <p className="text-2xl font-bold text-green-600">L. {totalVentasPagadas.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Número de ventas</p>
              <p className="text-2xl font-bold text-gray-900">{ventasPagadas.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Promedio por venta</p>
              <p className="text-2xl font-bold text-gray-900">
                L. {ventasPagadas.length > 0 ? (totalVentasPagadas / ventasPagadas.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen ventas pendientes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-600">
          <h3 className="text-xl font-bold text-gray-900 mb-4">⏳ Ventas Pendientes</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total pendiente</p>
              <p className="text-2xl font-bold text-orange-600">L. {totalVentasPendientes.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Número de ventas</p>
              <p className="text-2xl font-bold text-gray-900">{ventasPendientes.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Promedio por venta</p>
              <p className="text-2xl font-bold text-gray-900">
                L. {ventasPendientes.length > 0 ? (totalVentasPendientes / ventasPendientes.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen inventario */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📦 Inventario</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total en stock</p>
              <p className="text-2xl font-bold text-purple-600">{totalArticulos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendidos (pagado)</p>
              <p className="text-2xl font-bold text-gray-900">{articulosVendidos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{articulosDisponibles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">🎯 Información del Sistema</h2>
        <p className="text-blue-100 mb-6 leading-relaxed">
          Este dashboard muestra todas tus ventas filtradas por período. Los artículos disponibles se calculan restando 
          los artículos vendidos (solo pagados) del total en inventario. Usa los filtros para analizar diferentes períodos.
        </p>
      </div>
    </div>
  );
}