import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Camera, Upload as UploadIcon } from 'lucide-react';

export default function ArticulosForm({ articulo, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    cantidad_stock: '',
    foto_url: '',
    precio_costo: '',
    precio_venta: '',
    descripcion: '',
    categoria: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [isNewArticulo, setIsNewArticulo] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const generateUniqueCode = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ART-${timestamp}-${random}`;
  };

  useEffect(() => {
    if (articulo && articulo.id) {
      setIsNewArticulo(false);
      setFormData({
        nombre: articulo.nombre || '',
        codigo: articulo.codigo || '',
        cantidad_stock: articulo.cantidad_stock || '',
        foto_url: articulo.foto_url || '',
        precio_costo: articulo.precio_costo || '',
        precio_venta: articulo.precio_venta || '',
        descripcion: articulo.descripcion || '',
        categoria: articulo.categoria || ''
      });
      setPreview(articulo.foto_url || '');
    } else {
      setIsNewArticulo(true);
      setFormData(prev => ({
        ...prev,
        codigo: generateUniqueCode(),
        cantidad_stock: '',
        precio_costo: '',
        precio_venta: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        foto_url: ''
      }));
      setPreview('');
    }
  }, [articulo]);

  // ============================================================
  // CÁMARA - OPTIMIZADA PARA MÓVIL
  // ============================================================
  const startCamera = async () => {
    try {
      console.log('📷 Iniciando cámara...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setShowCamera(true);
          console.log('✅ Cámara iniciada');
        };
      }
    } catch (err) {
      setError('❌ No se pudo acceder a la cámara: ' + err.message);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => {
        t.stop();
      });
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const captureFoto = () => {
    if (!canvasRef.current || !videoRef.current) {
      setError('❌ Error: No se pudo capturar la imagen');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      const w = video.videoWidth;
      const h = video.videoHeight;

      if (w === 0 || h === 0) {
        setError('❌ Error: Video no cargado correctamente');
        return;
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('❌ No se pudo capturar la imagen');
            return;
          }
          const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
          uploadFoto(file);
        },
        'image/jpeg',
        0.9
      );
    } catch (err) {
      setError('❌ Error al capturar: ' + err.message);
      console.error('Capture error:', err);
    }
  };

  // ============================================================
  // UPLOAD A SUPABASE STORAGE
  // ============================================================
  const uploadFoto = async (file) => {
    setError('');

    if (file.size > 5 * 1024 * 1024) {
      setError('❌ La imagen debe ser menor a 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
      const filePath = `articulos/${fileName}`;

      console.log('📤 Subiendo archivo:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('articulos-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });

      if (uploadError) {
        throw new Error(`Error en upload: ${uploadError.message}`);
      }

      console.log('✅ Upload exitoso');

      const { data: urlData } = supabase.storage
        .from('articulos-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) {
        throw new Error('No se pudo generar la URL pública');
      }

      setFormData(prev => ({ ...prev, foto_url: publicUrl }));
      setPreview(publicUrl);
      setError('');
      console.log('🖼️ URL de foto guardada');
    } catch (err) {
      setError(`❌ Error al subir imagen: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // MANEJADORES
  // ============================================================
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFoto(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'codigo') return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.nombre.trim()) {
        throw new Error('El nombre del artículo es requerido');
      }

      const submitData = {
        nombre: formData.nombre.trim(),
        cantidad_stock: formData.cantidad_stock ? parseInt(formData.cantidad_stock) : 0,
        precio_costo: formData.precio_costo ? parseFloat(formData.precio_costo) : 0,
        precio_venta: formData.precio_venta ? parseFloat(formData.precio_venta) : 0,
        descripcion: formData.descripcion && formData.descripcion.trim() ? formData.descripcion.trim() : null,
        categoria: formData.categoria && formData.categoria.trim() ? formData.categoria.trim() : null,
        foto_url: formData.foto_url && formData.foto_url.trim() ? formData.foto_url.trim() : null
      };

      console.log('💾 Datos a guardar:', submitData);

      if (!isNewArticulo) {
        onSave?.(submitData);
      } else {
        onSave?.({
          ...submitData,
          codigo: formData.codigo
        });
      }

      setTimeout(() => {
        onClose?.();
      }, 500);
    } catch (err) {
      setError(err?.message || 'Error al guardar artículo');
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">
            {isNewArticulo ? 'Nuevo Artículo' : 'Editar Artículo'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* INFORMACIÓN BÁSICA */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Información Básica</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Lámpara"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
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
                  Precio Costo (L.)
                </label>
                <input
                  type="number"
                  name="precio_costo"
                  value={formData.precio_costo}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Venta (L.) *
                </label>
                <input
                  type="number"
                  name="precio_venta"
                  value={formData.precio_venta}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {formData.precio_costo && formData.precio_venta && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margen %
                  </label>
                  <div className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 text-green-700 font-medium">
                    {(((parseFloat(formData.precio_venta) - parseFloat(formData.precio_costo)) / parseFloat(formData.precio_costo) * 100).toFixed(2))}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DETALLES */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Detalles</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Ej: Iluminación"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción del artículo..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* FOTO */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">📸 Foto del Artículo</h3>

            {preview && (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-48 w-48 object-cover rounded-lg border-2 border-green-300"
                  onError={() => setPreview('')}
                />
                <p className="text-xs text-green-600 mt-2">✅ Foto cargada</p>
              </div>
            )}

            <div className="space-y-3">
              {/* CÁMARA - VISIBLE EN MÓVIL */}
              {!showCamera ? (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
                >
                  <Camera size={18} />
                  📱 Tomar Foto con Cámara
                </button>
              ) : (
                <div className="space-y-3 bg-white rounded-lg border-2 border-blue-400 p-4">
                  <div className="relative w-full rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      playsInline
                      autoPlay
                      muted
                      className="w-full h-80 object-cover"
                      style={{
                        transform: 'scaleX(-1)',
                        WebkitTransform: 'scaleX(-1)',
                      }}
                    />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={captureFoto}
                      disabled={uploading}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition"
                    >
                      {uploading ? '⏳ Subiendo...' : '✅ Capturar Foto'}
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* GALERÍA */}
              <label className="w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium transition"
                >
                  <UploadIcon size={18} />
                  📁 Seleccionar de Galería
                </button>
              </label>
            </div>

            {uploading && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm text-center">
                ⏳ Subiendo imagen, por favor espera...
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? '⏳ Guardando...' : '✅ Guardar Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}