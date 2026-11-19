import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Bars3Icon, 
    ChevronDownIcon, 
    ChevronLeftIcon,
    ArrowRightOnRectangleIcon,
    HomeIcon,
    CubeIcon,
    PercentBadgeIcon,
    BuildingOffice2Icon,
    BuildingStorefrontIcon,
    ChartBarIcon,
    BanknotesIcon,
    CreditCardIcon,
    KeyIcon,
    DevicePhoneMobileIcon,
    ArchiveBoxIcon,
    InboxStackIcon,
    CalendarDaysIcon,
    CubeTransparentIcon,
    ShoppingBagIcon,
    ArrowsRightLeftIcon,
    DocumentArrowDownIcon,
    ShieldCheckIcon,
    ClipboardDocumentListIcon,
    Squares2X2Icon,
    ScaleIcon,
} from '@heroicons/react/24/outline';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import SucursalSelector from 'components/Shared/Comboboxes/SucursalSelector';
import {Settings,TagIcon,User2Icon, UserCircleIcon, UserSquare2Icon } from 'lucide-react';
import { useAuth } from 'context/AuthContext';

// Marca: logo de la empresa o la pesa
import { MarcaSidebar } from 'components/Shared/Marca';

// =======================================================================
// CONFIGURACIÓN MAESTRA DEL MENÚ
// =======================================================================
const MENU_GROUPS = [
    {
        groupName: 'Principal',
        items: [
            {
                section: 'Home',
                link: '/home',
                icon: HomeIcon,
            },
            {
                section: 'Dashboard',
                link: '/dashboard',
                icon: ChartBarIcon,
                requiredPermission: 'dashboard.index',
            },
            { section: 'Mi Panel', link: '/mi-panel', icon: Squares2X2Icon, requiredPermission: 'perfil.index' },
            { section: 'Mi Panel', link: '/panel-instructor', icon: Squares2X2Icon, requiredPermission: 'clase.panel' },
            { section: 'Reportes', link: '/reportes', icon: DocumentArrowDownIcon, requiredPermission: 'reporte.ventas' },
        ]
    },
    {
        groupName: 'Mi Cuenta',
        items: [
            {
                section: 'Mi Perfil',
                link: '/mi-perfil',
                icon: UserCircleIcon,
                requiredPermission: 'perfil.index',
            },
            { section: 'Mis Pagos', link: '/mis-pagos', icon: CreditCardIcon, requiredPermission: 'perfil.pagos' },
            { section: 'Mis Rutinas', link: '/mis-rutinas', icon: ClipboardDocumentListIcon, requiredPermission: 'rutina.mias' },
            { section: 'Mi Progreso', link: '/mi-progreso', icon: ScaleIcon, requiredPermission: 'progreso.mio' },
        ]
    },
    {
        groupName: 'Administración',
        items: [
            { 
                section: 'Clientes', icon: User2Icon,
                subs: [
                    { name: 'Listar', link: '/cliente/listar', requiredPermission: 'cliente.index' },
                    { name: 'Agregar', link: '/cliente/agregar', requiredPermission: 'cliente.store' },
                ],
            },
            { 
                section: 'Empleados', icon: UserSquare2Icon,
                subs: [
                    { name: 'Listar', link: '/empleado/listar', requiredPermission: 'empleado.index' },
                    { name: 'Agregar', link: '/empleado/agregar', requiredPermission: 'empleado.store' },
                ],
            },
        ]
    },
    {
        groupName: 'Caja y Pagos',
        items: [
            { section: 'Mi Caja', link: '/caja', icon: BanknotesIcon, requiredPermission: 'cajaSesion.actual' },
            { section: 'Pagos', link: '/pago/listar', icon: CreditCardIcon, requiredPermission: 'pago.index' },
            { section: 'Historial de Cajas', link: '/caja/historial', icon: ArchiveBoxIcon, requiredPermission: 'cajaSesion.index' },
            { section: 'Cajas', link: '/caja/listar', icon: InboxStackIcon, requiredPermission: 'caja.index' },
            { section: 'PINs de Autorización', link: '/pin/listar', icon: KeyIcon, requiredPermission: 'pin.index' },
            { section: 'Métodos de Pago', link: '/metodo-pago', icon: DevicePhoneMobileIcon, requiredPermission: 'metodoPago.update' },
        ]
    },
    {
        groupName: 'Gimnasio',
        items: [
            { section: 'Clases', link: '/clases', icon: CalendarDaysIcon, requiredPermission: 'clase.index' },
            { section: 'Inventario', link: '/inventario', icon: CubeTransparentIcon, requiredPermission: 'inventario.index' },
            { section: 'Productos', link: '/productos', icon: ShoppingBagIcon, requiredPermission: 'producto.index' },
            { section: 'Traslados', link: '/traslados', icon: ArrowsRightLeftIcon, requiredPermission: 'traslado.index' },
            { 
                section: 'Planes', icon: TagIcon,
                subs: [
                    { name: 'Listar', link: '/plan/listar', requiredPermission: 'plan.index' },
                    { name: 'Agregar', link: '/plan/agregar', requiredPermission: 'plan.store' },
                ],
            },
            { 
                section: 'Descuentos', icon: PercentBadgeIcon,
                subs: [
                    { name: 'Listar', link: '/descuento/listar', requiredPermission: 'descuento.index' },
                    { name: 'Agregar', link: '/descuento/agregar', requiredPermission: 'descuento.store' },
                ],
            }
        ]
    },
    {
        groupName: 'Configuracion',
        items: [
            { section: 'Bitácora', link: '/bitacora', icon: ShieldCheckIcon, requiredPermission: 'auditoria.index' },
            {
                section: 'Sucursales', icon: BuildingStorefrontIcon,
                subs: [
                    { name: 'Listar', link: '/sucursal/listar', requiredPermission: 'sucursal.index' },
                    { name: 'Agregar', link: '/sucursal/agregar', requiredPermission: 'sucursal.store' },
                ],
            },
            {
                section: 'Datos de la Empresa', icon: BuildingOffice2Icon,
                link: '/empresa/datos', requiredPermission: 'empresa.update',
            },
            { 
                section: 'Roles y Permisos', icon: Settings,
                link: '/rol/listar', requiredPermission: 'rol.index'
            },
        ]
    }
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false); // Modal state para móvil
    const [openSection, setOpenSection] = useState(null); 
    const [showConfirm, setShowConfirm] = useState(false);
    
    const location = useLocation();
    const { can, logout } = useAuth();

    const handleLogout = () => { logout(); setShowConfirm(false); };
    
    const userMenuGroups = useMemo(() => {
        return MENU_GROUPS.map(group => {
            const filteredItems = group.items.map(item => {
                if (item.subs) {
                    const visibleSubs = item.subs.filter(sub => can(sub.requiredPermission));
                    return { ...item, subs: visibleSubs };
                }
                return item;
            }).filter(item => {
                if (item.subs) return item.subs.length > 0;
                if (!item.requiredPermission) return true;
                return can(item.requiredPermission);
            });

            return { ...group, items: filteredItems };
        }).filter(group => group.items.length > 0);
    }, [can]);

    const handleSectionClick = (section) => { 
        if (isCollapsed && window.innerWidth >= 768) {
            setIsCollapsed(false); 
            setOpenSection(section);
        } else {
            setOpenSection(prev => prev === section ? null : section); 
        }
    };

    const isSectionActive = useCallback((item) => {
        if (item.subs) return item.subs.some(sub => location.pathname.startsWith(sub.link));
        if (item.link) return location.pathname === item.link; 
        return false;
    }, [location.pathname]);
    
    useEffect(() => {
        if (openSection === null) {
            for (const group of userMenuGroups) {
                const activeItem = group.items.find(item => isSectionActive(item));
                if (activeItem && activeItem.subs) {
                    setOpenSection(activeItem.section);
                    break;
                }
            }
        }
    }, [location.pathname, userMenuGroups, isSectionActive, openSection]); 

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const sidebarWidth = isCollapsed ? 'md:w-20' : 'md:w-72';

    return (
        <>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* 1. Botón Móvil (Hamburguesa) */}
            <button className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-card" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir menú">
                <Bars3Icon className="h-5 w-5" />
            </button>

            {/* 2. Overlay Móvil */}
            <div 
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden
                    ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* 3. Sidebar Container — negro con acentos amarillos */}
            <div
                className={`app-sidebar fixed left-0 top-0 h-screen bg-secondary border-r border-white/5 z-40 transition-all duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full'} 
                    ${sidebarWidth} md:translate-x-0`}
                style={{ height: '100dvh' }}
            >
                {/* Botón Flotante para Retraer/Expandir (Solo visible en PC) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-card z-50 text-slate-500 hover:text-slate-900 transition-all"
                    aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
                >
                    <ChevronLeftIcon className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>

                {/* HEADER */}
                <div className={`flex items-center flex-shrink-0 h-[72px] border-b border-white/5 ${isCollapsed ? 'px-5 md:justify-center md:px-0' : 'px-5'}`}>
                    {/* Logo que la empresa sube en Configuración (o la pesa si no tiene) */}
                    <div className={isCollapsed ? 'md:hidden w-full' : 'w-full'}><MarcaSidebar /></div>
                    {isCollapsed && <div className="hidden md:block"><MarcaSidebar colapsado /></div>}
                </div>

                {/* EMPRESA ACTIVA (multitenant) */}
                <SucursalSelector isCollapsed={isCollapsed} />

                {/* BODY (Mapeo por Grupos) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 hide-scrollbar px-3 relative">
                    {userMenuGroups.map((group, gIndex) => (
                        <div key={gIndex} className="mb-5">

                            <div className={`px-3 mb-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider transition-all duration-300
                                ${isCollapsed ? 'md:opacity-0 md:h-0 md:mb-0 overflow-hidden' : 'opacity-100'}`}>
                                {group.groupName}
                            </div>

                            {isCollapsed && gIndex !== 0 && (
                                <div className="hidden md:block border-t border-white/5 my-3 mx-3" />
                            )}

                            <div className="space-y-0.5">
                                {group.items.map((item, idx) => {
                                    const isActive = isSectionActive(item);
                                    const isSubOpen = item.subs && openSection === item.section;
                                    const IconComponent = item.icon || CubeIcon;

                                    const itemBaseClasses = "flex items-center flex-nowrap w-full px-3 py-2.5 rounded-lg transition-colors duration-150 group relative overflow-hidden";
                                    const activeClasses = "bg-white/10 text-white font-medium [&>svg:first-child]:text-primary";
                                    const inactiveClasses = "text-zinc-400 hover:bg-white/5 hover:text-white";
                                    
                                    return (
                                        <div key={idx}>
                                            {item.subs ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleSectionClick(item.section)} 
                                                        className={`${itemBaseClasses} ${isActive && isCollapsed ? 'bg-white/10 text-white' : (isActive ? activeClasses : inactiveClasses)}`}
                                                        title={isCollapsed ? item.section : ''}
                                                    >
                                                        <IconComponent className="h-5 w-5 flex-shrink-0 min-w-[20px]" /> 
                                                        
                                                        <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 
                                                            ${isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'md:w-auto md:opacity-100 ml-3'}`}>
                                                            {item.section}
                                                        </span>

                                                        <ChevronDownIcon 
                                                            className={`ml-auto h-4 w-4 transition-transform duration-300 flex-shrink-0
                                                            ${isSubOpen ? 'rotate-180' : ''}
                                                            ${isCollapsed ? 'md:hidden' : ''}
                                                        `} />
                                                    </button>

                                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out 
                                                        ${isSubOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                                                        ${isCollapsed ? 'md:hidden' : ''} 
                                                    `}>
                                                        <ul className="ml-[22px] pl-3 border-l border-white/10 space-y-0.5 py-0.5">
                                                            {item.subs.map((sub, sIdx) => (
                                                                <li key={sIdx}>
                                                                    <Link to={sub.link} onClick={() => setIsOpen(false)} 
                                                                        className={`block py-2 px-3 rounded-md text-[13px] font-medium transition-colors truncate
                                                                        ${location.pathname.startsWith(sub.link) 
                                                                            ? 'text-white bg-white/5' 
                                                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                                                        {sub.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </>
                                            ) : (
                                                <Link to={item.link} onClick={() => setIsOpen(false)} 
                                                    className={`${itemBaseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                                                    title={isCollapsed ? item.section : ''}
                                                >
                                                    <IconComponent className="h-5 w-5 flex-shrink-0 min-w-[20px]" />
                                                    <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300
                                                        ${isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'md:w-auto md:opacity-100 ml-3'}`}>
                                                        {item.section}
                                                    </span>
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="p-3 border-t border-white/5 flex-shrink-0">
                    <button onClick={() => setShowConfirm(true)} 
                        className={`flex items-center w-full px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150 group ${isCollapsed ? 'md:justify-center' : ''}`} 
                        title="Cerrar Sesión">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0 min-w-[20px]" />
                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 text-sm font-medium 
                             ${isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'md:w-auto md:opacity-100 ml-3'}`}>
                            Salir
                        </span>
                    </button>
                </div>
            </div>

            {showConfirm && (
                <ConfirmModal message="¿Deseas cerrar sesión del sistema?" onConfirm={handleLogout} onCancel={() => setShowConfirm(false)} />
            )}
        </>
    );
};

export default Sidebar;