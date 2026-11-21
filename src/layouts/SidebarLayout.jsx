import React, { useEffect, useState } from "react";
import Sidebar from "../components/Shared/SideBar";
import { Outlet } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import BotonTema from "components/Shared/BotonTema";
import { NotificacionesProvider } from "context/NotificacionesContext";
import CampanaNotificaciones from "components/Shared/Notificaciones/CampanaNotificaciones";
import PagoEnVivo from "components/Shared/Notificaciones/PagoEnVivo";
import { aplicarTema, obtenerTema } from "utilities/Tema/tema";
import { EnLayoutContext } from "components/Shared/LoadingScreen";

const SidebarLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { sucursalActiva, can } = useAuth();

  // El modo oscuro vale solo dentro del sistema: el login siempre se ve claro
  useEffect(() => {
    aplicarTema(obtenerTema());
    return () => aplicarTema('claro');
  }, []);

  return (
    <NotificacionesProvider>
      <div className="min-h-screen flex overflow-hidden">
        {/* Arriba a la derecha: campanita y luna/sol */}
        <CampanaNotificaciones />
        <BotonTema />
        {/* Cliente: estado de su pago en vivo ("están revisando tu pago") */}
        {can("perfil.pagos") && <PagoEnVivo />}

        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        <main
          className={`
            flex-1 min-w-0 w-0 overflow-x-hidden overflow-y-auto
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}
            ${isMobileSidebarOpen ? 'pointer-events-none' : ''}
          `}
          style={{ maxWidth: '100vw' }}
        >
          {/* mt-12 en móvil (botón de menú) y en PC (campanita y tema arriba a la derecha) */}
          <div className="mt-12 min-w-0">
            {sucursalActiva && (
              <div className="mx-6 mt-4 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                Modo sucursal: estás viendo solo la sede {sucursalActiva.nombre}. Cámbialo a "Todas las sedes" en el menú lateral.
              </div>
            )}
            <EnLayoutContext.Provider value={true}>
              <Outlet />
            </EnLayoutContext.Provider>
          </div>
        </main>
      </div>
    </NotificacionesProvider>
  );
};

export default SidebarLayout;
