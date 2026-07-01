import { useState } from 'react';
import { createNote } from '../services/notesApi';

interface NoteFormProps {
  onNoteAdded: () => void;
  category: string;
}

export default function NoteForm({ onNoteAdded, category }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const newNote = { title, content, category };
    try {
      await createNote(newNote);
      setTitle('');
      setContent('');
      onNoteAdded();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save note';
      setError(message);
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      background: 'white',
      padding: '2rem',
      marginBottom: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>
        Create a New {category} Note
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#ed771d'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
        />
        <textarea 
          placeholder="Write your knowledge here..." 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          rows={4} 
          required 
          style={{
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#ed771d'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
        />
        <button 
          type="submit"
          disabled={saving}
          style={{ 
            background: 'linear-gradient(135deg, #ed771d 0%, #f5a623 100%)',
            color: 'white',
            padding: '14px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
        {error && (
          <p style={{ margin: 0, color: '#dc2626', fontSize: '0.9rem' }}>{error}</p>
        )}
      </div>
    </form>
  );
}