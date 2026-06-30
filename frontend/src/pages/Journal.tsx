import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Journal() {
  const navigate = useNavigate();
  const [noteCounts, setNoteCounts] = useState<{ frontend: number; backend: number; other: number }>({
    frontend: 0,
    backend: 0,
    other: 0,
  });

  useEffect(() => {
    const fetchNoteCounts = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/notes");
        const notes = await res.json();
        
        const counts = notes.reduce((acc: any, note: any) => {
          const category = note.category?.toLowerCase() || 'other';
          if (acc[category] !== undefined) {
            acc[category]++;
          }
          return acc;
        }, { frontend: 0, backend: 0, other: 0 });
        
        setNoteCounts(counts);
      } catch (error) {
        console.error("Failed to fetch note counts:", error);
      }
    };

    fetchNoteCounts();
  }, []);

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
            Welcome! Keep your learning notes organized by topic. Click a category
            to view and manage your notes.
          </p>

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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h2 style={{ margin: 0, color: "#1565c0" }}>
                  Frontend
                </h2>
                <span style={{
                  background: "#1565c0",
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: "bold"
                }}>
                  {noteCounts.frontend} notes
                </span>
              </div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h2 style={{ margin: 0, color: "#e65100" }}>
                  Backend
                </h2>
                <span style={{
                  background: "#e65100",
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: "bold"
                }}>
                  {noteCounts.backend} notes
                </span>
              </div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h2 style={{ margin: 0, color: "#6a1b9a" }}>Other</h2>
                <span style={{
                  background: "#6a1b9a",
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: "bold"
                }}>
                  {noteCounts.other} notes
                </span>
              </div>
              <p style={{ margin: 0, color: "#4a148c", lineHeight: "1.7" }}>
                Save any other information here—notes that don't fit in frontend
                or backend categories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
