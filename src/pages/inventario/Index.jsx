import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { index, store, update, cambiarEstado, fotoUrl } from 'services/inventarioService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import SucursalSelect from 'components/Shared/Comboboxes/SucursalSelect';
import { Modal, ImagenProtegida, VisorImagen, errorDeAlerta } from 'components/Pagos/PagoUI';
import { KpiTile } from 'components/Dashboard/Charts';
import {
    WrenchScrewdriverIcon, CheckCircleIcon, ExclamationTriangleIcon, ArchiveBoxXMarkIcon,
    CalendarDaysIcon, PencilSquareIcon, PhotoIcon, CubeIcon, TrashIcon
} from '@heroicons/react/24/outline';

export const CATEGORIAS = {
    cardio: 'Cardio', maquina: 'Máquina', peso_libre: 'Peso libre',
    accesorio: 'Accesorio', mobiliario: 'Mobiliario', otro: 'Otro',
};

const ESTADOS = {
    operativo:     { label: 'Operativo',     icon: CheckCircleIcon,         cls: 'bg-green-50 text-green-700 border-green-200' },
    mantenimiento: { label: 'Mantenimiento', icon: WrenchScrewdriverIcon,   cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    averiado:      { label: 'Averiado',      icon: ExclamationTriangleIcon, cls: 'bg-red-50 text-red-700 border-red-200' },
    baja:          { label: 'De baja',       icon: ArchiveBoxXMarkIcon,     cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const EstadoBadge = ({ estado }) => {
    const e = ESTADOS[estado];
    const Icon = e.icon;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${e.cls}`}><Icon className="w-3.5 h-3.5" /> {e.label}</span>;
};

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';
const FILTROS_INICIALES = { search: '', categoria: '', estado: '', mantenimiento: '' };

/** Registrar / editar equipo (con foto). */
const EquipoFormModal = ({ equipo, onClose, onGuardado }) => {
    const { sucursal } = useAuth();
    const [form, setForm] = useState({
        sucursal_id: equipo?.sucursal_id || '', nombre: equipo?.nombre || '', categoria: equipo?.categoria || 'maquina',
        codigo: equipo?.codigo || '', marca: equipo?.marca || '', modelo: equipo?.modelo || '', cantidad: equipo?.cantidad || 1,
        estado: equipo?.estado || 'operativo', fecha_adquisicion: equipo?.fecha_adquisicion || '', costo: equipo?.costo ?? '',
        ultimo_mantenimiento: equipo?.ultimo_mantenimiento || '', proximo_mantenimiento: equipo?.proximo_mantenimiento || '',
        notas: equipo?.notas || '',
    });
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [quitarFoto, setQuitarFoto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    useEffect(() => {
        if (!foto) { setPreview(null); return; }
        const u = URL.createObjectURL(foto);
        setPreview(u);
        return () => URL.revokeObjectURL(u);
    }, [foto]);

    const guardar = async () => {
        setGuardando(true);
        setAlert(null);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, k === 'nombre' ? String(v).toUpperCase() : (v ?? '')));
            if (foto) fd.append('foto', foto);
            if (quitarFoto) fd.append('quitar_foto', '1');
            const res = equipo ? await update(equipo.id, fd) : await store(fd);
            onGuardado(res.message);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo guardar el equipo'));
        } finally {
            setGuardando(false);
        }
    };

    const conFoto = preview || (equipo?.tiene_foto && !quitarFoto);

    return (
        <Modal titulo={equipo ? `Editar ${equipo.nombre}` : 'Nuevo equipo'} icon={CubeIcon} onClose={onClose} ancho="max-w-3xl" error={errorDeAlerta(alert)}
            pie={<>
                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando || !form.nombre.trim() || (!sucursal && !form.sucursal_id)}
                    className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm disabled:opacity-40">
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
            </>}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Foto */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {preview ? <img src={preview} alt="Nueva foto" className="w-full h-full object-contain" />
                            : conFoto ? <ImagenProtegida url={fotoUrl(equipo.id, equipo.updated_at)} alt={equipo.nombre} className="w-full h-full" />
                            : <div className="text-slate-400 text-xs flex flex-col items-center gap-1"><PhotoIcon className="w-8 h-8" /> Sin foto</div>}
                    </div>
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 cursor-pointer hover:bg-slate-50">
                        <PhotoIcon className="w-4 h-4" /> {conFoto ? 'Cambiar foto' : 'Subir foto'}
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => { setFoto(e.target.files?.[0] || null); setQuitarFoto(false); }} />
                    </label>
                    {conFoto && (
                        <button type="button" onClick={() => { setFoto(null); setQuitarFoto(true); }} className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline">
                            <TrashIcon className="w-3.5 h-3.5" /> Quitar foto
                        </button>
                    )}
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className={labelCls}>Nombre *</label>
                        <input value={form.nombre} onChange={e => set('nombre', e.target.value)} className={inputCls} placeholder="Ej: CAMINADORA" maxLength={100} autoFocus />
                    </div>
                    <div>
                        <label className={labelCls}>Categoría *</label>
                        <select value={form.categoria} onChange={e => set('categoria', e.target.value)} className={inputCls}>
                            {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Estado *</label>
                        <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inputCls}>
                            {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>
                    {sucursal ? (
                        <div><label className={labelCls}>Sede</label><p className="p-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200">{sucursal.nombre}</p></div>
                    ) : (
                        <SucursalSelect label="Sede" required value={form.sucursal_id} onChange={v => set('sucursal_id', v)} />
                    )}
                    <div>
                        <label className={labelCls}>Cantidad *</label>
                        <input type="number" min="1" value={form.cantidad} onChange={e => set('cantidad', e.target.value)} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>Código</label><input value={form.codigo} onChange={e => set('codigo', e.target.value.toUpperCase())} className={inputCls} placeholder="EQ-0001" maxLength={40} /></div>
                    <div><label className={labelCls}>Marca</label><input value={form.marca} onChange={e => set('marca', e.target.value)} className={inputCls} maxLength={60} /></div>
                    <div><label className={labelCls}>Modelo</label><input value={form.modelo} onChange={e => set('modelo', e.target.value)} className={inputCls} maxLength={60} /></div>
                    <div><label className={labelCls}>Costo (S/)</label><input type="number" min="0" step="0.01" value={form.costo} onChange={e => set('costo', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Adquirido el</label><input type="date" value={form.fecha_adquisicion} onChange={e => set('fecha_adquisicion', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Último mantenimiento</label><input type="date" value={form.ultimo_mantenimiento} onChange={e => set('ultimo_mantenimiento', e.target.value)} className={inputCls} /></div>
                    <div className="col-span-2 md:col-span-1"><label className={labelCls}>Próximo mantenimiento</label><input type="date" value={form.proximo_mantenimiento} onChange={e => set('proximo_mantenimiento', e.target.value)} className={inputCls} /></div>
                    <div className="col-span-2">
                        <label className={labelCls}>Notas</label>
                        <textarea rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} className={`${inputCls} resize-none`} placeholder="Historial, fallas, proveedor..." />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

/** Inventario del gimnasio por sede. */
const Index = () => {
    const { can } = useAuth();
    const [loading, setLoading] = useState(true);
    const [equipos, setEquipos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState(FILTROS_INICIALES);
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [editando, setEditando] = useState(null);
    const [ampliada, setAmpliada] = useState(null);

    const fetchEquipos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const r = await index(page, filtersRef.current);
            setEquipos(r.data || []);
            setResumen(r.resumen);
            setPagination({ currentPage: r.current_page, totalPages: r.last_page, total: r.total });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar el inventario'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEquipos(1); }, [fetchEquipos]);

    const aplicarFiltro = (cambios) => {
        const nuevo = { ...filtersRef.current, ...cambios };
        setFilters(nuevo); filtersRef.current = nuevo; fetchEquipos(1);
    };

    const estadoRapido = useCallback(async (equipo, estado) => {
        try {
            const r = await cambiarEstado(equipo.id, estado);
            setAlert({ type: 'success', message: `${equipo.nombre}: ${ESTADOS[estado].label.toLowerCase()}.` });
            fetchEquipos(pagination.currentPage);
            return r;
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo cambiar el estado'));
        }
    }, [fetchEquipos, pagination.currentPage]);

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Nombre, código o marca', placeholder: 'Ej: caminadora', colSpan: 'col-span-12 md:col-span-4' },
        { name: 'categoria', type: 'select', label: 'Categoría', colSpan: 'col-span-6 md:col-span-3',
            options: [{ value: '', label: 'Todas' }, ...Object.entries(CATEGORIAS).map(([value, label]) => ({ value, label }))] },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-6 md:col-span-3',
            options: [{ value: '', label: 'Todos' }, ...Object.entries(ESTADOS).map(([value, e]) => ({ value, label: e.label }))] },
    ], []);

    const columns = useMemo(() => [
        { header: 'Equipo', render: (r) => (
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {r.tiene_foto
                        ? <ImagenProtegida url={fotoUrl(r.id, r.updated_at)} alt={r.nombre} className="w-full h-full" onAbrir={setAmpliada} vacio="" />
                        : <CubeIcon className="w-6 h-6 text-slate-300" />}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{r.nombre}</p>
                    <p className="text-[11px] text-slate-500 truncate">{[r.codigo, r.marca, r.modelo].filter(Boolean).join(' · ') || '—'}</p>
                </div>
            </div>
        ) },
        { header: 'Categoría', render: (r) => <span className="text-xs text-slate-600">{CATEGORIAS[r.categoria]}</span> },
        { header: 'Sede', render: (r) => <span className="text-xs text-slate-600">{r.sucursal}</span> },
        { header: 'Cant.', render: (r) => <span className="text-sm font-black tabular-nums">{r.cantidad}</span> },
        { header: 'Estado', render: (r) => can('inventario.estado') ? (
            <select value={r.estado} onChange={e => estadoRapido(r, e.target.value)} aria-label={`Estado de ${r.nombre}`}
                className={`text-[11px] font-black uppercase rounded-full border px-2 py-1 cursor-pointer ${ESTADOS[r.estado].cls}`}>
                {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
        ) : <EstadoBadge estado={r.estado} /> },
        { header: 'Mantenimiento', render: (r) => {
            if (!r.proximo_mantenimiento) return <span className="text-xs text-slate-400">—</span>;
            const d = r.dias_mantenimiento;
            const urgente = d !== null && d <= 7;
            return (
                <div className="text-xs">
                    <p className="tabular-nums text-slate-700 inline-flex items-center gap-1"><CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" /> {r.proximo_mantenimiento}</p>
                    {d !== null && (
                        <p className={`font-bold ${urgente ? (d < 0 ? 'text-red-700' : 'text-amber-700') : 'text-slate-400'}`}>
                            {d < 0 ? `Vencido hace ${-d} días` : d === 0 ? 'Hoy' : `En ${d} días`}
                        </p>
                    )}
                </div>
            );
        } },
        { header: 'Acciones', render: (r) => can('inventario.update') ? (
            <button onClick={() => setEditando(r)} title="Editar" className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg"><PencilSquareIcon className="w-5 h-5" /></button>
        ) : null },
    ], [can, estadoRapido]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Inventario" subtitle="Máquinas, pesas y accesorios de cada sede" icon={CubeIcon} />
            {can('inventario.store') && (
                <div className="flex justify-end -mt-4 mb-6">
                    <button onClick={() => setEditando('nuevo')} className="bg-primary text-secondary px-6 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-primary-hover">+ Nuevo equipo</button>
                </div>
            )}

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {resumen && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <KpiTile label="Operativos" valor={resumen.operativo} icon={CheckCircleIcon} ayuda="Unidades en uso" />
                    <KpiTile label="En mantenimiento" valor={resumen.mantenimiento} icon={WrenchScrewdriverIcon} />
                    <KpiTile label="Averiados" valor={resumen.averiado} icon={ExclamationTriangleIcon} ayuda="Fuera de servicio" />
                    <KpiTile label="De baja" valor={resumen.baja} icon={ArchiveBoxXMarkIcon} />
                    <button type="button" onClick={() => aplicarFiltro({ mantenimiento: filtersRef.current.mantenimiento ? '' : '1' })}
                        className={`text-left rounded-2xl ${filters.mantenimiento ? 'ring-2 ring-secondary' : ''}`} title="Filtrar equipos con mantenimiento próximo o vencido">
                        <KpiTile destacado label="Mantener pronto" valor={resumen.por_mantener} icon={CalendarDaysIcon}
                            ayuda={filters.mantenimiento ? 'Filtrando · clic para quitar' : 'Próximos 7 días o vencidos · clic para ver'} />
                    </button>
                </div>
            )}

            <Table columns={columns} data={equipos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={() => { filtersRef.current = filters; fetchEquipos(1); }}
                onFilterClear={() => { setFilters(FILTROS_INICIALES); filtersRef.current = FILTROS_INICIALES; fetchEquipos(1); }}
                pagination={{ clave: 'inventario', ...pagination, onPageChange: fetchEquipos }} />

            {editando && (
                <EquipoFormModal equipo={editando === 'nuevo' ? null : editando} onClose={() => setEditando(null)}
                    onGuardado={(msg) => { setEditando(null); setAlert({ type: 'success', message: msg }); fetchEquipos(pagination.currentPage); }} />
            )}
            {ampliada && <VisorImagen src={ampliada} alt="Foto del equipo" onClose={() => setAmpliada(null)} />}
        </div>
    );
};

export default Index;
