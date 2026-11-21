import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import PanelLateral from 'components/Shared/PanelLateral';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

// Componentes Globales
import { ToastContainer } from 'react-toastify';
import SidebarLayout from 'layouts/SidebarLayout';

// UIS AUTH & ERRORS
import ErrorPage404 from 'components/ErrorPage404';
import ErrorPage401 from 'components/ErrorPage401';
import Login from 'pages/auth/Login/Login';

// UI HOME
import Home from 'pages/home/Home';

//UI EMPLEADOS
import AgregarEmpleado from 'pages/empleado/Store';
import EditarEmpleado from 'pages/empleado/Update';
import ListarEmpleados from 'pages/empleado/Index';

//UI CLientes
import AgregarCliente from 'pages/cliente/Store';
import EditarCliente from 'pages/cliente/Update';
import ListarClientes from 'pages/cliente/Index';

//UI PLANES
import AgregarPlan from 'pages/plan/Store';
import EditarPlan from 'pages/plan/Update';
import ListarPlanes from 'pages/plan/Index';

// UI DESCUENTOS
import AgregarDescuento from 'pages/descuento/Store';
import EditarDescuento from 'pages/descuento/Update';
import ListarDescuentos from 'pages/descuento/Index';

// UI PERFIL
import MembresiaIndex from 'pages/membresia/Index';
import MiPerfil from 'pages/perfil/MiPerfil';

// SETTINGS
import ListarRoles from 'pages/rol/Index';

// UI EMPRESAS (multitenant — solo superadmin)
import MiEmpresa from 'pages/empresa/MiEmpresa';
import AgregarEmpresa from 'pages/empresa/Store';
import EditarEmpresa from 'pages/empresa/Update';
import ListarEmpresas from 'pages/empresa/Index';

// UI PLANES DEL SISTEMA Y SUSCRIPCIONES (SaaS)
import ListarPlanesSistema from 'pages/suscripcion/Index';
import FormPlanSistema from 'pages/suscripcion/Form';
import CobrosSuscripcion from 'pages/suscripcion/Cobros';
import MiPlan from 'pages/suscripcion/MiPlan';

// UI CLASES E INVENTARIO
import Clases from 'pages/clase/Index';
import Inventario from 'pages/inventario/Index';
import Productos from 'pages/producto/Index';
import Reportes from 'pages/reporte/Index';
import Bitacora from 'pages/auditoria/Index';
import MisRutinas from 'pages/rutina/Index';
import MiPanel from 'pages/panel/Index';
import PanelInstructor from 'pages/panel-instructor/Index';
import MisPagos from 'pages/mis-pagos/Index';
import MiProgreso from 'pages/progreso/Index';
import Entrenar from 'pages/rutina/Entrenar';
import Traslados from 'pages/traslado/Index';

// UI CAJA Y PAGOS
import Caja from 'pages/caja/Index';
import HistorialCajas from 'pages/caja/Historial';
import ListarCajas from 'pages/caja/Listar';
import ListarPagos from 'pages/pago/Index';
import ListarPines from 'pages/pin/Index';
import MetodosPago from 'pages/metodoPago/Index';

// UI DASHBOARD
import Dashboard from 'pages/dashboard/Index';


// UI SUCURSALES (sedes de la empresa)
import AgregarSucursal from 'pages/sucursal/Store';
import EditarSucursal from 'pages/sucursal/Update';
import ListarSucursales from 'pages/sucursal/Index';

// Utilities
import ProtectedRouteHome from 'utilities/ProtectedRoutes/ProtectedRouteHome';
import ProtectedRoute from 'utilities/ProtectedRoutes/ProtectedRoute';
import { AuthProvider } from 'context/AuthContext';


/**
 * Crear y editar se abren en un panel lateral sobre el listado (no en otra página).
 * La URL sigue siendo /<modulo>/agregar o /<modulo>/editar/:id; el listado queda detrás.
 */
const PANELES = [
  { modulo: 'cliente',   Agregar: AgregarCliente,   Editar: EditarCliente,   ancho: 'sm:max-w-3xl' },
  { modulo: 'empleado',  Agregar: AgregarEmpleado,  Editar: EditarEmpleado,  ancho: 'sm:max-w-3xl' },
  { modulo: 'plan',      Agregar: AgregarPlan,      Editar: EditarPlan },
  { modulo: 'descuento', Agregar: AgregarDescuento, Editar: EditarDescuento },
  { modulo: 'sucursal',  Agregar: AgregarSucursal,  Editar: EditarSucursal },
  // SaaS (superadmin): empresas y planes del sistema
  { modulo: 'empresa',     Agregar: AgregarEmpresa,  Editar: EditarEmpresa,  ancho: 'sm:max-w-3xl' },
  { modulo: 'suscripcion', Agregar: FormPlanSistema, Editar: FormPlanSistema, ancho: 'sm:max-w-3xl' },
];

const panelDeRuta = (pathname) =>
  PANELES.find(p => new RegExp(`^/${p.modulo}/(agregar|editar/[^/]+)/?$`).test(pathname)) || null;

function AppContent() {
  const location = useLocation();
  const panel = panelDeRuta(location.pathname);
  // Con panel abierto, la pantalla de fondo es el listado del módulo
  const fondo = panel ? { ...location, pathname: `/${panel.modulo}/listar` } : location;

  return (
    <>
    {panel && (
      <Routes>
        <Route path={`/${panel.modulo}/agregar`} element={
          <ProtectedRoute requiredPermission={`${panel.modulo}.store`} element={
            <PanelLateral volverA={`/${panel.modulo}/listar`} ancho={panel.ancho}><panel.Agregar /></PanelLateral>
          } />
        } />
        <Route path={`/${panel.modulo}/editar/:id`} element={
          <ProtectedRoute requiredPermission={`${panel.modulo}.update`} element={
            <PanelLateral volverA={`/${panel.modulo}/listar`} ancho={panel.ancho}><panel.Editar /></PanelLateral>
          } />
        } />
      </Routes>
    )}
    <Routes location={fondo}>
      {/* 1. LOGIN */}
      <Route path="/" element={<ProtectedRouteHome element={<Login />} />} />

      {/* 2. LAYOUT GLOBAL */}
      <Route element={<ProtectedRoute element={<SidebarLayout />} />}>

        {/* HOME */}
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        
        {/* CLIENTES */}
        <Route path="/cliente/agregar" element={<ProtectedRoute requiredPermission="cliente.store" element={<AgregarCliente />} />} />
        <Route path="/cliente/editar/:id" element={<ProtectedRoute requiredPermission="cliente.update" element={<EditarCliente />} />} />
        <Route path="/cliente/listar" element={<ProtectedRoute requiredPermission="cliente.index" element={<ListarClientes />} />} />

        {/* EMPLEADOS */}
        <Route path="/empleado/agregar" element={<ProtectedRoute requiredPermission="empleado.store" element={<AgregarEmpleado />} />} />
        <Route path="/empleado/editar/:id" element={<ProtectedRoute requiredPermission="empleado.update" element={<EditarEmpleado />} />} />
        <Route path="/empleado/listar" element={<ProtectedRoute requiredPermission="empleado.index" element={<ListarEmpleados />} />} />

        {/* PLANES */}
        <Route path="/plan/agregar" element={<ProtectedRoute requiredPermission="plan.store" element={<AgregarPlan />} />} />
        <Route path="/plan/editar/:id" element={<ProtectedRoute requiredPermission="plan.update" element={<EditarPlan />} />} />
        <Route path="/plan/listar" element={<ProtectedRoute requiredPermission="plan.index" element={<ListarPlanes />} />} />
        
        {/* DESCUENTOS */}
        <Route path="/descuento/agregar" element={<ProtectedRoute requiredPermission="descuento.store" element={<AgregarDescuento />} />} />
        <Route path="/descuento/editar/:id" element={<ProtectedRoute requiredPermission="descuento.update" element={<EditarDescuento />} />} />
        <Route path="/descuento/listar" element={<ProtectedRoute requiredPermission="descuento.index" element={<ListarDescuentos />} />} />

        {/* MEMBRESIA */}
        <Route path="/membresia/:id" element={<ProtectedRoute requiredPermission="membresia.index" element={<MembresiaIndex />} />} />

        {/* MI PERFIL */}
        <Route path="/mi-perfil" element={<ProtectedRoute requiredPermission="perfil.index" element={<MiPerfil />} />} />

        {/* SETTINGS */}
        <Route path="/rol/listar" element={<ProtectedRoute requiredPermission="rol.index" element={<ListarRoles />} />} />

        {/* CLASES E INVENTARIO */}
        <Route path="/clases" element={<ProtectedRoute requiredPermission="clase.index" element={<Clases />} />} />
        <Route path="/inventario" element={<ProtectedRoute requiredPermission="inventario.index" element={<Inventario />} />} />
        <Route path="/productos" element={<ProtectedRoute requiredPermission="producto.index" element={<Productos />} />} />
        <Route path="/reportes" element={<ProtectedRoute requiredPermission="reporte.ventas" element={<Reportes />} />} />
        <Route path="/bitacora" element={<ProtectedRoute requiredPermission="auditoria.index" element={<Bitacora />} />} />
        <Route path="/mi-progreso" element={<ProtectedRoute requiredPermission="progreso.mio" element={<MiProgreso />} />} />
        <Route path="/mis-pagos" element={<ProtectedRoute requiredPermission="perfil.pagos" element={<MisPagos />} />} />
        <Route path="/panel-instructor" element={<ProtectedRoute requiredPermission="clase.panel" element={<PanelInstructor />} />} />
        <Route path="/mi-panel" element={<ProtectedRoute requiredPermission="perfil.index" element={<MiPanel />} />} />
        <Route path="/mis-rutinas" element={<ProtectedRoute requiredPermission="rutina.mias" element={<MisRutinas />} />} />
        <Route path="/mis-rutinas/entrenar/:id/:dia" element={<ProtectedRoute requiredPermission="rutina.mias" element={<Entrenar />} />} />
        <Route path="/traslados" element={<ProtectedRoute requiredPermission="traslado.index" element={<Traslados />} />} />

        {/* CAJA Y PAGOS */}
        <Route path="/caja" element={<ProtectedRoute requiredPermission="cajaSesion.actual" element={<Caja />} />} />
        <Route path="/caja/historial" element={<ProtectedRoute requiredPermission="cajaSesion.index" element={<HistorialCajas />} />} />
        <Route path="/caja/listar" element={<ProtectedRoute requiredPermission="caja.index" element={<ListarCajas />} />} />
        <Route path="/pago/listar" element={<ProtectedRoute requiredPermission="pago.index" element={<ListarPagos />} />} />
        <Route path="/pin/listar" element={<ProtectedRoute requiredPermission="pin.index" element={<ListarPines />} />} />
        <Route path="/metodo-pago" element={<ProtectedRoute requiredPermission="metodoPago.update" element={<MetodosPago />} />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<ProtectedRoute requiredPermission="dashboard.index" element={<Dashboard />} />} />


        {/* SUCURSALES */}
        <Route path="/sucursal/agregar" element={<ProtectedRoute requiredPermission="sucursal.store" element={<AgregarSucursal />} />} />
        <Route path="/sucursal/editar/:id" element={<ProtectedRoute requiredPermission="sucursal.update" element={<EditarSucursal />} />} />
        <Route path="/sucursal/listar" element={<ProtectedRoute requiredPermission="sucursal.index" element={<ListarSucursales />} />} />

        {/* EMPRESAS */}
        {/* MI EMPRESA: datos del negocio y logo de la empresa activa */}
        <Route path="/empresa/datos" element={<ProtectedRoute requiredPermission="miEmpresa.update" element={<MiEmpresa />} />} />

        {/* SaaS — EMPRESAS (superadmin) */}
        <Route path="/empresa/agregar" element={<ProtectedRoute requiredPermission="empresa.store" element={<AgregarEmpresa />} />} />
        <Route path="/empresa/editar/:id" element={<ProtectedRoute requiredPermission="empresa.update" element={<EditarEmpresa />} />} />
        <Route path="/empresa/listar" element={<ProtectedRoute requiredPermission="empresa.index" element={<ListarEmpresas />} />} />

        {/* SaaS — PLANES DEL SISTEMA Y COBRO DE SUSCRIPCIONES (superadmin) */}
        <Route path="/suscripcion/agregar" element={<ProtectedRoute requiredPermission="suscripcion.store" element={<FormPlanSistema />} />} />
        <Route path="/suscripcion/editar/:id" element={<ProtectedRoute requiredPermission="suscripcion.update" element={<FormPlanSistema />} />} />
        <Route path="/suscripcion/listar" element={<ProtectedRoute requiredPermission="suscripcion.index" element={<ListarPlanesSistema />} />} />
        <Route path="/suscripcion/cobros" element={<ProtectedRoute requiredPermission="suscripcion.cobrar" element={<CobrosSuscripcion />} />} />

        {/* SaaS — MI PLAN: cada empresa ve su plan, consumo, beneficios y pagos */}
        <Route path="/mi-plan" element={<ProtectedRoute requiredPermission="suscripcion.miPlan" element={<MiPlan />} />} />

      </Route>

      {/* 3. ERRORES */}
      <Route path="/401" element={<ErrorPage401 />} />
      <Route path="*" element={<ErrorPage404 />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-root min-h-screen bg-[#f6f7f9] text-slate-900">
          <AppContent />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;