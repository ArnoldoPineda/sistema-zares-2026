import React, { useState } from 'react';
import { Edit2, Trash2, Upload, Search, Camera } from 'lucide-react';

export default function ArticulosTable({
  articulos,
  loading,
  onEdit,
  onDelete,
  onUploadFoto,
  searchTerm,
  onSearchChange,
  page,
  onPageChange,
  totalCount,
  itemsPerPage = 10,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null);

  const handleFileChange = (e, articuloId) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({ articuloId, file });
    }
  };

  const handleCameraCapture = (e, articuloId) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({ articuloId, file });
      setActiveCamera(null);
    }
  };

  const handleUploadFoto = async (articuloId) => {
    if (!selectedFile || selectedFile.articuloId !== articuloId) return;

    setUploadingId(articuloId);
    await onUploadFoto(articuloId, selectedFile.file);
    setUploadingId(null);
    setSelectedFile(null);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header con búsqueda */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por código, nombre o categoría..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Precio Costo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Precio Venta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Foto</th>
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
            ) : articulos.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No hay artículos que mostrar
                </td>
              </tr>
            ) : (
              articulos.map((art) => (
                <tr key={art.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{art.codigo}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{art.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {art.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">L. {art.precio_costo.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">L. {art.precio_venta.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      art.cantidad_stock >= art.cantidad_minima
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {art.cantidad_stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {art.foto_url ? (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ Subida
                      </span>
                    ) : (
                      <div className="space-y-2">
                        {/* OPCIÓN 1: Seleccionar archivo */}
                        <div className="flex items-center gap-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, art.id)}
                            className="hidden"
                            id={`file-${art.id}`}
                          />
                          <label
                            htmlFor={`file-${art.id}`}
                            className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium hover:bg-yellow-200"
                          >
                            📁 Archivo
                          </label>

                          {/* OPCIÓN 2: Usar cámara (solo móvil) */}
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleCameraCapture(e, art.id)}
                            className="hidden"
                            id={`camera-${art.id}`}
                          />
                          <label
                            htmlFor={`camera-${art.id}`}
                            className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium hover:bg-purple-200"
                            title="Usar cámara del móvil"
                          >
                            <Camera size={14} />
                            Cámara
                          </label>

                          {/* Botón subir si hay archivo seleccionado */}
                          {selectedFile?.articuloId === art.id && (
                            <button
                              onClick={() => handleUploadFoto(art.id)}
                              disabled={uploadingId === art.id}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              {uploadingId === art.id ? '⏳...' : '✓ Subir'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(art)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de eliminar este artículo?')) {
                            onDelete(art.id);
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
          Mostrando {articulos.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} - {Math.min(page * itemsPerPage, totalCount)} de {totalCount} artículos
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

      {/* Info de cómo subir fotos */}
      <div className="bg-blue-50 border-t border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          <strong>📸 Cómo subir fotos:</strong> En cada artículo sin foto, elige 📁 "Archivo" de tu galería o 📷 "Cámara" para tomar una foto con el móvil, luego haz click en "✓ Subir".
        </p>
      </div>
    </div>
  );
}