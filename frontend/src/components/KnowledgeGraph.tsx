import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  BackgroundVariant,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TopicNode from './TopicNode';
import TopicSidebar from './TopicSidebar';
import './KnowledgeGraph.css';

const nodeTypes = {
  topicNode: TopicNode,
};

interface KnowledgeGraphProps {
  category?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at?: string;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ category }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const noteData = node.data as Note;
    setSelectedNote(noteData);
  }, []);

  const toggleNodeExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { fetchNotes } = await import('../services/notesApi');
      const notes = await fetchNotes();

      // Filter by category if provided
      const filteredNotes = category 
        ? notes.filter(note => note.category.toLowerCase() === category.toLowerCase())
        : notes;

      // Create tree structure from notes
      const treeStructure = buildTreeStructure(filteredNotes);

      // Transform tree to React Flow nodes
      const transformedNodes: Node[] = [];
      const transformedEdges: Edge[] = [];
      let nodeId = 0;

      const processNode = (node: any, level: number = 0, parentId?: string) => {
        const isExpanded = expandedNodes.has(node.id);
        const nodeData: Node = {
          id: node.id,
          type: 'topicNode',
          position: {
            x: level * 300 + 50,
            y: nodeId * 120 + 50
          },
          data: {
            title: node.title,
            category: node.category,
            status: getRandomStatus(),
            difficulty: getRandomDifficulty(),
            progress: Math.floor(Math.random() * 100),
            hasChildren: node.children && node.children.length > 0,
            isExpanded: isExpanded,
            onToggleExpand: () => toggleNodeExpand(node.id),
            onClick: () => setSelectedNote(node),
            ...node
          },
        };
        transformedNodes.push(nodeData);
        nodeId++;

        if (parentId) {
          transformedEdges.push({
            id: `${parentId}-${node.id}`,
            source: parentId,
            target: node.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#e0e0e0', strokeWidth: 2 },
          });
        }

        // Process children if expanded
        if (isExpanded && node.children) {
          node.children.forEach((child: any) => {
            processNode(child, level + 1, node.id);
          });
        }
      };

      // Process root nodes (nodes without parents in our tree structure)
      treeStructure.forEach((rootNode: any) => {
        processNode(rootNode, 0);
      });

      setNodes(transformedNodes);
      setEdges(transformedEdges);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTreeStructure = (notes: Note[]) => {
    // Simple tree structure based on title patterns
    // If title contains "→" or "->", split into parent-child
    const tree: any[] = [];
    const nodeMap: Record<string, any> = {};

    notes.forEach(note => {
      const parts = note.title.split(/→|->/).map(p => p.trim());
      if (parts.length > 1) {
        // Has parent-child relationship
        const parentTitle = parts[0];
        const childTitle = parts.slice(1).join(' → ');
        
        // Find or create parent
        if (!nodeMap[parentTitle]) {
          const parentNode = {
            id: `parent-${parentTitle.replace(/\s+/g, '-').toLowerCase()}`,
            title: parentTitle,
            category: note.category,
            content: '',
            children: []
          };
          nodeMap[parentTitle] = parentNode;
          tree.push(parentNode);
        }

        // Add child
        const childNode = {
          id: note.id,
          title: childTitle,
          category: note.category,
          content: note.content,
          children: []
        };
        nodeMap[parentTitle].children.push(childNode);
      } else {
        // Root node
        const rootNode = {
          id: note.id,
          title: note.title,
          category: note.category,
          content: note.content,
          children: []
        };
        if (!nodeMap[note.title]) {
          nodeMap[note.title] = rootNode;
          tree.push(rootNode);
        }
      }
    });

    return tree;
  };

  const getRandomStatus = (): 'not_started' | 'learning' | 'completed' => {
    const statuses: ('not_started' | 'learning' | 'completed')[] = ['not_started', 'learning', 'completed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getRandomDifficulty = (): 'beginner' | 'intermediate' | 'advanced' => {
    const difficulties: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  };

  useEffect(() => {
    fetchNotes();
  }, [category, expandedNodes]);

  if (loading) {
    return (
      <div className="knowledge-graph-loading">
        <div className="loading-spinner">Loading roadmap...</div>
      </div>
    );
  }

  return (
    <div className="knowledge-graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const category = node.data.category;
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
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>

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

export default KnowledgeGraph;
