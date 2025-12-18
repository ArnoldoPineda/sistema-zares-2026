import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CobroModal({ venta, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    fecha_pago: new Date().toISOString().split('T')[0],
    liquidacion: 'EFECTIVO',
    monto_pagado: '',
    banco: '',
    envio: '',
    pago_delivery: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});

  const liquidaciones = [
    'EFECTIVO',
    'BANCOS',
    'LINK PAGO',
    'CRÉDITO',
    'PENDIENTE',
    'Depósito Iczer',
    'Depósito Cesar',
    'Paquete pendiente',
  ];

  const bancos = [
    'ATLANTIDA',
    'CUSCATLAN',
    'BAC',
    'OCCIDENTE',
    'BANPAIS',
  ];

  const envios = [
    'CESAR',
    'CARGO',
    'Harry',
    'Recoge en bodega',
  ];

  // Calcular total desde detalles_venta
  const calcularTotalVenta = () => {
    return venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
  };

  // Calcular total cobrado
  const calcularTotalCobrado = () => {
    return venta.cobros?.reduce((sum, c) => sum + (c.monto_pagado + c.pago_delivery), 0) || 0;
  };

  const totalVenta = calcularTotalVenta();
  const totalCobrado = calcularTotalCobrado();
  const pendiente = totalVenta - totalCobrado;

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.monto_pagado) {
      newErrors.monto_pagado = 'El monto es requerido';
    } else if (parseFloat(formData.monto_pagado) <= 0) {
      newErrors.monto_pagado = 'El monto debe ser mayor a 0';
    }

    if (formData.liquidacion === 'BANCOS' && !formData.banco) {
      newErrors.banco = 'Selecciona un banco';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // ⭐ CAMBIO AQUÍ: Enviar con nombres correctos (camelCase sin underscore)
    onSave({
      liquidacion: formData.liquidacion,
      montoPagado: parseFloat(formData.monto_pagado),  // ✅ montoPagado (sin underscore)
      pagoDelivery: parseFloat(formData.pago_delivery) || 0,  // ✅ pagoDelivery (sin underscore)
      banco: formData.banco || null,
      envio: formData.envio || null,
      observaciones: formData.observaciones || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">💰 Registrar Cobro</h2>
          <button onClick={onClose} className="hover:bg-purple-700 p-2 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Información de la Venta */}
        <div className="bg-purple-50 border-b border-purple-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-purple-600 font-medium">Cliente</p>
              <p className="font-bold text-gray-900">{venta.clientes?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Venta</p>
              <p className="font-bold text-gray-900">L. {totalVenta.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Cobrado</p>
              <p className="font-bold text-green-600">
                L. {totalCobrado.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Pendiente</p>
              <p className="font-bold text-red-600">
                L. {pendiente.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fecha de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Pago *
            </label>
            <input
              type="date"
              name="fecha_pago"
              value={formData.fecha_pago}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Grid de dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liquidación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liquidación *
              </label>
              <select
                name="liquidacion"
                value={formData.liquidacion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {liquidaciones.map(liq => (
                  <option key={liq} value={liq}>{liq}</option>
                ))}
              </select>
            </div>

            {/* Banco (visible si liquidacion = BANCOS) */}
            {formData.liquidacion === 'BANCOS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banco *
                </label>
                <select
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.banco
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-purple-500'
                  }`}
                >
                  <option value="">Selecciona un banco</option>
                  {bancos.map(banco => (
                    <option key={banco} value={banco}>{banco}</option>
                  ))}
                </select>
                {errors.banco && <p className="text-red-500 text-sm mt-1">{errors.banco}</p>}
              </div>
            )}
          </div>

          {/* Monto Pagado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Pagado (L.) *
            </label>
            <input
              type="number"
              name="monto_pagado"
              value={formData.monto_pagado}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.monto_pagado
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
            />
            {errors.monto_pagado && <p className="text-red-500 text-sm mt-1">{errors.monto_pagado}</p>}
          </div>

          {/* Grid Envío + Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Envío */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Envío (Quién entrega)
              </label>
              <select
                name="envio"
                value={formData.envio}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Sin envío</option>
                {envios.map(envio => (
                  <option key={envio} value={envio}>{envio}</option>
                ))}
              </select>
            </div>

            {/* Pago Delivery */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pago Delivery (L.) - Se suma al monto
              </label>
              <input
                type="number"
                name="pago_delivery"
                value={formData.pago_delivery}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas sobre el cobro..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Resumen */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium mb-2">Resumen del Cobro:</p>
            <p className="text-2xl font-bold text-purple-900">
              L. {(parseFloat(formData.monto_pagado) + parseFloat(formData.pago_delivery) || 0).toFixed(2)}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Monto: L. {parseFloat(formData.monto_pagado || 0).toFixed(2)} + Delivery: L. {parseFloat(formData.pago_delivery || 0).toFixed(2)}
            </p>
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-400"
            >
              {isLoading ? 'Guardando...' : 'Registrar Cobro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}