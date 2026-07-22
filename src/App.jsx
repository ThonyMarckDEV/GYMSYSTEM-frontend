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

// Utilities
import ProtectedRouteHome from 'utilities/ProtectedRoutes/ProtectedRouteHome';
import ProtectedRoute from 'utilities/ProtectedRoutes/ProtectedRoute';
import { AuthProvider } from 'context/AuthContext';


function AppContent() {
  return (
    <Routes>
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