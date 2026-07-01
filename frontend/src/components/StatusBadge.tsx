import React from 'react';

interface StatusBadgeProps {
  status: 'not_started' | 'learning' | 'completed';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    not_started: {
      label: 'Not Started',
      color: '#9ca3af',
      bgColor: '#f3f4f6'
    },
    learning: {
      label: 'Learning',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    completed: {
      label: 'Completed',
      color: '#10b981',
      bgColor: '#d1fae5'
    }
  };

  const config = statusConfig[status];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '600',
        textTransform: 'uppercase',
        backgroundColor: config.bgColor,
        color: config.color
      }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
