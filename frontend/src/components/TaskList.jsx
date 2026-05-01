export default function TaskList({ tasks, loading, isAdmin, onEdit, onDelete, onToggle }) {
  if (loading) {
    return <p className="muted">loading tasks…</p>;
  }

  if (!tasks.length) {
    return (
      <div className="empty">
        <div className="big">∅</div>
        <div>no tasks yet</div>
        <div className="muted" style={{ marginTop: 6 }}>add your first one on the left →</div>
      </div>
    );
  }

  return (
    <div>
      {tasks.map((t) => (
        <div key={t.id} className={`task ${t.completed ? 'completed' : ''}`}>
          <input
            type="checkbox"
            className="checkbox"
            checked={t.completed}
            onChange={() => onToggle(t)}
            aria-label={t.completed ? 'mark as pending' : 'mark as done'}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="title">{t.title}</div>
            {t.description && <div className="desc">{t.description}</div>}
            <div className="meta">
              {new Date(t.createdAt).toLocaleString()}
              {isAdmin && t.user && (
                <>
                  {' · '}
                  <strong>{t.user.name || t.user.email}</strong>{' '}
                  <span className={`badge ${t.user.role === 'ADMIN' ? 'admin' : ''}`}>{t.user.role}</span>
                </>
              )}
            </div>
          </div>
          <div className="actions">
            <button className="ghost xs" onClick={() => onEdit(t)}>edit</button>
            <button className="danger xs" onClick={() => onDelete(t.id)}>delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
