import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
=======
import { clearAuthUser } from "../utils/auth";
>>>>>>> main

export default function Journal() {
  const navigate = useNavigate();

<<<<<<< HEAD
=======
  const handleLogout = () => {
    clearAuthUser();
    navigate("/login");
  };

>>>>>>> main
  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background:
          "linear-gradient(180deg, #fff8e1 0%, #fff3e0 40%, #ffffff 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "3rem 2rem",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "3rem",
              lineHeight: 1.05,
              color: "#333",
              letterSpacing: "-0.03em",
            }}
          >
            Knowledge Journal
          </h1>
          <p
            style={{
              margin: "1rem auto 2rem",
              maxWidth: "640px",
              color: "#666",
              fontSize: "1.05rem",
              lineHeight: "1.75",
            }}
          >
            Keep your learning notes organized by topic, then click a category
            to save new entries for frontend, backend, or other topics.
          </p>

          {/* Button Container to keep them nicely spaced */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginBottom: "2.5rem",
            }}
          >
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem 2rem",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(135deg, #fb8c00 0%, #fdd835 100%)",
                color: "white",
                fontSize: "1.1rem",
                fontWeight: "700",
                boxShadow: "0 14px 30px rgba(251, 140, 0, 0.18)",
                cursor: "default",
              }}
            >
              Welcome
            </button>

            {/* The New Logout Button that fixes the TS6133 Error */}
            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem 2rem",
                borderRadius: "999px",
                border: "2px solid #ffebee",
                background: "white",
                color: "#d32f2f",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#ffebee";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              Logout
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gap: "1.25rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            }}
          >
            <div
              style={{
                background: "#e3f2fd",
                padding: "1.5rem",
                borderRadius: "18px",
                textAlign: "left",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onClick={() => navigate("/frontend")}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(30, 136, 229, 0.12)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h2 style={{ margin: "0 0 0.75rem", color: "#1565c0" }}>
                Frontend
              </h2>
              <p style={{ margin: 0, color: "#455a64", lineHeight: "1.7" }}>
                Save your frontend information here and keep track of your
                React, CSS, and UI learning notes.
              </p>
            </div>

            <div
              style={{
                background: "#fff3e0",
                padding: "1.5rem",
                borderRadius: "18px",
                textAlign: "left",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onClick={() => navigate("/backend")}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(245, 124, 0, 0.16)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h2 style={{ margin: "0 0 0.75rem", color: "#e65100" }}>
                Backend
              </h2>
              <p style={{ margin: 0, color: "#5d4037", lineHeight: "1.7" }}>
                Store your backend learning notes here, including server,
                database, and API concepts.
              </p>
            </div>

            <div
              style={{
                background: "#f3e5f5",
                padding: "1.5rem",
                borderRadius: "18px",
                textAlign: "left",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onClick={() => navigate("/other")}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(124, 77, 255, 0.14)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h2 style={{ margin: "0 0 0.75rem", color: "#6a1b9a" }}>Other</h2>
              <p style={{ margin: 0, color: "#4a148c", lineHeight: "1.7" }}>
                Save any other information here—notes that don’t fit in frontend
                or backend categories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
