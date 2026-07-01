import React, { useState, useCallback, useEffect } from 'react';
import RoadmapCard from './RoadmapCard';
import TopicSidebar from './TopicSidebar';
import { toggleBookmark, getTopicMeta } from '../utils/topicStorage';
import './Roadmap.css';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface RoadmapNode {
  id: string;
  title: string;
  category: string;
  content: string;
  status: 'not_started' | 'learning' | 'completed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  children: RoadmapNode[];
  isExpanded: boolean;
}

interface RoadmapProps {
  category?: string;
}

const Roadmap: React.FC<RoadmapProps> = ({ category }) => {
  const [treeData, setTreeData] = useState<RoadmapNode[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  const buildTreeStructure = (notes: Note[]): RoadmapNode[] => {
    const tree: RoadmapNode[] = [];
    const nodeMap: Record<string, RoadmapNode> = {};

    notes.forEach(note => {
      const parts = note.title.split(/→|->/).map(p => p.trim());
      if (parts.length > 1) {
        // Has parent-child relationship
        const parentTitle = parts[0];
        const childTitle = parts.slice(1).join(' → ');
        
        // Find or create parent
        if (!nodeMap[parentTitle]) {
          const parentNode: RoadmapNode = {
            id: `parent-${parentTitle.replace(/\s+/g, '-').toLowerCase()}`,
            title: parentTitle,
            category: note.category,
            content: '',
            status: 'not_started',
            difficulty: 'beginner',
            progress: Math.floor(Math.random() * 100),
            children: [],
            isExpanded: true
          };
          nodeMap[parentTitle] = parentNode;
          tree.push(parentNode);
        }

        // Add child
        const childNode: RoadmapNode = {
          id: note.id,
          title: childTitle,
          category: note.category,
          content: note.content,
          status: 'not_started',
          difficulty: 'beginner',
          progress: Math.floor(Math.random() * 100),
          children: [],
          isExpanded: true
        };
        nodeMap[parentTitle].children.push(childNode);
        nodeMap[childTitle] = childNode;
      } else {
        // Root node
        if (!nodeMap[note.title]) {
          const rootNode: RoadmapNode = {
            id: note.id,
            title: note.title,
            category: note.category,
            content: note.content,
            status: 'not_started',
            difficulty: 'beginner',
            progress: Math.floor(Math.random() * 100),
            children: [],
            isExpanded: true
          };
          nodeMap[note.title] = rootNode;
          tree.push(rootNode);
        }
      }
    });

    return tree;
  };

  const toggleNodeExpand = useCallback((nodeId: string) => {
    const toggleRecursive = (nodes: RoadmapNode[]): RoadmapNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children.length > 0) {
          return { ...node, children: toggleRecursive(node.children) };
        }
        return node;
      });
    };

    setTreeData(toggleRecursive(treeData));
  }, [treeData]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/notes`);
      const notes: Note[] = await response.json();

      // Filter by category if provided
      const filteredNotes = category 
        ? notes.filter(note => note.category.toLowerCase() === category.toLowerCase())
        : notes;

      // Build tree structure
      const tree = buildTreeStructure(filteredNotes);
      setTreeData(tree);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [category]);

  const handleBookmark = useCallback((nodeId: string) => {
    toggleBookmark(nodeId);
    // Force re-render to update bookmark icon
    setTreeData(prev => [...prev]);
  }, []);

  const renderNode = (node: RoadmapNode) => {
    return (
      <div key={node.id} className="roadmap-node-wrapper">
        <RoadmapCard
          title={node.title}
          category={node.category}
          hasChildren={node.children.length > 0}
          isExpanded={node.isExpanded}
          onClick={() => setSelectedNote({
            id: node.id,
            title: node.title,
            content: node.content,
            category: node.category,
            created_at: new Date().toISOString()
          })}
          onToggleExpand={() => toggleNodeExpand(node.id)}
          onBookmark={() => handleBookmark(node.id)}
          onEdit={() => console.log('Edit:', node.id)}
          onDelete={() => console.log('Delete:', node.id)}
          isBookmarked={getTopicMeta(node.id).isBookmarked}
        />
        
        {/* SVG Connector Line */}
        {node.children.length > 0 && (
          <div className="roadmap-connector">
            <svg className="connector-svg" width="100%" height="40">
              <path
                d="M 20 0 L 20 20"
                className="connector-line"
                fill="none"
              />
              <path
                d="M 20 20 L 20 40"
                className="connector-line"
                fill="none"
              />
            </svg>
          </div>
        )}

        {node.isExpanded && node.children.length > 0 && (
          <div className="roadmap-children">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="roadmap-loading">
        <div className="loading-spinner">Loading roadmap...</div>
      </div>
    );
  }

  return (
    <div className="roadmap-container">
      <div className="roadmap-content">
        <div className="roadmap-tree">
          {treeData.map((node) => renderNode(node))}
        </div>
      </div>

      {selectedNote && (
        <TopicSidebar
          node={{
            id: selectedNote.id,
            title: selectedNote.title,
            category: selectedNote.category,
            content: selectedNote.content,
            created_at: selectedNote.created_at,
            status: 'not_started',
            difficulty: 'beginner',
            progress: 0,
            estimatedMinutes: 30,
            children: [],
            isExpanded: true,
            isBookmarked: false,
            noteId: selectedNote.id,
          }}
          open={!!selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
};

export default Roadmap;
