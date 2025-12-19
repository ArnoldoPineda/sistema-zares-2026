import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Upload, Link as LinkIcon, Camera, Lock } from 'lucide-react';

export default function ArticulosForm({ articulo, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    cantidad_stock: 0,
    foto_url: '',
    enlace: '',
    precio_costo: 0,
    precio_unitario: 0,
    descripcion: '',
    categoria: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isNewArticulo, setIsNewArticulo] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Función para generar código único
  const generateUniqueCode = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ART-${timestamp}-${random}`;
  };

  useEffect(() => {
    if (articulo && articulo.id) {
      // Editando artículo existente
      setIsNewArticulo(false);
      setFormData({
        nombre: articulo.nombre || '',
        codigo: articulo.codigo || '',
        cantidad_stock: articulo.cantidad_stock || 0,
        foto_url: articulo.foto_url || '',
        enlace: articulo.enlace || '',
        precio_costo: articulo.precio_costo || 0,
        precio_unitario: articulo.precio_unitario || 0,
        descripcion: articulo.descripcion || '',
        categoria: articulo.categoria || ''
      });
      setPreview(articulo.foto_url || '');
    } else {
      // Nuevo artículo - generar código
      setIsNewArticulo(true);
      setFormData(prev => ({
        ...prev,
        codigo: generateUniqueCode()
      }));
    }
  }, [articulo]);

  // Iniciar cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      setError('No se pudo acceder a la cámara: ' + error.message);
    }
  };

  // Capturar foto de cámara
  const captureFoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleImageUploadFile(file);
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  // Manejo de carga de imagen
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUploadFile(file);
    }
  };

  // Función para subir archivo
  const handleImageUploadFile = async (file) => {
    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `articulos/${fileName}`;

      // Subir a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('articulos-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicUrl } = supabase.storage
        .from('articulos-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        foto_url: publicUrl.publicUrl
      }));
      setPreview(publicUrl.publicUrl);
      setError('');
    } catch (err) {
      setError(`Error al subir imagen: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Pegar URL de imagen directa
  const handlePasteImageUrl = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, foto_url: url }));
    setPreview(url);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // No permitir cambio del código
    if (name === 'codigo') {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: (name === 'cantidad_stock' || name === 'precio_costo' || name === 'precio_unitario') 
        ? (value === '' ? 0 : parseFloat(value)) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.nombre.trim()) {
        throw new Error('El nombre del artículo es requerido');
      }

      if (formData.cantidad_stock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      if (formData.precio_unitario <= 0) {
        throw new Error('El precio de venta debe ser mayor a 0');
      }

      if (articulo?.id) {
        // Actualizar - el código no se actualiza
        const { error: updateError } = await supabase
          .from('articulos')
          .update({
            nombre: formData.nombre,
            cantidad_stock: formData.cantidad_stock,
            foto_url: formData.foto_url,
            enlace: formData.enlace,
            precio_costo: formData.precio_costo,
            precio_unitario: formData.precio_unitario,
            descripcion: formData.descripcion,
            categoria: formData.categoria
            // NO incluimos 'codigo' en la actualización
          })
          .eq('id', articulo.id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo - el código se genera automáticamente
        const { error: insertError } = await supabase
          .from('articulos')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      onSave();
    } catch (err) {
      setError(err.message || 'Error al guardar artículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">
            {isNewArticulo ? 'Nuevo Artículo' : 'Editar Artículo'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Información Básica</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Campo Código - Solo lectura */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock size={16} className="inline mr-2" />
                  Código (Automático)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo || ''}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:ring-0"
                  />
                  <Lock size={16} className="absolute right-3 top-3 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este código se genera automáticamente y no puede modificarse
                </p>
              </div>

              {/* Campo Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Lámpara de techo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Disponible
                </label>
                <input
                  type="number"
                  name="cantidad_stock"
                  value={formData.cantidad_stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Costo (L.)
                </label>
                <input
                  type="number"
                  name="precio_costo"
                  value={formData.precio_costo || 0}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Venta (L.) *
                </label>
                <input
                  type="number"
                  name="precio_unitario"
                  value={formData.precio_unitario || 0}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Margen de ganancia (informativo) */}
              {formData.precio_costo > 0 && formData.precio_unitario > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margen de Ganancia
                  </label>
                  <div className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 text-green-700 font-medium">
                    {((((formData.precio_unitario - formData.precio_costo) / formData.precio_costo) * 100).toFixed(2))}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección Descripción y Categoría */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Detalles Adicionales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  placeholder="Ej: Iluminación, Hogar, etc"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción detallada del artículo..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sección Foto */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Foto del Artículo</h3>
            
            {/* Preview de imagen */}
            {preview && (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-48 w-48 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=Error+Imagen';
                  }}
                />
              </div>
            )}

            {/* Opción 1: Subir imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload size={16} className="inline mr-2" />
                Opción 1: Subir desde tu computadora
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {uploading && <p className="text-sm text-blue-600 mt-1">Subiendo...</p>}
            </div>

            {/* Opción 2: Tomar foto con cámara */}
            <div>
              <button
                type="button"
                onClick={startCamera}
                disabled={showCamera}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
              >
                <Camera size={18} />
                📱 Opción 2: Tomar foto con cámara
              </button>
            </div>

            {/* Cámara en vivo */}
            {showCamera && (
              <div className="border-2 border-blue-400 rounded-lg p-4 space-y-3">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="w-full rounded-lg bg-black" 
                />
                <canvas 
                  ref={canvasRef} 
                  className="hidden" 
                  width={640} 
                  height={480} 
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={captureFoto}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    ✅ Capturar foto
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Opción 3: Pegar URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon size={16} className="inline mr-2" />
                Opción 3: Pegar URL de imagen
              </label>
              <input
                type="url"
                value={formData.foto_url || ''}
                onChange={handlePasteImageUrl}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Sección Enlaces */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Enlaces de Referencia</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <LinkIcon size={16} className="inline mr-2" />
                Enlace (Amazon, Proveedores, etc)
              </label>
              <input
                type="url"
                name="enlace"
                value={formData.enlace || ''}
                onChange={handleChange}
                placeholder="https://a.co/d/fC4LuiP o link de proveedor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-600 mt-1">
                Coloca aquí URLs de Amazon, referencias de proveedores, o cualquier enlace relacionado
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}