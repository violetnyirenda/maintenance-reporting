const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`priority priority-${priority}`}>
      {priorityLabels[priority] || priority}
    </span>
  );
}
