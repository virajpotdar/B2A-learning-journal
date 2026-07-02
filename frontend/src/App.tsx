import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { supabase } from "./supabase/client";

import Navbar from "./components/Navbar";
import Journal from "./pages/Journal";
import ForgotPassword from "./pages/ForgotPassword";
import RoadmapPage from "./pages/RoadmapPage";
import SharedPathPage from "./pages/SharedPathPage";
import JoinGroup from "./pages/JoinGroup";
import GroupDashboard from "./pages/GroupDashboard";
import SearchDialog from "./components/SearchDialog";
import { SearchProvider } from "./context/SearchContext";
import Login from "./pages/login";
import Register from "./pages/register";

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user) {
      const createOrUpdateProfile = async () => {
        try {
          const email = user.email;
          if (!email) return;
          const username = user.name || user.nickname || email.split('@')[0];

          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                email,
                full_name: username,
                auth_provider: 'auth0',
                auth_provider_id: user.sub || email,
                avatar_url: user.picture,
              }]);

            if (profileError) {
              console.error('Error creating OAuth user profile:', profileError);
            } else {
              console.log('Profile created successfully for:', email);
            }
          }
        } catch (error) {
          console.error('Error in OAuth profile creation:', error);
        }
      };

      createOrUpdateProfile();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SearchProvider>
      <Router>
        <SearchDialog />
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/journal" replace />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/journal" replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/journal" replace />
              ) : (
                <Register />
              )
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/share/:shareId" element={<SharedPathPage />} />
          <Route path="/group/join/:inviteCode" element={<JoinGroup />} />

          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route index element={<Navigate to="/journal" replace />} />
                  <Route path="journal" element={
                    isAuthenticated ? <Journal /> : <Navigate to="/login" replace />
                  } />
                  <Route path="roadmap/:slug" element={<RoadmapPage />} />
                  <Route path="group/:groupId" element={
                    isAuthenticated ? <GroupDashboard /> : <Navigate to="/login" replace />
                  } />

                  {/* Legacy route redirects */}
                  <Route path="frontend" element={<Navigate to="/roadmap/frontend" replace />} />
                  <Route path="backend" element={<Navigate to="/roadmap/backend" replace />} />
                  <Route path="other" element={<Navigate to="/roadmap/other" replace />} />
                  <Route path="graph" element={<Navigate to="/roadmap/frontend" replace />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </Router>
    </SearchProvider>
  );
}
