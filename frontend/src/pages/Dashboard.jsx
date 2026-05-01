import { useCallback, useEffect, useMemo, useState } from 'react';
import Nav from '../components/Nav';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api, { extractError } from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ q: '', completed: '' });

  const query = useMemo(() => {
    const q = { page: pagination.page, limit: pagination.limit };
    if (filters.q) q.q = filters.q;
    if (filters.completed !== '') q.completed = filters.completed;
    return q;
  }, [pagination.page, pagination.limit, filters]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', { params: query });
      const data = res.data.data;
      setTasks(data.items);
      setPagination((p) => ({ ...p, ...data.pagination }));
    } catch (err) {
      toast.error(extractError(err, 'Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await api.put(`/tasks/${editing.id}`, payload);
        toast.success('updated ✓');
      } else {
        await api.post('/tasks', payload);
        toast.success('task added ✓');
      }
      setEditing(null);
      setPagination((p) => ({ ...p, page: 1 }));
      await load();
    } catch (err) {
      toast.error(extractError(err, 'Operation failed'));
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('delete this task for real?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('gone 🗑');
      await load();
    } catch (err) {
      toast.error(extractError(err, 'Delete failed'));
    }
  };

  const handleToggle = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, { completed: !task.completed });
      await load();
    } catch (err) {
      toast.error(extractError(err, 'Update failed'));
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const firstName = (user?.name || user?.email || '').split(/[\s@]/)[0];

  return (
    <>
      <Nav />
      <div className="container">
        <div className="hero">
          <div>
            <span className="eyebrow">• dashboard</span>
            <h1>hey, {firstName} 👋</h1>
            <p className="hey">
              {user?.role === 'ADMIN' ? 'god mode activated — you can see every task.' : 'your personal task HQ. stack those W\'s.'}
            </p>
          </div>
          <div className="stat-row">
            <span className="stat lime"><b>{pagination.total}</b> total</span>
            <span className="stat"><b>{pendingCount}</b> pending</span>
            <span className="stat pink"><b>{completedCount}</b> done</span>
          </div>
        </div>

        <div className="grid dashboard-grid">
          <div className="card">
            <div className="section-head">
              <h2>{editing ? 'edit task' : 'new task'}</h2>
              <span className="badge accent">{editing ? 'editing' : 'fresh'}</span>
            </div>
            <TaskForm
              key={editing?.id || 'new'}
              initial={editing}
              onSubmit={handleSubmit}
              onCancel={editing ? () => setEditing(null) : null}
            />
          </div>

          <div className="card">
            <div className="section-head">
              <h2>{user?.role === 'ADMIN' ? 'all tasks' : 'your tasks'}</h2>
              <span className="badge soft">{pagination.total} in scope</span>
            </div>

            <div className="filter-bar">
              <input
                placeholder="search vibes…"
                value={filters.q}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, q: e.target.value }));
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              />
              <select
                value={filters.completed}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, completed: e.target.value }));
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <option value="">all</option>
                <option value="false">pending</option>
                <option value="true">done</option>
              </select>
            </div>

            <TaskList
              tasks={tasks}
              loading={loading}
              isAdmin={user?.role === 'ADMIN'}
              onEdit={(t) => setEditing(t)}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="ghost xs"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  ← prev
                </button>
                <span className="muted">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  className="ghost xs"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
