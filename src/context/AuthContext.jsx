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
    const [sucursal, setSucursal] = useState(null);           // Sucursal fija del usuario (null = todas)
    const [sucursalActiva, setSucursalActivaState] = useState(getSucursalActiva()); // Modo sucursal del superadmin
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

            // Solo el superadmin puede elegir sucursal: al resto se le limpia
            if (!userData.es_superadmin && getSucursalActiva()) {
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
     * Superadmin: modo global (null) o modo sucursal.
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
            esSuperAdmin,
            sucursal,
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