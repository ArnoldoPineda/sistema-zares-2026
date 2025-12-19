import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Obtener clientes con paginación
  const fetchClientes = async (page = 1, searchTerm = '', limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('clientes')
        .select('*', { count: 'exact' });

      // Filtro de búsqueda
      if (searchTerm) {
        query = query.or(
          `nombre_completo.ilike.%${searchTerm}%,nombre_usuario.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%,ciudad.ilike.%${searchTerm}%`
        );
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error: err, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (err) throw err;

      setClientes(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo cliente
  const createCliente = async (clienteData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select();

      if (err) throw err;

      setClientes([data[0], ...clientes]);
      return { success: true, data: data[0] };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cliente
  const updateCliente = async (id, clienteData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .select();

      if (err) throw err;

      setClientes(clientes.map(c => c.id === id ? data[0] : c));
      return { success: true, data: data[0] };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cliente
  const deleteCliente = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (err) throw err;

      setClientes(clientes.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    clientes,
    loading,
    error,
    totalCount,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
};