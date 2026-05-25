import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api
      .getReports()
      .then((data) => setReports(data.reports))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'pending').length,
      inProgress: reports.filter((r) => r.status === 'in_progress').length,
      resolved: reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') {
      return reports;
    }
    if (statusFilter === 'resolved') {
      return reports.filter((r) => r.status === 'resolved' || r.status === 'closed');
    }
    return reports.filter((r) => r.status === statusFilter);
  }, [reports, statusFilter]);

  if (loading) {
    return <LoadingSpinner label="Loading reports..." />;
  }

  return (
    <div className="dashboard">
      <section className="welcome-banner">
        <div className="welcome-banner-content">
          <p className="eyebrow">{user.role === 'admin' ? 'Admin dashboard' : 'Welcome back'}</p>
          <h1>
            {user.role === 'admin'
              ? 'Campus maintenance overview'
              : `Hello, ${user.fullName.split(' ')[0]}`}
          </h1>
          <p className="welcome-sub">
            {user.role === 'admin'
              ? 'Manage and resolve maintenance tickets submitted across campus.'
              : 'Submit new issues or track the progress of your existing reports.'}
          </p>
        </div>
        <Link to="/reports/new" className="btn btn-accent">
          New report
        </Link>
      </section>

      <div className="stats-grid">
        <article className="stat-card stat-card-neutral">
          <span className="stat-label">Total reports</span>
          <strong className="stat-value">{stats.total}</strong>
        </article>
        <article className="stat-card stat-card-warning">
          <span className="stat-label">Pending</span>
          <strong className="stat-value">{stats.pending}</strong>
        </article>
        <article className="stat-card stat-card-info">
          <span className="stat-label">In progress</span>
          <strong className="stat-value">{stats.inProgress}</strong>
        </article>
        <article className="stat-card stat-card-success">
          <span className="stat-label">Resolved</span>
          <strong className="stat-value">{stats.resolved}</strong>
        </article>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              {user.role === 'admin' ? 'All reports' : 'Your reports'}
            </h2>
            <p className="muted panel-sub">
              {filteredReports.length} of {reports.length} shown
            </p>
          </div>
          <div className="filter-chips" role="tablist" aria-label="Filter by status">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={statusFilter === filter.id}
                className={`chip ${statusFilter === filter.id ? 'chip-active' : ''}`}
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-error panel-alert">{error}</div>}

        {reports.length === 0 ? (
          <div className="empty-state">
            <h2>No reports yet</h2>
            <p className="muted">When you submit a maintenance issue, it will appear here.</p>
            <Link to="/reports/new" className="btn btn-accent">
              Submit your first report
            </Link>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state empty-state-compact">
            <p className="muted">No reports match this filter.</p>
            <button type="button" className="btn btn-secondary" onClick={() => setStatusFilter('all')}>
              Show all
            </button>
          </div>
        ) : (
          <div className="report-list">
            {filteredReports.map((report) => (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className={`report-row priority-accent-${report.priority}`}
              >
                <div className="report-row-main">
                  <div className="report-row-head">
                    <h3>{report.title}</h3>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="report-excerpt">{report.description}</p>
                  <div className="report-row-meta">
                    <span className="meta-item">{report.location}</span>
                    <span className="meta-item">{report.category}</span>
                    {user.role === 'admin' && (
                      <span className="meta-item meta-reporter">{report.reporterName}</span>
                    )}
                  </div>
                </div>
                <div className="report-row-side">
                  <PriorityBadge priority={report.priority} />
                  <time className="report-time" dateTime={report.createdAt}>
                    {new Date(report.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
