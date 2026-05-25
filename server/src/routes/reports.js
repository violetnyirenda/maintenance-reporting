import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

const router = Router();

const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
const validPriorities = ['low', 'medium', 'high', 'urgent'];

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === 'admin') {
      query = `
        SELECT r.*, u.full_name AS reporter_name, u.email AS reporter_email
        FROM maintenance_reports r
        JOIN users u ON u.id = r.reporter_id
        ORDER BY r.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT r.*, u.full_name AS reporter_name, u.email AS reporter_email
        FROM maintenance_reports r
        JOIN users u ON u.id = r.reporter_id
        WHERE r.reporter_id = $1
        ORDER BY r.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    const reports = await attachFilesToReports(result.rows);
    res.json({ reports: reports.map(formatReport) });
  } catch (error) {
    console.error('List reports error:', error.message, error.stack);
    res.status(500).json({
      message: 'Failed to fetch reports',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await fetchReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role !== 'admin' && report.reporter_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attachments = await fetchAttachments(report.id);
    res.json({ report: formatReport(report, attachments) });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Failed to fetch report' });
  }
});

router.post('/', async (req, res) => {
  const { title, description, location, category, priority } = req.body;

  if (!title || !description || !location || !category) {
    return res.status(400).json({
      message: 'Title, description, location, and category are required',
    });
  }

  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority value' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO maintenance_reports
        (reporter_id, title, description, location, category, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.id,
        title.trim(),
        description.trim(),
        location.trim(),
        category.trim(),
        priority || 'medium',
      ]
    );

    res.status(201).json({ report: formatReport(result.rows[0], []) });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Failed to create report' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const report = await fetchReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isOwner = report.reporter_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (isOwner && !isAdmin && report.status !== 'pending') {
      return res.status(403).json({ message: 'Only pending reports can be edited' });
    }

    const updates = buildUpdateFields(req.body, isAdmin);
    if (updates.fields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    updates.values.push(req.params.id);
    const result = await pool.query(
      `UPDATE maintenance_reports
       SET ${updates.fields.join(', ')}, updated_at = NOW()
       WHERE id = $${updates.values.length}
       RETURNING *`,
      updates.values
    );

    const attachments = await fetchAttachments(result.rows[0].id);
    res.json({ report: formatReport(result.rows[0], attachments) });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const report = await fetchReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isOwner = report.reporter_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && (!isOwner || report.status !== 'pending')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await pool.query('DELETE FROM maintenance_reports WHERE id = $1', [req.params.id]);
    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

router.post('/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    const report = await fetchReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role !== 'admin' && report.reporter_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await pool.query(
      `INSERT INTO report_attachments (report_id, file_name, file_path, mime_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, req.file.originalname, req.file.filename, req.file.mimetype]
    );

    res.status(201).json({ attachment: formatAttachment(result.rows[0]) });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload file' });
  }
});

router.get('/:id/attachments/:attachmentId', async (req, res) => {
  try {
    const report = await fetchReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role !== 'admin' && report.reporter_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT * FROM report_attachments WHERE id = $1 AND report_id = $2',
      [req.params.attachmentId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const attachment = result.rows[0];
    res.sendFile(path.join(uploadsDir, attachment.file_path));
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

async function fetchReportById(id) {
  const result = await pool.query(
    `SELECT r.*, u.full_name AS reporter_name, u.email AS reporter_email
     FROM maintenance_reports r
     JOIN users u ON u.id = r.reporter_id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function fetchAttachments(reportId) {
  const result = await pool.query(
    'SELECT * FROM report_attachments WHERE report_id = $1 ORDER BY created_at',
    [reportId]
  );
  return result.rows;
}

async function attachFilesToReports(reports) {
  if (reports.length === 0) {
    return [];
  }

  const reportIds = reports.map((report) => report.id);
  const placeholders = reportIds.map((_, index) => `$${index + 1}`).join(', ');
  const result = await pool.query(
    `SELECT * FROM report_attachments WHERE report_id IN (${placeholders}) ORDER BY created_at`,
    reportIds
  );

  const byReportId = {};
  for (const row of result.rows) {
    if (!byReportId[row.report_id]) {
      byReportId[row.report_id] = [];
    }
    byReportId[row.report_id].push(row);
  }

  return reports.map((report) => ({
    ...report,
    attachments: byReportId[report.id] || [],
  }));
}

function buildUpdateFields(body, isAdmin) {
  const fields = [];
  const values = [];
  let index = 1;

  const reporterFields = ['title', 'description', 'location', 'category', 'priority'];
  const adminOnlyFields = ['status', 'admin_notes'];

  for (const key of reporterFields) {
    if (body[key] !== undefined) {
      if (key === 'priority' && !validPriorities.includes(body[key])) {
        continue;
      }
      const column = key === 'admin_notes' ? 'admin_notes' : key;
      fields.push(`${column} = $${index}`);
      values.push(typeof body[key] === 'string' ? body[key].trim() : body[key]);
      index += 1;
    }
  }

  if (isAdmin) {
    for (const key of adminOnlyFields) {
      if (body[key] !== undefined) {
        if (key === 'status' && !validStatuses.includes(body[key])) {
          continue;
        }
        fields.push(`${key} = $${index}`);
        values.push(typeof body[key] === 'string' ? body[key].trim() : body[key]);
        index += 1;
      }
    }
  }

  return { fields, values };
}

function formatReport(row, attachments) {
  const fileList = Array.isArray(attachments)
    ? attachments
    : Array.isArray(row.attachments)
      ? row.attachments
      : [];

  return {
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: row.reporter_name,
    reporterEmail: row.reporter_email,
    title: row.title,
    description: row.description,
    location: row.location,
    category: row.category,
    priority: row.priority,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments: fileList.map(formatAttachment),
  };
}

function formatAttachment(row) {
  return {
    id: row.id,
    reportId: row.report_id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  };
}

export default router;
