import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const usePagos = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los cobros (pagos registrados)
  const fetchPagos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: cobros, error: err } = await supabase
        .from('cobros')
        .select(`
          id,
          venta_id,
          fecha_pago,
          liquidacion,
          banco,
          monto_pagado,
          envio,
          pago_delivery,
          observaciones,
          ventas(
            id,
            cliente_id,
            clientes(nombre, ciudad, telefono),
            detalles_venta(subtotal)
          )
        `)
        .order('fecha_pago', { ascending: false });

      if (err) throw err;

      // Procesar datos
      const pagosProcessados = cobros?.map(cobro => {
        const totalVenta = cobro.ventas?.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
        const totalPago = cobro.monto_pagado + (cobro.pago_delivery || 0);

        return {
          id: cobro.id,
          ventaId: cobro.venta_id,
          fecha: cobro.fecha_pago,
          cliente: cobro.ventas?.clientes?.nombre || 'N/A',
          ciudad: cobro.ventas?.clientes?.ciudad || 'N/A',
          telefono: cobro.ventas?.clientes?.telefono || 'N/A',
          liquidacion: cobro.liquidacion,
          banco: cobro.banco,
          montoPagado: cobro.monto_pagado,
          envio: cobro.envio,
          pagoDelivery: cobro.pago_delivery || 0,
          totalPago: totalPago,
          totalVenta: totalVenta,
          observaciones: cobro.observaciones,
        };
      }) || [];

      setPagos(pagosProcessados);
      return pagosProcessados;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener pagos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener resumen de cobranza
  const fetchResumenCobranza = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: cobros } = await supabase
        .from('cobros')
        .select(`
          monto_pagado,
          pago_delivery,
          fecha_pago
        `);

      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const inicioSemana = new Date(hoy.getTime() - (hoy.getDay() * 24 * 60 * 60 * 1000));

      let totalDia = 0;
      let totalSemana = 0;
      let totalMes = 0;
      let totalGeneral = 0;

      cobros?.forEach(cobro => {
        const total = (cobro.monto_pagado || 0) + (cobro.pago_delivery || 0);
        const fechaPago = new Date(cobro.fecha_pago);

        totalGeneral += total;

        if (fechaPago.toDateString() === hoy.toDateString()) {
          totalDia += total;
        }

        if (fechaPago >= inicioSemana) {
          totalSemana += total;
        }

        if (fechaPago >= inicioMes) {
          totalMes += total;
        }
      });

      return {
        totalDia,
        totalSemana,
        totalMes,
        totalGeneral,
        cantidadPagos: cobros?.length || 0,
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener pagos por rango de fechas
  const fetchPagosPorFecha = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      setError(null);

      const { data: cobros } = await supabase
        .from('cobros')
        .select(`
          id,
          venta_id,
          fecha_pago,
          liquidacion,
          banco,
          monto_pagado,
          envio,
          pago_delivery,
          ventas(
            clientes(nombre, ciudad)
          )
        `)
        .gte('fecha_pago', fechaInicio)
        .lte('fecha_pago', fechaFin)
        .order('fecha_pago', { ascending: false });

      return cobros || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener pagos por cliente
  const fetchPagosPorCliente = async (clienteId) => {
    try {
      setLoading(true);
      setError(null);

      const { data: cobros } = await supabase
        .from('cobros')
        .select(`
          id,
          fecha_pago,
          liquidacion,
          monto_pagado,
          pago_delivery,
          ventas(cliente_id)
        `)
        .order('fecha_pago', { ascending: false });

      const cobrosCliente = cobros?.filter(c => c.ventas?.cliente_id === clienteId) || [];
      
      return {
        pagos: cobrosCliente,
        totalPagado: cobrosCliente.reduce((sum, c) => sum + (c.monto_pagado || 0) + (c.pago_delivery || 0), 0),
        cantidadPagos: cobrosCliente.length,
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener pagos pendientes (ventas no pagadas)
  const fetchPagosPendientes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: ventas } = await supabase
        .from('ventas')
        .select(`
          id,
          fecha_venta,
          estado,
          clientes(nombre, ciudad, telefono, email),
          detalles_venta(subtotal),
          cobros(monto_pagado, pago_delivery)
        `)
        .neq('estado', 'PAGADO')
        .order('fecha_venta', { ascending: false });

      const pendientes = ventas?.map(venta => {
        const totalVenta = venta.detalles_venta?.reduce((sum, det) => sum + (det.subtotal || 0), 0) || 0;
        const totalCobrado = venta.cobros?.reduce((sum, c) => sum + (c.monto_pagado + (c.pago_delivery || 0)), 0) || 0;
        const pendiente = totalVenta - totalCobrado;

        return {
          ventaId: venta.id,
          fecha: venta.fecha_venta,
          cliente: venta.clientes?.nombre || 'N/A',
          ciudad: venta.clientes?.ciudad || 'N/A',
          telefono: venta.clientes?.telefono || 'N/A',
          email: venta.clientes?.email || 'N/A',
          totalVenta,
          totalCobrado,
          pendiente,
          estado: venta.estado,
        };
      }) || [];

      return pendientes.sort((a, b) => b.pendiente - a.pendiente);
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener resumen de liquidaciones
  const fetchResumenLiquidaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: cobros } = await supabase
        .from('cobros')
        .select('liquidacion, monto_pagado, pago_delivery');

      const liquidaciones = {};
      let totalGeneral = 0;

      cobros?.forEach(cobro => {
        const total = (cobro.monto_pagado || 0) + (cobro.pago_delivery || 0);
        totalGeneral += total;

        if (!liquidaciones[cobro.liquidacion]) {
          liquidaciones[cobro.liquidacion] = {
            cantidad: 0,
            monto: 0,
          };
        }

        liquidaciones[cobro.liquidacion].cantidad++;
        liquidaciones[cobro.liquidacion].monto += total;
      });

      return {
        liquidaciones: Object.entries(liquidaciones).map(([tipo, data]) => ({
          tipo,
          ...data,
          porcentaje: ((data.monto / totalGeneral) * 100).toFixed(2),
        })),
        totalGeneral,
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pagos,
    loading,
    error,
    fetchPagos,
    fetchResumenCobranza,
    fetchPagosPorFecha,
    fetchPagosPorCliente,
    fetchPagosPendientes,
    fetchResumenLiquidaciones,
  };
};