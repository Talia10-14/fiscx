import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const C = {
  green: "#006B3F", green2: "#005232", green3: "#00A35E",
  gold: "#FCD116", gold2: "#E6BC00", red: "#C8102E",
  navy: "#0D2D6B", off: "#F7F8F5", gray1: "#F0F2EE",
  gray2: "#D8DDD4", gray3: "#9AA394", gray4: "#5A6357",
  dark: "#111A13", text: "#1A2318", textm: "#4A5548",
  white: "#FFFFFF",
};

export default function LoginPagev2() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const demoPhone = import.meta.env.VITE_DEMO_PHONE || "97000000";
  const demoPin = import.meta.env.VITE_DEMO_PIN || "123456";
  
  const [phone, setPhone] = useState(demoPhone);
  const [pin, setPin] = useState(demoPin);
  const [selectedRole, setSelectedRole] = useState("MERCHANT");
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "MERCHANT", label: "🛍️ Commerçant", color: C.green },
    { id: "BANKER", label: "🏦 Banquier", color: "#1e40af" },
    { id: "ADMIN", label: "👨‍💼 Admin", color: "#7c3aed" },
    { id: "DGI", label: "📋 DGI Agent", color: "#dc2626" },
  ];

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Créer un utilisateur simulé avec le rôle sélectionné
    const mockUser = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      phone,
      pin,
      role: selectedRole,
      firstName: "Test",
      lastName: "User",
      email: `test.${selectedRole.toLowerCase()}@fiscx.bj`,
      creditScore: 750,
    };

    // Simuler un token JWT
    const mockToken = `bearer_${btoa(JSON.stringify(mockUser))}`;

    // Stocker dans localStorage et Zustand
    login(mockToken, mockUser);

    // Rediriger vers le bon dashboard
    const redirects = {
      MERCHANT: "/dashboard",
      BANKER: "/banker/dashboard",
      ADMIN: "/admin/dashboard",
      DGI: "/dgi/dashboard",
    };

    setTimeout(() => {
      navigate(redirects[selectedRole] || "/dashboard");
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.off, fontFamily: "'Sora',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
      `}</style>

      <div style={{
        width: "100%", maxWidth: 420,
        background: C.white, borderRadius: 20,
        padding: 40, boxShadow: "0 10px 40px rgba(0,0,0,.1)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, background: C.green,
            borderRadius: 16, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
            boxShadow: `0 4px 12px rgba(0,107,63,.15)`
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill={C.white}>
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.dark, marginBottom: 8 }}>FiscX Tester</h1>
          <p style={{ fontSize: ".9rem", color: C.gray3, marginBottom: 6 }}>Testez les différents dashboards</p>
        </div>

        {/* Test Credentials Info */}
        <div style={{ background: "#F0FAF5", border: `1px solid ${C.green}40`, borderRadius: 12, padding: 12, marginBottom: 24 }}>
          <div style={{ fontSize: ".75rem", fontWeight: 600, color: C.green, marginBottom: 8, textTransform: "uppercase" }}>📱 Identifiants de test</div>
          <div style={{ fontSize: ".85rem", color: C.text }}>
            <div style={{ marginBottom: 6 }}><strong>Téléphone:</strong> {phone}</div>
            <div><strong>PIN:</strong> {pin}</div>
          </div>
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: ".8rem", fontWeight: 600, color: C.text, marginBottom: 12 }}>
            Sélectionner un rôle
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  padding: 12, borderRadius: 12,
                  border: `2px solid ${selectedRole === role.id ? role.color : C.gray2}`,
                  background: selectedRole === role.id ? `${role.color}15` : C.white,
                  color: selectedRole === role.id ? role.color : C.textm,
                  fontSize: ".85rem", fontWeight: 500,
                  cursor: "pointer", transition: "all .2s",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: 14, borderRadius: 12,
            background: loading ? C.gray3 : C.green,
            border: "none", color: C.white,
            fontFamily: "'Sora',sans-serif", fontSize: "1rem",
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            transition: "all .2s",
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = C.green2)}
          onMouseLeave={e => !loading && (e.currentTarget.style.background = C.green)}
        >
          {loading ? "Connexion en cours…" : "Se connecter au tableau de bord →"}
        </button>

        {/* Info */}
        <div style={{ marginTop: 24, padding: 12, background: "#FFF0F0", borderRadius: 12, border: `1px solid ${C.red}40` }}>
          <p style={{ fontSize: ".75rem", color: C.red, margin: 0 }}>
            ℹ️ <strong>Mode démo:</strong> Cliquez sur un rôle et connexion pour l'essayer. Les données sont simulées.
          </p>
        </div>
      </div>
    </div>
  );
}
