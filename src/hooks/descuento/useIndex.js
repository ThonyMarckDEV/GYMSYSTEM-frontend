import { useState, useCallback, useRef, useEffect } from 'react';
import { index, toggleStatus } from 'services/descuentoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading]               = useState(true);
    const [descuentos, setDescuentos]         = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters]               = useState({ search: '', tipo: '', estado: '' });
    const filtersRef                          = useRef(filters);
    const [alert, setAlert]                   = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [idToToggle, setIdToToggle]   = useState(null);

    const fetchDescuentos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setDescuentos(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages:  response.last_page,
                total:       response.total
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar los descuentos'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDescuentos(1); }, [fetchDescuentos]);

    const handleAskToggle = (id) => { setIdToToggle(id); setShowConfirm(true); };

    const handleConfirmToggle = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            await toggleStatus(idToToggle);
            setAlert({ type: 'success', message: 'Estado del descuento actualizado correctamente.' });
            await fetchDescuentos(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cambiar el estado'));
        } finally {
            setLoading(false);
            setIdToToggle(null);
        }
    };

    const handleFilterChange  = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit  = () => { filtersRef.current = filters; fetchDescuentos(1); };
    const handleFilterClear   = () => {
        const reset = { search: '', tipo: '', estado: '' };
        setFilters(reset); filtersRef.current = reset; fetchDescuentos(1);
    };

    return {
        loading, descuentos, paginationInfo, filters, setFilters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchDescuentos, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    };
};