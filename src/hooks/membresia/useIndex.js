import { useState, useCallback, useEffect } from 'react';
import { index, congelar, reanudar, cancelar } from 'services/membresiaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = (clienteId) => {
    const [loading, setLoading] = useState(true);
    const [data, setData]       = useState(null);
    const [alert, setAlert]     = useState(null);

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

    useEffect(() => {
        fetchMembresia();
    }, [fetchMembresia]);

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
        loading, data, alert, setAlert,
        isCongelarOpen, setIsCongelarOpen, handleConfirmCongelar,
        confirmAction, setConfirmAction, handleAskConfirm, handleConfirmAction,
        actionLoading, fetchMembresia,
    };
};