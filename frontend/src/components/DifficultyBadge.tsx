import React from 'react';

interface DifficultyBadgeProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const difficultyConfig = {
    beginner: {
      label: 'Beginner',
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    intermediate: {
      label: 'Intermediate',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    advanced: {
      label: 'Advanced',
      color: '#ef4444',
      bgColor: '#fee2e2'
    }
  };

  const config = difficultyConfig[difficulty];

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
        color: config.color,
        marginLeft: '4px'
      }}
    >
      {config.label}
    </span>
  );
};

export default DifficultyBadge;
