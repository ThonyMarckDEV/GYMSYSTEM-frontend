import React, { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { APP_NAME } from 'config/app';
import { useAuth } from 'context/AuthContext';
import { obtenerUrlFirmada } from 'js/archivoAutenticado';
import { logoUrl } from 'services/empresaService';

/** Isotipo del sistema: una pesa sobre amarillo (se usa si la empresa no subió logo). */
export const Isotipo = ({ tam = 'md', className = '' }) => {
    const t = {
        sm: 'w-8 h-8 rounded-lg [&>svg]:w-[18px] [&>svg]:h-[18px]',
        md: 'w-9 h-9 rounded-lg [&>svg]:w-5 [&>svg]:h-5',
        lg: 'w-12 h-12 rounded-xl [&>svg]:w-6 [&>svg]:h-6',
    }[tam];
    return (
        <div className={`${t} flex-shrink-0 bg-primary text-secondary flex items-center justify-center ${className}`}>
            <Dumbbell strokeWidth={2.25} aria-hidden />
        </div>
    );
};

/** Isotipo + nombre del sistema. */
const Marca = ({ tam = 'md', claro = false, className = '' }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <Isotipo tam={tam} />
        <span className={`font-bold tracking-tight ${tam === 'lg' ? 'text-xl' : 'text-[15px]'} ${claro ? 'text-white' : 'text-slate-900'}`}>
            {APP_NAME}
        </span>
    </div>
);

/** URL firmada del logo que la empresa subió en Configuración (null si no tiene). */
export const useLogoEmpresa = () => {
    const { empresa } = useAuth();
    const [src, setSrc] = useState(null);
    const tiene = !!empresa?.tiene_logo;
    const version = empresa?.logo_version || '';

    useEffect(() => {
        let activo = true;
        setSrc(null);
        if (!tiene) return undefined;
        obtenerUrlFirmada(logoUrl(version))
            .then(u => activo && setSrc(u))
            .catch(() => activo && setSrc(null));
        return () => { activo = false; };
    }, [tiene, version]);

    return src;
};

/**
 * Marca del menú lateral: el logo de la empresa (sobre blanco, porque suele ser
 * para fondo claro) o, si no subió uno, la pesa con el nombre del gimnasio.
 */
export const MarcaSidebar = ({ colapsado = false }) => {
    const { empresa } = useAuth();
    const src = useLogoEmpresa();
    const nombre = empresa?.nombre_comercial || APP_NAME;

    if (src) {
        return colapsado ? (
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
                <img src={src} alt={nombre} className="max-w-full max-h-full object-contain" />
            </div>
        ) : (
            <div className="h-11 w-full max-w-[210px] rounded-lg bg-white px-3 flex items-center justify-center">
                <img src={src} alt={nombre} className="max-w-full max-h-8 object-contain" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 min-w-0">
            <Isotipo />
            {!colapsado && <span className="font-bold text-[15px] tracking-tight text-white truncate">{nombre}</span>}
        </div>
    );
};

export default Marca;
