import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ConfiguracionInicial from 'pages/empresa/ConfiguracionInicial';

// UI CLASES E INVENTARIO
import Clases from 'pages/clase/Index';
import Inventario from 'pages/inventario/Index';
import Productos from 'pages/producto/Index';
import Reportes from 'pages/reporte/Index';
import Bitacora from 'pages/auditoria/Index';
import MisRutinas from 'pages/rutina/Index';
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


function AppContent() {
  return (
    <Routes>
      {/* 1. LOGIN */}
      <Route path="/" element={<ProtectedRouteHome element={<Login />} />} />

      {/* PRIMER INICIO: el superadmin configura y activa la empresa (sin sidebar) */}
      <Route path="/configuracion-inicial" element={<ProtectedRoute element={<ConfiguracionInicial />} />} />

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
        <Route path="/empresa/datos" element={<ProtectedRoute requiredPermission="empresa.update" element={<MiEmpresa />} />} />

      </Route>

      {/* 3. ERRORES */}
      <Route path="/401" element={<ErrorPage401 />} />
      <Route path="*" element={<ErrorPage404 />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-primary">
          <AppContent />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;