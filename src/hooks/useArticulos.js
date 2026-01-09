import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

export const useArticulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchArticulos = async (page = 1, searchTerm = '', limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('articulos')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(
          `nombre.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`
        );
      }

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

  return {
    articulos,
    loading,
    error,
    totalCount,
    fetchArticulos,
    createArticulo,
    updateArticulo,
    deleteArticulo,
  };
};