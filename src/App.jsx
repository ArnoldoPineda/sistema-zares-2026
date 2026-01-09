import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useClientes } from './hooks/useClientes';
import { useVentas } from './hooks/useVentas';
import { useReportes } from './hooks/useReportes';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Layout from './components/Layout/Layout';
import ArticulosPage from './components/Articulos/ArticulosPage';
import ClientesTable from './components/Clientes/ClientesTable';
import ClientesForm from './components/Clientes/ClientesForm';
import VentasTable from './components/Ventas/VentasTable';
import VentasForm from './components/Ventas/VentasForm';
import CobroModal from './components/Ventas/CobroModal';
import PagosPage from './components/Pagos/PagosPage';
import EtiquetasVentas from './components/Reports/EtiquetasVentas';
import ReporteVentas from './components/Reports/ReporteVentas';
import ReporteClientes from './components/Reports/ReporteClientes';
import { Plus, Eye, X, Trash2 } from 'lucide-react';

// ============================================================
// DASHBOARD
// ============================================================
import Dashboard from './components/Dashboard/Dashboard';

function DashboardPage() {
  return <Dashboard />;
}

// ============================================================
// CLIENTES
// ============================================================
function ClientesPage() {
  const {
    clientes,
    loading,
    error,
    totalCount,
    fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
  } = useClientes();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClientes(page, searchTerm, itemsPerPage);
  }, [page, searchTerm]);

  const handleAddNew = () => {
    setEditingCliente(null);
    setShowForm(true);
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCliente(null);
  };

  const handleSaveCliente = async (formData) => {
    try {
      if (editingCliente) {
        await actualizarCliente(editingCliente.id, formData);
        handleCloseForm();
        setPage(1);
        await fetchClientes(1, searchTerm, itemsPerPage);
      } else {
        await crearCliente(formData);
        handleCloseForm();
        setPage(1);
        await fetchClientes(1, searchTerm, itemsPerPage);
      }
    } catch (err) {
      console.error('Error al guardar cliente:', err);
    }
  };

  const handleDeleteCliente = async (id) => {
    await eliminarCliente(id);
    await fetchClientes(page, searchTerm, itemsPerPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">👥 Clientes</h1>
          <p className="text-gray-600 mt-2">Administra tu base de clientes</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ❌ Error: {error}
        </div>
      )}

      <ClientesTable
        clientes={clientes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteCliente}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        page={page}
        onPageChange={setPage}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
      />

      {showForm && (
        <ClientesForm
          clienteEditando={editingCliente}
          onSave={handleSaveCliente}
          onClose={handleCloseForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900">👥 Total de Clientes</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalCount}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-bold text-purple-900">⭐ Clientes VIP</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {clientes.filter(c => c.tipo_cliente === 'VIP').length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-900">📦 Mayoristas</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {clientes.filter(c => c.tipo_cliente === 'Mayorista').length}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VENTAS
// ============================================================
function VentasPage() {
  const {
    ventas,
    ventaDetalles,
    cobros,
    loading,
    error,
    totalCount,
    fetchVentas,
    fetchVentaDetalles,
    createVenta,
    deleteVenta,
    createCobro,
    deleteCobro,
  } = useVentas();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormVenta, setShowFormVenta] = useState(false);
  const [editingVenta, setEditingVenta] = useState(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showCobroModal, setShowCobroModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVentas(page, searchTerm, itemsPerPage);
  }, [page, searchTerm, refreshKey]);

  const handleAddNew = () => {
    setEditingVenta(null);
    setShowFormVenta(true);
  };

  // ✅ NUEVA FUNCIÓN: handleEdit para editar ventas
  const handleEdit = (venta) => {
    console.log('📝 Editando venta:', venta);
    setEditingVenta(venta);
    setShowFormVenta(true);
  };

  const handleCloseForm = () => {
    setShowFormVenta(false);
    setEditingVenta(null);
  };

  const handleViewDetails = async (venta) => {
    await fetchVentaDetalles(venta.id);
    setShowDetallesModal(true);
  };

  const handleSaveVenta = async (formData) => {
    console.log('=== handleSaveVenta ===');
    console.log('Datos recibidos:', formData);
    
    try {
      const detallesArray = formData.detalles.map(det => ({
        articulo_id: det.articulo_id,
        cantidad: det.cantidad,
        precio_unitario: det.precio_unitario,
        subtotal: det.subtotal,
      }));
      console.log('Detalles preparados:', detallesArray);
      console.log('Cliente ID:', formData.clienteId);
      
      const result = await createVenta(formData.clienteId, detallesArray, formData.observaciones);
      
      console.log('Resultado createVenta:', result);
      if (result.success) {
        console.log('✅ Venta creada exitosamente');
        console.log('Venta ID:', result.ventaId);
        
        handleCloseForm();
        await new Promise(resolve => setTimeout(resolve, 500));
        setPage(1);
        setRefreshKey(prev => prev + 1);
        
        return { success: true };
      } else {
        console.error('❌ Error al crear venta:', result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ Error en handleSaveVenta:', err);
      return { success: false, error: err.message };
    }
  };

  const handleSaveCobro = async (cobroData) => {
    const result = await createCobro(ventaDetalles.id, cobroData);
    if (result.success) {
      await fetchVentaDetalles(ventaDetalles.id);
      setShowCobroModal(false);
      setRefreshKey(prev => prev + 1);
      await fetchVentas(page, searchTerm, itemsPerPage);
    }
  };

  const handleDeleteVenta = async (id) => {
    await deleteVenta(id);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteCobro = async (cobroId) => {
    await deleteCobro(cobroId, ventaDetalles.id);
  };

  const calcularTotalVenta = () => {
    return ventaDetalles?.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">🛒 Ventas</h1>
          <p className="text-gray-600 mt-2">Registra y gestiona tus ventas</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
        >
          <Plus size={20} />
          Nueva Venta
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ❌ Error: {error}
        </div>
      )}

      <VentasTable
        key={refreshKey}
        ventas={ventas}
        loading={loading}
        onEdit={handleEdit}
        onViewDetails={handleViewDetails}
        onDelete={handleDeleteVenta}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        page={page}
        onPageChange={setPage}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
      />

      {showFormVenta && (
        <VentasForm
          venta={editingVenta}
          onSave={handleSaveVenta}
          onClose={handleCloseForm}
          isLoading={loading}
        />
      )}

      {showDetallesModal && ventaDetalles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">📋 Detalles de Venta</h2>
              <button onClick={() => setShowDetallesModal(false)} className="text-2xl hover:bg-purple-700 p-2 rounded">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Cliente</p>
                    <p className="font-bold text-gray-900">{ventaDetalles.clientes?.nombre || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Fecha</p>
                    <p className="font-bold text-gray-900">
                      {new Date(ventaDetalles.fecha_venta).toLocaleDateString('es-HN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total</p>
                    <p className="font-bold text-gray-900">
                      L. {calcularTotalVenta().toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Estado</p>
                    <p className="font-bold text-gray-900">{ventaDetalles.estado}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Artículos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Artículo</th>
                        <th className="px-4 py-2 text-center">Cantidad</th>
                        <th className="px-4 py-2 text-right">Precio</th>
                        <th className="px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventaDetalles.detalles_venta?.map((det, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{det.articulos?.nombre || 'N/A'}</td>
                          <td className="px-4 py-2 text-center">{det.cantidad}</td>
                          <td className="px-4 py-2 text-right">L. {det.precio_unitario.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">L. {det.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Cobros Registrados</h3>
                  <button
                    onClick={() => setShowCobroModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
                  >
                    + Registrar Cobro
                  </button>
                </div>
                {cobros.length === 0 ? (
                  <p className="text-gray-500">No hay cobros registrados aún</p>
                ) : (
                  <div className="space-y-2">
                    {cobros.map((cobro) => (
                      <div key={cobro.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">{cobro.liquidacion}</p>
                          <p className="text-sm text-gray-600">L. {(cobro.monto_pagado + (cobro.pago_delivery || 0)).toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCobro(cobro.id)}
                          className="text-red-600 hover:bg-red-100 p-2 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDetallesModal(false)}
                className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCobroModal && ventaDetalles && (
        <CobroModal
          venta={ventaDetalles}
          onSave={handleSaveCobro}
          onClose={() => setShowCobroModal(false)}
          isLoading={loading}
        />
      )}
    </div>
  );
}

// ============================================================
// REPORTES
// ============================================================
function ReportesPage() {
  const [activeTab, setActiveTab] = useState('etiquetas');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('etiquetas')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'etiquetas'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏷️ Etiquetas
        </button>
        <button
          onClick={() => setActiveTab('ventas')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'ventas'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Ventas
        </button>
        <button
          onClick={() => setActiveTab('clientes')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'clientes'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Clientes
        </button>
      </div>

      {activeTab === 'etiquetas' && <EtiquetasVentas />}
      {activeTab === 'ventas' && <ReporteVentas />}
      {activeTab === 'clientes' && <ReporteClientes />}
    </div>
  );
}

// ============================================================
// RUTAS PROTEGIDAS
// ============================================================
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/articulos"
            element={
              <ProtectedRoute>
                <Layout>
                  <ArticulosPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClientesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ventas"
            element={
              <ProtectedRoute>
                <Layout>
                  <VentasPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pagos"
            element={
              <ProtectedRoute>
                <Layout>
                  <PagosPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}