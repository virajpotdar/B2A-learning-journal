import type { JournalNote } from '../types';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export async function fetchNotes(): Promise<JournalNote[]> {
  const response = await fetch(`${API_BASE}/api/notes`);
  if (!response.ok) throw new Error(`Failed to fetch notes: ${response.status}`);
  return response.json();
}

export async function createNote(note: {
  title: string;
  content: string;
  category: string;
}): Promise<JournalNote> {
  const response = await fetch(`${API_BASE}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.error || `Failed to create note: ${response.status}`;
    throw new Error(message);
  }
  const result = await response.json();
  return result.note;
}

export async function updateNote(
  id: string,
  data: { title: string; content: string }
): Promise<JournalNote> {
  const response = await fetch(`${API_BASE}/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update note: ${response.status}`);
  const result = await response.json();
  return result.note;
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/notes/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Failed to delete note: ${response.status}`);
}
