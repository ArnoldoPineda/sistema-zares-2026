import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ClientesForm({ onSave, onClose, clienteEditando = null }) {
  const [formData, setFormData] = useState({
    nombre_usuario: '', // Alias de redes sociales - OPCIONAL
    nombre_completo: '', // Nombre real - OBLIGATORIO Y ÚNICO
    email: '',
    telefono: '',
    celular: '',
    documento_identidad: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    tipo_cliente: 'Regular',
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (clienteEditando) {
      setFormData(clienteEditando);
    }
  }, [clienteEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validación: Nombre del Cliente es OBLIGATORIO
    if (!formData.nombre_completo || formData.nombre_completo.trim() === '') {
      nuevosErrores.nombre_completo = 'El nombre del cliente es obligatorio';
    }

    // Validación: Nombre del Cliente debe tener al menos 3 caracteres
    if (formData.nombre_completo && formData.nombre_completo.trim().length < 3) {
      nuevosErrores.nombre_completo = 'El nombre debe tener al menos 3 caracteres';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Manejo de errores de BD (duplicate key, etc)
      if (error.message.includes('duplicate')) {
        setErrores({
          nombre_completo: 'Este cliente ya existe en el sistema',
        });
      } else {
        setErrores({
          general: error.message || 'Error al guardar el cliente',
        });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            👤 {clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 p-1 rounded transition"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error General */}
          {errores.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
              {errores.general}
            </div>
          )}

          {/* Sección: Nombre de Usuario (Alias) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              👤 Nombre de Usuario (Alias)
            </label>
            <input
              type="text"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleChange}
              placeholder="Ej: juan_perez, cliente001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional - Alias de redes sociales (Facebook, Instagram, etc)
            </p>
          </div>

          {/* Sección: Información Personal */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              👤 Información Personal
            </h3>

            {/* Nombre del Cliente - REQUERIDO Y ÚNICO */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez García"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errores.nombre_completo
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errores.nombre_completo && (
                <p className="text-red-500 text-xs mt-1">{errores.nombre_completo}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Campo obligatorio - Nombre real de la persona</p>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ej: juan@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Teléfono */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: 2236-1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Celular */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Celular</label>
              <input
                type="tel"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                placeholder="Ej: 9876-5432"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Documento de Identidad */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Documento de Identidad</label>
              <input
                type="text"
                name="documento_identidad"
                value={formData.documento_identidad}
                onChange={handleChange}
                placeholder="Ej: 0801-1990-12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Dirección */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej: Calle Principal 123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Ciudad */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Ej: Tegucigalpa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Departamento */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Departamento</label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                placeholder="Ej: Francisco Morazán"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Tipo de Cliente */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Cliente</label>
              <select
                name="tipo_cliente"
                value={formData.tipo_cliente}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Mayorista">Mayorista</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={cargando}
            >
              {cargando ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}