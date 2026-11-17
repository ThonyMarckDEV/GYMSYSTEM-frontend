import { useState, useEffect, useCallback } from 'react';
import { actual, abrir, cerrar, buscarCliente, cobrar } from 'services/cajaSesionService';
import { combobox as cajasCombobox } from 'services/cajaService';
import { verificar, rechazar } from 'services/pagoService';
import { combobox as planesCombobox } from 'services/planService';
import { combobox as descuentosCombobox } from 'services/descuentoService';
import { index as metodosPago } from 'services/metodoPagoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useCaja = () => {
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [alert, setAlert] = useState(null);

    const [caja, setCaja] = useState(null);           // { caja, resumen, pagos } | null
    const [ultimoCierre, setUltimoCierre] = useState(null);

    const [planes, setPlanes] = useState([]);
    const [descuentos, setDescuentos] = useState([]);
    const [metodos, setMetodos] = useState(null);
    const [cajasDisponibles, setCajasDisponibles] = useState([]);

    // Cobro
    const [busqueda, setBusqueda] = useState(null);   // resultado de buscar por DNI
    const [ultimoCobro, setUltimoCobro] = useState(null);

    const cargarCaja = useCallback(async () => {
        try {
            const res = await actual();
            const abierta = res.data && res.data.caja ? res.data : null;
            setCaja(abierta);
            // Sin turno abierto: cargar las cajas libres de la sede para abrir una
            if (!abierta) {
                cajasCombobox({ disponibles: true }).then(r => setCajasDisponibles(r.data || [])).catch(() => setCajasDisponibles([]));
            }
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar tu caja'));
        }
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await cargarCaja();
            // Catálogos para cobrar (si falla alguno, la caja sigue funcionando)
            planesCombobox().then(r => setPlanes(r.data || [])).catch(() => {});
            descuentosCombobox().then(r => setDescuentos(r.data || [])).catch(() => {});
            metodosPago().then(r => setMetodos(r.data)).catch(() => {});
            setLoading(false);
        })();
    }, [cargarCaja]);

    const ejecutar = async (fn, msgError) => {
        setProcesando(true);
        setAlert(null);
        try {
            return await fn();
        } catch (err) {
            setAlert(handleApiError(err, msgError));
            return null;
        } finally {
            setProcesando(false);
        }
    };

    const abrirCaja = (data) => ejecutar(async () => {
        const res = await abrir(data);
        setCaja(res.data);
        setUltimoCierre(null);
        setAlert({ type: 'success', message: 'Caja abierta. ¡Buen turno!' });
    }, 'No se pudo abrir la caja');

    const cerrarCaja = (data) => ejecutar(async () => {
        const res = await cerrar(data);
        setUltimoCierre(res.data);
        setCaja(null);
        cajasCombobox({ disponibles: true }).then(r => setCajasDisponibles(r.data || [])).catch(() => {});
        setBusqueda(null);
        setUltimoCobro(null);
        return res.data;
    }, 'No se pudo cerrar la caja');

    const buscar = (dni) => ejecutar(async () => {
        setUltimoCobro(null);
        setBusqueda(null);
        const res = await buscarCliente(dni);
        setBusqueda(res.data);
    }, 'Cliente no encontrado');

    const cobrarCliente = (data) => ejecutar(async () => {
        const res = await cobrar(busqueda.cliente.id, data);
        const membresia = res.data;
        setUltimoCobro({ cliente: busqueda.cliente, membresia, pago: membresia.pagos?.[0] });
        setBusqueda(null);
        await cargarCaja();
    }, 'No se pudo registrar el cobro');

    const verificarPendiente = (pagoId) => ejecutar(async () => {
        await verificar(pagoId);
        setAlert({ type: 'success', message: 'Pago verificado. La membresía del cliente quedó activa.' });
        if (busqueda) await buscar(busqueda.cliente.dni);
        await cargarCaja();
        return true;
    }, 'No se pudo verificar el pago');

    const rechazarPendiente = (pagoId, motivo) => ejecutar(async () => {
        await rechazar(pagoId, motivo);
        setAlert({ type: 'success', message: 'Comprobante rechazado. El cliente verá el motivo en su perfil.' });
        if (busqueda) await buscar(busqueda.cliente.dni);
        return true;
    }, 'No se pudo rechazar el pago');

    return {
        loading, procesando, alert, setAlert,
        caja, ultimoCierre, planes, descuentos, metodos, cajasDisponibles,
        busqueda, setBusqueda, ultimoCobro, setUltimoCobro,
        abrirCaja, cerrarCaja, buscar, cobrarCliente, verificarPendiente, rechazarPendiente, recargar: cargarCaja,
    };
};
