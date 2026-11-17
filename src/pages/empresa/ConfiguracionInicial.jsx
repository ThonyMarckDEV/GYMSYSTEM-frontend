import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { show, update } from 'services/empresaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import EmpresaForm from 'components/Shared/Formularios/empresa/EmpresaForm';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { APP_NAME } from 'config/app';
import { RocketLaunchIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const VACIO = { razon_social: '', nombre_comercial: '', ruc: '', direccion: '', telefono: '', correo: '' };

/**
 * Primer inicio del sistema (edición empresa única).
 * El superadmin debe registrar los datos de la empresa para activarla;
 * hasta entonces ningún otro usuario puede iniciar sesión.
 */
const ConfiguracionInicial = () => {
    const navigate = useNavigate();
    const { login, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState(VACIO);

    useEffect(() => {
        show()
            .then(res => {
                const d = res.data || {};
                setFormData(Object.fromEntries(Object.keys(VACIO).map(k => [k, d[k] || ''])));
            })
            .catch(err => setAlert(handleApiError(err, 'No se pudieron cargar los datos de la empresa.')))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAlert(null);
        try {
            await update(formData);
            await login();               // vuelve a leer /me: la empresa ya está configurada
            navigate('/home', { replace: true });
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo guardar la configuración'));
            setSaving(false);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-light/40 to-white py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary rounded-xl text-primary"><RocketLaunchIcon className="w-8 h-8" /></div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">{APP_NAME} · Configuración inicial</p>
                            <h1 className="text-3xl font-black text-secondary tracking-tight">Registra los datos de tu empresa</h1>
                        </div>
                    </div>
                    <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" /> Salir
                    </button>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex gap-3">
                    <LockClosedIcon className="w-5 h-5 flex-shrink-0" />
                    <p>
                        Es el primer inicio del sistema. Mientras no registres la <b>razón social</b>, el <b>nombre comercial</b> y el <b>RUC</b>,
                        la empresa permanece inactiva y <b>ningún otro usuario puede iniciar sesión</b>. Estos datos aparecen en los tickets y
                        podrás cambiarlos luego en <b>Configuración → Datos de la Empresa</b>.
                    </p>
                </div>

                <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

                <form onSubmit={handleSubmit}>
                    <EmpresaForm formData={formData} handleChange={handleChange} />
                    <div className="mt-8 flex justify-end">
                        <button type="submit" disabled={saving}
                            className="bg-secondary text-primary px-10 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-secondary/90 disabled:opacity-50">
                            {saving ? 'Activando...' : 'Guardar y activar empresa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfiguracionInicial;
