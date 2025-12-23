import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';

export default function ClientesForm({ cliente, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    nombre_completo: '',
    email: '',
    telefono: '',
    celular: '',
    documento_identidad: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    tipo_cliente: 'Regular',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre_usuario: cliente.nombre_usuario || '',
        nombre_completo: cliente.nombre_completo || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        celular: cliente.celular || '',
        documento_identidad: cliente.documento_identidad || '',
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
        departamento: cliente.departamento || '',
        tipo_cliente: cliente.tipo_cliente || 'Regular',
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      // ✅ SOLO validar que nombre_completo no esté vacío
      if (!formData.nombre_completo.trim()) {
        throw new Error('El nombre del cliente es requerido');
      }

      // ✅ Preparar datos para enviar (todos opcionales excepto nombre)
      const submitData = {
        nombre_usuario: formData.nombre_usuario && formData.nombre_usuario.trim() ? formData.nombre_usuario.trim() : null,
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email && formData.email.trim() ? formData.email.trim() : null,
        telefono: formData.telefono && formData.telefono.trim() ? formData.telefono.trim() : null,
        celular: formData.celular && formData.celular.trim() ? formData.celular.trim() : null,
        documento_identidad: formData.documento_identidad && formData.documento_identidad.trim() ? formData.documento_identidad.trim() : null,
        direccion: formData.direccion && formData.direccion.trim() ? formData.direccion.trim() : null,
        ciudad: formData.ciudad && formData.ciudad.trim() ? formData.ciudad.trim() : null,
        departamento: formData.departamento && formData.departamento.trim() ? formData.departamento.trim() : null,
        tipo_cliente: formData.tipo_cliente,
      };

      console.log('📝 Datos a guardar:', submitData);

      const result = await onSave(submitData);

      if (result && result.success === false) {
        throw new Error(result.error || 'Error al guardar cliente');
      }

      onClose();
    } catch (err) {
      setError(err?.message || 'Error al guardar cliente');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-800 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User size={28} />
            <h2 className="text-2xl font-bold">
              {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
          </div>
          <button onClick={onClose} className="text-2xl hover:bg-green-700 p-2 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ {error}
            </div>
          )}

          {/* NOMBRE DE USUARIO */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Nombre de Usuario</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleChange}
                placeholder="Ej: juan_perez, cliente001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Identificador único del cliente (opcional)</p>
            </div>
          </div>

          {/* INFORMACIÓN PERSONAL */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Información Personal</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez García"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ej: juan@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 2234-5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Celular
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    placeholder="Ej: 98765432"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documento de Identidad
                  </label>
                  <input
                    type="text"
                    name="documento_identidad"
                    value={formData.documento_identidad}
                    onChange={handleChange}
                    placeholder="Ej: 0801-1990-00001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* UBICACIÓN */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-red-500" />
              <h3 className="text-lg font-bold text-gray-900">Ubicación</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección completa"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    placeholder="Ej: Tegucigalpa"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    placeholder="Ej: Francisco Morazán"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TIPO DE CLIENTE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cliente
            </label>
            <select
              name="tipo_cliente"
              value={formData.tipo_cliente}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="Mayorista">Mayorista</option>
            </select>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {loading || isLoading ? '⏳ Guardando...' : '✅ Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}