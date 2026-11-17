import React, { useEffect, useState } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { store, update, instructores as listarInstructores } from 'services/claseService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import { Modal, errorDeAlerta } from 'components/Pagos/PagoUI';
import SucursalSelect from 'components/Shared/Comboboxes/SucursalSelect';
import { aISO } from 'utilities/Fechas/fechas';

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';

/** Crear / editar una clase. El instructor crea las suyas; el admin elige el instructor. */
const ClaseFormModal = ({ clase, fechaInicial, onClose, onGuardado }) => {
    const { role, sucursal } = useAuth();
    const esInstructor = role === 'instructor';
    const editando = !!clase;

    const [form, setForm] = useState({
        nombre: clase?.nombre || '',
        descripcion: clase?.descripcion || '',
        lugar: clase?.lugar || '',
        fecha: clase?.fecha || fechaInicial || aISO(new Date()),
        hora_inicio: clase?.hora_inicio || '07:00',
        hora_fin: clase?.hora_fin || '08:00',
        cupo: clase?.cupo || 15,
        instructor_id: clase?.instructor?.id || '',
        sucursal_id: clase?.sucursal?.id || '',
        repetir_semanas: 0,
    });
    const [instructores, setInstructores] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (esInstructor) return;
        listarInstructores().then(r => setInstructores(r.data || [])).catch(() => setInstructores([]));
    }, [esInstructor]);

    const instructorElegido = instructores.find(i => String(i.id) === String(form.instructor_id));
    // La sede la define (en orden) la sede fija de quien crea, o la del instructor; si no, se elige
    const sedeFija = sucursal || (esInstructor ? null : instructorElegido?.sucursal_id ? { nombre: instructorElegido.sucursal } : null);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const guardar = async () => {
        setGuardando(true);
        setAlert(null);
        try {
            const data = { ...form, nombre: form.nombre.trim().toUpperCase(), cupo: Number(form.cupo) };
            if (esInstructor) delete data.instructor_id;
            const res = editando ? await update(clase.id, data) : await store(data);
            onGuardado(res.message);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo guardar la clase'));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal titulo={editando ? `Editar ${clase.nombre}` : 'Nueva clase'} icon={CalendarDaysIcon} onClose={onClose} ancho="max-w-2xl" error={errorDeAlerta(alert)}
            pie={<>
                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando || !form.nombre.trim() || (!esInstructor && !form.instructor_id)}
                    className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm disabled:opacity-40">
                    {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear clase'}
                </button>
            </>}>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-4">
                    <label className={labelCls}>Nombre *</label>
                    <input value={form.nombre} onChange={e => set('nombre', e.target.value)} className={inputCls} placeholder="Ej: SPINNING, YOGA, FUNCIONAL" maxLength={60} autoFocus />
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Cupo *</label>
                    <input type="number" min="1" max="200" value={form.cupo} onChange={e => set('cupo', e.target.value)} className={inputCls} />
                </div>

                <div className="md:col-span-2">
                    <label className={labelCls}>Día *</label>
                    <input type="date" value={form.fecha} min={editando ? undefined : aISO(new Date())} onChange={e => set('fecha', e.target.value)} className={inputCls} />
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Inicio *</label>
                    <input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className={inputCls} />
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Fin *</label>
                    <input type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)} className={inputCls} />
                </div>

                {!esInstructor && (
                    <div className="md:col-span-3">
                        <label className={labelCls}>Instructor *</label>
                        <select value={form.instructor_id} onChange={e => set('instructor_id', e.target.value)} className={inputCls}>
                            <option value="">-- Seleccionar instructor --</option>
                            {instructores.map(i => <option key={i.id} value={i.id}>{i.nombre} (sede: {i.sucursal})</option>)}
                        </select>
                        {instructores.length === 0 && <p className="mt-1 text-[11px] text-amber-700">No hay instructores. Regístralos en Empleados con el rol "instructor".</p>}
                    </div>
                )}
                <div className={esInstructor ? 'md:col-span-6' : 'md:col-span-3'}>
                    {sedeFija ? (
                        <>
                            <label className={labelCls}>Sede</label>
                            <p className="p-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-700">{sedeFija.nombre}</p>
                        </>
                    ) : (
                        <SucursalSelect label="Sede" required value={form.sucursal_id} onChange={v => set('sucursal_id', v)} />
                    )}
                </div>

                <div className="md:col-span-3">
                    <label className={labelCls}>Lugar</label>
                    <input value={form.lugar} onChange={e => set('lugar', e.target.value)} className={inputCls} placeholder="Ej: SALA 1" maxLength={60} />
                </div>
                {!editando && (
                    <div className="md:col-span-3">
                        <label className={labelCls}>Repetir cada semana</label>
                        <select value={form.repetir_semanas} onChange={e => set('repetir_semanas', Number(e.target.value))} className={inputCls}>
                            <option value={0}>No repetir</option>
                            {[1, 2, 3, 4, 6, 8, 12].map(n => <option key={n} value={n}>{n} {n === 1 ? 'semana más' : 'semanas más'}</option>)}
                        </select>
                    </div>
                )}
                <div className="md:col-span-6">
                    <label className={labelCls}>Descripción</label>
                    <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} className={inputCls} placeholder="Qué se trabaja, nivel, qué traer..." maxLength={255} />
                </div>
            </div>
        </Modal>
    );
};

export default ClaseFormModal;
