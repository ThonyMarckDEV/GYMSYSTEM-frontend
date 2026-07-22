import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/clienteService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setSaving] = useState(true);
    const [saving,  setLoading] = useState(false);
    const [alert,   setAlert]  = useState(null);

    const [formData, setFormData] = useState({
        datos_cliente: {
            nombre: '', apellidoPaterno: '', apellidoMaterno: '',
            dni: '', fechaNacimiento: '', sexo: ''
        },
        contactos: { telefonoMovil: '', correo: '' },
        usuario:   { username: '', password: '', password_confirmation: '' }
    });

    useEffect(() => {
        const loadCliente = async () => {
            try {
                const response = await show(id);
                const data = response.data || response;
                setFormData({
                    datos_cliente: {
                        nombre:           data.nombre           || '',
                        apellidoPaterno:  data.apellidoPaterno  || '',
                        apellidoMaterno:  data.apellidoMaterno  || '',
                        dni:              data.dni              || '',
                        fechaNacimiento:  data.fechaNacimiento  || '',
                        sexo:             data.sexo             || '',
                    },
                    contactos: {
                        telefonoMovil: data.contacto?.telefonoMovil || '',
                        correo:        data.contacto?.correo        || ''
                    },
                    usuario: {
                        username:              data.usuario?.username || '',
                        password:              '',
                        password_confirmation: ''
                    }
                });
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar la información del cliente.'));
            } finally {
                setSaving(false);
            }
        };
        if (id) loadCliente();
    }, [id]);

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.usuario.password && formData.usuario.password !== formData.usuario.password_confirmation) {
            return setAlert({ type: 'error', message: 'Las contraseñas no coinciden.' });
        }
        setLoading(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Cliente actualizado correctamente.' });
            setTimeout(() => navigate('/cliente/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al actualizar el cliente'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, setFormData, loading, saving, alert, setAlert, handleNestedChange, handleSubmit, navigate };
};