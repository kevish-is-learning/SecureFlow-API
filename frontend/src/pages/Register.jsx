import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { extractError } from '../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const u = await register(form);
      toast.success(`you're in, ${u.name || u.email}`);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = extractError(err, 'Registration failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <span className="eyebrow">• new account</span>
        <h1>let's get it.</h1>
        <p className="sub">make an account and start stacking W's.</p>

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" placeholder="what do we call you?" value={form.name} onChange={onChange} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@vibe.com" value={form.email} onChange={onChange} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="make it strong" value={form.password} onChange={onChange} required autoComplete="new-password" minLength={8} />
            <p className="help-text">8+ chars · at least 1 letter & 1 number</p>
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="accent" disabled={submitting}>
              {submitting ? 'cooking…' : 'create account'}
            </button>
          </div>
        </form>

        <hr className="dash" />

        <p className="muted" style={{ margin: 0 }}>
          already vibing? <Link to="/login">log in</Link>
        </p>
      </div>
    </div>
  );
}
