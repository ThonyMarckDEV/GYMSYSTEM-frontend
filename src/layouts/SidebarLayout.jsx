import React, { useState } from "react";
import Sidebar from "../components/Shared/SideBar";
import { Outlet } from "react-router-dom";
import { useAuth } from "context/AuthContext";

const SidebarLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { esSuperAdmin, sucursalActiva } = useAuth();

  return (
    <div className="min-h-screen flex overflow-hidden">
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
        {/* mt-12 en móvil para el botón hamburguesa fijo */}
        <div className="mt-12 md:mt-0 min-w-0">
          {esSuperAdmin && sucursalActiva && (
            <div className="mx-6 mt-4 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              Modo sucursal: estás viendo solo la sede {sucursalActiva.nombre}. Cámbialo a "Todas" en el menú lateral para el modo global.
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;