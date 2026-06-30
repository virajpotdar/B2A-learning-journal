import { useEffect, useState } from 'react';
import type { JournalNote } from '../types/index';

function NoteCard({
  note,
  onDelete,
  onUpdate,
}: {
  note: JournalNote;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title: string; content: string }) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.title, note.content]);

  const handleSave = async () => {
    await onUpdate(note.id, { title, content });
    setIsEditing(false);
  };

  return (
    <div style={{ 
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '0.75rem'
      }}>
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '1.1rem',
              borderRadius: '10px',
              border: '1px solid #ddd',
              marginBottom: '0.75rem'
            }}
          />
        ) : (
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: '#333' 
          }}>
            {note.title}
          </h3>
        )}
        {note.category && (
          <span style={{
            padding: '4px 12px',
            background: note.category === 'Frontend' ? '#e3f2fd' : '#fff3e0',
            color: note.category === 'Frontend' ? '#1976d2' : '#f57c00',
            borderRadius: '16px',
            fontSize: '0.875rem',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            {note.category}
          </span>
        )}
      </div>
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #ddd',
            resize: 'vertical',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        />
      ) : (
        <p style={{ 
          margin: 0, 
          color: '#666', 
          lineHeight: '1.6',
          fontSize: '1rem'
        }}>
          {note.content}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setTitle(note.title);
                setContent(note.content);
              }}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: '1px solid #ccc',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!title.trim() || !content.trim()}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: '#1976d2',
                color: 'white',
                cursor: title.trim() && content.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Save Changes
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: '1px solid #1976d2',
                background: 'white',
                color: '#1976d2',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: '1px solid #e53935',
                background: 'white',
                color: '#e53935',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>

      {note.created_at && (
        <div style={{ 
          marginTop: '1rem', 
          fontSize: '0.875rem', 
          color: '#999' 
        }}>
          {new Date(note.created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
export default NoteCard;