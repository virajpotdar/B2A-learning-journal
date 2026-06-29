import type { JournalNote } from '../types/index';

function NoteCard({ note }: { note: JournalNote }) {
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
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: '#333' 
        }}>
          {note.title}
        </h3>
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
      <p style={{ 
        margin: 0, 
        color: '#666', 
        lineHeight: '1.6',
        fontSize: '1rem'
      }}>
        {note.content}
      </p>
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