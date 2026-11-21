import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from 'services/authService';
import jwtUtils from 'utilities/Token/jwtUtils';
import { logout as logoutAction } from 'js/logout';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { getSucursalActiva, setSucursalActiva, clearSucursalActiva } from 'js/sucursalActiva';
import { getEmpresaActiva, setEmpresaActiva, clearEmpresaActiva } from 'js/empresaActiva';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [permissions, setPermissions] = useState([]);
    // Multiempresa (SaaS)
    const [empresa, setEmpresa] = useState(null);             // Empresa del usuario con su plan (null = superadmin)
    const [esSuperAdmin, setEsSuperAdmin] = useState(false);
    const [sucursal, setSucursal] = useState(null);           // Sede con la que trabaja ahora: fija o elegida (null = todas)
    const [sedeFija, setSedeFija] = useState(false);          // true = sede asignada al usuario (no la puede cambiar)
    const [empresaActiva, setEmpresaActivaState] = useState(getEmpresaActiva());    // Empresa elegida por el superadmin
    const [sucursalActiva, setSucursalActivaState] = useState(getSucursalActiva()); // Modo sucursal (sin sede fija)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = jwtUtils.getAccessTokenFromCookie();

        if (!token) {
            handleLogoutState();
            return;
        }

        try {
            let response;
            try {
                response = await authService.verifySession();
            } catch (error) {
                // Si la empresa o sucursal guardada ya no existe, se limpian y se reintenta una vez
                if (!getEmpresaActiva() && !getSucursalActiva()) throw error;
                clearEmpresaActiva(); setEmpresaActivaState(null);
                clearSucursalActiva(); setSucursalActivaState(null);
                response = await authService.verifySession();
            }
            const userData = response.data || response;

            setUser(userData);
            setRole(userData.rol?.nombre || userData.rol || null);
            setPermissions(userData.permisos || []);
            setEmpresa(userData.empresa || null);
            setEsSuperAdmin(!!userData.es_superadmin);
            setSucursal(userData.sucursal || null);

            // Solo el superadmin elige empresa: al resto se le limpia
            if (!userData.es_superadmin && getEmpresaActiva()) {
                clearEmpresaActiva();
                setEmpresaActivaState(null);
            }
            // Modo sucursal: solo el personal sin sede fija (el superadmin solo dentro de una empresa).
            // El cliente nunca: ve lo suyo de todas las sedes.
            const esCliente = (userData.rol?.nombre || userData.rol) === 'cliente';
            // (sede_fija = asignada al usuario; la elegida en el menú no la bloquea)
            setSedeFija(!!userData.sede_fija);
            const puedeElegirSede = !esCliente && !userData.sede_fija && (!userData.es_superadmin || getEmpresaActiva());
            if (!puedeElegirSede && getSucursalActiva()) {
                clearSucursalActiva();
                setSucursalActivaState(null);
            }

            setIsAuthenticated(true);

        } catch (error) {
            console.error("Sesión no válida:", error);
            logoutAction();
            handleLogoutState();
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutState = () => {
        setUser(null);
        setRole(null);
        setPermissions([]);
        setEmpresa(null);
        setEsSuperAdmin(false);
        setSucursal(null);
        setSedeFija(false);
        setIsAuthenticated(false);
        setLoading(false);
    };

    // Función mágica para validar si el usuario tiene un permiso específico
    const can = (permissionName) => {
        return permissions.includes(permissionName);
    };

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line
    }, []);

    /**
     * Superadmin: cambia la empresa en la que está trabajando (null = modo global).
     * Recarga la app para que todas las vistas vuelvan a pedir datos de esa empresa.
     */
    const cambiarEmpresa = (nuevaEmpresa) => {
        setEmpresaActiva(nuevaEmpresa);
        clearSucursalActiva(); // la sede elegida era de la empresa anterior
        window.location.reload();
    };

    /**
     * Quien no tiene sede fija: todas las sedes (null) o modo sucursal.
     * Recarga la app para que todas las vistas vuelvan a pedir datos de esa sede.
     */
    const cambiarSucursal = (nuevaSucursal) => {
        setSucursalActiva(nuevaSucursal);
        setSucursalActivaState(getSucursalActiva());
        window.location.reload();
    };

    // Empresa con la que se está trabajando ahora mismo
    const empresaActual = esSuperAdmin ? empresaActiva : empresa;

    // Estado de la suscripción de la empresa del usuario (null = superadmin)
    const suscripcion = empresa?.suscripcion ?? null;

    const login = async () => {
        setLoading(true);
        await checkAuth();
    };

    // Cambios de la empresa sin recargar la sesión (p. ej. subió o quitó el logo)
    const actualizarEmpresa = (cambios) => setEmpresa(e => (e ? { ...e, ...cambios } : e));

    const logout = () => {
        logoutAction();
        handleLogoutState();
    };

    return (
        <AuthContext.Provider value={{
            user,
            role,
            permissions,
            can,
            empresa,
            actualizarEmpresa,
            esSuperAdmin,
            sucursal,
            sedeFija,
            empresaActiva,
            empresaActual,
            cambiarEmpresa,
            sucursalActiva,
            cambiarSucursal,
            suscripcion,
            isAuthenticated,
            loading,
            login,
            logout
        }}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
export const useAuth = () => useContext(AuthContext);
