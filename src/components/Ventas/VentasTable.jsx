import React from 'react';
import { Edit2, Trash2, Search, Eye, Plus } from 'lucide-react';

export default function VentasTable({
  ventas,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
  searchTerm,
  onSearchChange,
  page,
  onPageChange,
  totalCount,
  itemsPerPage = 10,
}) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getEstadoBadge = (estado) => {
    const estados = {
      'PAGADO': 'bg-green-100 text-green-800',
      'PARCIAL': 'bg-yellow-100 text-yellow-800',
      'PENDIENTE': 'bg-red-100 text-red-800',
    };
    return estados[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calcularTotales = (venta) => {
    const total = venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
    const totalArticulos = venta.detalles_venta?.reduce((sum, det) => sum + (det.cantidad || 0), 0) || 0;
    
    return { total, totalArticulos };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header con búsqueda */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente, estado..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Artículos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cobrado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Pendiente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No hay ventas registradas
                </td>
              </tr>
            ) : (
              ventas.map((venta) => {
                const { total, totalArticulos } = calcularTotales(venta);
                const totalCobrado = 0; // Placeholder - se llena cuando hay cobros
                const pendiente = total - totalCobrado;

                return (
                  <tr key={venta.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatDate(venta.fecha_venta)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {venta.clientes?.nombre_completo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {totalArticulos} {totalArticulos === 1 ? 'artículo' : 'artículos'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      L. {total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      L. {totalCobrado.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      L. {pendiente.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(venta.estado)}`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewDetails(venta)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(venta)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar venta del ${formatDate(venta.fecha_venta)}?`)) {
                              onDelete(venta.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Mostrando {ventas.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} - {Math.min(page * itemsPerPage, totalCount)} de {totalCount} ventas
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 flex items-center">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}