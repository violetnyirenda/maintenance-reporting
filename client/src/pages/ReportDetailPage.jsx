import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const baseUrl = import.meta.env.VITE_API_URL || '';

const categories = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Furniture',
  'IT Equipment',
  'Building',
  'Other',
];

export default function ReportDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [uploadFile, setUploadFile] = useState(null);

  const isAdmin = user.role === 'admin';
  const isOwner = report && report.reporterId === user.id;
  const canEdit = isAdmin || (isOwner && report.status === 'pending');

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getReport(id);
      setReport(data.report);
      setForm({
        title: data.report.title,
        description: data.report.description,
        location: data.report.location,
        category: data.report.category,
        priority: data.report.priority,
        status: data.report.status,
        adminNotes: data.report.adminNotes || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category,
        priority: form.priority,
      };

      if (isAdmin) {
        payload.status = form.status;
        payload.adminNotes = form.adminNotes;
      }

      const data = await api.updateReport(id, payload);
      setReport(data.report);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this report?')) {
      return;
    }

    try {
      await api.deleteReport(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!uploadFile) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.uploadAttachment(id, uploadFile);
      setUploadFile(null);
      await loadReport();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function downloadAttachment(attachmentId, fileName) {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${baseUrl}/api/reports/${id}/attachments/${attachmentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      setError('Failed to download file');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <LoadingSpinner label="Loading report..." />;
  }

  if (!report) {
    return (
      <div>
        <div className="alert alert-error">{error || 'Report not found'}</div>
        <Link to="/" className="back-link">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">
        Back to reports
      </Link>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-hero panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">Report #{report.id}</p>
            <h1>{report.title}</h1>
            <div className="detail-pills">
              <span className="tag">{report.category}</span>
              <PriorityBadge priority={report.priority} />
              <StatusBadge status={report.status} />
            </div>
          </div>
        </div>
        <div className="detail-info-grid">
          <div className="info-card">
            <div>
              <span className="info-label">Location</span>
              <span className="info-value">{report.location}</span>
            </div>
          </div>
          <div className="info-card">
            <div>
              <span className="info-label">Submitted</span>
              <span className="info-value">{new Date(report.createdAt).toLocaleString()}</span>
            </div>
          </div>
          {isAdmin && (
            <div className="info-card info-card-wide">
              <div>
                <span className="info-label">Reporter</span>
                <span className="info-value">
                  {report.reporterName} · {report.reporterEmail}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!editMode ? (
        <div className="panel detail-body">
          <h2>Description</h2>
          <p className="detail-description">{report.description}</p>
          {report.adminNotes && (
            <div className="admin-notes">
              <h3>Admin notes</h3>
              <p>{report.adminNotes}</p>
            </div>
          )}
          <div className="detail-actions">
            {canEdit && (
              <button type="button" className="btn btn-secondary" onClick={() => setEditMode(true)}>
                Edit report
              </button>
            )}
            {canEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="panel form-panel form">
          <h2 className="form-heading">Edit report</h2>

          <div className="form-section">
            <h3 className="form-section-title">Report details</h3>

            <div className="form-row">
              <label>
                Title
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                required
              />
            </label>

            <div className="form-row">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
            </div>

            {isAdmin && (
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
            )}
          </div>

          {isAdmin && (
            <div className="form-section">
              <h3 className="form-section-title">Admin</h3>
              <label>
                Admin notes
                <textarea
                  value={form.adminNotes}
                  onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                  rows={3}
                />
              </label>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      <section className="panel attachments-section">
        <h2>Attachments</h2>
        {report.attachments.length === 0 ? (
          <p className="muted">No files uploaded yet.</p>
        ) : (
          <ul className="attachment-list">
            {report.attachments.map((attachment) => (
              <li key={attachment.id}>
                <button
                  type="button"
                  className="attachment-item"
                  onClick={() => downloadAttachment(attachment.id, attachment.fileName)}
                >
                  {attachment.fileName}
                </button>
              </li>
            ))}
          </ul>
        )}

        {canEdit && (
          <form onSubmit={handleUpload} className="upload-form">
            <label className="file-drop file-drop-inline">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setUploadFile(e.target.files[0] || null)}
              />
              <span className="file-drop-inner">
                <strong>{uploadFile ? uploadFile.name : 'Choose file to upload'}</strong>
              </span>
            </label>
            <button type="submit" className="btn btn-secondary" disabled={saving || !uploadFile}>
              Upload file
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
