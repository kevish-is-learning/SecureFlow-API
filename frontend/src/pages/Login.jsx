import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { extractError } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`wb, ${u.name || u.email}`);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = extractError(err, 'Login failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <span className="eyebrow">• login</span>
        <h1>wb. log in & lock in.</h1>
        <p className="sub">your tasks miss you. sign in to get after it.</p>

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@vibe.com" value={form.email} onChange={onChange} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="•••••••••" value={form.password} onChange={onChange} required autoComplete="current-password" />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'cooking…' : 'log in'}
            </button>
          </div>
        </form>

        <hr className="dash" />

        <p className="muted" style={{ margin: 0 }}>
          new here? <Link to="/register">make an account</Link>
        </p>
        <div className="help-text" style={{ marginTop: 10 }}>
          <p style={{ margin: '0 0 5px 0' }}>demo login: <code>user@secureflow.dev</code> / <code>User@12345</code></p>
          <p style={{ margin: 0 }}>admin demo: <code>admin@secureflow.dev</code> / <code>admin@secureflow.dev1</code></p>
        </div>
      </div>
    </div>
  );
}
