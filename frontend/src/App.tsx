import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FrontendPage from './pages/FrontendPage';
import BackendPage from './pages/BackendPage';
import OtherPage from './pages/OtherPage';
import Login from './pages/login'; 
import Register from './pages/Register';
import Journal from './pages/Journal';

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login and Register pages without Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main website pages WITH Navbar */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route index element={<ProtectedRoute><FrontendPage /></ProtectedRoute>} />
                <Route path="frontend" element={<ProtectedRoute><FrontendPage /></ProtectedRoute>} />
                <Route path="backend" element={<ProtectedRoute><BackendPage /></ProtectedRoute>} />
                <Route path="journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
              </Routes>
            </>
          }
        />

      </Routes>
    </Router>
  );
}