import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav style={{ 
      padding: '1rem 1.5rem', 
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              color: '#ed771d',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>Knowledge Journal</h2>
        </div>
        
        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link 
            to="/frontend"
            style={{
              padding: '0.6rem 1.2rem',
              background: 'white',
              color: '#ed771d',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              fontSize: '0.9rem'
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
              padding: '0.6rem 1.2rem',
              background: 'white',
              color: '#ed771d',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              fontSize: '0.9rem'
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
          <Link 
            to="/other"
            style={{
              padding: '0.6rem 1.2rem',
              background: 'white',
              color: '#ed771d',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              fontSize: '0.9rem'
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
            Other
          </Link>
          {/* Requirement 6: Remove logout button, only show Login link when not authenticated */}
          {!user && (
            <Link 
              to="/login"
              style={{
                padding: '0.6rem 1.2rem',
                background: 'white',
                color: '#ed771d',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                fontSize: '0.9rem'
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

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          style={{
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '32px',
            height: '32px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            gap: '4px'
          }}
        >
          <span style={{
            width: '24px',
            height: '3px',
            background: 'white',
            borderRadius: '2px',
            transition: 'all 0.3s'
          }}></span>
          <span style={{
            width: '24px',
            height: '3px',
            background: 'white',
            borderRadius: '2px',
            transition: 'all 0.3s'
          }}></span>
          <span style={{
            width: '24px',
            height: '3px',
            background: 'white',
            borderRadius: '2px',
            transition: 'all 0.3s'
          }}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className="mobile-menu"
        style={{
          display: mobileMenuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          gap: '0.5rem',
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px'
        }}
      >
        <Link 
          to="/frontend"
          style={{
            padding: '0.75rem',
            background: 'white',
            color: '#ed771d',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          Frontend
        </Link>
        <Link 
          to="/backend"
          style={{
            padding: '0.75rem',
            background: 'white',
            color: '#ed771d',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          Backend
        </Link>
        <Link 
          to="/other"
          style={{
            padding: '0.75rem',
            background: 'white',
            color: '#ed771d',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          Other
        </Link>
        {!user && (
          <Link 
            to="/login"
            style={{
              padding: '0.75rem',
              background: 'white',
              color: '#ed771d',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
export default Navbar;