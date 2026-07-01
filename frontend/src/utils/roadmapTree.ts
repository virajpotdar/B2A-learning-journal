import type { JournalNote, RoadmapNode, TopicDifficulty } from '../types';
import { getTopicMeta } from './topicStorage';

function slugify(text: string): string {
  return text.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function deriveDifficulty(title: string, content: string): TopicDifficulty {
  const text = `${title} ${content}`.toLowerCase();
  if (/advanced|expert|architecture|distributed|optimization|internals/.test(text)) return 'advanced';
  if (/intermediate|patterns|async|hooks|middleware|testing/.test(text)) return 'intermediate';
  return 'beginner';
}

function deriveEstimatedMinutes(content: string, difficulty: TopicDifficulty): number {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const base = difficulty === 'advanced' ? 90 : difficulty === 'intermediate' ? 60 : 30;
  return Math.min(180, Math.max(base, Math.round(wordCount / 8)));
}

function createNode(
  id: string,
  title: string,
  category: string,
  content: string,
  noteId?: string,
  created_at?: string
): RoadmapNode {
  const meta = getTopicMeta(id);
  const difficulty = deriveDifficulty(title, content);
  return {
    id,
    title,
    category,
    content,
    created_at,
    status: meta.status,
    difficulty,
    progress: meta.progress,
    estimatedMinutes: deriveEstimatedMinutes(content, difficulty),
    children: [],
    isExpanded: true,
    isBookmarked: meta.isBookmarked,
    noteId,
  };
}

function findOrCreateChild(parent: RoadmapNode, title: string, category: string): RoadmapNode {
  const existing = parent.children.find((c) => c.title.toLowerCase() === title.toLowerCase());
  if (existing) return existing;

  const id = `synthetic-${slugify(category)}-${slugify(parent.title)}-${slugify(title)}`;
  const node = createNode(id, title, category, '');
  parent.children.push(node);
  return node;
}

export function buildTreeFromNotes(notes: JournalNote[]): RoadmapNode[] {
  const roots: RoadmapNode[] = [];
  const rootMap = new Map<string, RoadmapNode>();

  const getOrCreateRoot = (title: string, category: string): RoadmapNode => {
    const key = `${category}::${title.toLowerCase()}`;
    if (rootMap.has(key)) return rootMap.get(key)!;

    const id = `synthetic-${slugify(category)}-${slugify(title)}`;
    const node = createNode(id, title, category, '');
    roots.push(node);
    rootMap.set(key, node);
    return node;
  };

  for (const note of notes) {
    const parts = note.title.split(/→|->/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) continue;

    if (parts.length === 1) {
      const key = `${note.category}::${parts[0].toLowerCase()}`;
      if (rootMap.has(key)) {
        const existing = rootMap.get(key)!;
        existing.content = note.content;
        existing.noteId = note.id;
        existing.created_at = note.created_at;
        existing.id = note.id;
        const meta = getTopicMeta(note.id);
        existing.status = meta.status;
        existing.progress = meta.progress;
        existing.isBookmarked = meta.isBookmarked;
        existing.difficulty = deriveDifficulty(parts[0], note.content);
        existing.estimatedMinutes = deriveEstimatedMinutes(note.content, existing.difficulty);
      } else {
        const node = createNode(note.id, parts[0], note.category, note.content, note.id, note.created_at);
        roots.push(node);
        rootMap.set(key, node);
      }
      continue;
    }

    let current = getOrCreateRoot(parts[0], note.category);
    for (let i = 1; i < parts.length - 1; i++) {
      current = findOrCreateChild(current, parts[i], note.category);
    }

    const leafTitle = parts[parts.length - 1];
    const leafKey = `${note.category}::${parts.join('>').toLowerCase()}`;
    const existingLeaf = current.children.find((c) => c.title.toLowerCase() === leafTitle.toLowerCase());

    if (existingLeaf && existingLeaf.noteId) {
      existingLeaf.content = note.content;
      existingLeaf.noteId = note.id;
      existingLeaf.id = note.id;
    } else if (existingLeaf) {
      existingLeaf.content = note.content;
      existingLeaf.noteId = note.id;
      existingLeaf.id = note.id;
      existingLeaf.created_at = note.created_at;
    } else {
      const leaf = createNode(note.id, leafTitle, note.category, note.content, note.id, note.created_at);
      current.children.push(leaf);
      rootMap.set(leafKey, leaf);
    }
  }

  return roots;
}

export function countTopics(nodes: RoadmapNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countTopics(n.children), 0);
}

export function countCompleted(nodes: RoadmapNode[]): number {
  return nodes.reduce((sum, n) => {
    const self = n.status === 'completed' ? 1 : 0;
    return sum + self + countCompleted(n.children);
  }, 0);
}

export function computeCategoryProgress(nodes: RoadmapNode[]): number {
  const total = countTopics(nodes);
  if (total === 0) return 0;
  return Math.round((countCompleted(nodes) / total) * 100);
}

export function flattenNodes(nodes: RoadmapNode[]): RoadmapNode[] {
  const result: RoadmapNode[] = [];
  const walk = (list: RoadmapNode[]) => {
    for (const n of list) {
      result.push(n);
      walk(n.children);
    }
  };
  walk(nodes);
  return result;
}

export function filterNodes(
  nodes: RoadmapNode[],
  query: string,
  statusFilter: string | null
): RoadmapNode[] {
  const q = query.toLowerCase().trim();

  const matches = (node: RoadmapNode): boolean => {
    const textMatch = !q || node.title.toLowerCase().includes(q) || node.content.toLowerCase().includes(q);
    const statusMatch = !statusFilter || node.status === statusFilter;
    return textMatch && statusMatch;
  };

  const filterRecursive = (list: RoadmapNode[]): RoadmapNode[] => {
    return list
      .map((node) => {
        const filteredChildren = filterRecursive(node.children);
        if (matches(node) || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren, isExpanded: true };
        }
        return null;
      })
      .filter((n): n is RoadmapNode => n !== null);
  };

  return filterRecursive(nodes);
}

export function findNodeById(nodes: RoadmapNode[], id: string): RoadmapNode | null {
  for (const node of nodes) {
    if (String(node.id) === String(id)) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}
