import React from 'react';
import { useUpdate } from 'hooks/empresa/useUpdate';
import EmpresaForm from 'components/Shared/Formularios/empresa/EmpresaForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const Update = () => {
    const { formData, loading, saving, alert, setAlert, handleChange, handleSubmit, navigate } = useUpdate();

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Editar Empresa"
                subtitle={`Editando: ${formData.nombre_comercial || ''}`}
                icon={PencilSquareIcon}
                buttonText="← Volver al listado"
                buttonLink="/empresa/listar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <EmpresaForm formData={formData} handleChange={handleChange} conSuscripcion />
                <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={() => navigate('/empresa/listar')}
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors uppercase text-sm">
                        Cancelar
                    </button>
                    <button type="submit" disabled={saving}
                        className="bg-secondary text-primary px-10 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-secondary/90 transition-all disabled:opacity-50">
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Update;
