import { useState } from 'react';
import { usePagos } from '../../hooks/usePagos';

export default function PagosForm() {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    nombre_clienta: '',
    monto: '',
    banco: 'BAC',
    ubicacion: 'CARGO',
    estado: 'pendiente',
    foto_url: '',
  });

  const { createPago, loading } = usePagos();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPago({
      ...formData,
      monto: parseFloat(formData.monto),
    });
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      nombre_clienta: '',
      monto: '',
      banco: 'BAC',
      ubicacion: 'CARGO',
      estado: 'pendiente',
      foto_url: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Registrar Pago</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Nombre Clienta</label>
          <input
            type="text"
            name="nombre_clienta"
            value={formData.nombre_clienta}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Monto (L.)</label>
          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Banco</label>
          <select
            name="banco"
            value={formData.banco}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option>BAC</option>
            <option>Atlántida</option>
            <option>Occidente</option>
            <option>Link de Pago</option>
            <option>Efectivo</option>
            <option>Delivery</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Ubicación</label>
          <select
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option>CARGO</option>
            <option>TEGUCIGALPA</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Guardando...' : 'Registrar Pago'}
      </button>
    </form>
  );
}