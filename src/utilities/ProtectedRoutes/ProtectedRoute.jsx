import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';

export const RUTA_CONFIGURACION_INICIAL = '/configuracion-inicial';

const ProtectedRoute = ({ element, requiredPermission }) => {
    const { isAuthenticated, can, loading, esSuperAdmin, empresa } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Edición empresa única: mientras la empresa no esté configurada,
    // el superadmin solo puede estar en la configuración inicial
    const pendiente = esSuperAdmin && empresa && !empresa.configurada;
    const enConfiguracion = location.pathname === RUTA_CONFIGURACION_INICIAL;

    if (pendiente && !enConfiguracion) {
        return <Navigate to={RUTA_CONFIGURACION_INICIAL} replace />;
    }
    if (!pendiente && enConfiguracion) {
        return <Navigate to="/home" replace />;
    }

    if (requiredPermission && !can(requiredPermission)) {
        return <Navigate to="/401" replace />;
    }

    return element ? element : <Outlet />;
};

export default ProtectedRoute;
