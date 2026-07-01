import { useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import RoadmapNodeComponent from './RoadmapNode';
import type { RoadmapNode } from '../types';

interface RoadmapTreeProps {
  nodes: RoadmapNode[];
  loading?: boolean;
  selectedId: string | null;
  onSelect: (node: RoadmapNode) => void;
  onTreeChange: (nodes: RoadmapNode[]) => void;
  onToggleBookmark: (id: string) => void;
}

function updateNodeInTree(nodes: RoadmapNode[], id: string, updater: (n: RoadmapNode) => RoadmapNode): RoadmapNode[] {
  return nodes.map((node) => {
    if (node.id === id) return updater(node);
    if (node.children.length > 0) {
      return { ...node, children: updateNodeInTree(node.children, id, updater) };
    }
    return node;
  });
}

export default function RoadmapTree({
  nodes,
  loading,
  selectedId,
  onSelect,
  onTreeChange,
  onToggleBookmark,
}: RoadmapTreeProps) {
  const handleToggleExpand = useCallback(
    (id: string) => {
      onTreeChange(
        updateNodeInTree(nodes, id, (n) => ({ ...n, isExpanded: !n.isExpanded }))
      );
    },
    [nodes, onTreeChange]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (nodes.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 3,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          borderStyle: 'dashed',
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No topics yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add notes with titles like &quot;JavaScript → Variables&quot; to build your learning path.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        py: 2,
      }}
    >
      {nodes.map((node, idx) => (
        <RoadmapNodeComponent
          key={node.id}
          node={node}
          isLast={idx === nodes.length - 1}
          selectedId={selectedId}
          onSelect={onSelect}
          onToggleExpand={handleToggleExpand}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </Box>
  );
}
