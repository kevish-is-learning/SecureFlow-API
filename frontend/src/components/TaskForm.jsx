import { useEffect, useState } from 'react';

export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    completed: initial?.completed || false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      title: initial?.title || '',
      description: initial?.description || '',
      completed: initial?.completed || false,
    });
  }, [initial]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { title: form.title.trim(), completed: form.completed };
      if (form.description.trim()) payload.description = form.description.trim();
      await onSubmit(payload);
      if (!initial) setForm({ title: '', description: '', completed: false });
    } catch {
      // parent handles toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handle}
          placeholder="what are we doing?"
          maxLength={120}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="description">Details</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handle}
          placeholder="add some context (optional)"
          rows={4}
          maxLength={2000}
        />
      </div>
      {initial && (
        <div className="field row">
          <input
            id="completed"
            name="completed"
            type="checkbox"
            className="checkbox"
            checked={form.completed}
            onChange={handle}
          />
          <label htmlFor="completed" style={{ margin: 0 }}>mark as done</label>
        </div>
      )}

      {error && <div className="error-text">{error}</div>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>
            cancel
          </button>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? 'saving…' : initial ? 'save changes' : 'add task'}
        </button>
      </div>
    </form>
  );
}
