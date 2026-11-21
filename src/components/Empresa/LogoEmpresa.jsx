import React, { useRef, useState } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { logoUrl, subirLogo, eliminarLogo } from 'services/miEmpresaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { ImagenProtegida } from 'components/Pagos/PagoUI';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

/**
 * Logo de la empresa (guardado en MinIO). Aparece en los tickets solo si existe.
 * Permite subir, cambiar y eliminar.
 */
const LogoEmpresa = ({ tieneLogo, onCambio }) => {
    const inputRef = useRef(null);
    const [version, setVersion] = useState(Date.now()); // fuerza recargar la imagen tras cambiarla
    const [trabajando, setTrabajando] = useState(false);
    const [confirmar, setConfirmar] = useState(false);
    const [alert, setAlert] = useState(null);

    const elegir = () => inputRef.current?.click();

    const alElegir = async (e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (!archivo) return;
        setTrabajando(true);
        setAlert(null);
        try {
            const res = await subirLogo(archivo);
            setVersion(Date.now());
            setAlert({ type: 'success', message: res.message });
            onCambio?.(true);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo subir el logo'));
        } finally {
            setTrabajando(false);
        }
    };

    const quitar = async () => {
        setConfirmar(false);
        setTrabajando(true);
        setAlert(null);
        try {
            const res = await eliminarLogo();
            setAlert({ type: 'success', message: res.message });
            onCambio?.(false);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo eliminar el logo'));
        } finally {
            setTrabajando(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-card border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                <PhotoIcon className="w-5 h-5" /> Logo de la Empresa
            </h3>

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-48 h-28 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
                    {tieneLogo ? (
                        <ImagenProtegida key={version} url={logoUrl(version)} alt="Logo de la empresa" className="max-w-full max-h-full" vacio="No se pudo cargar" />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                            <PhotoIcon className="w-8 h-8" /> Sin logo
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                    <p className="text-sm text-slate-600">
                        {tieneLogo
                            ? 'Este logo aparece en todos los tickets de pago.'
                            : 'Si subes un logo, aparecerá en todos los tickets de pago. Sin logo, el ticket sale solo con el nombre.'}
                    </p>
                    <p className="text-[11px] text-slate-400">PNG o JPG, máximo 2 MB. Recomendado: fondo blanco o transparente, horizontal.</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <button type="button" onClick={elegir} disabled={trabajando}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-primary rounded-lg text-xs font-black uppercase hover:bg-secondary/90 disabled:opacity-50">
                            <ArrowUpTrayIcon className="w-4 h-4" /> {trabajando ? 'Procesando...' : tieneLogo ? 'Cambiar logo' : 'Subir logo'}
                        </button>
                        {tieneLogo && (
                            <button type="button" onClick={() => setConfirmar(true)} disabled={trabajando}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold uppercase hover:bg-red-100 disabled:opacity-50">
                                <TrashIcon className="w-4 h-4" /> Eliminar logo
                            </button>
                        )}
                    </div>
                    <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={alElegir} />
                </div>
            </div>

            {confirmar && (
                <ConfirmModal message="¿Eliminar el logo? Los tickets se mostrarán sin logo."
                    confirmText="Sí, eliminar" cancelText="Cancelar"
                    onConfirm={quitar} onCancel={() => setConfirmar(false)} />
            )}
        </div>
    );
};

export default LogoEmpresa;
