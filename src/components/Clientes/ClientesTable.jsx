import React from 'react';
import { Edit2, Trash2, Search, Mail, Phone, MapPin } from 'lucide-react';

export default function ClientesTable({
  clientes,
  loading,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
  page,
  onPageChange,
  totalCount,
  itemsPerPage = 10,
}) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getTipoClienteBadge = (tipo) => {
    const tipos = {
      'Normal': 'bg-blue-100 text-blue-800',
      'VIP': 'bg-purple-100 text-purple-800',
      'Mayorista': 'bg-green-100 text-green-800',
    };
    return tipos[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header con búsqueda */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono o ciudad..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ciudad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Límite Crédito</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No hay clientes que mostrar
                </td>
              </tr>
            ) : (
              clientes.map((cli) => (
                <tr key={cli.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {cli.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{cli.nombre}</p>
                        {cli.apellido && <p className="text-xs text-gray-500">{cli.apellido}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {cli.email ? (
                      <a href={`mailto:${cli.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                        <Mail size={16} />
                        {cli.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">Sin email</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {cli.telefono ? (
                      <a href={`tel:${cli.telefono}`} className="text-green-600 hover:underline flex items-center gap-1">
                        <Phone size={16} />
                        {cli.telefono}
                      </a>
                    ) : (
                      <span className="text-gray-400">Sin teléfono</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} className="text-gray-500" />
                      {cli.ciudad || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoClienteBadge(cli.tipo_cliente || 'Normal')}`}>
                      {cli.tipo_cliente || 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {cli.limite_credito > 0 ? (
                      <span className="font-semibold text-green-600">L. {cli.limite_credito.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400">Sin límite</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cli.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cli.activo ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(cli)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de eliminar a ${cli.nombre}?`)) {
                            onDelete(cli.id);
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Mostrando {clientes.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} - {Math.min(page * itemsPerPage, totalCount)} de {totalCount} clientes
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