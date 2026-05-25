const statusLabels = {
  pending: 'Pending',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function StatusBadge({ status }) {
  return <span className={`status status-${status}`}>{statusLabels[status] || status}</span>;
}
