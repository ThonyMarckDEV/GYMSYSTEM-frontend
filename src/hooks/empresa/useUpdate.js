import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/empresaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { EMPRESA_FORM_INICIAL } from 'hooks/empresa/useStore';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [alert,   setAlert]   = useState(null);

    const [formData, setFormData] = useState(EMPRESA_FORM_INICIAL);

    useEffect(() => {
        const loadEmpresa = async () => {
            try {
                const response = await show(id);
                const data = response.data || response;
                setFormData({
                    razon_social:     data.razon_social     || '',
                    nombre_comercial: data.nombre_comercial || '',
                    ruc:              data.ruc              || '',
                    direccion:        data.direccion        || '',
                    telefono:         data.telefono         || '',
                    correo:           data.correo           || '',
                    plan_suscripcion_id: data.plan_suscripcion_id || '',
                    suscripcion_vence:   data.suscripcion_vence ? String(data.suscripcion_vence).slice(0, 10) : '',
                });
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar la información de la empresa.'));
            } finally {
                setLoading(false);
            }
        };
        if (id) loadEmpresa();
    }, [id]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Empresa actualizada correctamente.' });
            setTimeout(() => navigate('/empresa/listar'), 900);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al actualizar la empresa'));
        } finally {
            setSaving(false);
        }
    };

    return { formData, setFormData, loading, saving, alert, setAlert, handleChange, handleSubmit, navigate };
};
