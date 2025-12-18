import React, { useState, useEffect } from 'react';
import { X, Upload, Camera } from 'lucide-react';

export default function ArticulosForm({ articulo, onSave, onClose, isLoading, onUploadFoto }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_costo: '',
    precio_venta: '',
    cantidad_stock: '',
    cantidad_minima: '',
    categoria: '',
  });

  const [errors, setErrors] = useState({});
  const [fotoPreview, setFotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  useEffect(() => {
    if (articulo) {
      setFormData({
        codigo: articulo.codigo || '',
        nombre: articulo.nombre || '',
        descripcion: articulo.descripcion || '',
        precio_costo: articulo.precio_costo || '',
        precio_venta: articulo.precio_venta || '',
        cantidad_stock: articulo.cantidad_stock || '',
        cantidad_minima: articulo.cantidad_minima || '',
        categoria: articulo.categoria || '',
      });
      if (articulo.foto_url) {
        setFotoPreview(articulo.foto_url);
      }
    }
  }, [articulo]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.precio_costo) newErrors.precio_costo = 'El precio costo es requerido';
    if (!formData.precio_venta) newErrors.precio_venta = 'El precio venta es requerido';
    if (!formData.cantidad_stock) newErrors.cantidad_stock = 'La cantidad es requerida';
    if (!formData.categoria.trim()) newErrors.categoria = 'La categoría es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Mostrar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Mostrar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFoto = async () => {
    if (!selectedFile || !articulo) {
      alert('Primero debes guardar el artículo antes de subir la foto');
      return;
    }

    setUploadingFoto(true);
    const result = await onUploadFoto(articulo.id, selectedFile);
    setUploadingFoto(false);

    if (result.success) {
      setSelectedFile(null);
      alert('✓ Foto subida exitosamente');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSave({
      ...formData,
      precio_costo: parseFloat(formData.precio_costo),
      precio_venta: parseFloat(formData.precio_venta),
      cantidad_stock: parseInt(formData.cantidad_stock),
      cantidad_minima: parseInt(formData.cantidad_minima) || 5,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {articulo ? '✏️ Editar Artículo' : '➕ Nuevo Artículo'}
          </h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-2 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECCIÓN 1: Foto */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📸 Foto del Artículo</h3>

            {/* Preview de la foto */}
            {fotoPreview && (
              <div className="mb-4">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}

            {/* Botones para seleccionar foto */}
            <div className="flex gap-3 mb-4 flex-wrap">
              {/* Opción 1: Archivo */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold"
                >
                  <Upload size={18} />
                  📁 Seleccionar Archivo
                </label>
              </div>

              {/* Opción 2: Cámara */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                  id="camera-input"
                />
                <label
                  htmlFor="camera-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold"
                  title="Usar cámara del móvil"
                >
                  <Camera size={18} />
                  📷 Tomar Foto
                </label>
              </div>

              {/* Opción 3: Subir foto (solo si articulo ya existe y hay archivo) */}
              {articulo && selectedFile && (
                <button
                  type="button"
                  onClick={handleUploadFoto}
                  disabled={uploadingFoto}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:bg-gray-400"
                >
                  {uploadingFoto ? '⏳ Subiendo...' : '✓ Subir Foto'}
                </button>
              )}

              {/* Mensaje si aún no se guarda el artículo */}
              {!articulo && selectedFile && (
                <div className="w-full text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  💡 Primero guarda el artículo, luego podrás subir la foto
                </div>
              )}
            </div>

            {/* Estado de la foto */}
            {articulo?.foto_url && !selectedFile && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                ✓ Este artículo ya tiene foto subida
              </div>
            )}
          </div>

          {/* SECCIÓN 2: Datos del artículo */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">📝 Información del Artículo</h3>

            {/* Grid de dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código del Artículo
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ej: ART001"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.codigo
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.codigo && <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Artículo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Lámpara LED"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.nombre
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  placeholder="Ej: Electrónica"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.categoria
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>}
              </div>

              {/* Precio Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Costo (L.)
                </label>
                <input
                  type="number"
                  name="precio_costo"
                  value={formData.precio_costo}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.precio_costo
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.precio_costo && <p className="text-red-500 text-sm mt-1">{errors.precio_costo}</p>}
              </div>

              {/* Precio Venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Venta (L.)
                </label>
                <input
                  type="number"
                  name="precio_venta"
                  value={formData.precio_venta}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.precio_venta
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.precio_venta && <p className="text-red-500 text-sm mt-1">{errors.precio_venta}</p>}
              </div>

              {/* Cantidad Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad en Stock
                </label>
                <input
                  type="number"
                  name="cantidad_stock"
                  value={formData.cantidad_stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.cantidad_stock
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.cantidad_stock && <p className="text-red-500 text-sm mt-1">{errors.cantidad_stock}</p>}
              </div>

              {/* Cantidad Mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Mínima
                </label>
                <input
                  type="number"
                  name="cantidad_minima"
                  value={formData.cantidad_minima}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Descripción (full width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalles adicionales del producto..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {isLoading ? 'Guardando...' : 'Guardar Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}