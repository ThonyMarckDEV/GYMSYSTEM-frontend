import React, { useEffect, useState } from "react";
import Sidebar from "../components/Shared/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import { AvisosSuscripcion, SuscripcionBloqueada } from "components/Shared/AvisosSuscripcion";
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
  const { can, suscripcion } = useAuth();
  const location = useLocation();

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
            {/* SaaS: empresa/sede con la que se trabaja y estado de la suscripción */}
            <AvisosSuscripcion />
            <EnLayoutContext.Provider value={true}>
              {/* Suscripción vencida (pasada la gracia): solo puede ver su plan */}
              {suscripcion?.bloqueada && location.pathname !== '/mi-plan' ? <SuscripcionBloqueada /> : <Outlet />}
            </EnLayoutContext.Provider>
          </div>
        </main>
      </div>
    </NotificacionesProvider>
  );
};

export default SidebarLayout;
