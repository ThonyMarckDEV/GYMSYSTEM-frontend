import React from 'react';
import { useStore } from 'hooks/empresa/useStore';
import EmpresaForm from 'components/Shared/Formularios/empresa/EmpresaForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

const Store = () => {
    const { formData, loading, alert, setAlert, handleChange, handleSubmit } = useStore();

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Registrar Nueva Empresa"
                icon={BuildingOffice2Icon}
                buttonText="Volver al Listado"
                buttonLink="/empresa/listar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <EmpresaForm formData={formData} handleChange={handleChange} />
                <p className="mt-4 text-xs text-slate-500">
                    Luego de registrarla, usa <b>Entrar</b> en el listado y crea su administrador desde <b>Empleados → Agregar</b>.
                </p>
                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={loading}
                        className="bg-secondary text-primary px-8 py-3 rounded-lg font-black uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-lg">
                        {loading ? 'Guardando...' : 'Registrar Empresa'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Store;
