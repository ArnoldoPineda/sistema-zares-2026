import React, { useState, useEffect } from 'react';
import ArticulosTable from './ArticulosTable';
import ArticulosForm from './ArticulosForm';
import { useArticulos } from '../../hooks/useArticulos';
import { Plus } from 'lucide-react';

export default function ArticulosPage() {
  const {
    articulos,
    loading,
    error,
    totalCount,
    fetchArticulos,
    createArticulo,
    updateArticulo,
    deleteArticulo,
  } = useArticulos();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArticulo, setEditingArticulo] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 10;

  // Cargar artículos cuando cambia página, búsqueda o refreshKey
  useEffect(() => {
    console.log('📌 Cargando artículos... página:', page, 'búsqueda:', searchTerm);
    fetchArticulos(page, searchTerm, itemsPerPage);
  }, [page, searchTerm, refreshKey]);

  const handleAddNew = () => {
    setEditingArticulo(null);
    setShowForm(true);
  };

  const handleEdit = (articulo) => {
    setEditingArticulo(articulo);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingArticulo(null);
  };

  const handleSaveArticulo = async (formData) => {
    console.log('💾 handleSaveArticulo llamado con:', formData);
    
    try {
      if (editingArticulo) {
        console.log('✏️ Editando artículo:', editingArticulo.id);
        const result = await updateArticulo(editingArticulo.id, formData);
        console.log('Resultado actualización:', result);
      } else {
        console.log('➕ Creando nuevo artículo');
        const result = await createArticulo(formData);
        console.log('Resultado creación:', result);
      }
      
      // ✅ IMPORTANTE: Esperar y refrescar lista
      setTimeout(() => {
        console.log('🔄 Refrescando lista de artículos...');
        handleCloseForm();
        setPage(1);
        setRefreshKey(prev => prev + 1);
      }, 800);
    } catch (err) {
      console.error('❌ Error en handleSaveArticulo:', err);
    }
  };

  const handleDeleteArticulo = async (id) => {
    console.log('🗑️ Eliminando artículo:', id);
    const result = await deleteArticulo(id);
    if (result.success) {
      console.log('✅ Artículo eliminado, refrescando...');
      setPage(1);
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">📦 Artículos</h1>
          <p className="text-gray-600 mt-2">Gestiona tu inventario de productos</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Plus size={20} />
          Nuevo Artículo
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ❌ Error: {error}
        </div>
      )}

      {/* Tabla */}
      <ArticulosTable
        articulos={articulos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteArticulo}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        page={page}
        onPageChange={setPage}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
      />

      {/* Form Modal */}
      {showForm && (
        <ArticulosForm
          articulo={editingArticulo}
          onSave={handleSaveArticulo}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}