import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/planService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [alert,   setAlert]   = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        duracion_dias: '',
        precio: '',
        dias_gracia: '',
        congelamientos_permitidos: ''
    });

    useEffect(() => {
        const loadPlan = async () => {
            try {
                const response = await show(id);
                const data = response.data || response;
                setFormData({
                    nombre:                     data.nombre                     || '',
                    descripcion:                data.descripcion                || '',
                    duracion_dias:              data.duracion_dias              || '',
                    precio:                     data.precio                     || '',
                    dias_gracia:                data.dias_gracia                || '',
                    congelamientos_permitidos:  data.congelamientos_permitidos  || '',
                });
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar la información del plan.'));
            } finally {
                setLoading(false);
            }
        };
        if (id) loadPlan();
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
            setAlert({ type: 'success', message: 'Plan actualizado correctamente.' });
            setTimeout(() => navigate('/plan/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al actualizar el plan'));
        } finally {
            setSaving(false);
        }
    };

    return { formData, setFormData, loading, saving, alert, setAlert, handleChange, handleSubmit, navigate };
};