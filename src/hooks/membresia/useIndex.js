import { useState, useCallback, useEffect } from 'react';
import { index, asignar, congelar, reanudar, cancelar } from 'services/membresiaService';
import { combobox as comboboxPlanes } from 'services/planService';
import { combobox as comboboxDescuentos } from 'services/descuentoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = (clienteId) => {
    const [loading, setLoading] = useState(true);
    const [data, setData]       = useState(null);
    const [alert, setAlert]     = useState(null);

    const [planes, setPlanes]         = useState([]);
    const [descuentos, setDescuentos] = useState([]);

    const [isAsignarOpen, setIsAsignarOpen]   = useState(false);
    const [isCongelarOpen, setIsCongelarOpen] = useState(false);
    const [confirmAction, setConfirmAction]   = useState(null); // 'reanudar' | 'cancelar'

    const [actionLoading, setActionLoading] = useState(false);

    const fetchMembresia = useCallback(async () => {
        setLoading(true);
        try {
            const response = await index(clienteId);
            setData(response.data || response);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar la membresía del cliente'));
        } finally {
            setLoading(false);
        }
    }, [clienteId]);

    const fetchCombos = useCallback(async () => {
        try {
            const [planesRes, descuentosRes] = await Promise.all([
                comboboxPlanes(),
                comboboxDescuentos(),
            ]);
            setPlanes(planesRes.data || planesRes || []);
            setDescuentos(descuentosRes.data || descuentosRes || []);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar planes o descuentos'));
        }
    }, []);

    useEffect(() => {
        fetchMembresia();
        fetchCombos();
    }, [fetchMembresia, fetchCombos]);

    const handleAsignar = async (formData) => {
        setActionLoading(true);
        try {
            await asignar(clienteId, formData);
            setAlert({ type: 'success', message: 'Membresía asignada exitosamente.' });
            setIsAsignarOpen(false);
            await fetchMembresia();
        } catch (err) {
            setAlert(handleApiError(err, 'Error al asignar la membresía'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmCongelar = async (motivo) => {
        setActionLoading(true);
        try {
            await congelar(data.membresia_actual.id, { motivo });
            setAlert({ type: 'success', message: 'Membresía congelada exitosamente.' });
            setIsCongelarOpen(false);
            await fetchMembresia();
        } catch (err) {
            setAlert(handleApiError(err, 'Error al congelar la membresía'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleAskConfirm = (type) => setConfirmAction(type);

    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        setActionLoading(true);
        try {
            if (confirmAction === 'reanudar') {
                await reanudar(data.membresia_actual.id);
                setAlert({ type: 'success', message: 'Membresía reanudada exitosamente.' });
            } else if (confirmAction === 'cancelar') {
                await cancelar(data.membresia_actual.id);
                setAlert({ type: 'success', message: 'Membresía cancelada exitosamente.' });
            }
            setConfirmAction(null);
            await fetchMembresia();
        } catch (err) {
            setAlert(handleApiError(err, 'Error al procesar la acción'));
        } finally {
            setActionLoading(false);
        }
    };

    return {
        loading, data, alert, setAlert, planes, descuentos,
        isAsignarOpen, setIsAsignarOpen, handleAsignar,
        isCongelarOpen, setIsCongelarOpen, handleConfirmCongelar,
        confirmAction, setConfirmAction, handleAskConfirm, handleConfirmAction,
        actionLoading, fetchMembresia,
    };
};