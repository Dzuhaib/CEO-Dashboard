"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  Activity, 
  Plus, 
  MoreVertical, 
  Search, 
  Bell, 
  LogOut, 
  ChevronRight, 
  TrendingUp, 
  Mail, 
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  ExternalLink,
  Briefcase,
  PieChart as PieChartIcon,
  ShieldCheck,
  Globe,
  Upload
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
} from "recharts";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";

// --- Types ---

type LeadStatus = "New" | "Cold" | "Sent Email" | "Replied" | "Call Booked" | "Proposal Sent" | "Won" | "Lost";
type Platform = "LinkedIn" | "Upwork" | "Fiverr" | "Cold Email" | "Referral" | "Other";
type Niche = "Restaurant" | "Salon" | "Estate Agent" | "Hotel" | "E-commerce" | "Other";
type TeamRole = "Outreach" | "Content" | "Delivery" | "CEO" | "Outreach Manager";

interface Lead {
  id: string;
  businessName: string;
  websiteUrl: string;
  city: string;
  niche: string;
  email: string;
  emailsSent: number;
  lastOutreachAt: string | null;
  platform: Platform;
  service: string;
  status: LeadStatus;
  dateAdded: string;
  followUpDate: string;
  notes: string;
}

interface Task {
  id: string;
  title: string;
  assignee: TeamRole;
  done: boolean;
  date: string;
}

interface ContentEntry {
  id: string;
  date: string;
  platform: Platform;
  idea: string;
  status: "Draft" | "Scheduled" | "Posted";
}

interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  focus: string;
}

interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
  type: "create" | "update" | "delete" | "system";
}

interface AppState {
  leads: Lead[];
  tasks: Task[];
  content: ContentEntry[];
  team: TeamMember[];
  activity: ActivityLog[];
}

const getPKTDate = () => {
  return new Date(new Date().getTime() + 5 * 60 * 60 * 1000).toISOString().split('T')[0];
};

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Your agency's growth is limited only by your imagination.", author: "Strategic Mind" },
  { text: "Consistency is the mother of mastery.", author: "Robin Sharma" },
  { text: "Don't find customers for your products, find products for your customers.", author: "Seth Godin" },
];

const Toast = ({ message, type, onClear }: { message: string, type: 'success' | 'error', onClear: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClear, 3000);
    return () => clearTimeout(timer);
  }, [onClear]);

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 luxury-card px-8 py-4 rounded-full flex items-center gap-4 animate-in slide-in-from-bottom-4">
      <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-white">{message}</span>
    </div>
  );
};

function AuthView() {
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
        <div className="space-y-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
               <TrendingUp size={24} className="text-black" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter text-white">AI VIZED</span>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-8xl font-display font-bold tracking-tighter text-white leading-[0.85]">
              Master <br />
              <span className="text-white/20 italic">Growth.</span>
            </h1>
            <p className="text-white/40 text-xl max-w-sm font-medium leading-relaxed">
              The minimalist command center for elite agency operations.
            </p>
          </div>

          <div className="pt-12 border-t border-white/5 max-w-sm">
            <p className="text-white/20 italic text-sm mb-4 leading-relaxed">"{QUOTES[quoteIdx].text}"</p>
            <p className="text-white/60 font-bold text-[10px] uppercase tracking-[0.3em]">— {QUOTES[quoteIdx].author}</p>
          </div>
        </div>

        <div className="luxury-card p-20 rounded-[4rem]">
          <div className="mb-16">
            <p className="label-premium mb-2">Secure Access</p>
            <h2 className="text-4xl font-display font-bold text-white tracking-tighter">Welcome back.</h2>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-white text-black py-6 rounded-3xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95"
          >
            <Globe size={18} />
            Authenticate with Google
          </button>

          <div className="mt-20 pt-12 border-t border-white/5 grid grid-cols-3 gap-12 opacity-20">
            {[ShieldCheck, Activity, Users].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center">
                <Icon size={24} className="text-white" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiVized() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [state, setState] = useState<AppState>({
    leads: [], tasks: [], content: [],
    team: [
      { id: "m1", name: "Zuhaib Ahmed", role: "CEO", focus: "Strategy & High-ticket Sales" },
      { id: "m2", name: "Hadi Seelro", role: "Outreach Manager", focus: "Cold Email & LinkedIn Automation" }
    ],
    activity: []
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
        supabase.from('leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('content').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('activity').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(50)
      ]);

      setState(prev => ({
        ...prev,
        leads: (leadsRes.data || []).map((l: any) => ({ ...l, businessName: l.business_name, websiteUrl: l.website_url, emailsSent: l.emails_sent || 0, lastOutreachAt: l.last_outreach_at })),
        tasks: tasksRes.data || [],
        content: contentRes.data || [],
        activity: activityRes.data || []
      }));
      
      const today = getPKTDate();
      if (!(tasksRes.data || []).some((t: any) => t.date === today)) {
        const defaults = [
          { user_id: userId, title: "Execute 15 Outreach Threads", assignee: "Outreach Manager" as TeamRole, done: false, date: today },
          { user_id: userId, title: "Qualify 15 High-Value Targets", assignee: "CEO" as TeamRole, done: false, date: today },
          { user_id: userId, title: "Deploy Content Stream", assignee: "Content" as TeamRole, done: false, date: today }
        ];
        const { data } = await supabase.from('tasks').insert(defaults).select();
        if (data) setState(prev => ({ ...prev, tasks: [...data, ...prev.tasks] }));
      }
    } finally { setLoading(false); }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });
  const addActivity = async (text: string, type: ActivityLog["type"] = "update") => {
    if (!user) return;
    const { data } = await supabase.from('activity').insert([{ user_id: user.id, text, timestamp: new Date().toISOString(), type }]).select().single();
    if (data) setState(prev => ({ ...prev, activity: [data, ...prev.activity].slice(0, 50) }));
  };

  const handleLogout = () => supabase.auth.signOut();

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-1.5 h-12 bg-white animate-[bounce_1s_infinite]" />
    </div>
  );

  if (!user) return <AuthView />;

  const tabs = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Pipeline", icon: Briefcase },
    { name: "Daily Tasks", icon: CheckSquare },
    { name: "Planner", icon: Calendar },
    { name: "Team", icon: Users },
    { name: "Registry", icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-white/10">
      <aside className="fixed left-0 top-0 h-full w-80 bg-black border-r border-white/5 p-16 flex flex-col z-40">
        <div className="mb-20 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-black" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tighter">AI VIZED</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-6 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.name ? "bg-white/5 text-white" : "text-white/20 hover:text-white/40"}`}
            >
              <tab.icon size={18} className={activeTab === tab.name ? "text-emerald-500" : ""} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 flex items-center gap-4">
          <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=fff&color=000`} className="w-10 h-10 rounded-xl grayscale" alt="P" />
          <div className="flex-1 min-w-0">
             <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{user.email?.split('@')[0]}</p>
          </div>
          <button onClick={handleLogout} className="text-white/20 hover:text-white"><LogOut size={18} /></button>
        </div>
      </aside>

      <main className="ml-80 flex-1 p-24">
        <div className="max-w-6xl mx-auto space-y-24">
          <header className="flex justify-between items-center">
            <h2 className="text-7xl font-display font-bold tracking-tighter uppercase">{activeTab}</h2>
            <div className="flex items-center gap-12">
               <div className="relative">
                  <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10" />
                  <input type="text" className="bg-transparent border-b border-white/5 pl-8 pr-4 py-2 focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest" placeholder="SEARCH" />
               </div>
               <Bell size={20} className="text-white/20" />
            </div>
          </header>

          {activeTab === "Dashboard" && <DashboardView state={state} setState={setState} setActiveTab={setActiveTab} />}
          {activeTab === "Pipeline" && <PipelineView state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
          {activeTab === "Daily Tasks" && <TasksView state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
          {activeTab === "Planner" && <ContentView state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
          {activeTab === "Team" && <TeamView state={state} setState={setState} showToast={showToast} addActivity={addActivity} />}
          {activeTab === "Registry" && <ActivityView state={state} />}
        </div>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClear={() => setToast(null)} />}
    </div>
  );
}

function DashboardView({ state, setActiveTab }: any) {
  const stats = useMemo(() => {
    const today = getPKTDate();
    const todayTasks = state.tasks.filter((t: any) => t.date === today);
    return [
      { label: "Daily Reach", value: state.leads.filter((l: any) => l.lastOutreachAt?.split('T')[0] === today).length.toString() },
      { label: "Execution", value: `${todayTasks.length ? Math.round((todayTasks.filter((t: any) => t.done).length / todayTasks.length) * 100) : 0}%` },
      { label: "Active Nodes", value: state.leads.filter((l: any) => l.status !== "Won" && l.status !== "Lost").length.toString() },
      { label: "Revenue Core", value: state.leads.filter((l: any) => l.status === "Won").length.toString() },
    ];
  }, [state]);

  return (
    <div className="space-y-24 animate-in fade-in duration-1000">
      <div className="grid grid-cols-4 gap-16">
        {stats.map((s: any, i: number) => (
          <div key={i} className="space-y-4">
             <p className="label-premium">{s.label}</p>
             <h3 className="text-6xl font-display font-bold tracking-tighter">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-16">
        <div className="col-span-2 luxury-card p-16 rounded-[4rem]">
           <div className="flex justify-between items-end mb-16">
              <h3 className="text-2xl font-display font-bold">Activity Index</h3>
              <p className="label-premium">System Baseline</p>
           </div>
           <div className="h-[300px] bg-white/[0.02] rounded-[2rem] flex items-end p-8 gap-4">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-white/5 rounded-full relative group transition-all hover:bg-white/20" style={{ height: `${h}%` }}>
                   <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-xl" />
                </div>
              ))}
           </div>
        </div>
        <div className="luxury-card p-16 rounded-[4rem] flex flex-col justify-between">
           <h3 className="text-2xl font-display font-bold">Distribution</h3>
           <div className="space-y-8">
              {['LinkedIn', 'Email', 'Referral'].map((p, i) => (
                <div key={p} className="flex justify-between items-end">
                   <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{p}</p>
                   <p className="text-xl font-display font-bold">{[45, 35, 20][i]}%</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function PipelineView({ state, setState, showToast, addActivity, user }: any) {
  const [filter, setFilter] = useState("All");
  const filtered = state.leads.filter((l: Lead) => filter === "All" || l.status === filter);

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
         <div className="flex gap-8">
            {["All", "New", "Won"].map((f: string) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-[10px] font-bold uppercase tracking-[0.3em] ${filter === f ? 'text-emerald-500' : 'text-white/20'}`}>{f}</button>
            ))}
         </div>
         <button className="btn-luxury">Initialize Node</button>
      </div>

      <div className="luxury-card rounded-[3rem] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-12 py-8 label-premium">Corporate Entity</th>
              <th className="px-12 py-8 label-premium">Status Protocol</th>
              <th className="px-12 py-8 label-premium text-right">Metrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map((lead: Lead) => (
              <tr key={lead.id} className="group hover:bg-white/[0.01]">
                <td className="px-12 py-10">
                   <p className="text-lg font-bold tracking-tight">{lead.businessName}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-1">{lead.email || 'NO-LINK'}</p>
                </td>
                <td className="px-12 py-10">
                   <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full text-white/60">{lead.status}</span>
                </td>
                <td className="px-12 py-10 text-right">
                   <p className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">{lead.emailsSent || 0} OUTREACH</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TasksView({ state, setState }: any) {
  const today = getPKTDate();
  const tasks = state.tasks.filter((t: any) => t.date === today);

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-700">
       <div className="luxury-card p-24 rounded-[4rem] text-center">
          <p className="label-premium mb-4">Synchronization</p>
          <h3 className="text-9xl font-display font-bold tracking-tighter">{tasks.length ? Math.round((tasks.filter((t: any) => t.done).length / tasks.length) * 100) : 0}%</h3>
       </div>
       <div className="space-y-4">
          {tasks.map((t: any) => (
            <div key={t.id} className="luxury-card p-10 rounded-[2rem] flex items-center gap-10 group cursor-pointer">
               <div className={`w-8 h-8 rounded-xl border-2 transition-all ${t.done ? 'bg-white border-white' : 'border-white/10 group-hover:border-white/30'}`} />
               <span className={`text-xl font-bold flex-1 ${t.done ? 'text-white/20 line-through' : ''}`}>{t.title}</span>
               <span className="label-premium opacity-0 group-hover:opacity-100 transition-opacity">{t.assignee}</span>
            </div>
          ))}
       </div>
    </div>
  );
}

function ContentView({ state }: any) {
  return (
    <div className="grid grid-cols-3 gap-12 animate-in fade-in duration-700">
      {state.content.map((c: ContentEntry) => (
        <div key={c.id} className="luxury-card p-12 rounded-[3rem] space-y-10">
           <div className="flex justify-between items-center">
              <span className="label-premium">{c.platform}</span>
              <span className="text-white/20 text-[10px]">{c.date}</span>
           </div>
           <p className="text-2xl font-bold italic leading-tight">"{c.idea}"</p>
           <div className="pt-10 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">{c.status}</span>
              <ArrowUpRight size={18} className="text-white/20" />
           </div>
        </div>
      ))}
    </div>
  );
}

function TeamView({ state }: any) {
  return (
    <div className="grid grid-cols-2 gap-16 animate-in fade-in duration-700">
      {state.team.map((m: TeamMember) => (
        <div key={m.id} className="luxury-card p-16 rounded-[4rem] flex flex-col justify-between h-[450px]">
           <div>
              <p className="label-premium mb-4">{m.role}</p>
              <h3 className="text-5xl font-display font-bold tracking-tighter">{m.name}</h3>
           </div>
           <div className="space-y-8">
              <div className="p-8 bg-white/5 rounded-3xl">
                 <p className="label-premium mb-2">Focus Core</p>
                 <p className="text-white/60 font-medium">{m.focus}</p>
              </div>
              <button className="w-full py-5 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Impact Analysis</button>
           </div>
        </div>
      ))}
    </div>
  );
}

function ActivityView({ state }: any) {
  return (
    <div className="max-w-4xl mx-auto luxury-card rounded-[3rem] overflow-hidden animate-in fade-in duration-700">
       <div className="divide-y divide-white/[0.03]">
          {state.activity.map((l: ActivityLog) => (
            <div key={l.id} className="p-10 flex items-center gap-10 group">
               <div className={`w-2 h-2 rounded-full ${l.type === 'create' ? 'bg-emerald-500' : 'bg-white/10'}`} />
               <div className="flex-1">
                  <p className="text-sm font-bold tracking-tight">{l.text}</p>
                  <p className="label-premium mt-1 opacity-50">{new Date(l.timestamp).toLocaleTimeString()}</p>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
