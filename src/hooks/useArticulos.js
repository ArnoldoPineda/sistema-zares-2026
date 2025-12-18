import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useArticulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Obtener artículos con paginación
  const fetchArticulos = async (page = 1, searchTerm = '', limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('articulos')
        .select('*', { count: 'exact' });

      // Filtro de búsqueda
      if (searchTerm) {
        query = query.or(
          `nombre.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`
        );
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error: err, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (err) throw err;

      setArticulos(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener artículos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo artículo
  const createArticulo = async (articuloData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('articulos')
        .insert([articuloData])
        .select();

      if (err) throw err;

      setArticulos([data[0], ...articulos]);
      return { success: true, data: data[0] };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar artículo
  const updateArticulo = async (id, articuloData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('articulos')
        .update(articuloData)
        .eq('id', id)
        .select();

      if (err) throw err;

      setArticulos(articulos.map(a => a.id === id ? data[0] : a));
      return { success: true, data: data[0] };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar artículo
  const deleteArticulo = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase
        .from('articulos')
        .delete()
        .eq('id', id);

      if (err) throw err;

      setArticulos(articulos.filter(a => a.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Subir foto a Storage
  const uploadFoto = async (articuloId, file) => {
    try {
      setLoading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${articuloId}-${Date.now()}.${fileExt}`;
      const filePath = `articulos/${fileName}`;

      // Subir a Storage
      const { error: uploadError } = await supabase.storage
        .from('articulos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage
        .from('articulos')
        .getPublicUrl(filePath);

      // Actualizar BD con URL
      const { data: updated, error: updateError } = await supabase
        .from('articulos')
        .update({ foto_url: data.publicUrl })
        .eq('id', articuloId)
        .select();

      if (updateError) throw updateError;

      // Actualizar estado local
      setArticulos(articulos.map(a => a.id === articuloId ? updated[0] : a));

      return { success: true, url: data.publicUrl };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    articulos,
    loading,
    error,
    totalCount,
    fetchArticulos,
    createArticulo,
    updateArticulo,
    deleteArticulo,
    uploadFoto,
  };
};