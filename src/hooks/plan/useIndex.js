import { useState, useCallback, useRef, useEffect } from 'react';
import { index, toggleStatus } from 'services/planService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading]               = useState(true);
    const [planes, setPlanes]                 = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters]               = useState({ search: '', estado: '' });
    const filtersRef                          = useRef(filters);
    const [alert, setAlert]                   = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [idToToggle, setIdToToggle]   = useState(null);

    const fetchPlanes = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setPlanes(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages:  response.last_page,
                total:       response.total
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar los planes'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlanes(1); }, [fetchPlanes]);

    const handleAskToggle = (id) => { setIdToToggle(id); setShowConfirm(true); };

    const handleConfirmToggle = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            await toggleStatus(idToToggle);
            setAlert({ type: 'success', message: 'Estado del plan actualizado correctamente.' });
            await fetchPlanes(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cambiar el estado'));
        } finally {
            setLoading(false);
            setIdToToggle(null);
        }
    };

    const handleFilterChange  = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit  = () => { filtersRef.current = filters; fetchPlanes(1); };
    const handleFilterClear   = () => {
        const reset = { search: '', estado: '' };
        setFilters(reset); filtersRef.current = reset; fetchPlanes(1);
    };

    return {
        loading, planes, paginationInfo, filters, setFilters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchPlanes, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    };
};