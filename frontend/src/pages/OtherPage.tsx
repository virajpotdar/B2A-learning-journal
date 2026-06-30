import { useState, useEffect } from 'react';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';
import type { JournalNote } from '../types';

export default function OtherPage() {
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/notes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const otherNotes = data.filter((note: JournalNote) => note.category === 'Other');
      setNotes(otherNotes || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }
      setNotes((current) => current.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleUpdateNote = async (noteId: string, updatedData: { title: string; content: string }) => {
    try {
      const response = await fetch(`http://localhost:4000/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      const result = await response.json();
      setNotes((current) => current.map((note) => note.id === noteId ? { ...note, ...result.note } : note));
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f3e5f5', minHeight: '100vh' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ 
            color: '#6a1b9a', 
            marginBottom: '0.5rem', 
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>Other Knowledge</h1>
          <p style={{ color: '#4527a0', fontSize: '1.1rem', margin: 0 }}>
            Store your other learning notes here
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#7e57c2';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(126, 87, 194, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <NoteForm onNoteAdded={fetchNotes} category="Other" />
        
        <h2 style={{ 
          marginBottom: '1.5rem', 
          color: '#333', 
          fontSize: '1.75rem',
          fontWeight: 'bold'
        }}>
          Recent Other Notes
        </h2>
        {filteredNotes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            color: '#999',
            fontSize: '1.1rem'
          }}>
            No notes yet. Create your first other note above!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onUpdate={handleUpdateNote}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
