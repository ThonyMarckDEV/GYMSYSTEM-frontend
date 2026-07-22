// hooks/membresia/useIndex.js — ADMIN
import { useState, useCallback, useRef, useEffect } from 'react';
import { index, show, aprobar, rechazar, congelar, reanudar, cancelar } from 'services/membresiaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading]               = useState(true);
    const [membresias, setMembresias]         = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters]               = useState({ search: '', estado: '' });
    const filtersRef                          = useRef(filters);
    const [alert, setAlert]                   = useState(null);

    // Modal de detalle
    const [isViewOpen, setIsViewOpen]   = useState(false);
    const [viewData, setViewData]       = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Modal de rechazo (pide motivo)
    const [isRechazarOpen, setIsRechazarOpen] = useState(false);
    const [idToRechazar, setIdToRechazar]     = useState(null);

    // Modal de congelar (motivo opcional)
    const [isCongelarOpen, setIsCongelarOpen] = useState(false);
    const [idToCongelar, setIdToCongelar]     = useState(null);

    // Confirmaciones simples
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'aprobar'|'reanudar'|'cancelar', id }

    const [actionLoading, setActionLoading] = useState(false);

    const fetchMembresias = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setMembresias(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages:  response.last_page,
                total:       response.total
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar las membresías'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMembresias(1); }, [fetchMembresias]);

    const handleView = async (id) => {
        setIsViewOpen(true);
        setViewLoading(true);
        setViewData(null);
        try {
            const response = await show(id);
            setViewData(response.data || response);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar detalles'));
            setIsViewOpen(false);
        } finally {
            setViewLoading(false);
        }
    };

    const refrescar = async () => {
        await fetchMembresias(paginationInfo.currentPage);
        if (isViewOpen && viewData) {
            const response = await show(viewData.id);
            setViewData(response.data || response);
        }
    };

    // ── Aprobar / Reanudar / Cancelar (confirmación simple) ──
    const handleAskConfirm = (type, id) => setConfirmAction({ type, id });

    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        const { type, id } = confirmAction;
        setConfirmAction(null);
        setActionLoading(true);
        try {
            const acciones = { aprobar, reanudar, cancelar };
            await acciones[type](id);
            const mensajes = {
                aprobar:  'Membresía aprobada y activada exitosamente.',
                reanudar: 'Membresía reanudada exitosamente.',
                cancelar: 'Membresía cancelada exitosamente.',
            };
            setAlert({ type: 'success', message: mensajes[type] });
            await refrescar();
        } catch (err) {
            setAlert(handleApiError(err, 'Error al procesar la acción'));
        } finally {
            setActionLoading(false);
        }
    };

    // ── Rechazar (con motivo) ──
    const handleAskRechazar = (id) => { setIdToRechazar(id); setIsRechazarOpen(true); };

    const handleConfirmRechazar = async (motivo) => {
        setActionLoading(true);
        try {
            await rechazar(idToRechazar, { motivo });
            setAlert({ type: 'success', message: 'Solicitud rechazada.' });
            setIsRechazarOpen(false);
            setIdToRechazar(null);
            await refrescar();
        } catch (err) {
            setAlert(handleApiError(err, 'Error al rechazar la solicitud'));
        } finally {
            setActionLoading(false);
        }
    };

    // ── Congelar (motivo opcional) ──
    const handleAskCongelar = (id) => { setIdToCongelar(id); setIsCongelarOpen(true); };

    const handleConfirmCongelar = async (motivo) => {
        setActionLoading(true);
        try {
            await congelar(idToCongelar, { motivo });
            setAlert({ type: 'success', message: 'Membresía congelada exitosamente.' });
            setIsCongelarOpen(false);
            setIdToCongelar(null);
            await refrescar();
        } catch (err) {
            setAlert(handleApiError(err, 'Error al congelar la membresía'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleFilterChange  = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit  = () => { filtersRef.current = filters; fetchMembresias(1); };
    const handleFilterClear   = () => {
        const reset = { search: '', estado: '' };
        setFilters(reset); filtersRef.current = reset; fetchMembresias(1);
    };

    return {
        loading, membresias, paginationInfo, filters, alert, setAlert,
        isViewOpen, setIsViewOpen, viewData, viewLoading, handleView,
        isRechazarOpen, setIsRechazarOpen, handleAskRechazar, handleConfirmRechazar,
        isCongelarOpen, setIsCongelarOpen, handleAskCongelar, handleConfirmCongelar,
        confirmAction, setConfirmAction, handleAskConfirm, handleConfirmAction,
        actionLoading,
        fetchMembresias, handleFilterChange, handleFilterSubmit, handleFilterClear
    };
};