import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { descargarArchivo, query } from 'utilities/Archivos/descargar';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { Modal } from 'components/Pagos/PagoUI';
import { KpiTile } from 'components/Dashboard/Charts';
import {
    ShieldCheckIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, CheckCircleIcon, XCircleIcon,
    EyeIcon, ArrowDownTrayIcon, ExclamationTriangleIcon, UsersIcon, BoltIcon, LockClosedIcon
} from '@heroicons/react/24/outline';

const BASE = `${API_BASE_URL}/api/auditoria`;
const FILTROS_INICIALES = { search: '', modulo: '', usuario_id: '', resultado: '', fecha_desde: '', fecha_hasta: '' };
const EVENTOS = { creado: 'bg-green-50 text-green-700 border-green-200', actualizado: 'bg-amber-50 text-amber-800 border-amber-200', eliminado: 'bg-red-50 text-red-700 border-red-200' };

const valorTexto = (v) => v === null || v === undefined || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v);

const Dispositivo = ({ texto }) => {
    const movil = /Móvil|Tablet/.test(texto || '');
    const Icon = movil ? DevicePhoneMobileIcon : ComputerDesktopIcon;
    return <span className="inline-flex items-center gap-1"><Icon className="w-3.5 h-3.5 shrink-0" /> {texto || '—'}</span>;
};

/** Detalle de una línea: lo enviado y los campos que cambiaron (antes → después). */
const DetalleModal = ({ registro: r, onClose }) => (
    <Modal titulo={`Bitácora #${r.id}`} icon={ShieldCheckIcon} onClose={onClose} ancho="max-w-3xl">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt className="text-[10px] uppercase font-bold text-slate-400">Fecha</dt><dd className="font-bold text-slate-800 tabular-nums">{r.fecha}</dd></div>
            <div><dt className="text-[10px] uppercase font-bold text-slate-400">Usuario</dt><dd className="font-bold text-slate-800">{r.usuario || 'Anónimo'} {r.rol && <span className="text-xs font-normal text-slate-500">· {r.rol}</span>}</dd></div>
            <div><dt className="text-[10px] uppercase font-bold text-slate-400">Acción</dt><dd className="text-slate-800">{r.modulo_nombre} · <code className="text-xs">{r.accion}</code></dd></div>
            <div><dt className="text-[10px] uppercase font-bold text-slate-400">Resultado</dt>
                <dd className={`font-bold ${r.exitoso ? 'text-green-700' : 'text-red-700'}`}>{r.exitoso ? 'Exitoso' : 'Fallido'} <span className="text-xs font-normal text-slate-500">(HTTP {r.codigo_http} · {r.duracion_ms} ms)</span></dd></div>
            <div className="sm:col-span-2"><dt className="text-[10px] uppercase font-bold text-slate-400">Descripción</dt><dd className="text-slate-800">{r.descripcion || '—'}</dd></div>
            <div><dt className="text-[10px] uppercase font-bold text-slate-400">IP</dt><dd className="text-slate-800 tabular-nums">{r.ip || '—'}</dd></div>
            <div><dt className="text-[10px] uppercase font-bold text-slate-400">Dispositivo</dt><dd className="text-slate-800"><Dispositivo texto={r.dispositivo} /></dd></div>
            <div className="sm:col-span-2"><dt className="text-[10px] uppercase font-bold text-slate-400">Ruta</dt><dd className="text-xs text-slate-600 break-all"><b>{r.metodo}</b> {r.ruta}{r.sucursal ? ` · sede ${r.sucursal}` : ''}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[10px] uppercase font-bold text-slate-400">Navegador (user agent)</dt><dd className="text-[11px] text-slate-500 break-all">{r.user_agent || '—'}</dd></div>
        </dl>

        {r.cambios?.length > 0 && (
            <div className="mt-5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cambios en los datos</h4>
                <div className="space-y-3">
                    {r.cambios.map((c, i) => {
                        const campos = Array.from(new Set([...Object.keys(c.antes || {}), ...Object.keys(c.despues || {})]));
                        return (
                            <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                                <p className="px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2">
                                    {c.modelo} #{c.id}
                                    <span className={`px-1.5 py-px rounded-full border text-[10px] uppercase ${EVENTOS[c.evento] || ''}`}>{c.evento}</span>
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead><tr className="text-[10px] uppercase text-slate-400"><th className="text-left px-3 py-1">Campo</th>{c.evento !== 'creado' && <th className="text-left px-3 py-1">Antes</th>}{c.evento !== 'eliminado' && <th className="text-left px-3 py-1">Después</th>}</tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {campos.map(k => (
                                                <tr key={k}>
                                                    <td className="px-3 py-1 font-bold text-slate-600 whitespace-nowrap">{k}</td>
                                                    {c.evento !== 'creado' && <td className="px-3 py-1 text-red-700 break-all">{valorTexto(c.antes?.[k])}</td>}
                                                    {c.evento !== 'eliminado' && <td className="px-3 py-1 text-green-700 break-all">{valorTexto(c.despues?.[k])}</td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {r.datos && Object.keys(r.datos).length > 0 && (
            <div className="mt-5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Datos enviados</h4>
                <pre className="text-[11px] bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto max-h-64">{JSON.stringify(r.datos, null, 2)}</pre>
            </div>
        )}
    </Modal>
);

/** Bitácora de auditoría: todo lo que se hizo en el sistema (solo superadmin). */
const Index = () => {
    const [loading, setLoading] = useState(true);
    const [registros, setRegistros] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState(FILTROS_INICIALES);
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [exportando, setExportando] = useState(false);

    const fetchRegistros = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const r = await handleResponse(await fetchWithAuth(`${BASE}/index${query({ page, ...filtersRef.current })}`, { method: 'GET' }));
            setRegistros(r.data || []);
            setResumen(r.resumen);
            setPagination({ currentPage: r.current_page, totalPages: r.last_page, total: r.total });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar la bitácora'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRegistros(1); }, [fetchRegistros]);

    const aplicar = (cambios) => {
        const nuevo = { ...filtersRef.current, ...cambios };
        setFilters(nuevo); filtersRef.current = nuevo; fetchRegistros(1);
    };

    const exportar = async () => {
        setExportando(true); setAlert(null);
        try {
            await descargarArchivo(`${BASE}/exportar${query(filtersRef.current)}`, 'bitacora.xlsx');
        } catch (e) {
            setAlert({ type: 'error', message: e.message });
        } finally {
            setExportando(false);
        }
    };

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Usuario, descripción o IP', placeholder: 'Ej: 190.12.34.56', colSpan: 'col-span-12 md:col-span-4' },
        { name: 'modulo', type: 'select', label: 'Módulo', colSpan: 'col-span-6 md:col-span-2',
            options: [{ value: '', label: 'Todos' }, ...(resumen?.modulos || [])] },
        { name: 'usuario_id', type: 'select', label: 'Usuario', colSpan: 'col-span-6 md:col-span-2',
            options: [{ value: '', label: 'Todos' }, ...(resumen?.usuarios || [])] },
        { name: 'resultado', type: 'select', label: 'Resultado', colSpan: 'col-span-6 md:col-span-2',
            options: [{ value: '', label: 'Todos' }, { value: 'exitoso', label: 'Exitosos' }, { value: 'fallido', label: 'Fallidos' }] },
        { name: 'fecha_desde', type: 'date', label: 'Desde', colSpan: 'col-span-6 md:col-span-2' },
        { name: 'fecha_hasta', type: 'date', label: 'Hasta', colSpan: 'col-span-6 md:col-span-2' },
    ], [resumen]);

    const columns = useMemo(() => [
        { header: 'Fecha', render: (r) => (
            <div className="tabular-nums whitespace-nowrap">
                <p className="text-xs font-bold text-slate-700">{r.fecha?.slice(0, 10)}</p>
                <p className="text-[11px] text-slate-400">{r.fecha?.slice(11, 19)}</p>
            </div>
        ) },
        { header: 'Usuario', render: (r) => (
            <div className="min-w-0 max-w-[200px]">
                <p className="text-sm font-bold text-slate-800 truncate">{r.usuario || 'Anónimo'}</p>
                <p className="text-[11px] text-slate-400">{r.rol || '—'}{r.sucursal ? ` · ${r.sucursal}` : ''}</p>
            </div>
        ) },
        { header: 'Acción', render: (r) => (
            <div className="max-w-[320px]">
                <p className="text-xs font-black uppercase text-secondary">{r.modulo_nombre} <span className="font-semibold normal-case text-slate-500">· {r.accion}</span></p>
                <p className="text-xs text-slate-600 line-clamp-2" title={r.descripcion}>{r.descripcion || '—'}</p>
                {r.cambios?.length > 0 && <p className="text-[10px] text-slate-400">{r.cambios.length} {r.cambios.length === 1 ? 'registro modificado' : 'registros modificados'}</p>}
            </div>
        ) },
        { header: 'Resultado', render: (r) => r.exitoso
            ? <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-green-700"><CheckCircleIcon className="w-4 h-4" /> OK</span>
            : <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-red-700"><XCircleIcon className="w-4 h-4" /> Falló</span> },
        { header: 'IP / dispositivo', render: (r) => (
            <div className="text-[11px] text-slate-600">
                <button type="button" onClick={() => aplicar({ search: r.ip })} className="font-bold tabular-nums hover:underline" title="Ver todo lo hecho desde esta IP">{r.ip || '—'}</button>
                <p className="text-slate-400"><Dispositivo texto={r.dispositivo} /></p>
            </div>
        ) },
        { header: '', render: (r) => (
            <button onClick={() => setDetalle(r)} title="Ver detalle" className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg"><EyeIcon className="w-5 h-5" /></button>
        ) },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Bitácora" subtitle="Auditoría: quién hizo qué, cuándo, desde qué IP y dispositivo" icon={ShieldCheckIcon} />
            <div className="flex justify-end -mt-2 mb-6">
                <button onClick={exportar} disabled={exportando}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary text-primary font-black uppercase text-sm hover:bg-secondary/90 disabled:opacity-50">
                    <ArrowDownTrayIcon className="w-4 h-4" /> {exportando ? 'Generando...' : 'Exportar a Excel'}
                </button>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {resumen && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KpiTile label="Acciones hoy" valor={resumen.acciones_hoy} icon={BoltIcon} />
                    <KpiTile label="Usuarios activos hoy" valor={resumen.usuarios_hoy} icon={UsersIcon} />
                    <button type="button" className="text-left" title="Ver las acciones fallidas" onClick={() => aplicar({ resultado: 'fallido', modulo: '' })}>
                        <KpiTile label="Fallidas hoy" valor={resumen.fallidas_hoy} icon={ExclamationTriangleIcon} ayuda="Clic para ver" />
                    </button>
                    <button type="button" className="text-left" title="Ver los inicios de sesión fallidos" onClick={() => aplicar({ modulo: 'auth', resultado: 'fallido' })}>
                        <KpiTile destacado label="Logins fallidos hoy" valor={resumen.logins_fallidos_hoy} icon={LockClosedIcon} ayuda="Posibles intentos de acceso · clic para ver" />
                    </button>
                </div>
            )}

            <Table columns={columns} data={registros} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={() => { filtersRef.current = filters; fetchRegistros(1); }}
                onFilterClear={() => { setFilters(FILTROS_INICIALES); filtersRef.current = FILTROS_INICIALES; fetchRegistros(1); }}
                pagination={{ ...pagination, onPageChange: fetchRegistros }} />

            {detalle && <DetalleModal registro={detalle} onClose={() => setDetalle(null)} />}
        </div>
    );
};

export default Index;
