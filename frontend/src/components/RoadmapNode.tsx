import { Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import TopicCard from './TopicCard';
import ConnectorLine from './ConnectorLine';
import type { RoadmapNode } from '../types';
import { getCategoryColor } from '../data/categories';

interface RoadmapNodeComponentProps {
  node: RoadmapNode;
  isLast?: boolean;
  selectedId: string | null;
  onSelect: (node: RoadmapNode) => void;
  onToggleExpand: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  depth?: number;
}

export default function RoadmapNodeComponent({
  node,
  isLast = false,
  selectedId,
  onSelect,
  onToggleExpand,
  onToggleBookmark,
  depth = 0,
}: RoadmapNodeComponentProps) {
  const color = getCategoryColor(node.category);
  const hasChildren = node.children.length > 0;

  return (
    <Box
      className="roadmap-node"
      data-topic-id={node.id}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
      }}
    >
      {depth > 0 && <ConnectorLine isLast={isLast} color={color} />}

      <TopicCard
        node={node}
        isActive={selectedId === node.id}
        onClick={() => onSelect(node)}
        onToggleExpand={() => onToggleExpand(node.id)}
        onToggleBookmark={() => onToggleBookmark(node.id)}
      />

      {hasChildren && node.isExpanded && (
        <>
          <ConnectorLine color={color} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              pl: { xs: 2, sm: 4 },
              borderLeft: depth >= 0 ? `2px solid` : 'none',
              borderColor: `${color}33`,
              ml: { xs: 2, sm: 3 },
            }}
          >
            <AnimatePresence initial={false}>
              {node.children.map((child, idx) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                  <RoadmapNodeComponent
                    node={child}
                    isLast={idx === node.children.length - 1}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onToggleExpand={onToggleExpand}
                    onToggleBookmark={onToggleBookmark}
                    depth={depth + 1}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </>
      )}
    </Box>
  );
}
