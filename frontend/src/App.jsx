import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTasks } from './hooks/useTasks';
import {
  STATUS_OPTIONS, PRIORITY_OPTIONS,
  getStatusConfig, getPriorityConfig,
  formatDate, formatDateTime, isOverdue
} from './utils/constants';

// ─── Icons (inline SVG) ────────────────────────────────────────────────────────
const Icon = ({ path, size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={path} />
  </svg>
);
const Icons = {
  Plus: () => <Icon path="M12 5v14M5 12h14" />,
  Edit: () => <Icon path="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />,
  Trash: () => <Icon path="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  Check: () => <Icon path="M20 6L9 17l-5-5" />,
  Search: () => <Icon path="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />,
  Filter: () => <Icon path="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  ChevronLeft: () => <Icon path="M15 18l-6-6 6-6" />,
  ChevronRight: () => <Icon path="M9 18l6-6-6-6" />,
  X: () => <Icon path="M18 6L6 18M6 6l12 12" />,
  Clock: () => <Icon path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" />,
  BarChart: () => <Icon path="M18 20V10M12 20V4M6 20v-6" />,
  Task: () => <Icon path="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  Alert: () => <Icon path="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />,
  Refresh: () => <Icon path="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />,
};

// ─── Badge Components ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      border: `1px solid ${cfg.color}30`
    }}>
      {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const cfg = getPriorityConfig(priority);
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      border: `1px solid ${cfg.color}30`
    }}>
      {cfg.label}
    </span>
  );
};

// ─── Stats Card ───────────────────────────────────────────────────────────────
const StatsCard = ({ label, value, color, icon: Ic }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex',
    alignItems: 'center', gap: 16, flex: 1, minWidth: 160,
    border: '1px solid #f0f0f0'
  }}>
    <div style={{
      background: color + '18', borderRadius: 10, width: 46, height: 46,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Ic size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 2, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

// ─── Task Modal ───────────────────────────────────────────────────────────────
const EMPTY_FORM = { title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' };

const TaskModal = ({ isOpen, task, onClose, onSave, loading }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const titleRef = useRef();

  useEffect(() => {
    if (isOpen) {
      setForm(task ? {
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'PENDING',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate || '',
      } : EMPTY_FORM);
      setErrors({});
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, task]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length < 2) e.title = 'Title must be at least 2 characters';
    else if (form.title.length > 200) e.title = 'Title must not exceed 200 characters';
    if (form.description.length > 2000) e.description = 'Description must not exceed 2000 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form, dueDate: form.dueDate || null };
    onSave(payload);
  };

  if (!isOpen) return null;

  const inputStyle = (hasErr) => ({
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1.5px solid ${hasErr ? '#EF4444' : '#e2e8f0'}`,
    fontSize: 14, color: '#1a1a2e', outline: 'none',
    background: '#fafbff', transition: 'border 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  });

  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,20,40,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16, backdropFilter: 'blur(3px)'
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 18, width: '100%', maxWidth: 520,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '22px 28px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icons.Task color="#fff" size={20} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
            borderRadius: 8, padding: 6, display: 'flex', color: '#fff'
          }}>
            <Icons.X />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Title <span style={{ color: '#EF4444' }}>*</span></label>
            <input ref={titleRef} value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Enter task title..."
              style={inputStyle(errors.title)} />
            {errors.title && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.title}</div>}
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Add task details..."
              rows={3}
              style={{ ...inputStyle(errors.description), resize: 'vertical', minHeight: 80 }} />
            {errors.description && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.description}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Status <span style={{ color: '#EF4444' }}>*</span></label>
              <select value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ ...inputStyle(false), cursor: 'pointer' }}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority <span style={{ color: '#EF4444' }}>*</span></label>
              <select value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ ...inputStyle(false), cursor: 'pointer' }}>
                {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              style={inputStyle(false)} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid #f0f0f0',
          display: 'flex', gap: 10, justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} disabled={loading} style={{
            padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0',
            background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#555'
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14,
            color: '#fff', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
          }}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, taskTitle, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,20,40,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1001, padding: 16, backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px', maxWidth: 400,
        width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center'
      }}>
        <div style={{
          width: 56, height: 56, background: '#FEE2E2', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Icons.Alert color="#EF4444" size={24} />
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Delete Task?</h3>
        <p style={{ margin: '0 0 24px', color: '#666', fontSize: 14 }}>
          Are you sure you want to delete <strong>"{taskTitle}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '10px 22px', borderRadius: 8, border: '1.5px solid #e2e8f0',
            background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: '10px 22px', borderRadius: 8, border: 'none',
            background: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#fff'
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const {
    tasks, loading, pagination,
    fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask
  } = useTasks();

  const [filters, setFilters] = useState({ title: '', status: '', priority: '', page: 0, size: 10 });
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savingTask, setSavingTask] = useState(false);
  const searchTimeout = useRef(null);

  const loadTasks = useCallback((params) => {
    fetchTasks(params);
  }, [fetchTasks]);

  useEffect(() => {
    loadTasks(filters);
  }, [filters]); // eslint-disable-line

  // Debounced search
  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters(f => ({ ...f, title: value, page: 0 }));
    }, 400);
  };

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(f => ({ ...f, page: newPage }));
  };

  const handleSaveTask = async (formData) => {
    setSavingTask(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask(formData);
      }
      setModalOpen(false);
      setEditingTask(null);
      loadTasks(filters);
    } catch (e) {
      // toast already shown in hook
    } finally {
      setSavingTask(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTask(deleteConfirm.id);
      setDeleteConfirm(null);
      loadTasks(filters);
    } catch (e) { }
  };

  const handleMarkComplete = async (task) => {
    try {
      await updateTaskStatus(task.id, 'COMPLETED');
      loadTasks(filters);
    } catch (e) { }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setFilters({ title: '', status: '', priority: '', page: 0, size: 10 });
    setSearchInput('');
  };

  // Stats calculations
  const totalTasks = pagination.totalElements;
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  const hasFilters = filters.title || filters.status || filters.priority;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: 10, fontFamily: 'inherit', fontSize: 14 }
      }} />

      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(102,126,234,0.4)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8,
            display: 'flex', backdropFilter: 'blur(10px)'
          }}>
            <Icons.Task color="#fff" size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              TaskFlow
            </h1>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
              Task Management System
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => loadTasks(filters)} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600
          }}>
            <Icons.Refresh size={14} color="#fff" /> Refresh
          </button>
          <button onClick={() => { setEditingTask(null); setModalOpen(true); }} style={{
            background: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 18px', cursor: 'pointer', color: '#667eea', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <Icons.Plus /> Add Task
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Stats Row ── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatsCard label="Total Tasks" value={totalTasks} color="#667eea" icon={({ size, color }) => <Icon path="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" size={size} color={color} />} />
          <StatsCard label="Pending" value={pendingCount} color="#F59E0B" icon={({ size, color }) => <Icon path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={size} color={color} />} />
          <StatsCard label="In Progress" value={inProgressCount} color="#3B82F6" icon={({ size, color }) => <Icon path="M18 20V10M12 20V4M6 20v-6" size={size} color={color} />} />
          <StatsCard label="Completed" value={completedCount} color="#10B981" icon={({ size, color }) => <Icon path="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" size={size} color={color} />} />
        </div>

        {/* ── Filters & Search Row ── */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: '16px 20px',
          marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          border: '1px solid #f0f0f0',
          display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Icons.Search color="#aaa" size={16} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none'
            }} />
            <input
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search tasks by title..."
              style={{
                width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
                border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
                background: '#fafbff', boxSizing: 'border-box', fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Status Filter */}
          <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
              fontSize: 14, background: '#fafbff', cursor: 'pointer', fontFamily: 'inherit',
              color: filters.status ? '#1a1a2e' : '#888'
            }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Priority Filter */}
          <select value={filters.priority} onChange={e => handleFilterChange('priority', e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
              fontSize: 14, background: '#fafbff', cursor: 'pointer', fontFamily: 'inherit',
              color: filters.priority ? '#1a1a2e' : '#888'
            }}>
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button onClick={clearFilters} style={{
              padding: '9px 14px', borderRadius: 8, border: '1.5px solid #fecaca',
              background: '#fff5f5', cursor: 'pointer', fontSize: 13,
              color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Icons.X size={14} /> Clear
            </button>
          )}
        </div>

        {/* ── Task Table ── */}
        <div style={{
          background: '#fff', borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
            padding: '13px 20px', background: '#f8f9fd',
            borderBottom: '1px solid #f0f0f0'
          }}>
            {['Task', 'Status', 'Priority', 'Due Date', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{
                width: 36, height: 36, border: '3px solid #e2e8f0',
                borderTopColor: '#667eea', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
              }} />
              <div style={{ color: '#888', fontSize: 14 }}>Loading tasks...</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && tasks.length === 0 && (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, background: '#f0f2f8', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <Icons.Task color="#b0b8cc" size={32} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#555', fontWeight: 700 }}>No tasks found</h3>
              <p style={{ margin: '0 0 20px', color: '#888', fontSize: 14 }}>
                {hasFilters ? 'Try adjusting your filters.' : 'Get started by creating your first task.'}
              </p>
              <button onClick={() => { setEditingTask(null); setModalOpen(true); }} style={{
                padding: '10px 22px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14
              }}>
                + Add Task
              </button>
            </div>
          )}

          {/* Task Rows */}
          {!loading && tasks.map((task, idx) => {
            const overdue = isOverdue(task.dueDate, task.status);
            return (
              <div key={task.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
                padding: '14px 20px', borderBottom: idx < tasks.length - 1 ? '1px solid #f8f9fd' : 'none',
                alignItems: 'center', transition: 'background 0.15s',
                background: task.status === 'COMPLETED' ? '#fafffe' : '#fff',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8f9fd'}
                onMouseLeave={e => e.currentTarget.style.background = task.status === 'COMPLETED' ? '#fafffe' : '#fff'}
              >
                {/* Title + description */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: 14, color: '#1a1a2e',
                    textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                    opacity: task.status === 'COMPLETED' ? 0.6 : 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{
                      fontSize: 12, color: '#999', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
                    Created {formatDateTime(task.createdAt)}
                  </div>
                </div>

                {/* Status */}
                <div><StatusBadge status={task.status} /></div>

                {/* Priority */}
                <div><PriorityBadge priority={task.priority} /></div>

                {/* Due date */}
                <div style={{ fontSize: 13 }}>
                  {task.dueDate ? (
                    <span style={{ color: overdue ? '#EF4444' : '#555', fontWeight: overdue ? 600 : 400 }}>
                      {overdue && <Icons.Alert color="#EF4444" size={12} style={{ marginRight: 4 }} />}
                      {formatDate(task.dueDate)}
                    </span>
                  ) : <span style={{ color: '#ccc' }}>—</span>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {task.status !== 'COMPLETED' && (
                    <button onClick={() => handleMarkComplete(task)} title="Mark Complete" style={{
                      background: '#D1FAE5', border: 'none', borderRadius: 7, padding: 7,
                      cursor: 'pointer', display: 'flex', color: '#10B981'
                    }}>
                      <Icons.Check size={15} color="#10B981" />
                    </button>
                  )}
                  <button onClick={() => handleEdit(task)} title="Edit" style={{
                    background: '#DBEAFE', border: 'none', borderRadius: 7, padding: 7,
                    cursor: 'pointer', display: 'flex'
                  }}>
                    <Icons.Edit size={15} color="#3B82F6" />
                  </button>
                  <button onClick={() => setDeleteConfirm(task)} title="Delete" style={{
                    background: '#FEE2E2', border: 'none', borderRadius: 7, padding: 7,
                    cursor: 'pointer', display: 'flex'
                  }}>
                    <Icons.Trash size={15} color="#EF4444" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, padding: '0 4px'
          }}>
            <div style={{ fontSize: 13, color: '#888' }}>
              Showing {pagination.currentPage * pagination.pageSize + 1}–
              {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
              {pagination.totalElements} tasks
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                style={{
                  padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  background: '#fff', cursor: pagination.currentPage === 0 ? 'not-allowed' : 'pointer',
                  opacity: pagination.currentPage === 0 ? 0.4 : 1, display: 'flex'
                }}>
                <Icons.ChevronLeft />
              </button>

              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                const pageNum = i;
                return (
                  <button key={pageNum} onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '7px 13px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                      background: pagination.currentPage === pageNum
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
                      color: pagination.currentPage === pageNum ? '#fff' : '#555',
                      cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      border: pagination.currentPage === pageNum ? 'none' : '1.5px solid #e2e8f0'
                    }}>
                    {pageNum + 1}
                  </button>
                );
              })}

              <button onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                style={{
                  padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  background: '#fff',
                  cursor: pagination.currentPage >= pagination.totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.currentPage >= pagination.totalPages - 1 ? 0.4 : 1, display: 'flex'
                }}>
                <Icons.ChevronRight />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={modalOpen}
        task={editingTask}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        loading={savingTask}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        taskTitle={deleteConfirm?.title}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* CSS animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        select option { color: #1a1a2e; }
      `}</style>
    </div>
  );
}
