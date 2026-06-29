import { useState } from 'react';

interface NoteFormProps {
  onNoteAdded: () => void;
  category: string;
}

export default function NoteForm({ onNoteAdded, category }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
  
    const newNote = { title, content, category };
    try {
      await fetch('http://localhost:4000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });

      // 3. Clear the form
      setTitle('');
      setContent('');

      // 4. Refresh the list so the new note shows up immediately!
      onNoteAdded();

    } catch (error) {
      console.error("Failed to save note:", error);
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
          Save Note
        </button>
      </div>
    </form>
  );
}