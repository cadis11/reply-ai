import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

type Lang = "en" | "ne";

const T = {
  en: {
    appName: "NepORM",
    appSub: "Nepal Political ORM",
    tabReply: "✍️ Reply",
    tabMonitor: "🔍 Monitor",
    tabProfile: "👤 Profile",
    freeLimitTitle: "Free limit reached",
    freeLimitDesc: "Contact us to upgrade",
    freeLimitBtn: "📞 Contact Us",
    sectionPerson: "Person",
    sectionPlatform: "Platform",
    sectionComment: "Comment",
    sectionSettings: "Reply Settings",
    namePlaceholder: "e.g. Ram Bahadur Shrestha",
    roleLabel: "Role",
    commentPlaceholder: "Paste the attack, complaint, or message here...",
    situationLabel: "Situation",
    toneLabel: "Tone",
    languageLabel: "Reply Language",
    generateBtn: "✍️ Generate Replies",
    generatingBtn: "Generating...",
    replyOption: "Option",
    regenerateBtn: "↺ Regenerate",
    searchPlaceholder: "e.g. KP Sharma Oli, Balen Shah...",
    searchBtn: "🔍",
    searchHint: "Search a name to see mentions from news & Reddit",
    noResults: "No mentions found.",
    openOriginal: "↗ Open Original",
    planLabel: "Plan",
    statusLabel: "Status",
    totalReplies: "Total Replies",
    thisMonth: "This Month",
    upgradeTitle: "🚀 Upgrade",
    upgradeDesc: "Get unlimited replies, Monitor tab, and press statement generator on Pro.",
    upgradePrice: "NPR 2,000/month only",
    contactBtn: "📞 Send Contact Request",
    contactSent: "Request sent! We'll contact you soon.",
    namField: "Full Name *",
    emailField: "Email *",
    phoneField: "Phone (optional)",
    active: "✅ Active",
    inactive: "⏸ Inactive",
    offline: "Offline payment — eSewa / Bank Transfer / Cash\nAccount activated after payment confirmation",
    signOut: "Sign out",
  },
  ne: {
    appName: "नेपORM",
    appSub: "नेपाल राजनीतिक ORM",
    tabReply: "✍️ जवाफ",
    tabMonitor: "🔍 निगरानी",
    tabProfile: "👤 प्रोफाइल",
    freeLimitTitle: "Free limit सकियो",
    freeLimitDesc: "Upgrade को लागि सम्पर्क गर्नुहोस्",
    freeLimitBtn: "📞 सम्पर्क गर्नुहोस्",
    sectionPerson: "व्यक्तिको विवरण",
    sectionPlatform: "प्लेटफर्म",
    sectionComment: "टिप्पणी *",
    sectionSettings: "जवाफको प्रकार",
    namePlaceholder: "जस्तै: राम बहादुर श्रेष्ठ",
    roleLabel: "भूमिका",
    commentPlaceholder: "यहाँ आलोचना, गुनासो, वा सन्देश टाइप गर्नुहोस्...",
    situationLabel: "स्थिति",
    toneLabel: "स्वर",
    languageLabel: "जवाफको भाषा",
    generateBtn: "✍️ जवाफ बनाउनुहोस्",
    generatingBtn: "जवाफ बनाउँदैछ...",
    replyOption: "विकल्प",
    regenerateBtn: "↺ फेरि बनाउनुहोस्",
    searchPlaceholder: "जस्तै: KP Sharma Oli, Balen Shah...",
    searchBtn: "🔍",
    searchHint: "नाम खोज्नुहोस् र समाचार तथा Reddit मा उल्लेखहरू हेर्नुहोस्",
    noResults: "कुनै उल्लेख फेला परेन।",
    openOriginal: "↗ मूल हेर्नुहोस्",
    planLabel: "Plan",
    statusLabel: "स्थिति",
    totalReplies: "कुल जवाफ",
    thisMonth: "यस महिना",
    upgradeTitle: "🚀 Upgrade गर्नुहोस्",
    upgradeDesc: "Pro plan मा असीमित जवाफ, Monitor tab, र प्रेस स्टेटमेन्ट generator पाउनुहोस्।",
    upgradePrice: "NPR 2,000/महिना मात्र",
    contactBtn: "📞 सम्पर्क अनुरोध पठाउनुहोस्",
    contactSent: "Request पठाइयो! हामी छिट्टै सम्पर्क गर्छौं।",
    namField: "पूरा नाम *",
    emailField: "इमेल *",
    phoneField: "फोन (optional)",
    active: "✅ सक्रिय",
    inactive: "⏸ निष्क्रिय",
    offline: "Offline payment — eSewa / Bank Transfer / Cash\nभुक्तानी पछि account activate गरिन्छ",
    signOut: "साइन आउट",
  },
};

const PERSON_TYPES = (lang: Lang) => [
  { value: "politician",    label: lang === "en" ? "Politician" : "नेता" },
  { value: "minister",      label: lang === "en" ? "Minister" : "मन्त्री" },
  { value: "mayor",         label: lang === "en" ? "Mayor" : "मेयर" },
  { value: "ward_chair",    label: lang === "en" ? "Ward Chair" : "वडाध्यक्ष" },
  { value: "candidate",     label: lang === "en" ? "Candidate" : "उम्मेद्वार" },
  { value: "activist",      label: lang === "en" ? "Activist" : "अभियन्ता" },
  { value: "journalist",    label: lang === "en" ? "Journalist" : "पत्रकार" },
  { value: "influencer",    label: lang === "en" ? "Influencer" : "इन्फ्लुएन्सर" },
  { value: "ngo_leader",    label: lang === "en" ? "NGO Leader" : "NGO नेता" },
  { value: "public_figure", label: lang === "en" ? "Public Figure" : "सार्वजनिक व्यक्ति" },
];

const SITUATION_TYPES = (lang: Lang) => [
  { value: "attack",           label: lang === "en" ? "⚔️ Political Attack" : "⚔️ राजनीतिक आक्रमण" },
  { value: "complaint",        label: lang === "en" ? "📢 Complaint" : "📢 गुनासो" },
  { value: "misinformation",   label: lang === "en" ? "🚫 Misinformation" : "🚫 झूटो खबर" },
  { value: "policy_criticism", label: lang === "en" ? "📋 Policy Criticism" : "📋 नीति आलोचना" },
  { value: "personal_attack",  label: lang === "en" ? "👤 Personal Attack" : "👤 व्यक्तिगत आक्रमण" },
  { value: "positive_support", label: lang === "en" ? "❤️ Positive Support" : "❤️ समर्थन" },
  { value: "press_question",   label: lang === "en" ? "🎙️ Press Question" : "🎙️ प्रेस प्रश्न" },
  { value: "crisis",           label: lang === "en" ? "🚨 Crisis Response" : "🚨 संकट" },
];

const TONES = (lang: Lang) => [
  { value: "diplomatic",     label: lang === "en" ? "🤝 Diplomatic" : "🤝 कूटनीतिक" },
  { value: "firm",           label: lang === "en" ? "💪 Firm & Factual" : "💪 दृढ" },
  { value: "empathetic",     label: lang === "en" ? "💙 Empathetic" : "💙 सहानुभूतिपूर्ण" },
  { value: "crisis_control", label: lang === "en" ? "🛡️ Crisis Control" : "🛡️ संकट नियन्त्रण" },
  { value: "grateful",       label: lang === "en" ? "🙏 Grateful" : "🙏 आभारी" },
];

const PLATFORMS = [
  { value: "facebook",  label: "Facebook",    icon: "🔵" },
  { value: "youtube",   label: "YouTube",     icon: "🔴" },
  { value: "tiktok",    label: "TikTok",      icon: "⬛" },
  { value: "twitter",   label: "X / Twitter", icon: "🐦" },
  { value: "instagram", label: "Instagram",   icon: "📸" },
  { value: "news",      label: "News/Media",  icon: "📰" },
  { value: "other",     label: "Other",       icon: "💬" },
];

const LANGUAGES = (lang: Lang) => [
  { value: "nepali",  label: "नेपाली" },
  { value: "english", label: "English" },
  { value: "both",    label: lang === "en" ? "Both" : "दुवै" },
];

type Plan = "free" | "starter" | "pro" | "agency";
type Tab  = "reply" | "monitor" | "profile";

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [tab, setTab]   = useState<Tab>("reply");
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const userData = useQuery(api.users.getMe);

  const t = T[lang];
  const planLimits: Record<Plan, string> = {
    free: lang === "en" ? "5 replies" : "५ जवाफ",
    starter: lang === "en" ? "30/month" : "३०/महिना",
    pro: lang === "en" ? "Unlimited" : "असीमित",
    agency: lang === "en" ? "Unlimited" : "असीमित",
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#e8c84a", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate({ to: "/signin" });
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/signin" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0ede8", fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif" }}>
      <header style={{ padding: "14px 20px 0", borderBottom: "1px solid #1e1e2a" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 680, margin: "0 auto" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#e8c84a" }}>{t.appName}</div>
            <div style={{ fontSize: 11, color: "#555" }}>{t.appSub}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", background: "#111118", border: "1px solid #1e1e2a", borderRadius: 8, overflow: "hidden" }}>
              {(["en", "ne"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: "5px 10px", background: lang === l ? "#e8c84a" : "none", color: lang === l ? "#0a0a0f" : "#555", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >{l === "en" ? "EN" : "नेपाली"}</button>
              ))}
            </div>
            {userData && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#555" }}>{userData.plan.toUpperCase()}</div>
                <div style={{ fontSize: 11, color: "#444" }}>{planLimits[userData.plan as Plan]}</div>
              </div>
            )}
            <button onClick={handleSignOut}
              style={{ background: "none", border: "1px solid #1e1e2a", borderRadius: 6, color: "#444", fontSize: 11, padding: "5px 10px", cursor: "pointer" }}
            >{t.signOut}</button>
          </div>
        </div>

        <div style={{ display: "flex", maxWidth: 680, margin: "0 auto", marginTop: 14 }}>
          {([
            { id: "reply",   label: t.tabReply },
            { id: "monitor", label: t.tabMonitor },
            { id: "profile", label: t.tabProfile },
          ] as { id: Tab; label: string }[]).map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              style={{ flex: 1, padding: "10px 8px", background: "none", border: "none", borderBottom: tab === tb.id ? "2px solid #e8c84a" : "2px solid transparent", color: tab === tb.id ? "#e8c84a" : "#555", fontSize: 12, fontWeight: tab === tb.id ? 600 : 400, cursor: "pointer" }}
            >{tb.label}</button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 80px" }}>
        {userData && (
          <>
            {tab === "reply"   && <ReplyTab   userId={userData._id} userData={userData} lang={lang} />}
            {tab === "monitor" && <MonitorTab userId={userData._id} lang={lang} />}
            {tab === "profile" && <ProfileTab userId={userData._id} userData={userData} lang={lang} />}
          </>
        )}
      </main>
    </div>
  );
}

function ReplyTab({ userId, userData, lang }: { userId: Id<"users">; userData: any; lang: Lang }) {
  const t = T[lang];
  const [personType,     setPersonType]     = useState("politician");
  const [profileName,    setProfileName]    = useState("");
  const [platform,       setPlatform]       = useState("facebook");
  const [situationType,  setSituationType]  = useState("attack");
  const [tone,           setTone]           = useState("diplomatic");
  const [language,       setLanguage]       = useState("nepali");
  const [comment,        setComment]        = useState("");
  const [replies,        setReplies]        = useState<string[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [copied,         setCopied]         = useState<number | null>(null);
  const generate = useAction(api.replies.generateReplies);

  const canGenerate = profileName.trim() && comment.trim() && !loading;
  const isPlanLimited = userData?.plan === "free" && userData?.repliesUsed >= 5;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true); setError(""); setReplies([]);
    try {
      const res = await generate({ userId, profileName: profileName.trim(), personType, platform: platform as any, situationType: situationType as any, tone: tone as any, language: language as any, originalComment: comment.trim() });
      if (res.success) setReplies(res.replies);
      else setError(res.error ?? "Error");
    } catch (e) { setError("Server error: " + String(e)); }
    finally { setLoading(false); }
  };

  const copyReply = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      {isPlanLimited && (
        <div style={{ background: "#1a1208", border: "1px solid #e8c84a33", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "center" }}>
          <div style={{ color: "#e8c84a", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.freeLimitTitle}</div>
          <div style={{ color: "#888", fontSize: 13 }}>{t.freeLimitDesc}</div>
          <a href="tel:+977" style={{ display: "inline-block", marginTop: 10, background: "#e8c84a", color: "#0a0a0f", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>{t.freeLimitBtn}</a>
        </div>
      )}
      <Section title={t.sectionPerson}>
        <Label>{lang === "en" ? "Name *" : "नाम *"}</Label>
        <Input value={profileName} onChange={setProfileName} placeholder={t.namePlaceholder} />
        <Label style={{ marginTop: 12 }}>{t.roleLabel}</Label>
        <Select value={personType} onChange={setPersonType} options={PERSON_TYPES(lang)} />
      </Section>
      <Section title={t.sectionPlatform}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {PLATFORMS.map((p) => (
            <button key={p.value} onClick={() => setPlatform(p.value)}
              style={{ padding: "10px 4px", background: platform === p.value ? "#1a1a08" : "#111118", border: `1px solid ${platform === p.value ? "#e8c84a" : "#1e1e2a"}`, borderRadius: 8, color: platform === p.value ? "#e8c84a" : "#555", fontSize: 11, cursor: "pointer", textAlign: "center" }}
            >
              <div style={{ fontSize: 18 }}>{p.icon}</div>
              <div style={{ marginTop: 3 }}>{p.label}</div>
            </button>
          ))}
        </div>
      </Section>
      <Section title={t.sectionComment}>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t.commentPlaceholder} rows={4}
          style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2a", borderRadius: 10, color: "#f0ede8", padding: "12px", fontSize: 14, resize: "vertical", fontFamily: "'Noto Sans Devanagari', sans-serif", boxSizing: "border-box" }}
        />
      </Section>
      <Section title={t.sectionSettings}>
        <Label>{t.situationLabel}</Label>
        <Select value={situationType} onChange={setSituationType} options={SITUATION_TYPES(lang)} />
        <Label style={{ marginTop: 12 }}>{t.toneLabel}</Label>
        <Select value={tone} onChange={setTone} options={TONES(lang)} />
        <Label style={{ marginTop: 12 }}>{t.languageLabel}</Label>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {LANGUAGES(lang).map((l) => (
            <button key={l.value} onClick={() => setLanguage(l.value)}
              style={{ flex: 1, padding: "8px 4px", background: language === l.value ? "#1a1a08" : "#0a0a0f", border: `1px solid ${language === l.value ? "#e8c84a" : "#1e1e2a"}`, borderRadius: 8, color: language === l.value ? "#e8c84a" : "#555", fontSize: 13, cursor: "pointer" }}
            >{l.label}</button>
          ))}
        </div>
      </Section>
      <button onClick={handleGenerate} disabled={!canGenerate || !!isPlanLimited}
        style={{ width: "100%", padding: "15px", background: canGenerate && !isPlanLimited ? "#e8c84a" : "#1a1a1a", color: canGenerate && !isPlanLimited ? "#0a0a0f" : "#444", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: canGenerate && !isPlanLimited ? "pointer" : "not-allowed", transition: "all 0.15s" }}
      >{loading ? t.generatingBtn : t.generateBtn}</button>
      {error && <div style={{ background: "#1a0808", border: "1px solid #e85a4a33", borderRadius: 10, padding: 14, marginTop: 16, color: "#e85a4a", fontSize: 13 }}>{error}</div>}
      {loading && (
        <div style={{ marginTop: 24 }}>
          {[0,1,2].map((i) => <div key={i} style={{ background: "#111118", borderRadius: 12, height: 80, marginBottom: 12, opacity: 1 - i * 0.2, animation: "pulse 1.5s ease-in-out infinite" }} />)}
        </div>
      )}
      {replies.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 12, textAlign: "center" }}>
            {lang === "en" ? "3 Reply Options" : "जवाफका ३ विकल्प"}
          </div>
          {replies.map((reply, i) => (
            <div key={i} style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#555" }}>{t.replyOption} {i + 1}</div>
                <button onClick={() => copyReply(reply, i)}
                  style={{ background: copied === i ? "#1a2a1a" : "#1a1a1a", border: `1px solid ${copied === i ? "#4a8" : "#2a2a2a"}`, borderRadius: 6, color: copied === i ? "#4a8" : "#888", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}
                >{copied === i ? "✓ Copied" : "Copy"}</button>
              </div>
              <div style={{ fontSize: 14, color: "#d0cdc8", lineHeight: 1.7, fontFamily: "'Noto Sans Devanagari', sans-serif", whiteSpace: "pre-wrap" }}>{reply}</div>
            </div>
          ))}
          <button onClick={handleGenerate}
            style={{ width: "100%", padding: "11px", background: "none", border: "1px solid #2a2a3a", borderRadius: 10, color: "#555", fontSize: 13, cursor: "pointer", marginTop: 4 }}
          >{t.regenerateBtn}</button>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
    </div>
  );
}

function MonitorTab({ userId, lang }: { userId: Id<"users">; lang: Lang }) {
  const t = T[lang];
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const search = useAction(api.monitor.searchMentions);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try { const res = await search({ query: query.trim(), userId }); setResults(res.results); }
    catch { setResults([]); }
    finally { setLoading(false); }
  };

  const sentimentColors: Record<string, string> = { negative: "#e85a4a", positive: "#4a8", neutral: "#888" };
  const sentimentLabels = (s: string) => {
    const map: Record<string, Record<Lang, string>> = {
      negative: { en: "⚠️ Negative", ne: "⚠️ नकारात्मक" },
      positive: { en: "✅ Positive",  ne: "✅ सकारात्मक" },
      neutral:  { en: "○ Neutral",   ne: "○ तटस्थ" },
    };
    return map[s]?.[lang] ?? s;
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>{t.searchHint}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t.searchPlaceholder}
            style={{ flex: 1, background: "#111118", border: "1px solid #1e1e2a", borderRadius: 10, color: "#f0ede8", padding: "12px 14px", fontSize: 14 }}
          />
          <button onClick={handleSearch} disabled={!query.trim() || loading}
            style={{ padding: "12px 20px", background: "#e8c84a", color: "#0a0a0f", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >{loading ? "..." : t.searchBtn}</button>
        </div>
      </div>
      {loading && <div style={{ textAlign: "center", color: "#555", padding: "40px 0", fontSize: 13 }}>{lang === "en" ? "Searching..." : "खोज्दैछ..."}</div>}
      {!loading && searched && results.length === 0 && <div style={{ textAlign: "center", color: "#444", padding: "40px 0", fontSize: 13 }}>{t.noResults}</div>}
      {!loading && results.length > 0 && (
        <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>
          {results.length} {lang === "en" ? "results found" : "नतिजा भेटियो"} · {lang === "en" ? "sorted by newest" : "नयाँ पहिले"}
        </div>
      )}
      {!loading && results.map((r, i) => {
        const credBadge: Record<string, { label: string; color: string }> = {
          nepal_major: { label: "🇳🇵 Major Nepal Media", color: "#1D9E75" },
          nepal_minor: { label: "🇳🇵 Nepal Media", color: "#4a8" },
          international: { label: "🌐 International", color: "#378ADD" },
          unknown: { label: "📰 Source", color: "#555" },
        };
        const cred = credBadge[r.credibility ?? "unknown"];
        const timeAgo = (dateStr?: string) => {
          if (!dateStr) return "";
          const diff = Date.now() - new Date(dateStr).getTime();
          const mins = Math.floor(diff / 60000);
          if (mins < 60) return `${mins}m ago`;
          const hrs = Math.floor(mins / 60);
          if (hrs < 24) return `${hrs}h ago`;
          return `${Math.floor(hrs / 24)}d ago`;
        };
        return (
          <div key={i} style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: cred.color, background: cred.color + "18", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>{cred.label}</span>
                <span style={{ fontSize: 11, color: "#444" }}>{r.source}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: sentimentColors[r.sentiment], fontWeight: 600 }}>{sentimentLabels(r.sentiment)}</span>
                {r.publishedAt && <span style={{ fontSize: 10, color: "#444" }}>{timeAgo(r.publishedAt)}</span>}
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#d0cdc8", lineHeight: 1.5, marginBottom: 8 }}>{r.title}</div>
            {r.snippet && r.snippet !== r.title && <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{r.snippet.slice(0, 150)}{r.snippet.length > 150 ? "..." : ""}</div>}
            <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#e8c84a", textDecoration: "none" }}>{t.openOriginal}</a>
          </div>
        );
      })}
      {!loading && !searched && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ color: "#444", fontSize: 13 }}>{t.searchHint}</div>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ userId, userData, lang }: { userId: Id<"users">; userData: any; lang: Lang }) {
  const t = T[lang];
  const planColors: Record<Plan, string> = { free: "#555", starter: "#4a8", pro: "#e8c84a", agency: "#a78bfa" };

  return (
    <div>
      {userData && (
        <div style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1a1a08", border: "2px solid #e8c84a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🇳🇵</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{userData.name}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{userData.email}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: t.planLabel,    value: <span style={{ color: planColors[userData.plan as Plan], textTransform: "uppercase", fontWeight: 700 }}>{userData.plan}</span> },
              { label: t.statusLabel,  value: userData.isActive ? <span style={{ color: "#4a8" }}>{t.active}</span> : <span style={{ color: "#e85a4a" }}>{t.inactive}</span> },
              { label: t.totalReplies, value: userData.repliesUsed },
              { label: t.thisMonth,    value: userData.repliesThisMonth },
            ].map((item, i) => (
              <div key={i} style={{ background: "#0a0a0f", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {userData?.plan === "free" && (
        <div style={{ background: "#0d0d08", border: "1px solid #e8c84a33", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e8c84a", marginBottom: 8 }}>{t.upgradeTitle}</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 8, lineHeight: 1.6 }}>{t.upgradeDesc}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>💰 {t.upgradePrice}</div>
          <ContactForm lang={lang} />
        </div>
      )}
      <div style={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 14, overflow: "hidden" }}>
        {[
          { plan: "Starter", price: "NPR 500/mo",   features: lang === "en" ? "30 replies/month · Facebook + YouTube" : "३० जवाफ/महिना", color: "#4a8" },
          { plan: "Pro",     price: "NPR 2,000/mo", features: lang === "en" ? "Unlimited · All platforms · Monitor" : "असीमित · सबै platforms", color: "#e8c84a", highlight: true },
          { plan: "Agency",  price: "NPR 8,000/mo", features: lang === "en" ? "10 profiles · Team · White-label" : "१० profiles · Team", color: "#a78bfa" },
        ].map((tier, i) => (
          <div key={i} style={{ padding: "14px 16px", borderBottom: i < 2 ? "1px solid #1a1a2a" : "none", background: tier.highlight ? "#0d0d06" : "transparent" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: tier.color }}>{tier.plan}</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{tier.features}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{tier.price}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: "#333", textAlign: "center", whiteSpace: "pre-line" }}>{t.offline}</div>
    </div>
  );
}

function ContactForm({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [sent,  setSent]  = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = useMutation(api.admin.submitContactRequest);

  const send = async () => {
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    try { await submit({ name: name.trim(), phone: phone.trim(), planInterested: "pro" }); setSent(true); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div style={{ background: "#0a180a", border: "1px solid #4a833", borderRadius: 10, padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
      <div style={{ color: "#4a8", fontSize: 14, fontWeight: 600 }}>{t.contactSent}</div>
    </div>
  );

  return (
    <div>
      <Input value={name}  onChange={setName}  placeholder={lang === "en" ? "Your name" : "नाम"} />
      <div style={{ marginTop: 8 }}>
        <Input value={phone} onChange={setPhone} placeholder="98XXXXXXXX" type="tel" />
      </div>
      <button onClick={send} disabled={loading || !name || !phone}
        style={{ width: "100%", marginTop: 10, padding: "12px", background: "#e8c84a", color: "#0a0a0f", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
      >{loading ? "..." : t.contactBtn}</button>
    </div>
  );
}

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

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2a", borderRadius: 8, color: "#f0ede8", padding: "10px 12px", fontSize: 14, fontFamily: "'Noto Sans Devanagari', sans-serif", boxSizing: "border-box" }}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2a", borderRadius: 8, color: "#f0ede8", padding: "10px 12px", fontSize: 13, fontFamily: "'Noto Sans Devanagari', sans-serif", cursor: "pointer" }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
