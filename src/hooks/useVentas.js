import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const useVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventaDetalles, setVentaDetalles] = useState(null);
  const [cobros, setCobros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validar stock disponible antes de crear venta
  const validarStock = async (articulos) => {
    try {
      for (const articulo of articulos) {
        const { data: art, error: err } = await supabase
          .from('articulos')
          .select('cantidad_stock, nombre')
          .eq('id', articulo.articulo_id)
          .single();

        if (err) throw err;

        if (art.cantidad_stock < articulo.cantidad) {
          return {
            valido: false,
            mensaje: `Stock insuficiente para "${art.nombre}". Solo hay ${art.cantidad_stock} en stock.`,
          };
        }
      }

      return { valido: true };
    } catch (err) {
      console.error('Error validando stock:', err);
      return { valido: false, mensaje: err.message };
    }
  };

  // Obtener todas las ventas
  const fetchVentas = async (page = 1, searchTerm = '', itemsPerPage = 10) => {
    try {
      setLoading(true);
      setError(null);

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('ventas')
        .select(
          `
          id,
          fecha_venta,
          estado,
          clientes(nombre, ciudad),
          detalles_venta(cantidad, subtotal),
          cobros(liquidacion, banco, monto_pagado, pago_delivery)
        `,
          { count: 'exact' }
        )
        .order('fecha_venta', { ascending: false })
        .range(from, to);

      if (searchTerm) {
        query = query.or(`clientes.nombre.ilike.%${searchTerm}%`);
      }

      const { data, error: err, count } = await query;

      if (err) throw err;

      console.log('=== fetchVentas DEBUG ===');
      console.log('Datos crudos de Supabase:', data);

      // ⭐ CORRECCIÓN: Mantener la misma estructura que espera VentasTable
      const ventasProcessadas = data?.map(venta => ({
        id: venta.id,
        fecha_venta: venta.fecha_venta,  // ⭐ CORRECTO: fecha_venta (no "fecha")
        estado: venta.estado,
        clientes: venta.clientes,  // ⭐ CORRECTO: Pasar objeto completo de clientes
        detalles_venta: venta.detalles_venta,  // ⭐ CORRECTO: Pasar detalles completos
        cobros: venta.cobros,  // ⭐ CORRECTO: Pasar cobros completos para PagosPage
      })) || [];

      console.log('Ventas procesadas:', ventasProcessadas);
      console.log('Total count:', count);

      setVentas(ventasProcessadas);
      return { 
        data: ventasProcessadas, 
        count: count || 0,
        totalCount: count || 0 
      };
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener ventas:', err);
      return { data: [], count: 0, totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Obtener detalles de una venta
  const fetchVentaDetalles = async (ventaId) => {
    try {
      setLoading(true);
      setError(null);

      const { data: venta, error: err } = await supabase
        .from('ventas')
        .select(
          `
          id,
          fecha_venta,
          estado,
          clientes(id, nombre, ciudad, telefono),
          detalles_venta(
            id,
            articulo_id,
            cantidad,
            precio_unitario,
            subtotal,
            articulos(nombre, codigo)
          ),
          cobros(id, fecha_pago, liquidacion, monto_pagado, pago_delivery)
        `
        )
        .eq('id', ventaId)
        .single();

      if (err) throw err;

      setVentaDetalles(venta);
      setCobros(venta?.cobros || []);
      return venta;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener detalles de venta:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva venta
  const createVenta = async (clienteId, detalles, observaciones = '') => {
    try {
      setLoading(true);
      setError(null);

      // 1. VALIDAR STOCK
      const validacion = await validarStock(detalles);
      if (!validacion.valido) {
        setError(validacion.mensaje);
        return { success: false, error: validacion.mensaje };
      }

      // 2. CREAR VENTA
      const { data: ventaData, error: ventaErr } = await supabase
        .from('ventas')
        .insert({
          cliente_id: clienteId,
          fecha_venta: new Date().toISOString(),
          estado: 'PENDIENTE',
          observaciones: observaciones,
        })
        .select()
        .single();

      if (ventaErr) throw ventaErr;

      console.log('✅ Venta insertada:', ventaData);

      // 3. CREAR DETALLES DE VENTA
      const detallesConVentaId = detalles.map(det => ({
        venta_id: ventaData.id,
        articulo_id: det.articulo_id,
        cantidad: det.cantidad,
        precio_unitario: det.precio_unitario,
        subtotal: det.subtotal,
      }));

      const { error: detallesErr } = await supabase
        .from('detalles_venta')
        .insert(detallesConVentaId);

      if (detallesErr) throw detallesErr;

      console.log('✅ Detalles de venta insertados');

      // 4. REGISTRAR EN PRODUCTOS_VENDIDOS (para histórico)
      const productosVendidos = detalles.map(det => ({
        articulo_id: det.articulo_id,
        venta_id: ventaData.id,
        cantidad: det.cantidad,
        precio_unitario: det.precio_unitario,
        subtotal: det.subtotal,
        fecha_venta: new Date().toISOString(),
        estado: 'VENDIDO',
      }));

      const { error: productosErr } = await supabase
        .from('productos_vendidos')
        .insert(productosVendidos);

      if (productosErr) throw productosErr;

      console.log('✅ Productos vendidos registrados');

      setError(null);
      return { success: true, ventaId: ventaData.id };
    } catch (err) {
      setError(err.message);
      console.error('Error al crear venta:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Crear cobro y DESCONTAR STOCK
  const createCobro = async (ventaId, cobroData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== createCobro ===');
      console.log('Datos recibidos:', cobroData);
      console.log('Venta ID:', ventaId);

      // 1. CREAR COBRO
      const cobroPayload = {
        venta_id: ventaId,
        fecha_pago: new Date().toISOString(),
        liquidacion: cobroData.liquidacion || 'N/A',
        banco: cobroData.banco || null,
        monto_pagado: parseFloat(cobroData.montoPagado) || 0,
        envio: cobroData.envio || null,
        pago_delivery: parseFloat(cobroData.pagoDelivery) || 0,
        observaciones: cobroData.observaciones || '',
      };

      console.log('Payload para Supabase:', cobroPayload);

      const { data: cobroResult, error: cobroErr } = await supabase
        .from('cobros')
        .insert(cobroPayload)
        .select()
        .single();

      if (cobroErr) {
        console.error('Error en insert cobro:', cobroErr);
        throw cobroErr;
      }

      console.log('✅ Cobro insertado:', cobroResult);

      // 2. OBTENER DETALLES DE LA VENTA
      const { data: ventaData, error: ventaErr } = await supabase
        .from('detalles_venta')
        .select('articulo_id, cantidad')
        .eq('venta_id', ventaId);

      if (ventaErr) throw ventaErr;

      console.log('Detalles de venta:', ventaData);

      // 3. DESCONTAR STOCK DE CADA ARTÍCULO
      for (const detalle of ventaData) {
        const { data: articulo, error: artErr } = await supabase
          .from('articulos')
          .select('cantidad_stock')
          .eq('id', detalle.articulo_id)
          .single();

        if (artErr) throw artErr;

        const nuevoStock = Math.max(0, articulo.cantidad_stock - detalle.cantidad);

        console.log(`Actualizando stock artículo ${detalle.articulo_id}: ${articulo.cantidad_stock} - ${detalle.cantidad} = ${nuevoStock}`);

        const { error: updateErr } = await supabase
          .from('articulos')
          .update({ cantidad_stock: nuevoStock })
          .eq('id', detalle.articulo_id);

        if (updateErr) throw updateErr;
      }

      console.log('✅ Stock actualizado');

      // 4. ACTUALIZAR ESTADO DE LA VENTA A "PAGADO"
      const { error: updateVentaErr } = await supabase
        .from('ventas')
        .update({ estado: 'PAGADO' })
        .eq('id', ventaId);

      if (updateVentaErr) throw updateVentaErr;

      console.log('✅ Venta actualizada a PAGADO');

      // 5. ACTUALIZAR ESTADO EN PRODUCTOS_VENDIDOS A "PAGADO"
      const { error: updateProdErr } = await supabase
        .from('productos_vendidos')
        .update({ 
          estado: 'PAGADO',
          fecha_pago: new Date().toISOString()
        })
        .eq('venta_id', ventaId);

      if (updateProdErr) throw updateProdErr;

      console.log('✅ Productos vendidos actualizados a PAGADO');

      setError(null);
      return { success: true, cobroId: cobroResult.id };
    } catch (err) {
      setError(err.message);
      console.error('❌ Error al crear cobro:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar venta
  const deleteVenta = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase
        .from('ventas')
        .delete()
        .eq('id', id);

      if (err) throw err;

      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar venta:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cobro
  const deleteCobro = async (cobroId, ventaId) => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase
        .from('cobros')
        .delete()
        .eq('id', cobroId);

      if (err) throw err;

      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar cobro:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    ventas,
    ventaDetalles,
    cobros,
    loading,
    error,
    fetchVentas,
    fetchVentaDetalles,
    createVenta,
    createCobro,
    deleteVenta,
    deleteCobro,
  };
};