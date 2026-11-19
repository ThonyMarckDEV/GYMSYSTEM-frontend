import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { index, store, update, toggleStatus } from 'services/cajaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import EstadoToggle, { SinAcciones } from 'components/Shared/Tables/EstadoToggle';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import SucursalSelect from 'components/Shared/Comboboxes/SucursalSelect';
import { Modal, errorDeAlerta } from 'components/Pagos/PagoUI';
import { InboxStackIcon, PencilSquareIcon, LockOpenIcon } from '@heroicons/react/24/outline';

const FILTROS_INICIALES = { search: '', estado: '' };
const inputCls = 'w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none bg-white';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

/** Registrar / editar caja (misma ventana). */
const CajaFormModal = ({ caja, onClose, onGuardado }) => {
    const { sucursal } = useAuth();
    const [form, setForm] = useState({
        nombre: caja?.nombre || '',
        descripcion: caja?.descripcion || '',
        sucursal_id: caja?.sucursal_id ? String(caja.sucursal_id) : '',
    });
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);

    const guardar = async () => {
        setGuardando(true);
        setAlert(null);
        try {
            const data = { ...form, sucursal_id: form.sucursal_id || null };
            if (caja) await update(caja.id, data);
            else await store(data);
            onGuardado(caja ? 'Caja actualizada.' : 'Caja registrada.');
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo guardar la caja'));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal titulo={caja ? `Editar ${caja.nombre}` : 'Nueva caja'} icon={InboxStackIcon} onClose={onClose} error={errorDeAlerta(alert)}
            pie={<>
                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando || !form.nombre.trim() || (!sucursal && !form.sucursal_id)}
                    className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm disabled:opacity-40">
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
            </>}>
            <div className="space-y-4">
                {!sucursal && (
                    <SucursalSelect label="Sucursal" required value={form.sucursal_id}
                        onChange={(v) => setForm(f => ({ ...f, sucursal_id: v }))} />
                )}
                <div>
                    <label className={labelCls}>Nombre *</label>
                    <input value={form.nombre} maxLength={50} autoFocus
                        onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value.toUpperCase() }))}
                        className={inputCls} placeholder="Ej: CAJA 1, CAJA RECEPCIÓN" />
                </div>
                <div>
                    <label className={labelCls}>Descripción</label>
                    <input value={form.descripcion} maxLength={150}
                        onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
                        className={inputCls} placeholder="Ej: Caja junto a la puerta principal" />
                </div>
            </div>
        </Modal>
    );
};

/** CRUD de cajas físicas: una sucursal puede tener una o varias. */
const Listar = () => {
    const { can } = useAuth();
    const [loading, setLoading] = useState(true);
    const [cajas, setCajas] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState(FILTROS_INICIALES);
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [editando, setEditando] = useState(null);   // null | 'nueva' | caja
    const [aCambiar, setACambiar] = useState(null);

    const fetchCajas = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            setCajas(res.data || []);
            setPagination({ currentPage: res.current_page, totalPages: res.last_page, total: res.total });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar las cajas'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCajas(1); }, [fetchCajas]);

    const cambiarEstado = async () => {
        const id = aCambiar;
        setACambiar(null);
        try {
            await toggleStatus(id);
            setAlert({ type: 'success', message: 'Estado de la caja actualizado.' });
            fetchCajas(pagination.currentPage);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo cambiar el estado'));
        }
    };

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar por nombre', placeholder: 'Ej: CAJA 1', colSpan: 'col-span-12 md:col-span-6' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
            options: [{ value: '', label: 'Todas' }, { value: '1', label: 'Activas' }, { value: '0', label: 'Inactivas' }] },
    ], []);

    const columns = useMemo(() => [
        { header: 'Caja', render: (r) => (
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full border bg-primary-light border-primary/30"><InboxStackIcon className="w-6 h-6 text-secondary" /></div>
                <div>
                    <p className="font-bold text-slate-800 text-sm">{r.nombre}</p>
                    <p className="text-xs text-slate-500 max-w-[220px] truncate">{r.descripcion || 'Sin descripción'}</p>
                </div>
            </div>
        ) },
        { header: 'Sucursal', render: (r) => <span className="text-sm text-slate-600">{r.sucursal}</span> },
        { header: 'Turno actual', render: (r) => r.abierta_por ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-800 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                <LockOpenIcon className="w-3.5 h-3.5" /> Abierta por {r.abierta_por} · {r.abierta_at?.slice(11, 16)}
            </span>
        ) : <span className="text-xs text-slate-400">Cerrada</span> },
        { header: 'Turnos', render: (r) => <span className="text-sm tabular-nums text-slate-600">{r.turnos}</span> },
        { header: 'Estado', render: (r) => (
            <EstadoToggle activo={r.estado} si="Activa" no="Inactiva" puede={can('caja.status')} onClick={() => setACambiar(r.id)} />
        ) },
        { header: 'Acciones', render: (r) => !can('caja.update') ? <SinAcciones /> : (
            <button onClick={() => setEditando(r)} title="Editar" className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg">
                <PencilSquareIcon className="w-5 h-5" />
            </button>
        ) },
    ], [can]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Cajas" subtitle="Cajas de cada sucursal (una sede puede tener varias)" icon={InboxStackIcon} />
            {can('caja.store') && (
                <div className="flex justify-end -mt-4 mb-6">
                    <button onClick={() => setEditando('nueva')} className="bg-primary text-secondary px-6 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-primary-hover">
                        + Nueva caja
                    </button>
                </div>
            )}

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table columns={columns} data={cajas} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={() => { filtersRef.current = filters; fetchCajas(1); }}
                onFilterClear={() => { setFilters(FILTROS_INICIALES); filtersRef.current = FILTROS_INICIALES; fetchCajas(1); }}
                pagination={{ clave: 'cajas', ...pagination, onPageChange: fetchCajas }} />

            {editando && (
                <CajaFormModal caja={editando === 'nueva' ? null : editando}
                    onClose={() => setEditando(null)}
                    onGuardado={(msg) => { setEditando(null); setAlert({ type: 'success', message: msg }); fetchCajas(pagination.currentPage); }} />
            )}
            {aCambiar && (
                <ConfirmModal message="¿Cambiar el estado de esta caja? Una caja inactiva no se puede abrir."
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={cambiarEstado} onCancel={() => setACambiar(null)} />
            )}
        </div>
    );
};

export default Listar;
