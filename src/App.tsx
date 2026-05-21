import { useState, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "reply" | "monitor" | "profile";
type Plan = "free" | "starter" | "pro" | "agency";

const PERSON_TYPES = [
  { value: "politician", label: "नेता / Politician" },
  { value: "minister", label: "मन्त्री / Minister" },
  { value: "mayor", label: "मेयर / Mayor" },
  { value: "ward_chair", label: "वडाध्यक्ष / Ward Chair" },
  { value: "candidate", label: "उम्मेद्वार / Candidate" },
  { value: "activist", label: "अभियन्ता / Activist" },
  { value: "journalist", label: "पत्रकार / Journalist" },
  { value: "influencer", label: "इन्फ्लुएन्सर / Influencer" },
  { value: "ngo_leader", label: "NGO नेता / NGO Leader" },
  { value: "public_figure", label: "सार्वजनिक व्यक्ति / Public Figure" },
];

const SITUATION_TYPES = [
  { value: "attack", label: "⚔️ राजनीतिक आक्रमण / Political Attack" },
  { value: "complaint", label: "📢 गुनासो / Constituent Complaint" },
  { value: "misinformation", label: "🚫 झूटो खबर / Misinformation" },
  { value: "policy_criticism", label: "📋 नीति आलोचना / Policy Criticism" },
  { value: "personal_attack", label: "👤 व्यक्तिगत आक्रमण / Personal Attack" },
  { value: "positive_support", label: "❤️ समर्थन / Positive Support" },
  { value: "press_question", label: "🎙️ प्रेस प्रश्न / Press Question" },
  { value: "crisis", label: "🚨 संकट / Crisis Response" },
];

const TONES = [
  { value: "diplomatic", label: "🤝 कूटनीतिक / Diplomatic" },
  { value: "firm", label: "💪 दृढ / Firm & Factual" },
  { value: "empathetic", label: "💙 सहानुभूतिपूर्ण / Empathetic" },
  { value: "crisis_control", label: "🛡️ संकट नियन्त्रण / Crisis Control" },
  { value: "grateful", label: "🙏 आभारी / Grateful" },
];

const PLATFORMS = [
  { value: "facebook", label: "Facebook", icon: "🔵" },
  { value: "youtube", label: "YouTube", icon: "🔴" },
  { value: "tiktok", label: "TikTok", icon: "⬛" },
  { value: "twitter", label: "X / Twitter", icon: "🐦" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "news", label: "News / Media", icon: "📰" },
  { value: "other", label: "अन्य / Other", icon: "💬" },
];

const LANGUAGES = [
  { value: "nepali", label: "नेपाली" },
  { value: "english", label: "English" },
  { value: "both", label: "दुवै / Both" },
];

// Local storage keys
const LS_USER = "neporm_user";
const LS_PROFILE = "neporm_profile";

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>("reply");
  const [userId, setUserId] = useState<Id<"users"> | null>(() => {
    const s = localStorage.getItem(LS_USER);
    return s ? JSON.parse(s).userId : null;
  });
  const [showOnboard, setShowOnboard] = useState(!userId);

  const userData = useQuery(
    api.users.getMyData,
    userId ? { email: JSON.parse(localStorage.getItem(LS_USER) ?? "{}").email ?? "" } : "skip"
  );

  const planLimits: Record<Plan, string> = {
    free: "५ जवाफ",
    starter: "३० जवाफ/महिना",
    pro: "असीमित",
    agency: "असीमित",
  };

  if (showOnboard) {
    return <OnboardScreen onDone={(uid, email, name) => {
      localStorage.setItem(LS_USER, JSON.stringify({ userId: uid, email, name }));
      setUserId(uid);
      setShowOnboard(false);
    }} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0ede8", fontFamily: "'Noto Sans Devanagari', 'Mukta', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: "16px 20px 0", borderBottom: "1px solid #1e1e2a" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 680, margin: "0 auto" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#e8c84a", letterSpacing: "-0.5px" }}>
              नेपओRM
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>Nepal Political ORM</div>
          </div>
          {userData && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#555" }}>
                {userData.plan.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {planLimits[userData.plan]} · {userData.repliesUsed} used
              </div>
            </div>
          )}
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, maxWidth: 680, margin: "0 auto", marginTop: 16 }}>
          {([
            { id: "reply", label: "✍️ जवाफ / Reply" },
            { id: "monitor", label: "🔍 निगरानी / Monitor" },
            { id: "profile", label: "👤 प्रोफाइल" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "10px 8px",
                background: "none",
                border: "none",
                borderBottom: tab === t.id ? "2px solid #e8c84a" : "2px solid transparent",
                color: tab === t.id ? "#e8c84a" : "#555",
                fontSize: 12,
                fontWeight: tab === t.id ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 80px" }}>
        {tab === "reply" && <ReplyTab userId={userId!} userData={userData} />}
        {tab === "monitor" && <MonitorTab userId={userId!} />}
        {tab === "profile" && <ProfileTab userId={userId!} userData={userData} />}
      </main>
    </div>
  );
}

// ─── Onboard ──────────────────────────────────────────────────────────────────
function OnboardScreen({ onDone }: { onDone: (uid: Id<"users">, email: string, name: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const register = useMutation(api.users.registerUser);

  const submit = async () => {
    if (!name.trim() || !email.trim()) { setError("नाम र इमेल आवश्यक छ।"); return; }
    setLoading(true);
    try {
      const res = await register({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() || undefined });
      onDone(res.userId, email.trim().toLowerCase(), name.trim());
    } catch (e) {
      setError("Error: " + String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🇳🇵</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#e8c84a", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>नेपओRM</div>
          <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>Nepal को लागि राजनीतिक ORM औजार</div>
          <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>Political Reputation Management for Nepal</div>
        </div>

        <div style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 20, textAlign: "center" }}>
            निःशुल्क सुरु गर्नुहोस् — ५ जवाफ Free
          </div>

          <Label>पूरा नाम / Full Name *</Label>
          <Input value={name} onChange={setName} placeholder="जस्तै: राम बहादुर थापा" />

          <Label style={{ marginTop: 14 }}>इमेल / Email *</Label>
          <Input value={email} onChange={setEmail} placeholder="email@example.com" type="email" />

          <Label style={{ marginTop: 14 }}>फोन / Phone (optional)</Label>
          <Input value={phone} onChange={setPhone} placeholder="98XXXXXXXX" type="tel" />

          {error && <div style={{ color: "#e85a4a", fontSize: 12, marginTop: 8 }}>{error}</div>}

          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%", marginTop: 20, padding: "14px",
              background: loading ? "#333" : "#e8c84a", color: "#0a0a0f",
              border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Noto Sans Devanagari', sans-serif",
            }}
          >
            {loading ? "..." : "सुरु गर्नुहोस् →"}
          </button>

          <div style={{ fontSize: 11, color: "#444", textAlign: "center", marginTop: 12 }}>
            पहिले नै account छ? उही email राख्नुहोस्।
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reply Tab ────────────────────────────────────────────────────────────────
function ReplyTab({ userId, userData }: { userId: Id<"users">; userData: any }) {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(LS_PROFILE) ?? "null"); } catch { return null; }
  })();

  const [personType, setPersonType] = useState(saved?.personType ?? "politician");
  const [profileName, setProfileName] = useState(saved?.name ?? "");
  const [platform, setPlatform] = useState("facebook");
  const [situationType, setSituationType] = useState("attack");
  const [tone, setTone] = useState("diplomatic");
  const [language, setLanguage] = useState("nepali");
  const [comment, setComment] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const generate = useAction(api.replies.generateReplies);

  const canGenerate = profileName.trim() && comment.trim() && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setReplies([]);
    try {
      const res = await generate({
        userId,
        profileName: profileName.trim(),
        personType,
        platform: platform as any,
        situationType: situationType as any,
        tone: tone as any,
        language: language as any,
        originalComment: comment.trim(),
      });
      if (res.success) {
        setReplies(res.replies);
      } else {
        setError(res.error ?? "Error generating replies");
      }
    } catch (e) {
      setError("Server error: " + String(e));
    } finally {
      setLoading(false);
    }
  };

  const copyReply = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const isPlanLimited = userData?.plan === "free" && userData?.repliesUsed >= 5;

  return (
    <div>
      {isPlanLimited && (
        <div style={{ background: "#1a1208", border: "1px solid #e8c84a33", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "center" }}>
          <div style={{ color: "#e8c84a", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Free limit सकियो</div>
          <div style={{ color: "#888", fontSize: 13 }}>Upgrade को लागि सम्पर्क गर्नुहोस्</div>
          <a href="tel:+977" style={{ display: "inline-block", marginTop: 10, background: "#e8c84a", color: "#0a0a0f", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            📞 सम्पर्क गर्नुहोस्
          </a>
        </div>
      )}

      <Section title="व्यक्तिको विवरण / Person">
        <Label>नाम / Name *</Label>
        <Input value={profileName} onChange={setProfileName} placeholder="जस्तै: राम बहादुर श्रेष्ठ" />
        <Label style={{ marginTop: 12 }}>भूमिका / Role</Label>
        <Select value={personType} onChange={setPersonType} options={PERSON_TYPES} />
      </Section>

      <Section title="प्लेटफर्म / Platform">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              style={{
                padding: "10px 4px", background: platform === p.value ? "#1a1a08" : "#111118",
                border: `1px solid ${platform === p.value ? "#e8c84a" : "#1e1e2a"}`,
                borderRadius: 8, color: platform === p.value ? "#e8c84a" : "#555",
                fontSize: 11, cursor: "pointer", textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18 }}>{p.icon}</div>
              <div style={{ marginTop: 3 }}>{p.label}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="टिप्पणी / Comment *">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="यहाँ आलोचना, गुनासो, वा सन्देश टाइप गर्नुहोस्..."
          rows={4}
          style={{
            width: "100%", background: "#111118", border: "1px solid #1e1e2a",
            borderRadius: 10, color: "#f0ede8", padding: "12px", fontSize: 14,
            resize: "vertical", fontFamily: "'Noto Sans Devanagari', sans-serif", boxSizing: "border-box",
          }}
        />
      </Section>

      <Section title="जवाफको प्रकार / Reply Settings">
        <Label>स्थिति / Situation</Label>
        <Select value={situationType} onChange={setSituationType} options={SITUATION_TYPES} />
        <Label style={{ marginTop: 12 }}>स्वर / Tone</Label>
        <Select value={tone} onChange={setTone} options={TONES} />
        <Label style={{ marginTop: 12 }}>भाषा / Language</Label>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {LANGUAGES.map((l) => (
            <button key={l.value} onClick={() => setLanguage(l.value)}
              style={{
                flex: 1, padding: "8px 4px",
                background: language === l.value ? "#1a1a08" : "#111118",
                border: `1px solid ${language === l.value ? "#e8c84a" : "#1e1e2a"}`,
                borderRadius: 8, color: language === l.value ? "#e8c84a" : "#555",
                fontSize: 13, cursor: "pointer",
              }}
            >{l.label}</button>
          ))}
        </div>
      </Section>

      <button
        onClick={handleGenerate}
        disabled={!canGenerate || !!isPlanLimited}
        style={{
          width: "100%", padding: "15px",
          background: canGenerate && !isPlanLimited ? "#e8c84a" : "#1a1a1a",
          color: canGenerate && !isPlanLimited ? "#0a0a0f" : "#444",
          border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
          cursor: canGenerate && !isPlanLimited ? "pointer" : "not-allowed",
          fontFamily: "'Noto Sans Devanagari', sans-serif",
          transition: "all 0.15s",
        }}
      >
        {loading ? "जवाफ बनाउँदैछ..." : "✍️ जवाफ बनाउनुहोस्"}
      </button>

      {error && (
        <div style={{ background: "#1a0808", border: "1px solid #e85a4a33", borderRadius: 10, padding: 14, marginTop: 16, color: "#e85a4a", fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 24 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "#111118", borderRadius: 12, height: 80, marginBottom: 12, opacity: 1 - i * 0.2, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      )}

      {replies.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 12, textAlign: "center" }}>जवाफका ३ विकल्प / 3 Reply Options</div>
          {replies.map((reply, i) => (
            <div key={i} style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#555" }}>विकल्प {i + 1} / Option {i + 1}</div>
                <button
                  onClick={() => copyReply(reply, i)}
                  style={{ background: copied === i ? "#1a2a1a" : "#1a1a1a", border: `1px solid ${copied === i ? "#4a8" : "#2a2a2a"}`, borderRadius: 6, color: copied === i ? "#4a8" : "#888", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}
                >
                  {copied === i ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <div style={{ fontSize: 14, color: "#d0cdc8", lineHeight: 1.7, fontFamily: "'Noto Sans Devanagari', sans-serif", whiteSpace: "pre-wrap" }}>
                {reply}
              </div>
            </div>
          ))}
          <button
            onClick={handleGenerate}
            style={{ width: "100%", padding: "11px", background: "none", border: "1px solid #2a2a3a", borderRadius: 10, color: "#555", fontSize: 13, cursor: "pointer", marginTop: 4 }}
          >
            ↺ फेरि बनाउनुहोस् / Regenerate
          </button>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
    </div>
  );
}

// ─── Monitor Tab ──────────────────────────────────────────────────────────────
function MonitorTab({ userId }: { userId: Id<"users"> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const search = useAction(api.monitor.searchMentions);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await search({ query: query.trim(), userId });
      setResults(res.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sentimentColors: Record<string, string> = {
    negative: "#e85a4a",
    positive: "#4a8",
    neutral: "#888",
  };

  const sentimentLabels: Record<string, string> = {
    negative: "⚠️ नकारात्मक",
    positive: "✅ सकारात्मक",
    neutral: "○ तटस्थ",
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
          नाम खोज्नुहोस् — समाचार र Reddit मा उल्लेख देखाउँछ
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="जस्तै: KP Sharma Oli, Balen Shah..."
            style={{
              flex: 1, background: "#111118", border: "1px solid #1e1e2a",
              borderRadius: 10, color: "#f0ede8", padding: "12px 14px",
              fontSize: 14, fontFamily: "'Noto Sans Devanagari', sans-serif",
            }}
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            style={{
              padding: "12px 20px", background: "#e8c84a", color: "#0a0a0f",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "🔍"}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", color: "#555", padding: "40px 0", fontSize: 13 }}>
          खोज्दैछ... Searching news & Reddit
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: "center", color: "#444", padding: "40px 0", fontSize: 13 }}>
          कुनै उल्लेख फेला परेन। / No mentions found.
        </div>
      )}

      {!loading && results.map((r, i) => (
        <div key={i} style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: "#555" }}>{r.source} · {r.platform}</div>
            <div style={{ fontSize: 11, color: sentimentColors[r.sentiment], fontWeight: 600 }}>
              {sentimentLabels[r.sentiment]}
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#d0cdc8", lineHeight: 1.5, marginBottom: 8 }}>{r.title}</div>
          {r.snippet && r.snippet !== r.title && (
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 8 }}>{r.snippet.slice(0, 150)}{r.snippet.length > 150 ? "..." : ""}</div>
          )}
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color: "#e8c84a", textDecoration: "none" }}
          >
            ↗ मूल हेर्नुहोस् / Open Original
          </a>
        </div>
      ))}

      {!loading && !searched && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ color: "#444", fontSize: 13 }}>नाम खोज्नुहोस् र उल्लेखहरू हेर्नुहोस्</div>
          <div style={{ color: "#333", fontSize: 12, marginTop: 4 }}>Search a name to see mentions</div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ userId, userData }: { userId: Id<"users">; userData: any }) {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem(LS_USER) ?? "{}"); } catch { return {}; }
  })();

  const planColors: Record<Plan, string> = {
    free: "#555",
    starter: "#4a8",
    pro: "#e8c84a",
    agency: "#a78bfa",
  };

  return (
    <div>
      {userData && (
        <div style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1a1a08", border: "2px solid #e8c84a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🇳🇵
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#f0ede8" }}>{userData.name}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{userData.email}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Plan", value: <span style={{ color: planColors[userData.plan as Plan] ?? "#555", textTransform: "uppercase", fontWeight: 700 }}>{userData.plan}</span> },
              { label: "Status", value: userData.isActive ? <span style={{ color: "#4a8" }}>✅ Active</span> : <span style={{ color: "#e85a4a" }}>⏸ Inactive</span> },
              { label: "कुल जवाफ / Total Replies", value: userData.repliesUsed },
              { label: "यस महिना / This Month", value: userData.repliesThisMonth },
            ].map((item, i) => (
              <div key={i} style={{ background: "#0a0a0f", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f0ede8" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {userData?.plan === "free" && (
        <div style={{ background: "#0d0d08", border: "1px solid #e8c84a33", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e8c84a", marginBottom: 8 }}>🚀 Upgrade गर्नुहोस्</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.6 }}>
            Pro plan मा असीमित जवाफ, Monitor tab, र प्रेस स्टेटमेन्ट generator पाउनुहोस्।
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
            💰 NPR 2,000/महिना मात्र
          </div>
          <ContactForm />
        </div>
      )}

      {/* Plan info */}
      <div style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 14, overflow: "hidden" }}>
        {[
          { plan: "Starter", price: "NPR 500/mo", features: "३० जवाफ/महिना · Facebook + YouTube", color: "#4a8" },
          { plan: "Pro", price: "NPR 2,000/mo", features: "असीमित · सबै platforms · Monitor", color: "#e8c84a", highlight: true },
          { plan: "Agency", price: "NPR 8,000/mo", features: "१० profiles · Team · White-label", color: "#a78bfa" },
        ].map((t, i) => (
          <div key={i} style={{ padding: "14px 16px", borderBottom: i < 2 ? "1px solid #1a1a2a" : "none", background: t.highlight ? "#0d0d06" : "transparent" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.color }}>{t.plan}</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{t.features}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f0ede8", textAlign: "right" }}>{t.price}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: "#333", textAlign: "center" }}>
        Offline payment — eSewa / Bank Transfer / Cash<br />सम्पर्क गरेपछि account activate गरिन्छ
      </div>
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("pro");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = useMutation(api.admin.submitContactRequest);

  const send = async () => {
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    try {
      await submit({ name: name.trim(), phone: phone.trim(), planInterested: plan });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ background: "#0a180a", border: "1px solid #4a833", borderRadius: 10, padding: 16, textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
        <div style={{ color: "#4a8", fontSize: 14, fontWeight: 600 }}>Request पठाइयो!</div>
        <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>हामी छिट्टै सम्पर्क गर्छौं।</div>
      </div>
    );
  }

  return (
    <div>
      <Input value={name} onChange={setName} placeholder="नाम / Name" />
      <div style={{ marginTop: 8 }}>
        <Input value={phone} onChange={setPhone} placeholder="Phone: 98XXXXXXXX" type="tel" />
      </div>
      <button onClick={send} disabled={loading || !name || !phone}
        style={{ width: "100%", marginTop: 10, padding: "12px", background: "#e8c84a", color: "#0a0a0f", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans Devanagari', sans-serif" }}
      >
        {loading ? "..." : "📞 सम्पर्क अनुरोध पठाउनुहोस्"}
      </button>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
      {children}
    </div>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontSize: 12, color: "#555", marginBottom: 6, ...style }}>{children}</div>;
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2a", borderRadius: 8, color: "#f0ede8", padding: "10px 12px", fontSize: 14, fontFamily: "'Noto Sans Devanagari', sans-serif", boxSizing: "border-box" }}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2a", borderRadius: 8, color: "#f0ede8", padding: "10px 12px", fontSize: 13, fontFamily: "'Noto Sans Devanagari', sans-serif", cursor: "pointer" }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
