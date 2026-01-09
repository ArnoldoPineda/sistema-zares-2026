import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los clientes
  const fetchClientes = async () => {
    setCargando(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setClientes(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener clientes:', err);
    } finally {
      setCargando(false);
    }
  };

  // Crear cliente
  const crearCliente = async (clienteData) => {
    try {
      setError(null);

      // Validación: nombre_completo es obligatorio
      if (!clienteData.nombre_completo || clienteData.nombre_completo.trim() === '') {
        throw new Error('El nombre del cliente es obligatorio');
      }

      // Limpiar espacios en blanco
      const datosLimpios = {
        ...clienteData,
        nombre_completo: clienteData.nombre_completo.trim(),
        nombre_usuario: clienteData.nombre_usuario?.trim() || null, // null si está vacío
        email: clienteData.email?.trim() || null,
        telefono: clienteData.telefono?.trim() || null,
        celular: clienteData.celular?.trim() || null,
        documento_identidad: clienteData.documento_identidad?.trim() || null,
        direccion: clienteData.direccion?.trim() || null,
        ciudad: clienteData.ciudad?.trim() || null,
        departamento: clienteData.departamento?.trim() || null,
      };

      const { data, error: createError } = await supabase
        .from('clientes')
        .insert([datosLimpios])
        .select()
        .single();

      if (createError) {
        // Manejo específico de errores de Supabase
        if (createError.code === '23505') {
          // Violación de unique constraint
          if (createError.message.includes('nombre_completo')) {
            throw new Error('Este cliente ya existe en el sistema (nombre duplicado)');
          } else if (createError.message.includes('nombre_usuario')) {
            throw new Error('Este alias de usuario ya está en uso');
          }
          throw new Error('Datos duplicados detectados');
        }
        throw new Error(createError.message);
      }

      // Actualizar lista local
      setClientes([data, ...clientes]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Actualizar cliente
  const actualizarCliente = async (id, clienteData) => {
    try {
      setError(null);

      // Validación: nombre_completo es obligatorio
      if (!clienteData.nombre_completo || clienteData.nombre_completo.trim() === '') {
        throw new Error('El nombre del cliente es obligatorio');
      }

      // Limpiar espacios en blanco
      const datosLimpios = {
        ...clienteData,
        nombre_completo: clienteData.nombre_completo.trim(),
        nombre_usuario: clienteData.nombre_usuario?.trim() || null,
        email: clienteData.email?.trim() || null,
        telefono: clienteData.telefono?.trim() || null,
        celular: clienteData.celular?.trim() || null,
        documento_identidad: clienteData.documento_identidad?.trim() || null,
        direccion: clienteData.direccion?.trim() || null,
        ciudad: clienteData.ciudad?.trim() || null,
        departamento: clienteData.departamento?.trim() || null,
      };

      const { data, error: updateError } = await supabase
        .from('clientes')
        .update(datosLimpios)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === '23505') {
          if (updateError.message.includes('nombre_completo')) {
            throw new Error('Este nombre de cliente ya existe en el sistema');
          }
        }
        throw new Error(updateError.message);
      }

      // Actualizar lista local
      setClientes(clientes.map((c) => (c.id === id ? data : c)));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Eliminar cliente
  const eliminarCliente = async (id) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Actualizar lista local
      setClientes(clientes.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Buscar clientes
  const buscarClientes = async (termino) => {
    try {
      setError(null);

      if (!termino || termino.trim() === '') {
        await fetchClientes();
        return;
      }

      const { data, error: searchError } = await supabase
        .from('clientes')
        .select('*')
        .or(
          `nombre_completo.ilike.%${termino}%,nombre_usuario.ilike.%${termino}%,email.ilike.%${termino}%,telefono.ilike.%${termino}%,celular.ilike.%${termino}%`
        )
        .order('created_at', { ascending: false });

      if (searchError) {
        throw new Error(searchError.message);
      }

      setClientes(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error al buscar clientes:', err);
    }
  };

  // Obtener cliente por ID
  const obtenerClientePorId = async (id) => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Contar total de clientes
  const contarClientes = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(countError.message);
      }

      return count;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Filtrar por tipo de cliente
  const filtrarPorTipo = async (tipo) => {
    try {
      setError(null);

      const { data, error: filterError } = await supabase
        .from('clientes')
        .select('*')
        .eq('tipo_cliente', tipo)
        .order('created_at', { ascending: false });

      if (filterError) {
        throw new Error(filterError.message);
      }

      setClientes(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error al filtrar clientes:', err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    cargando,
    error,
    fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
    obtenerClientePorId,
    contarClientes,
    filtrarPorTipo,
  };
};