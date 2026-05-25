import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const categories = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Furniture',
  'IT Equipment',
  'Building',
  'Other',
];

export default function NewReportPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState('medium');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await api.createReport({
        title,
        description,
        location,
        category,
        priority,
      });

      if (file) {
        await api.uploadAttachment(data.report.id, file);
      }

      navigate(`/reports/${data.report.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <div className="page-intro">
        <p className="eyebrow">New submission</p>
        <h1>Report a maintenance issue</h1>
        <p className="muted">Provide clear details so facilities can respond quickly.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="panel form-panel form">
        <div className="form-section">
          <h2 className="form-section-title">Issue details</h2>

          <div className="form-row">
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Broken projector in Lab 3"
                required
              />
            </label>
            <label>
              Location
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Block B, Room 204"
                required
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="What is broken? When did it start? Any safety concerns?"
              required
            />
          </label>

          <div className="form-row">
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Attachment (optional)</h2>
          <label className="file-drop">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <span className="file-drop-inner">
              <strong>{file ? file.name : 'Drop a photo or PDF here'}</strong>
              <span className="muted">Max 5MB · JPG, PNG, GIF, WebP, PDF</span>
            </span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-accent" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit report'}
          </button>
        </div>
      </form>
    </div>
  );
}
