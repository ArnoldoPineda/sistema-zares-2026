import { useState } from 'react';
import supabase from '../services/supabaseClient';

export const useReportes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ventasPorCiudad, setVentasPorCiudad] = useState({});

  // Obtener todas las ventas agrupadas por ciudad
  const fetchEtiquetasVentas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: ventas, error: err } = await supabase
        .from('ventas')
        .select(`
          id,
          fecha_venta,
          estado,
          observaciones,
          clientes(
            id,
            nombre_completo,
            telefono,
            ciudad,
            direccion
          ),
          detalles_venta(
            id,
            subtotal
          )
        `)
        .order('fecha_venta', { ascending: false });

      if (err) throw err;

      // Agrupar por ciudad
      const agrupadas = {};

      ventas?.forEach(venta => {
        const ciudad = venta.clientes?.ciudad || 'Sin Ciudad';
        
        if (!agrupadas[ciudad]) {
          agrupadas[ciudad] = [];
        }

        // Calcular total de la venta
        const total = venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;

        agrupadas[ciudad].push({
          id: venta.id,
          fecha: venta.fecha_venta,
          estado: venta.estado,
          cliente: venta.clientes?.nombre_completo || 'N/A',
          telefono: venta.clientes?.telefono || 'N/A',
          direccion: venta.clientes?.direccion || 'N/A',
          ciudad: ciudad,
          monto: total,
          observaciones: venta.observaciones,
        });
      });

      // Ordenar ciudades alfabéticamente
      const ordenadas = Object.keys(agrupadas)
        .sort()
        .reduce((obj, key) => {
          obj[key] = agrupadas[key];
          return obj;
        }, {});

      setVentasPorCiudad(ordenadas);
      return ordenadas;
    } catch (err) {
      console.error('Error al obtener etiquetas:', err);
      setError(err.message);
      return {};
    } finally {
      setLoading(false);
    }
  };

  // Obtener resumen de ventas
  const fetchResumenVentas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: ventas, error: err } = await supabase
        .from('ventas')
        .select(`
          id,
          estado,
          detalles_venta(subtotal)
        `);

      if (err) throw err;

      const resumen = {
        totalVentas: ventas?.length || 0,
        ventasPendientes: 0,
        ventasParciales: 0,
        ventasPagadas: 0,
        montoTotal: 0,
        montoPendiente: 0,
        montoParcial: 0,
        montoPagado: 0,
      };

      ventas?.forEach(venta => {
        const total = venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
        resumen.montoTotal += total;

        switch (venta.estado) {
          case 'PENDIENTE':
            resumen.ventasPendientes++;
            resumen.montoPendiente += total;
            break;
          case 'PARCIAL':
            resumen.ventasParciales++;
            resumen.montoParcial += total;
            break;
          case 'PAGADO':
            resumen.ventasPagadas++;
            resumen.montoPagado += total;
            break;
          default:
            break;
        }
      });

      return resumen;
    } catch (err) {
      console.error('Error al obtener resumen:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener ventas por estado
  const fetchVentasPorEstado = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: ventas, error: err } = await supabase
        .from('ventas')
        .select(`
          id,
          estado,
          fecha_venta,
          clientes(nombre_completo),
          detalles_venta(subtotal)
        `)
        .order('fecha_venta', { ascending: false });

      if (err) throw err;

      const porEstado = {
        PENDIENTE: [],
        PARCIAL: [],
        PAGADO: [],
      };

      ventas?.forEach(venta => {
        const total = venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
        
        porEstado[venta.estado].push({
          id: venta.id,
          fecha: venta.fecha_venta,
          cliente: venta.clientes?.nombre_completo || 'N/A',
          monto: total,
        });
      });

      return porEstado;
    } catch (err) {
      console.error('Error al obtener ventas por estado:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener top clientes por monto
  const fetchTopClientes = async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const { data: ventas, error: err } = await supabase
        .from('ventas')
        .select(`
          clientes(id, nombre_completo),
          detalles_venta(subtotal)
        `);

      if (err) throw err;

      const clientesMap = {};

      ventas?.forEach(venta => {
        const clienteId = venta.clientes?.id;
        const clienteNombre = venta.clientes?.nombre_completo || 'N/A';
        const total = venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;

        if (!clientesMap[clienteId]) {
          clientesMap[clienteId] = {
            nombre: clienteNombre,
            montoTotal: 0,
            cantidadVentas: 0,
          };
        }

        clientesMap[clienteId].montoTotal += total;
        clientesMap[clienteId].cantidadVentas++;
      });

      const topClientes = Object.values(clientesMap)
        .sort((a, b) => b.montoTotal - a.montoTotal)
        .slice(0, limit);

      return topClientes;
    } catch (err) {
      console.error('Error al obtener top clientes:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener artículos más vendidos
  const fetchArticulosMasVendidos = async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const { data: detalles, error: err } = await supabase
        .from('detalles_venta')
        .select(`
          articulo_id,
          cantidad,
          subtotal,
          articulos(nombre, codigo)
        `);

      if (err) throw err;

      const articulosMap = {};

      detalles?.forEach(det => {
        const articuloId = det.articulo_id;
        const articuloNombre = det.articulos?.nombre || 'N/A';
        const codigo = det.articulos?.codigo || 'N/A';

        if (!articulosMap[articuloId]) {
          articulosMap[articuloId] = {
            nombre: articuloNombre,
            codigo: codigo,
            cantidadVendida: 0,
            montoTotal: 0,
          };
        }

        articulosMap[articuloId].cantidadVendida += det.cantidad;
        articulosMap[articuloId].montoTotal += det.subtotal;
      });

      const masVendidos = Object.values(articulosMap)
        .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
        .slice(0, limit);

      return masVendidos;
    } catch (err) {
      console.error('Error al obtener artículos más vendidos:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    ventasPorCiudad,
    loading,
    error,
    fetchEtiquetasVentas,
    fetchResumenVentas,
    fetchVentasPorEstado,
    fetchTopClientes,
    fetchArticulosMasVendidos,
  };
};