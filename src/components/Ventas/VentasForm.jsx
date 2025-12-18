import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

export default function VentasForm({ venta, onSave, onClose, isLoading }) {
  const [clienteId, setClienteId] = useState('');
  const [clientes, setClientes] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClientes();
    fetchArticulos();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error: err } = await supabase
        .from('clientes')
        .select('id, nombre')
        .order('nombre');
      
      if (err) throw err;
      setClientes(data || []);
    } catch (err) {
      console.error('Error al obtener clientes:', err);
      setError('Error al cargar clientes');
    }
  };

  const fetchArticulos = async () => {
    try {
      const { data, error: err } = await supabase
        .from('articulos')
        .select('*')
        .order('nombre');
      
      if (err) throw err;

      console.log('Artículos cargados:', data);
      setArticulos(data || []);
      setError('');
    } catch (err) {
      console.error('Error al obtener artículos:', err);
      setError('Error al cargar artículos: ' + err.message);
    }
  };

  const agregarDetalle = () => {
    setDetalles([
      ...detalles,
      {
        articulo_id: '',
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0,
        nombre: '',
        stockDisponible: 0,
      },
    ]);
  };

  const actualizarDetalle = (index, campo, valor) => {
    console.log(`Actualizando detalle ${index}, campo: ${campo}, valor: ${valor}`);
    
    const nuevosDetalles = [...detalles];
    const detalle = nuevosDetalles[index];

    if (campo === 'articulo_id') {
      const articulo = articulos.find(a => a.id === valor);
      if (articulo) {
        detalle.articulo_id = articulo.id;
        detalle.nombre = articulo.nombre;
        // Usar cantidad_stock, no stock
        detalle.precio_unitario = articulo.precio_unitario || articulo.precio_venta || articulo.precio || 0;
        detalle.stockDisponible = articulo.cantidad_stock || 0;
        detalle.cantidad = 1;
        detalle.subtotal = detalle.precio_unitario;
        setError('');
        console.log('Artículo seleccionado:', detalle);
      }
    } 
    else if (campo === 'cantidad') {
      const cantidad = parseInt(valor) || 0;
      console.log(`Stock disponible: ${detalle.stockDisponible}, Cantidad solicitada: ${cantidad}`);
      
      if (cantidad > detalle.stockDisponible) {
        setError(
          `❌ Stock insuficiente para "${detalle.nombre}". Solo hay ${detalle.stockDisponible} disponible.`
        );
        console.log('Stock insuficiente');
        return;
      }
      
      setError('');
      detalle.cantidad = cantidad;
      detalle.subtotal = detalle.cantidad * detalle.precio_unitario;
      console.log('Cantidad actualizada:', detalle);
    } 
    else if (campo === 'precio_unitario') {
      const precio = parseFloat(valor) || 0;
      detalle.precio_unitario = precio;
      detalle.subtotal = detalle.cantidad * detalle.precio_unitario;
      console.log('Precio actualizado:', detalle);
    }

    nuevosDetalles[index] = detalle;
    setDetalles(nuevosDetalles);
  };

  const eliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
    setError('');
  };

  const handleSave = async () => {
    if (!clienteId) {
      setError('Selecciona un cliente');
      return;
    }

    if (detalles.length === 0) {
      setError('Agrega al menos un artículo');
      return;
    }

    const detallesCompletos = detalles.every(d => d.articulo_id);
    if (!detallesCompletos) {
      setError('Todos los artículos deben estar seleccionados');
      return;
    }

    for (const detalle of detalles) {
      if (detalle.cantidad > detalle.stockDisponible) {
        setError(
          `❌ Stock insuficiente para "${detalle.nombre}". Solo hay ${detalle.stockDisponible} disponible.`
        );
        return;
      }
    }

    setLoading(true);
    const result = await onSave({
      clienteId,
      detalles,
      observaciones,
    });

    if (result.success) {
      setError('');
      onClose();
    } else {
      setError(result.error || 'Error al crear la venta');
    }
    setLoading(false);
  };

  const total = detalles.reduce((sum, d) => sum + (d.subtotal || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">🛒 Nueva Venta</h2>
          <button onClick={onClose} className="text-2xl hover:bg-orange-700 p-2 rounded">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-red-600" />
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Cliente *
            </label>
            <select
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Selecciona cliente --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Artículos ({articulos.length})</h3>
              <button
                onClick={agregarDetalle}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus size={18} />
                Agregar Artículo
              </button>
            </div>

            {detalles.length === 0 ? (
              <p className="text-gray-500">No hay artículos agregados</p>
            ) : (
              <div className="space-y-4">
                {detalles.map((detalle, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Artículo
                        </label>
                        <select
                          value={detalle.articulo_id || ''}
                          onChange={e =>
                            actualizarDetalle(idx, 'articulo_id', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">-- Selecciona --</option>
                          {articulos.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.nombre} (Stock: {a.cantidad_stock || 0})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Cantidad
                          {detalle.stockDisponible > 0 && (
                            <span className="text-blue-600">
                              {' '}
                              (Máx: {detalle.stockDisponible})
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={detalle.stockDisponible || 999}
                          value={detalle.cantidad}
                          onChange={e =>
                            actualizarDetalle(idx, 'cantidad', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Precio Unitario
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={detalle.precio_unitario}
                          onChange={e =>
                            actualizarDetalle(idx, 'precio_unitario', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Subtotal
                        </label>
                        <input
                          type="text"
                          value={`L. ${detalle.subtotal.toFixed(2)}`}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => eliminarDetalle(idx)}
                        className="text-red-600 hover:bg-red-100 p-2 rounded text-sm font-semibold"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Notas adicionales sobre la venta..."
            />
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
            <p className="text-sm text-orange-700">Total a cobrar:</p>
            <p className="text-3xl font-bold text-orange-600">
              L. {total.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || isLoading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50"
            >
              {loading || isLoading ? 'Guardando...' : 'Guardar Venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}