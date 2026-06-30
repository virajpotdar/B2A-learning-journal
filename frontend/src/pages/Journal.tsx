import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";

export default function Journal() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Knowledge Journal</h1>
      <p>Welcome — your learning entries will appear here.</p>
    </div>
  );
}
