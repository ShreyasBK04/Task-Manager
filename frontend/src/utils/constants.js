export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#3B82F6', bg: '#DBEAFE' },
  { value: 'COMPLETED', label: 'Completed', color: '#10B981', bg: '#D1FAE5' },
];

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: '#6B7280', bg: '#F3F4F6' },
  { value: 'MEDIUM', label: 'Medium', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'HIGH', label: 'High', color: '#EF4444', bg: '#FEE2E2' },
];

export const getStatusConfig = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

export const getPriorityConfig = (priority) =>
  PRIORITY_OPTIONS.find((p) => p.value === priority) || PRIORITY_OPTIONS[0];

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '—';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'COMPLETED') return false;
  return new Date(dueDate) < new Date();
};