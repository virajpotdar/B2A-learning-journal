import { useState, useEffect } from 'react';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';
import Roadmap from '../components/Roadmap';
import type { JournalNote } from '../types';

export default function FrontendPage() {
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/notes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const frontendNotes = data.filter((note: JournalNote) => note.category === 'Frontend');
      setNotes(frontendNotes || []);
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
    <div style={{ fontFamily: 'sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ 
            color: '#1976d2', 
            marginBottom: '0.5rem', 
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>Frontend Knowledge</h1>
          <p style={{ color: '#1565c0', fontSize: '1.1rem', margin: 0 }}>
            Explore your frontend development insights
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode('graph')}
            style={{
              padding: '12px 24px',
              background: viewMode === 'graph' ? '#1976d2' : 'white',
              color: viewMode === 'graph' ? 'white' : '#1976d2',
              border: '2px solid #1976d2',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📊 Graph View
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '12px 24px',
              background: viewMode === 'list' ? '#1976d2' : 'white',
              color: viewMode === 'list' ? 'white' : '#1976d2',
              border: '2px solid #1976d2',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📋 List View
          </button>
        </div>

        <NoteForm onNoteAdded={fetchNotes} category="Frontend" />
        
        {viewMode === 'graph' ? (
          <div style={{ 
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            height: '600px'
          }}>
            <Roadmap category="frontend" />
          </div>
        ) : (
          <>
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
                  e.currentTarget.style.borderColor = '#1976d2';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <h2 style={{ 
              marginBottom: '1.5rem', 
              color: '#333', 
              fontSize: '1.75rem',
              fontWeight: 'bold'
            }}>
              Recent Frontend Notes
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
                No notes yet. Create your first frontend note above!
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
          </>
        )}
      </main>
    </div>
  );
}
