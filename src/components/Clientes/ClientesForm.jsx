import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ClientesForm({ cliente, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    nombre_completo: '',
    email: '',
    telefono: '',
    celular: '',
    empresa: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    pais: 'Honduras',
    documento_identidad: '',
    tipo_cliente: 'Normal',
    limite_credito: '',
    dias_credito: '',
    notas: '',
    activo: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre_usuario: cliente.nombre_usuario || '',
        nombre_completo: cliente.nombre_completo || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        celular: cliente.celular || '',
        empresa: cliente.empresa || '',
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
        departamento: cliente.departamento || '',
        pais: cliente.pais || 'Honduras',
        documento_identidad: cliente.documento_identidad || '',
        tipo_cliente: cliente.tipo_cliente || 'Normal',
        limite_credito: cliente.limite_credito || '',
        dias_credito: cliente.dias_credito || '',
        notas: cliente.notas || '',
        activo: cliente.activo !== false,
      });
    }
  }, [cliente]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_usuario.trim()) newErrors.nombre_usuario = 'El nombre de usuario es requerido';
    if (!formData.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre completo es requerido';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSave({
      ...formData,
      limite_credito: formData.limite_credito ? parseFloat(formData.limite_credito) : 0,
      dias_credito: formData.dias_credito ? parseInt(formData.dias_credito) : 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {cliente ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
          </h2>
          <button onClick={onClose} className="hover:bg-green-700 p-2 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECCIÓN 0: Nombre de Usuario */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Nombre de Usuario</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleChange}
                placeholder="Ej: juan_perez, cliente001"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.nombre_usuario
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.nombre_usuario && <p className="text-red-500 text-sm mt-1">{errors.nombre_usuario}</p>}
            </div>
          </div>

          {/* SECCIÓN 1: Información Personal */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre Completo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez García"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.nombre_completo
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                />
                {errors.nombre_completo && <p className="text-red-500 text-sm mt-1">{errors.nombre_completo}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ej: juan@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 2234-5678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Celular */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Celular
                </label>
                <input
                  type="tel"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="Ej: 98765432"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Documento Identidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento de Identidad
                </label>
                <input
                  type="text"
                  name="documento_identidad"
                  value={formData.documento_identidad}
                  onChange={handleChange}
                  placeholder="Ej: 0801-1990-00001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Información de Dirección */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📍 Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección completa"
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ej: Tegucigalpa"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.ciudad
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                />
                {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  placeholder="Ej: Francisco Morazán"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <input
                  type="text"
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Información Comercial */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">💼 Información Comercial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  placeholder="Nombre de la empresa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Tipo Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cliente
                </label>
                <select
                  name="tipo_cliente"
                  value={formData.tipo_cliente}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="VIP">VIP</option>
                  <option value="Mayorista">Mayorista</option>
                </select>
              </div>

              {/* Límite Crédito */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de Crédito (L.)
                </label>
                <input
                  type="number"
                  name="limite_credito"
                  value={formData.limite_credito}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Días de Crédito */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de Crédito
                </label>
                <input
                  type="number"
                  name="dias_credito"
                  value={formData.dias_credito}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Notas y Estado */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Notas y Estado</h3>
            <div className="space-y-4">
              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  placeholder="Observaciones sobre el cliente..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Activo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Cliente Activo
                </label>
              </div>
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}