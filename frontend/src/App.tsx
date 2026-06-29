import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FrontendPage from './pages/FrontendPage';
import BackendPage from './pages/BackendPage';

export default function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<FrontendPage />} />
          <Route path="/frontend" element={<FrontendPage />} />
          <Route path="/backend" element={<BackendPage />} />
        </Routes>
      </div>
    </Router>
  );
}