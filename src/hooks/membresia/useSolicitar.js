// hooks/membresia/useSolicitar.js — CLIENTE
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitar } from 'services/membresiaClienteService';
import { combobox as comboboxPlanes } from 'services/planService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useSolicitar = () => {
    const navigate = useNavigate();
    const [loading, setLoading]       = useState(false);
    const [alert, setAlert]           = useState(null);
    const [planes, setPlanes]         = useState([]);
    const [loadingPlanes, setLoadingPlanes] = useState(true);
    const [preview, setPreview]       = useState(null);

    const [formData, setFormData] = useState({
        plan_id: '',
        codigo_descuento: '',
        metodo_pago: 'yape',
        numero_operacion: '',
        comprobante: null,
    });

    const fetchPlanes = useCallback(async () => {
        setLoadingPlanes(true);
        try {
            const response = await comboboxPlanes();
            setPlanes(response.data || response || []);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudieron cargar los planes disponibles.'));
        } finally {
            setLoadingPlanes(false);
        }
    }, []);

    useEffect(() => { fetchPlanes(); }, [fetchPlanes]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectPlan = (planId) => {
        setFormData(prev => ({ ...prev, plan_id: planId }));
    };

    const handleFileChange = (file) => {
        setFormData(prev => ({ ...prev, comprobante: file }));
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.plan_id) {
            return setAlert({ type: 'error', message: 'Debes seleccionar un plan.' });
        }
        if (!formData.comprobante) {
            return setAlert({ type: 'error', message: 'Debes adjuntar la captura de tu pago.' });
        }

        setLoading(true);
        setAlert(null);
        try {
            const fd = new FormData();
            fd.append('plan_id', formData.plan_id);
            fd.append('codigo_descuento', formData.codigo_descuento || '');
            fd.append('metodo_pago', formData.metodo_pago);
            fd.append('numero_operacion', formData.numero_operacion || '');
            fd.append('comprobante', formData.comprobante);

            await solicitar(fd);
            setAlert({ type: 'success', message: 'Solicitud enviada. Espera la validación de tu pago.' });
            setTimeout(() => navigate('/membresia/mis-solicitudes'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al enviar la solicitud'));
        } finally {
            setLoading(false);
        }
    };

    return {
        formData, loading, alert, setAlert,
        planes, loadingPlanes, preview,
        handleChange, handleSelectPlan, handleFileChange, handleSubmit
    };
};