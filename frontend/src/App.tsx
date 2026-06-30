import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { supabase } from "./supabase/client";

import Navbar from "./components/Navbar";
import FrontendPage from "./pages/FrontendPage";
import BackendPage from "./pages/BackendPage";
import OtherPage from "./pages/OtherPage";
import Login from "./pages/login";
import Register from "./pages/Register";
import Journal from "./pages/Journal";

export default function App() {
  // 1. Bring in the Auth0 hook to check the user's status
  const { isAuthenticated, isLoading, user } = useAuth0();

  // 2. Requirement 8: Create OAuth user profile in Supabase when user authenticates via Google
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Auth0 Google Login Successful!", user);
      
      // Create or retrieve user profile in Supabase
      const createOrUpdateProfile = async () => {
        try {
          const email = user.email;
          if (!email) return;
          const username = user.name || user.nickname || email.split('@')[0];
          
          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
          
          if (!existingProfile) {
            // Create new profile for OAuth user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{ 
                email, 
                full_name: username,
                // Store Auth0 user ID as metadata for provider identification
                auth_provider: 'auth0',
                auth_provider_id: user.sub
              }]);
            
            if (profileError) {
              console.error('Error creating OAuth user profile:', profileError);
            } else {
              console.log('OAuth user profile created successfully');
            }
          } else {
            console.log('OAuth user profile already exists');
          }
        } catch (error) {
          console.error('Error in OAuth profile creation:', error);
        }
      };
      
      createOrUpdateProfile();
    }
  }, [isAuthenticated, user]);

  // 3. Show a loading screen while Auth0 checks if they are logged in
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Redirect root to login, UNLESS they are already authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/journal" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login and Register pages */}
        {/* If they are already logged in, push them directly to the journal */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/journal" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/journal" replace /> : <Register />
          }
        />

        {/* Main website pages WITH Navbar */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route index element={<FrontendPage />} />
                <Route path="frontend" element={<FrontendPage />} />
                <Route path="backend" element={<BackendPage />} />
                <Route path="other" element={<OtherPage />} />

                {/* Protect the Journal - only let them in if Auth0 says yes */}
                <Route
                  path="journal"
                  element={
                    isAuthenticated ? (
                      <Journal />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
              </Routes>
            </>
          }
        />
      </Routes>
    </Router>
  );
}
