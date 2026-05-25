import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user.fullName?.charAt(0)?.toUpperCase() || '?';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-accent" aria-hidden="true" />
        <div className="header-inner">
          <Link to="/" className="brand">
            <span>
              CampusFix
              <small>Maintenance Reporting</small>
            </span>
          </Link>
          <nav className="nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/reports/new"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              New report
            </NavLink>
          </nav>
          <div className="user-bar">
            <div className="user-meta">
              <span className="avatar">{initial}</span>
              <span className="user-text">
                <strong>{user.fullName}</strong>
                <span className={`badge badge-${user.role}`}>{user.role}</span>
              </span>
            </div>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>CampusFix · University maintenance reporting system</p>
      </footer>
    </div>
  );
}
