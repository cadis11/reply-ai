import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const checkPassword = useAction(api.admin.checkAdminPassword);

  const login = async () => {
    setLoading(true);
    setError("");
    const ok = await checkPassword({ password });
    if (ok) {
      setAuthed(true);
      sessionStorage.setItem("neporm_admin", password);
    } else {
      setError("गलत password");
    }
    setLoading(false);
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 360, background: "#111118", border: "1px solid #1e1e2a", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#e8c84a", marginBottom: 4 }}>नेपओRM Admin</div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>Admin Password</div>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password"
            style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2a", borderRadius: 8, color: "#f0ede8", padding: "10px 12px", fontSize: 14, boxSizing: "border-box", marginBottom: 12 }}
          />
          {error && <div style={{ color: "#e85a4a", fontSize: 12, marginBottom: 8 }}>{error}</div>}
          <button onClick={login} disabled={loading}
            style={{ width: "100%", padding: "12px", background: "#e8c84a", color: "#0a0a0f", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "..." : "Login →"}
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard password={password} />;
}

function AdminDashboard({ password }: { password: string }) {
  const [tab, setTab] = useState<"stats" | "users" | "contacts">("stats");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getDashboard = useAction(api.admin.getDashboardStats);
  const listUsers = useAction(api.admin.listUsers);
  const listContacts = useAction(api.admin.listContactRequests);
  const activateUser = useAction(api.admin.activateUser);

  const loadStats = async () => {
    setLoading(true);
    const res = await getDashboard({ adminPassword: password });
    if ("error" in res) return;
    setStats(res);
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    const res = await listUsers({ adminPassword: password });
    if (!Array.isArray(res)) return;
    setUsers(res);
    setLoading(false);
  };

  const loadContacts = async () => {
    setLoading(true);
    const res = await listContacts({ adminPassword: password });
    if (!Array.isArray(res)) return;
    setContacts(res);
    setLoading(false);
  };

  const handleTabChange = (t: "stats" | "users" | "contacts") => {
    setTab(t);
    if (t === "stats" && !stats) loadStats();
    if (t === "users") loadUsers();
    if (t === "contacts") loadContacts();
  };

  const handleActivate = async (userId: Id<"users">, plan: string) => {
    await activateUser({ adminPassword: password, userId, plan: plan as any, note: "Manually activated" });
    loadUsers();
  };

  const planColor: Record<string, string> = { free: "#555", starter: "#4a8", pro: "#e8c84a", agency: "#a78bfa" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0ede8" }}>
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e8c84a" }}>नेपओRM Admin</div>
        <div style={{ fontSize: 11, color: "#555" }}>Admin Panel</div>
      </header>

      <div style={{ display: "flex", borderBottom: "1px solid #1e1e2a" }}>
        {(["stats", "users", "contacts"] as const).map((t) => (
          <button key={t} onClick={() => handleTabChange(t)}
            style={{ flex: 1, padding: "12px", background: "none", border: "none", borderBottom: tab === t ? "2px solid #e8c84a" : "2px solid transparent", color: tab === t ? "#e8c84a" : "#555", fontSize: 13, cursor: "pointer" }}
          >
            {t === "stats" ? "📊 Stats" : t === "users" ? "👥 Users" : "📞 Contacts"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        {tab === "stats" && (
          <div>
            {!stats && (
              <button onClick={loadStats} style={{ padding: "12px 24px", background: "#e8c84a", color: "#0a0a0f", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Load Stats
              </button>
            )}
            {stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                {[
                  { label: "Total Users", value: stats.totalUsers },
                  { label: "Active Users", value: stats.activeUsers },
                  { label: "Pro/Agency", value: stats.proUsers },
                  { label: "Total Replies", value: stats.totalReplies },
                  { label: "Today's Replies", value: stats.todayReplies },
                  { label: "New Contacts", value: stats.newContacts, highlight: true },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.highlight ? "#0d0d08" : "#111118", border: `1px solid ${s.highlight ? "#e8c84a33" : "#1e1e2a"}`, borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: s.highlight ? "#e8c84a" : "#f0ede8" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            {stats && (
              <div style={{ marginTop: 16, background: "#111118", borderRadius: 10, padding: 14 }}>
                <span style={{ fontSize: 12, color: "#555" }}>AI Provider: </span>
                <span style={{ fontSize: 12, color: "#e8c84a", fontWeight: 600 }}>{stats.aiProvider.toUpperCase()}</span>
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div>
            {loading && <div style={{ color: "#555", fontSize: 13, padding: 20 }}>Loading...</div>}
            {users.map((u) => (
              <div key={u._id} style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{u.email} · {u.phone ?? "no phone"}</div>
                    <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>
                      {u.repliesUsed} replies · Joined {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: planColor[u.plan] ?? "#555", fontWeight: 600 }}>{u.plan.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: u.isActive ? "#4a8" : "#e85a4a" }}>
                      {u.isActive ? "● Active" : "● Inactive"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {(["starter", "pro", "agency"] as const).map((plan) => (
                    <button key={plan} onClick={() => handleActivate(u._id, plan)}
                      style={{ padding: "5px 10px", background: "#1a1a1a", border: "1px solid #2a2a3a", borderRadius: 6, color: planColor[plan], fontSize: 11, cursor: "pointer" }}
                    >
                      → {plan}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "contacts" && (
          <div>
            {loading && <div style={{ color: "#555", fontSize: 13, padding: 20 }}>Loading...</div>}
            {contacts.map((c) => (
              <div key={c._id} style={{ background: "#111118", border: `1px solid ${c.status === "new" ? "#e8c84a33" : "#1e1e2a"}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>📞 {c.phone}</div>
                    {c.email && <div style={{ fontSize: 12, color: "#555" }}>✉️ {c.email}</div>}
                    <div style={{ fontSize: 12, color: "#e8c84a", marginTop: 4 }}>Plan: {c.planInterested}</div>
                    {c.message && <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{c.message}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: c.status === "new" ? "#e8c84a" : "#555" }}>{c.status.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: "#444" }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
