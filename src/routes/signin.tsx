import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
});

function SignInPage() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !password) { setError("Email and password required."); return; }
    setLoading(true); setError("");
    try {
      await signIn("password", { email, password, flow: "signIn" });
      navigate({ to: "/" });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🇳🇵</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#e8c84a" }}>NepORM</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>Nepal Political ORM</div>
        </div>

        <div style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#f0ede8", marginBottom: 20 }}>Sign in</div>

          <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>Email</div>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2a", borderRadius: 8, color: "#f0ede8", padding: "10px 12px", fontSize: 14, boxSizing: "border-box", marginBottom: 14 }}
          />

          <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>Password</div>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && handle()}
            style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2a", borderRadius: 8, color: "#f0ede8", padding: "10px 12px", fontSize: 14, boxSizing: "border-box" }}
          />

          {error && <div style={{ color: "#e85a4a", fontSize: 12, marginTop: 10 }}>{error}</div>}

          <button onClick={handle} disabled={loading}
            style={{ width: "100%", marginTop: 20, padding: "13px", background: loading ? "#333" : "#e8c84a", color: "#0a0a0f", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
          >{loading ? "Signing in..." : "Sign in →"}</button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#444" }}>
            No account?{" "}
            <Link to="/signup" style={{ color: "#e8c84a", textDecoration: "none" }}>Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
