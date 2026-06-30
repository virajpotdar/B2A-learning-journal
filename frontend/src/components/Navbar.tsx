import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) setUser(data?.user ?? null);
      } catch (e) {
        console.error('getUser error', e);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      try { sub?.subscription?.unsubscribe(); } catch {};
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <nav style={{ 
      padding: '1.5rem', 
      background: 'linear-gradient(135deg, #ed771d 0%, #f5a623 100%)', 
      color: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontFamily: 'Arial, Verdana'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Knowledge Journal</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link 
            to="/frontend"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#ed771d',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
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
            Frontend
          </Link>
          <Link 
            to="/backend"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#ed771d',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
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
            Backend
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              style={{
                padding: '0.55rem 1.2rem',
                background: 'white',
                color: '#ed771d',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#ed771d',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
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
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;