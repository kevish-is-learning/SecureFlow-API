import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="nav">
      <Link to="/" className="brand">
        <span className="logo">SF</span>
        <span className="wordmark">
          SecureFlow
          <small>your tasks · your rules</small>
        </span>
      </Link>
      {user && (
        <div className="row">
          <span className="user-chip">
            <span>{user.name || user.email}</span>
            <span className={`badge ${user.role === 'ADMIN' ? 'admin' : ''}`}>{user.role}</span>
          </span>
          <button className="ghost" onClick={handleLogout}>Log out</button>
        </div>
      )}
    </div>
  );
}
