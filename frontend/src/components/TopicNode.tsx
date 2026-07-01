import React from 'react';
import { Handle, Position } from 'reactflow';
import ProgressRing from './ProgressRing';
import StatusBadge from './StatusBadge';
import DifficultyBadge from './DifficultyBadge';

interface TopicNodeProps {
  data: {
    title: string;
    category: string;
    status?: string;
    difficulty?: string;
    progress?: number;
    hasChildren?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    onClick?: () => void;
  };
}

const TopicNode: React.FC<TopicNodeProps> = ({ data }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      frontend: '#61DAFB',
      backend: '#68A063',
      devops: '#326CE5',
      database: '#4479A1',
      security: '#F7DF1E',
      testing: '#C21325',
      general: '#E34F26',
      other: '#ed771d'
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      frontend: '⚛️',
      backend: '🖥️',
      devops: '🔧',
      database: '🗄️',
      security: '🔒',
      testing: '🧪',
      general: '📚',
      other: '📝'
    };
    return icons[category.toLowerCase()] || icons.other;
  };

  const categoryColor = getCategoryColor(data.category);
  const categoryIcon = getCategoryIcon(data.category);
  const progress = data.progress || Math.floor(Math.random() * 100);
  const status = data.status || 'not_started';
  const difficulty = data.difficulty || 'beginner';

  return (
    <div 
      className="topic-node"
      style={{
        padding: '16px',
        borderRadius: '12px',
        border: `2px solid ${categoryColor}`,
        backgroundColor: 'white',
        minWidth: '200px',
        maxWidth: '280px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
      onClick={data.onClick}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: categoryColor, width: 8, height: 8 }}
      />
      
      {/* Header with category and progress */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '8px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>{categoryIcon}</span>
          <span 
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: `${categoryColor}15`,
              color: categoryColor
            }}
          >
            {data.category}
          </span>
        </div>
        <ProgressRing progress={progress} size={20} strokeWidth={2} color={categoryColor} />
      </div>
      
      {/* Title */}
      <div 
        style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px',
          lineHeight: '1.3'
        }}
      >
        {data.title}
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <StatusBadge status={status as any} />
        <DifficultyBadge difficulty={difficulty as any} />
      </div>

      {/* Expand/Collapse Button */}
      {data.hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleExpand?.();
          }}
          style={{
            width: '100%',
            padding: '6px',
            background: `${categoryColor}10`,
            border: `1px solid ${categoryColor}30`,
            borderRadius: '6px',
            color: categoryColor,
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {data.isExpanded ? '▼ Collapse' : '▶ Expand'}
        </button>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: categoryColor, width: 8, height: 8 }}
      />
    </div>
  );
};

export default TopicNode;
