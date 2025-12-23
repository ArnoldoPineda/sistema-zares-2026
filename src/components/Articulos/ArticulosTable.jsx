import React, { useState } from 'react';
import { Eye, Trash2, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ArticulosTable({
  articulos,
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
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleViewDetails = (articulo) => {
    setSelectedArticulo(articulo);
    setShowModal(true);
  };

  const handleDelete = (articulo) => {
    if (window.confirm(`¿Eliminar "${articulo.nombre}"?`)) {
      onDelete(articulo.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* SEARCH BAR */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, código, descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Foto</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Código</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Precio Costo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Precio Venta</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Categoría</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : articulos.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  📦 No hay artículos disponibles
                </td>
              </tr>
            ) : (
              articulos.map((articulo) => (
                <tr key={articulo.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  {/* FOTO */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {articulo.foto_url ? (
                        <img
                          src={articulo.foto_url}
                          alt={articulo.nombre}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                    </div>
                  </td>

                  {/* CÓDIGO */}
                  <td className="px-6 py-4">
                    <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-mono text-gray-800">
                      {articulo.codigo}
                    </span>
                  </td>

                  {/* NOMBRE */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 line-clamp-2">{articulo.nombre}</p>
                  </td>

                  {/* STOCK */}
                  <td className="px-6 py-4">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        articulo.cantidad_stock > 20
                          ? 'bg-green-100 text-green-800'
                          : articulo.cantidad_stock > 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {articulo.cantidad_stock} unidades
                    </div>
                  </td>

                  {/* PRECIO COSTO */}
                  <td className="px-6 py-4">
                    <p className="text-gray-700 font-semibold">
                      L. {articulo.precio_costo?.toFixed(2) || '0.00'}
                    </p>
                  </td>

                  {/* PRECIO VENTA */}
                  <td className="px-6 py-4">
                    <p className="text-green-600 font-bold text-lg">
                      L. {articulo.precio_venta?.toFixed(2) || '0.00'}
                    </p>
                  </td>

                  {/* CATEGORÍA */}
                  <td className="px-6 py-4">
                    <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      {articulo.categoria || 'N/A'}
                    </span>
                  </td>

                  {/* ACCIONES */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(articulo)}
                        title="Ver detalles"
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(articulo)}
                        title="Editar"
                        className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(articulo)}
                        title="Eliminar"
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
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

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{(page - 1) * itemsPerPage + 1}</span> a{' '}
            <span className="font-semibold">{Math.min(page * itemsPerPage, totalCount)}</span> de{' '}
            <span className="font-semibold">{totalCount}</span> artículos
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-10 h-10 rounded-lg font-semibold transition ${
                    page === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {showModal && selectedArticulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">📋 Detalles del Artículo</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl hover:bg-blue-700 p-2 rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* FOTO GRANDE */}
              {selectedArticulo.foto_url && (
                <div className="flex justify-center">
                  <img
                    src={selectedArticulo.foto_url}
                    alt={selectedArticulo.nombre}
                    className="w-64 h-64 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* INFO BÁSICA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedArticulo.nombre}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Código</p>
                    <p className="text-lg font-mono font-bold text-gray-900">{selectedArticulo.codigo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categoría</p>
                    <p className="text-lg font-bold text-gray-900">{selectedArticulo.categoria || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stock Disponible</p>
                    <p className="text-lg font-bold text-green-600">{selectedArticulo.cantidad_stock} unidades</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stock Mínimo</p>
                    <p className="text-lg font-bold text-gray-900">{selectedArticulo.cantidad_minima || 0}</p>
                  </div>
                </div>
              </div>

              {/* PRECIOS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Precio de Costo</p>
                  <p className="text-2xl font-bold text-orange-600">
                    L. {selectedArticulo.precio_costo?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Precio de Venta</p>
                  <p className="text-2xl font-bold text-green-600">
                    L. {selectedArticulo.precio_venta?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {/* MARGEN DE GANANCIA */}
              {selectedArticulo.precio_costo && selectedArticulo.precio_venta && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Margen de Ganancia</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(
                      ((selectedArticulo.precio_venta - selectedArticulo.precio_costo) /
                        selectedArticulo.precio_costo) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </div>
              )}

              {/* DESCRIPCIÓN */}
              {selectedArticulo.descripcion && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">Descripción</p>
                  <p className="text-gray-700 leading-relaxed">{selectedArticulo.descripcion}</p>
                </div>
              )}

              {/* BOTONES */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onEdit(selectedArticulo);
                    setShowModal(false);
                  }}
                  className="flex-1 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}