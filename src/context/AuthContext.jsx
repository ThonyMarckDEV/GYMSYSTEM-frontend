import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from 'services/authService'; 
import jwtUtils from 'utilities/Token/jwtUtils'; 
import { logout as logoutAction } from 'js/logout';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { getSucursalActiva, setSucursalActiva, clearSucursalActiva } from 'js/sucursalActiva';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [permissions, setPermissions] = useState([]);
    // Multitenant
    const [empresa, setEmpresa] = useState(null);             // La empresa (edición empresa única)
    const [esSuperAdmin, setEsSuperAdmin] = useState(false);
    const [sucursal, setSucursal] = useState(null);           // Sede con la que trabaja ahora: fija o elegida (null = todas)
    const [sedeFija, setSedeFija] = useState(false);          // true = sede asignada al usuario (no la puede cambiar)
    const [sucursalActiva, setSucursalActivaState] = useState(getSucursalActiva()); // Sede elegida en el menú lateral
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
                // Si la sucursal guardada ya no existe, la limpiamos y reintentamos una vez
                if (!getSucursalActiva()) throw error;
                clearSucursalActiva();
                setSucursalActivaState(null);
                response = await authService.verifySession();
            }
            const userData = response.data || response;

            setUser(userData);
            setRole(userData.rol?.nombre || userData.rol || null);
            setPermissions(userData.permisos || []);
            setEmpresa(userData.empresa || null);
            setEsSuperAdmin(!!userData.es_superadmin);
            setSucursal(userData.sucursal || null);

            setSedeFija(!!userData.sede_fija);

            // Elige sede en el menú: el personal sin sede fija. Al cliente y a
            // quien tiene sede asignada se le limpia cualquier sede guardada.
            const esCliente = (userData.rol?.nombre || userData.rol) === 'cliente';
            if ((esCliente || userData.sede_fija) && getSucursalActiva()) {
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
     * Personal sin sede fija: todas las sedes (null) o modo sucursal.
     * Recarga la app para que todas las vistas vuelvan a pedir datos de esa sede.
     */
    const cambiarSucursal = (nuevaSucursal) => {
        setSucursalActiva(nuevaSucursal);
        setSucursalActivaState(getSucursalActiva());
        window.location.reload();
    };


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
            sucursalActiva,
            cambiarSucursal,
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