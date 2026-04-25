"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  Activity,
  Search,
  Bell,
  LogOut,
  TrendingUp,
  ArrowUpRight,
  Briefcase,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStatus =
  | "New" | "Cold" | "Sent Email" | "Replied"
  | "Call Booked" | "Proposal Sent" | "Won" | "Lost";
type Platform = "LinkedIn" | "Upwork" | "Fiverr" | "Cold Email" | "Referral" | "Other";
type TeamRole = "Outreach" | "Content" | "Delivery" | "CEO" | "Outreach Manager";

interface Lead {
  id: string; businessName: string; websiteUrl: string; city: string;
  niche: string; email: string; emailsSent: number; lastOutreachAt: string | null;
  platform: Platform; service: string; status: LeadStatus;
  dateAdded: string; followUpDate: string; notes: string;
}
interface Task { id: string; title: string; assignee: TeamRole; done: boolean; date: string; }
interface ContentEntry { id: string; date: string; platform: Platform; idea: string; status: "Draft" | "Scheduled" | "Posted"; }
interface TeamMember { id: string; name: string; role: TeamRole; focus: string; }
interface ActivityLog { id: string; text: string; timestamp: string; type: "create" | "update" | "delete" | "system"; }
interface AppState { leads: Lead[]; tasks: Task[]; content: ContentEntry[]; team: TeamMember[]; activity: ActivityLog[]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPKTDate = () =>
  new Date(new Date().getTime() + 5 * 60 * 60 * 1000).toISOString().split("T")[0];

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Your agency's growth is limited only by your imagination.", author: "Strategic Mind" },
  { text: "Consistency is the mother of mastery.", author: "Robin Sharma" },
  { text: "Don't find customers for your products, find products for your customers.", author: "Seth Godin" },
];

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({
  message, type, onClear,
}: { message: string; type: "success" | "error"; onClear: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClear, 3000);
    return () => clearTimeout(t);
  }, [onClear]);
  return (
    <div className="fixed bottom-28 md:bottom-12 left-1/2 -translate-x-1/2 z-[60] luxury-card px-8 py-4 rounded-full flex items-center gap-4">
      <div className={`w-2 h-2 rounded-full ${type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">
        {message}
      </span>
    </div>
  );
};

// ─── Auth View ────────────────────────────────────────────────────────────────

function AuthView() {
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]     = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
      }
      // on success the browser redirects — no need to setLoading(false)
    } catch (err: any) {
      setAuthError(err?.message ?? "Unexpected error. Check console.");
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 md:p-8 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-center relative z-10">
        <div className="space-y-8 lg:space-y-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center">
              <TrendingUp size={20} className="text-black" />
            </div>
            <span className="font-display font-bold text-xl md:text-2xl tracking-tighter text-white">
              AI VIZED
            </span>
          </div>

          <div className="space-y-4 md:space-y-8">
            <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-white leading-[0.85]">
              Master <br />
              <span className="text-white/20 italic">Growth.</span>
            </h1>
            <p className="text-white/40 text-base md:text-xl max-w-sm font-medium leading-relaxed">
              The minimalist command center for elite agency operations.
            </p>
          </div>

          <div className="pt-8 md:pt-12 border-t border-white/5 max-w-sm hidden md:block">
            <p className="text-white/20 italic text-sm mb-4 leading-relaxed">
              &ldquo;{QUOTES[quoteIdx].text}&rdquo;
            </p>
            <p className="text-white/60 font-bold text-[10px] uppercase tracking-[0.3em]">
              — {QUOTES[quoteIdx].author}
            </p>
          </div>
        </div>

        <div className="luxury-card p-10 md:p-20 rounded-[3rem] md:rounded-[4rem]">
          <div className="mb-10 md:mb-16">
            <p className="label-premium mb-2">Secure Access</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tighter">
              Welcome back.
            </h2>
          </div>

          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="w-full bg-white text-black py-5 md:py-6 rounded-3xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {authLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Redirecting…
              </>
            ) : (
              <>
                <Globe size={18} />
                Authenticate with Google
              </>
            )}
          </button>

          {authError && (
            <div className="mt-6 px-5 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                {authError}
              </p>
            </div>
          )}

          <div className="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-white/5 grid grid-cols-3 gap-8 md:gap-12 opacity-20">
            {[ShieldCheck, Activity, Users].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center">
                <Icon size={22} className="text-white" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { name: "Dashboard",   icon: LayoutDashboard, label: "Home"  },
  { name: "Pipeline",    icon: Briefcase,       label: "Leads" },
  { name: "Daily Tasks", icon: CheckSquare,     label: "Tasks" },
  { name: "Planner",     icon: Calendar,        label: "Plan"  },
  { name: "Team",        icon: Users,           label: "Team"  },
  { name: "Registry",    icon: Activity,        label: "Log"   },
];

// ─── Root Component ───────────────────────────────────────────────────────────

export default function AiVized() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading]     = useState(true);
  const [user, setUser]           = useState<any>(null);
  const [toast, setToast]         = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [state, setState] = useState<AppState>({
    leads: [], tasks: [], content: [],
    team: [
      { id: "m1", name: "Zuhaib Ahmed", role: "CEO",             focus: "Strategy & High-ticket Sales"     },
      { id: "m2", name: "Hadi Seelro",  role: "Outreach Manager",focus: "Cold Email & LinkedIn Automation" },
    ],
    activity: [],
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      else setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      const [leadsRes, tasksRes, contentRes, activityRes] = await Promise.all([
        supabase.from("leads").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").eq("user_id", userId).order("date", { ascending: false }),
        supabase.from("content").select("*").eq("user_id", userId).order("date", { ascending: false }),
        supabase.from("activity").select("*").eq("user_id", userId).order("timestamp", { ascending: false }).limit(50),
      ]);

      setState(prev => ({
        ...prev,
        leads: (leadsRes.data || []).map((l: any) => ({
          ...l,
          businessName:   l.business_name,
          websiteUrl:     l.website_url,
          emailsSent:     l.emails_sent || 0,
          lastOutreachAt: l.last_outreach_at,
        })),
        tasks:    tasksRes.data    || [],
        content:  contentRes.data  || [],
        activity: activityRes.data || [],
      }));

      const today = getPKTDate();
      if (!(tasksRes.data || []).some((t: any) => t.date === today)) {
        const defaults = [
          { user_id: userId, title: "Execute 15 Outreach Threads",  assignee: "Outreach Manager" as TeamRole, done: false, date: today },
          { user_id: userId, title: "Qualify 15 High-Value Targets", assignee: "CEO"             as TeamRole, done: false, date: today },
          { user_id: userId, title: "Deploy Content Stream",         assignee: "Content"         as TeamRole, done: false, date: today },
        ];
        const { data } = await supabase.from("tasks").insert(defaults).select();
        if (data) setState(prev => ({ ...prev, tasks: [...data, ...prev.tasks] }));
      }
    } finally { setLoading(false); }
  };

  const showToast   = (message: string, type: "success" | "error" = "success") => setToast({ message, type });
  const addActivity = async (text: string, type: ActivityLog["type"] = "update") => {
    if (!user) return;
    const { data } = await supabase
      .from("activity")
      .insert([{ user_id: user.id, text, timestamp: new Date().toISOString(), type }])
      .select().single();
    if (data) setState(prev => ({ ...prev, activity: [data, ...prev.activity].slice(0, 50) }));
  };

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) setActiveTab(tab);
  };

  const handleLogout = () => supabase.auth.signOut();

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-1.5 h-12 bg-white animate-[bounce_1s_infinite]" />
    </div>
  );

  if (!user) return <AuthView />;

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-white/10">

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-80 bg-black border-r border-white/5 p-16 flex-col z-40">
        <div className="mb-20 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-black" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tighter">AI VIZED</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabChange(tab.name)}
              className={`w-full flex items-center gap-6 px-6 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === tab.name
                  ? "bg-white/5 text-white"
                  : "text-white/20 hover:text-white/40 hover:bg-white/[0.02]"
              }`}
            >
              <tab.icon
                size={18}
                className={`transition-colors duration-300 ${activeTab === tab.name ? "text-emerald-500" : ""}`}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{tab.name}</span>
              {activeTab === tab.name && (
                <span className="ml-auto w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 flex items-center gap-4">
          <img
            src={
              user.user_metadata?.avatar_url ||
              `https://ui-avatars.com/api/?name=${user.email}&background=fff&color=000`
            }
            className="w-10 h-10 rounded-xl grayscale"
            alt="avatar"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 truncate">
              {user.email?.split("@")[0]}
            </p>
          </div>
          <button onClick={handleLogout} className="text-white/20 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────── */}
      <main className="w-full md:ml-80 flex-1 px-4 pt-6 pb-32 md:p-24 md:pb-16">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-20">

          {/* Header */}
          <header className="flex justify-between items-center gap-4">
            <h2 className="text-3xl md:text-7xl font-display font-bold tracking-tighter uppercase leading-none">
              <span className="hidden md:inline">{activeTab}</span>
              <span className="md:hidden">
                {TABS.find((t) => t.name === activeTab)?.label ?? activeTab}
              </span>
            </h2>
            <div className="flex items-center gap-4 md:gap-12">
              <div className="relative hidden md:block">
                <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10" />
                <input
                  type="text"
                  className="bg-transparent border-b border-white/5 pl-8 pr-4 py-2 focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest w-36"
                  placeholder="SEARCH"
                />
              </div>
              <Bell size={18} className="text-white/20 cursor-pointer hover:text-white/40 transition-colors" />
              <button
                onClick={handleLogout}
                className="md:hidden text-white/20 hover:text-white transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          {/* Tab Content — key re-triggers the CSS entrance animation */}
          <div key={activeTab} className="animate-tab-in">
            {activeTab === "Dashboard"   && <DashboardView  state={state} setState={setState} setActiveTab={handleTabChange} />}
            {activeTab === "Pipeline"    && <PipelineView   state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
            {activeTab === "Daily Tasks" && <TasksView      state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
            {activeTab === "Planner"     && <ContentView    state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
            {activeTab === "Team"        && <TeamView       state={state} setState={setState} showToast={showToast} addActivity={addActivity} />}
            {activeTab === "Registry"    && <ActivityView   state={state} />}
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────── */}
      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />

      {toast && <Toast message={toast.message} type={toast.type} onClear={() => setToast(null)} />}
    </div>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

function MobileNav({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const [poppingTab, setPoppingTab] = useState<string | null>(null);

  const handlePress = (tabName: string) => {
    if (tabName === activeTab) return;
    setPoppingTab(tabName);
    onTabChange(tabName);
    setTimeout(() => setPoppingTab(null), 420);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="bg-black/95 backdrop-blur-2xl">
        <div className="flex items-end justify-around px-1 pt-2 pb-safe">
          {TABS.map((tab) => {
            const isActive  = activeTab === tab.name;
            const isPopping = poppingTab === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => handlePress(tab.name)}
                className="flex flex-col items-center gap-0.5 flex-1 py-1 min-w-0 group"
                aria-label={tab.name}
              >
                {/* Icon pill */}
                <div
                  className={[
                    "relative flex items-center justify-center w-10 h-10 rounded-2xl",
                    "transition-all duration-300 ease-out",
                    isActive
                      ? "bg-emerald-500/15 shadow-[0_0_18px_rgba(16,185,129,0.15)] scale-110 -translate-y-0.5"
                      : "scale-100 translate-y-0 group-active:bg-white/5",
                    isPopping ? "nav-icon-pop" : "",
                  ].join(" ")}
                >
                  <tab.icon
                    size={19}
                    className={`transition-all duration-300 ${
                      isActive ? "text-emerald-400" : "text-white/30 group-active:text-white/50"
                    }`}
                  />
                  {isActive && (
                    <span className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-md -z-10" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive ? "text-emerald-400" : "text-white/20"
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active indicator dot */}
                <span
                  className={`block w-1 h-1 rounded-full mt-0.5 transition-all duration-300 ${
                    isActive ? "bg-emerald-500 scale-100 opacity-100" : "scale-0 opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardView({ state }: any) {
  const stats = useMemo(() => {
    const today      = getPKTDate();
    const todayTasks = (state.tasks as Task[]).filter((t) => t.date === today);
    const done       = todayTasks.filter((t) => t.done).length;
    const pct        = todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0;
    return [
      { label: "Daily Reach",  value: (state.leads as Lead[]).filter((l) => l.lastOutreachAt?.split("T")[0] === today).length.toString() },
      { label: "Execution",    value: `${pct}%` },
      { label: "Active Nodes", value: (state.leads as Lead[]).filter((l) => l.status !== "Won" && l.status !== "Lost").length.toString() },
      { label: "Revenue Core", value: (state.leads as Lead[]).filter((l) => l.status === "Won").length.toString() },
    ];
  }, [state]);

  return (
    <div className="space-y-8 md:space-y-20">

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-16">
        {stats.map((s, i) => (
          <div
            key={i}
            className="luxury-card md:bg-transparent md:border-0 md:shadow-none p-5 md:p-0 rounded-2xl space-y-1 md:space-y-4"
          >
            <p className="label-premium">{s.label}</p>
            <h3 className="text-4xl md:text-6xl font-display font-bold tracking-tighter">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-16">
        <div className="md:col-span-2 luxury-card p-7 md:p-16 rounded-[2rem] md:rounded-[4rem]">
          <div className="flex justify-between items-end mb-6 md:mb-16">
            <h3 className="text-lg md:text-2xl font-display font-bold">Activity Index</h3>
            <p className="label-premium">System Baseline</p>
          </div>
          <div className="h-[150px] md:h-[300px] bg-white/[0.02] rounded-[1.5rem] md:rounded-[2rem] flex items-end p-3 md:p-8 gap-2 md:gap-4">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/5 rounded-full relative group transition-all hover:bg-white/20"
                style={{ height: `${h}%` }}
              >
                <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="luxury-card p-7 md:p-16 rounded-[2rem] md:rounded-[4rem] flex flex-col justify-between gap-6 md:gap-0">
          <h3 className="text-lg md:text-2xl font-display font-bold">Distribution</h3>
          <div className="space-y-5 md:space-y-8">
            {["LinkedIn", "Email", "Referral"].map((p, i) => (
              <div key={p}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{p}</p>
                  <p className="text-lg md:text-xl font-display font-bold">{[45, 35, 20][i]}%</p>
                </div>
                <div className="h-px bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500/50 rounded-full"
                    style={{ width: `${[45, 35, 20][i]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

function PipelineView({ state }: any) {
  const [filter, setFilter] = useState("All");
  const filtered = (state.leads as Lead[]).filter(
    (l) => filter === "All" || l.status === filter
  );

  return (
    <div className="space-y-6 md:space-y-16">
      <div className="flex justify-between items-center">
        <div className="flex gap-5 md:gap-8">
          {["All", "New", "Won"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-colors pb-1 border-b ${
                filter === f
                  ? "text-emerald-500 border-emerald-500"
                  : "text-white/20 border-transparent hover:text-white/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="bg-white text-black font-bold text-[10px] uppercase tracking-[0.1em] px-5 py-2.5 md:px-8 md:py-4 rounded-full transition-all active:scale-95 hover:bg-white/90 shadow-xl">
          + Node
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="luxury-card p-12 rounded-[2rem] text-center text-white/20 text-sm font-bold uppercase tracking-widest">
          No leads in this filter
        </div>
      )}

      {/* Mobile: card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((lead) => (
          <div key={lead.id} className="luxury-card p-5 rounded-[1.5rem] space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-bold text-base leading-tight truncate">{lead.businessName}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-1 truncate">
                  {lead.email || "NO-LINK"}
                </p>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-white/5 rounded-full text-white/60 shrink-0">
                {lead.status}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/[0.04]">
              <p className="label-premium">{lead.platform}</p>
              <p className="text-xs font-bold text-white/30">{lead.emailsSent || 0} outreach</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block luxury-card rounded-[3rem] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-12 py-8 label-premium">Corporate Entity</th>
              <th className="px-12 py-8 label-premium">Status Protocol</th>
              <th className="px-12 py-8 label-premium text-right">Metrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map((lead) => (
              <tr key={lead.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-12 py-10">
                  <p className="text-lg font-bold tracking-tight">{lead.businessName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-1">
                    {lead.email || "NO-LINK"}
                  </p>
                </td>
                <td className="px-12 py-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full text-white/60">
                    {lead.status}
                  </span>
                </td>
                <td className="px-12 py-10 text-right">
                  <p className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">
                    {lead.emailsSent || 0} OUTREACH
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function TasksView({ state }: any) {
  const today = getPKTDate();
  const tasks = (state.tasks as Task[]).filter((t) => t.date === today);
  const done  = tasks.filter((t) => t.done).length;
  const pct   = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-16">
      <div className="luxury-card p-8 md:p-24 rounded-[2.5rem] md:rounded-[4rem] text-center">
        <p className="label-premium mb-3 md:mb-4">Synchronization</p>
        <h3 className="text-7xl md:text-9xl font-display font-bold tracking-tighter">{pct}%</h3>
        <div className="mt-5 md:mt-8 h-1 bg-white/5 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="luxury-card p-5 md:p-10 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-5 md:gap-10 group cursor-pointer"
          >
            <div
              className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl border-2 transition-all shrink-0 flex items-center justify-center ${
                t.done ? "bg-white border-white" : "border-white/10 group-hover:border-white/30"
              }`}
            >
              {t.done && (
                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={`text-base md:text-xl font-bold block ${
                  t.done ? "text-white/20 line-through" : ""
                }`}
              >
                {t.title}
              </span>
              <span className="label-premium mt-1 block md:hidden opacity-60">{t.assignee}</span>
            </div>
            <span className="label-premium opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
              {t.assignee}
            </span>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="luxury-card p-10 rounded-[2rem] text-center text-white/20 text-sm font-bold uppercase tracking-widest">
            No tasks for today
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Content Planner ──────────────────────────────────────────────────────────

function ContentView({ state }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-12">
      {(state.content as ContentEntry[]).map((c) => (
        <div key={c.id} className="luxury-card p-7 md:p-12 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-10">
          <div className="flex justify-between items-center">
            <span className="label-premium">{c.platform}</span>
            <span className="text-white/20 text-[10px]">{c.date}</span>
          </div>
          <p className="text-xl md:text-2xl font-bold italic leading-tight">&ldquo;{c.idea}&rdquo;</p>
          <div className="pt-5 md:pt-10 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              {c.status}
            </span>
            <ArrowUpRight size={16} className="text-white/20" />
          </div>
        </div>
      ))}

      {state.content.length === 0 && (
        <div className="col-span-full luxury-card p-10 rounded-[2rem] text-center text-white/20 text-sm font-bold uppercase tracking-widest">
          No content planned yet
        </div>
      )}
    </div>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamView({ state }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-16">
      {(state.team as TeamMember[]).map((m) => (
        <div
          key={m.id}
          className="luxury-card p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] flex flex-col justify-between gap-8 md:gap-0 min-h-[260px] md:h-[450px]"
        >
          <div>
            <p className="label-premium mb-2 md:mb-4">{m.role}</p>
            <h3 className="text-3xl md:text-5xl font-display font-bold tracking-tighter">{m.name}</h3>
          </div>
          <div className="space-y-3 md:space-y-8">
            <div className="p-5 md:p-8 bg-white/5 rounded-2xl md:rounded-3xl">
              <p className="label-premium mb-1 md:mb-2">Focus Core</p>
              <p className="text-white/60 font-medium text-sm md:text-base">{m.focus}</p>
            </div>
            <button className="w-full py-4 md:py-5 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95">
              Impact Analysis
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activity Registry ────────────────────────────────────────────────────────

function ActivityView({ state }: any) {
  return (
    <div className="max-w-4xl mx-auto luxury-card rounded-[2rem] md:rounded-[3rem] overflow-hidden">
      <div className="divide-y divide-white/[0.03]">
        {(state.activity as ActivityLog[]).map((l) => (
          <div key={l.id} className="p-5 md:p-10 flex items-center gap-5 md:gap-10">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                l.type === "create" ? "bg-emerald-500" : "bg-white/10"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold tracking-tight line-clamp-2 md:line-clamp-none">
                {l.text}
              </p>
              <p className="label-premium mt-1 opacity-50">
                {new Date(l.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {state.activity.length === 0 && (
          <div className="p-12 text-center text-white/20 text-sm font-bold uppercase tracking-widest">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}
