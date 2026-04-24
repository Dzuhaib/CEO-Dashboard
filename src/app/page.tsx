"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  Activity, 
  Filter, 
  Plus, 
  MoreVertical, 
  Search, 
  Bell, 
  LogOut, 
  ChevronRight, 
  TrendingUp, 
  Mail, 
  Link2, 
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
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";

// --- Types ---

type LeadStatus = "Cold" | "Replied" | "Call Booked" | "Proposal Sent" | "Won" | "Lost";
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

// --- Components ---

const Toast = ({ message, type, onClear }: { message: string, type: 'success' | 'error', onClear: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClear, 3000);
    return () => clearTimeout(timer);
  }, [onClear]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1e293b] border border-indigo-500/30 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right fade-in duration-300">
      <div className={`p-1 rounded-full ${type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
        <CheckCircle2 size={18} />
      </div>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClear} className="text-slate-400 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

// --- Auth Component ---

function AuthView() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <TrendingUp className="text-white" size={40} />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-display font-black text-white tracking-tight mb-3">AGENCY OS</h1>
          <p className="text-slate-400 text-lg leading-relaxed">Login to access your agency dashboard and management tools.</p>
        </div>
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-xl"
        >
          <Globe size={24} />
          Sign in with Google
        </button>
        <div className="pt-4 border-t border-slate-800/50">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <ShieldCheck size={16} />
            Secure Enterprise Encryption
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Application ---

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Helper for Pakistani Timezone (UTC+5)
  const getPKTDate = () => {
    return new Date(new Date().getTime() + 5 * 60 * 60 * 1000).toISOString().split('T')[0];
  };

  const [state, setState] = useState<AppState>({
    leads: [],
    tasks: [],
    content: [],
    team: [
      { id: "m1", name: "Zuhaib Ahmed", role: "CEO", focus: "Strategy & High-ticket Sales" },
      { id: "m2", name: "Hadi Seelro", role: "Outreach Manager", focus: "Cold Email & LinkedIn Automation" }
    ],
    activity: []
  });

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      else setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      else {
        setState(prev => ({ ...prev, leads: [], tasks: [], content: [], activity: [] }));
        if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
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
        leads: (leadsRes.data || []).map((l: any) => ({
          ...l,
          businessName: l.business_name,
          websiteUrl: l.website_url,
          emailsSent: l.emails_sent || 0
        })),
        tasks: tasksRes.data || [],
        content: contentRes.data || [],
        activity: activityRes.data || []
      }));

      // Trigger daily task generation check after data is loaded
      if (tasksRes.data) {
        await checkTasks(userId, tasksRes.data);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const addActivity = async (text: string, type: ActivityLog["type"] = "update") => {
    if (!user) return;
    const log = {
      user_id: user.id,
      text,
      timestamp: new Date().toISOString(),
      type
    };
    const { data } = await supabase.from('activity').insert([log]).select().single();
    if (data) {
      setState(prev => ({ ...prev, activity: [data, ...prev.activity].slice(0, 50) }));
    }
  };

  const checkTasks = async (userId: string, currentTasks: Task[]) => {
    const today = getPKTDate();
    const todayTasks = currentTasks.filter(t => t.date === today);
    console.log(`Checking tasks for ${today}. Found: ${todayTasks.length}`);
    
    if (todayTasks.length === 0) {
      const defaults = [
        { user_id: userId, title: "Send 15 cold emails", assignee: "Outreach Manager" as TeamRole, done: false, date: today },
        { user_id: userId, title: "Send 15 cold DMs for LinkedIn", assignee: "Outreach Manager" as TeamRole, done: false, date: today },
        { user_id: userId, title: "Find 15 email leads for next time", assignee: "CEO" as TeamRole, done: false, date: today },
        { user_id: userId, title: "Post 1 LinkedIn piece", assignee: "Content" as TeamRole, done: false, date: today },
        { user_id: userId, title: "Review pipeline", assignee: "CEO" as TeamRole, done: false, date: today }
      ];
      const { data, error } = await supabase.from('tasks').insert(defaults).select();
      if (error) {
        console.error("Task Insert Error:", error);
        showToast("Error generating daily tasks: " + error.message, "error");
      } else if (data) {
        setState(prev => ({ ...prev, tasks: [...data, ...prev.tasks] }));
        addActivity("Daily outreach tasks generated", "system");
        showToast("Daily tasks generated!", "success");
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-display font-medium tracking-widest text-sm animate-pulse">SYNCHRONIZING OS</p>
      </div>
    );
  }

  if (!user) return <AuthView />;

  // Sections Definitions
  const tabs = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Pipeline", icon: Briefcase },
    { name: "Daily Tasks", icon: CheckSquare },
    { name: "Content Planner", icon: Calendar },
    { name: "Team", icon: Users },
    { name: "Activity Log", icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f172a] border-r border-slate-800/50 p-6 flex flex-col z-40">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
            AGENCY OS
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === tab.name 
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.name ? "text-indigo-400" : "group-hover:scale-110 transition-transform"} />
              <span className="font-medium">{tab.name}</span>
              {activeTab === tab.name && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-2 py-3">
            <img 
              src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`} 
              className="w-9 h-9 rounded-full border border-slate-700 shadow-lg"
              alt="Profile"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.user_metadata?.full_name || 'CEO'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">{activeTab}</h2>
              <p className="text-slate-400 mt-1">
                {activeTab === "Dashboard" ? "Overview of your agency's performance" : `Manage your ${activeTab.toLowerCase()}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="bg-slate-900/50 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                />
              </div>
              <button className="relative p-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#030712]" />
              </button>
            </div>
          </header>

          {/* Views */}
          {activeTab === "Dashboard" && <DashboardView state={state} setState={setState} setActiveTab={setActiveTab} />}
          {activeTab === "Pipeline" && <PipelineView state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
          {activeTab === "Daily Tasks" && <TasksView state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
          {activeTab === "Content Planner" && <ContentView state={state} setState={setState} showToast={showToast} addActivity={addActivity} user={user} />}
          {activeTab === "Team" && <TeamView state={state} setState={setState} showToast={showToast} addActivity={addActivity} />}
          {activeTab === "Activity Log" && <ActivityView state={state} />}
        </div>
      </main>

      {/* Toasts */}
      {toast && <Toast message={toast.message} type={toast.type} onClear={() => setToast(null)} />}
    </div>
  );
}

// --- View Components ---

function DashboardView({ state, setState, setActiveTab }: { state: AppState, setState: any, setActiveTab: any }) {
  const stats = useMemo(() => {
    const today = new Date(new Date().getTime() + 5 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayTasks = state.tasks.filter(t => t.date === today);
    const wonLeads = state.leads.filter(l => l.status === "Won");
    const followUpsToday = state.leads.filter(l => l.followUpDate === today);
    
    return [
      { label: "Outreach Sent Today", value: todayTasks.filter(t => t.done && t.assignee === "Outreach").length > 0 ? "45" : "0", icon: Mail, color: "text-indigo-400", bg: "bg-indigo-400/10" },
      { label: "Tasks Completed", value: `${todayTasks.filter(t => t.done).length}/${todayTasks.length}`, icon: CheckSquare, color: "text-emerald-400", bg: "bg-emerald-400/10" },
      { label: "Follow-ups Due", value: followUpsToday.length.toString(), icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
      { label: "Active Pipeline", value: state.leads.filter(l => l.status !== "Won" && l.status !== "Lost").length.toString(), icon: Briefcase, color: "text-blue-400", bg: "bg-blue-400/10" },
      { label: "Total Won", value: wonLeads.length.toString(), icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-400/10" },
      { label: "Conversion Rate", value: state.leads.length ? `${Math.round((wonLeads.length / state.leads.length) * 100)}%` : "0%", icon: PieChartIcon, color: "text-rose-400", bg: "bg-rose-400/10" },
    ];
  }, [state]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    state.leads.forEach(l => {
      const p = l.platform || "Other";
      counts[p] = (counts[p] || 0) + 1;
    });
    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : [
      { name: "LinkedIn", value: 0 },
      { name: "Upwork", value: 0 },
      { name: "Cold Email", value: 0 },
      { name: "Other", value: 0 },
    ];
  }, [state.leads]);

  const chartData = [
    { name: "Mon", sent: 8, replied: 1 },
    { name: "Tue", sent: 15, replied: 2 },
    { name: "Wed", sent: 12, replied: 4 },
    { name: "Thu", sent: 18, replied: 3 },
    { name: "Fri", sent: 10, replied: 5 },
    { name: "Sat", sent: 5, replied: 1 },
    { name: "Sun", sent: 3, replied: 0 },
  ];

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl group hover:border-indigo-500/30 transition-all relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-indigo-500 group-hover:text-white`}>
                   <stat.icon size={24} />
                </div>
                <div className="text-right">
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                   <h3 className="text-2xl font-display font-black text-white">{stat.value}</h3>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Outreach Performance</h3>
            <select className="bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-lg px-3 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Platforms Pie */}
        <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Source Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-slate-400">{entry.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks Preview */}
        <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Today's Focus</h3>
            <button onClick={() => setActiveTab("Daily Tasks")} className="text-indigo-400 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {state.tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className={`p-2 rounded-lg ${task.done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                   {task.done ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${task.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</p>
                  <p className="text-xs text-slate-500">{task.assignee}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads Preview */}
        <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent Leads</h3>
            <button onClick={() => setActiveTab("Pipeline")} className="text-indigo-400 text-sm font-medium hover:underline flex items-center gap-1">
              Manage <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {state.leads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
                  {lead.businessName ? lead.businessName[0] : "L"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-slate-200">{lead.businessName}</p>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{lead.service} • {lead.platform}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineView({ state, setState, showToast, addActivity, user }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    status: "Cold",
    platform: "LinkedIn",
    niche: "Other"
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredLeads = state.leads.filter((l: Lead) => filter === "All" || l.status === filter);

  const handleAddLead = async () => {
    if (!newLead.businessName || !user) return;
    const lead = {
      user_id: user.id,
      business_name: newLead.businessName!,
      website_url: newLead.websiteUrl || "",
      city: newLead.city || "",
      niche: newLead.niche || "Other",
      email: newLead.email || "",
      platform: newLead.platform as Platform,
      service: newLead.service || "Web Design",
      status: newLead.status as LeadStatus,
      date_added: new Date().toISOString().split('T')[0],
      follow_up_date: newLead.followUpDate || "",
      notes: newLead.notes || ""
    };
    const { data, error } = await supabase.from('leads').insert([lead]).select().single();
    if (error) {
      showToast("Error adding lead", "error");
      return;
    }
    setState((prev: AppState) => ({ ...prev, leads: [data, ...prev.leads] }));
    addActivity(`Lead added: ${lead.business_name}`, "create");
    showToast("Lead successfully added!");
    setIsModalOpen(false);
    setNewLead({ status: "Cold", platform: "LinkedIn", niche: "Other" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rawData = results.data as any[];
        const leadsToInsert = rawData.map(row => ({
          user_id: user.id,
          business_name: row.businessName || row.business_name || "Unknown",
          website_url: row.websiteUrl || row.website_url || "",
          city: row.city || "",
          niche: row.niche || "Other",
          email: row.email || "",
          platform: "Cold Email",
          service: "Web Design",
          status: "Cold",
          date_added: new Date().toISOString().split('T')[0]
        }));

        const { data, error } = await supabase.from('leads').insert(leadsToInsert).select();
        if (error) {
          showToast("Error uploading file", "error");
          return;
        }
        setState((prev: AppState) => ({ ...prev, leads: [...(data || []), ...prev.leads] }));
        addActivity(`${leadsToInsert.length} leads uploaded via CSV`, "create");
        showToast(`Successfully uploaded ${leadsToInsert.length} leads!`);
      }
    });
  };

  const deleteLead = async (id: string) => {
    const lead = state.leads.find((l: Lead) => l.id === id);
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      showToast("Error deleting lead", "error");
      return;
    }
    setState((prev: AppState) => ({ ...prev, leads: prev.leads.filter(l => l.id !== id) }));
    addActivity(`Lead deleted: ${lead?.businessName}`, "delete");
    showToast("Lead removed", "error");
  };

  const bulkDelete = async () => {
    if (!selectedLeads.length) return;
    const { error } = await supabase.from('leads').delete().in('id', selectedLeads);
    if (error) {
      showToast("Error in bulk delete", "error");
      return;
    }
    setState((prev: AppState) => ({ ...prev, leads: prev.leads.filter(l => !selectedLeads.includes(l.id)) }));
    addActivity(`${selectedLeads.length} leads deleted via bulk action`, "delete");
    showToast(`Deleted ${selectedLeads.length} leads`, "error");
    setSelectedLeads([]);
  };

  const bulkUpdateStatus = async (status: LeadStatus) => {
    if (!selectedLeads.length) return;
    const { error } = await supabase.from('leads').update({ status }).in('id', selectedLeads);
    if (error) {
      showToast("Error in bulk update", "error");
      return;
    }
    setState((prev: AppState) => ({
      ...prev,
      leads: prev.leads.map(l => selectedLeads.includes(l.id) ? { ...l, status } : l)
    }));
    addActivity(`Bulk status update for ${selectedLeads.length} leads to ${status}`);
    showToast(`Updated ${selectedLeads.length} leads to ${status}`);
    setSelectedLeads([]);
  };

  const updateEmailsSent = async (id: string) => {
    const lead = state.leads.find((l: Lead) => l.id === id);
    if (!lead) return;
    const newVal = (lead.emailsSent || 0) + 1;
    const { error } = await supabase.from('leads').update({ emails_sent: newVal }).eq('id', id);
    if (error) return;
    setState((prev: AppState) => ({
      ...prev,
      leads: prev.leads.map(l => l.id === id ? { ...l, emailsSent: newVal } : l)
    }));
    addActivity(`Email tracked for ${lead.businessName} (Total: ${newVal})`);
  };

  const toggleSelect = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) setSelectedLeads([]);
    else setSelectedLeads(filteredLeads.map((l: Lead) => l.id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          {["All", "Cold", "Replied", "Call Booked", "Won"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedLeads([]); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all border-dashed hover:border-indigo-500/50"
          >
            <Upload size={18} className="text-indigo-400" /> Upload CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={20} /> Add Lead
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <span className="text-indigo-400 font-bold text-sm">{selectedLeads.length} leads selected</span>
            <div className="h-4 w-px bg-indigo-500/20" />
            <div className="flex gap-2">
              {["Cold", "Replied", "Call Booked", "Won"].map((s) => (
                <button 
                  key={s}
                  onClick={() => bulkUpdateStatus(s as LeadStatus)}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold rounded-lg hover:text-white transition-colors"
                >
                  SET {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={bulkDelete}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-bold text-sm px-4"
          >
            <Trash2 size={16} /> Delete Selected
          </button>
        </div>
      )}

      <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business & Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location & Niche</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLeads.map((lead: Lead) => (
                <tr key={lead.id} className={`hover:bg-slate-800/30 transition-colors group ${selectedLeads.includes(lead.id) ? 'bg-indigo-500/5' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        {lead.businessName}
                        {lead.websiteUrl && (
                          <a href={lead.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{lead.email || "No email provided"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300">{lead.city || "Remote"}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">{lead.niche}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      lead.status === "Won" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      lead.status === "Call Booked" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      lead.status === "Replied" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      "bg-slate-900 text-slate-500 border-slate-800"
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => updateEmailsSent(lead.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-[10px] font-bold border border-indigo-500/20"
                      >
                        <Mail size={14} /> {lead.emailsSent || 0} SENT
                      </button>
                       <button 
                        onClick={() => deleteLead(lead.id)}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
             <div className="p-20 text-center text-slate-500">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>No leads found in this category.</p>
             </div>
          )}
        </div>
      </div>

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-display font-bold text-white mb-6">Add New Prospect</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Business Name</label>
                <input 
                  type="text" 
                  value={newLead.businessName || ""}
                  onChange={(e) => setNewLead({...newLead, businessName: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Company Ltd"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddLead}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Create Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TasksView({ state, setState, showToast, addActivity, user }: any) {
  // Use Pakistani Timezone (UTC+5)
  const today = new Date(new Date().getTime() + 5 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const toggleTask = async (id: string) => {
    const task = state.tasks.find((t: Task) => t.id === id);
    if (!task) return;
    const newDone = !task.done;
    const { error } = await supabase.from('tasks').update({ done: newDone }).eq('id', id);
    if (error) return;

    setState((prev: AppState) => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, done: newDone } : t)
    }));
    if (newDone) {
      showToast(`Completed: ${task.title}`);
      addActivity(`Task completed: ${task.title}`);
    }
  };

  const currentTasks = state.tasks.filter((t: Task) => t.date === today);
  const progress = currentTasks.length ? (currentTasks.filter((t: Task) => t.done).length / currentTasks.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex justify-between items-end">
          <div>
             <h3 className="text-xl font-bold text-white">Daily Progress</h3>
             <p className="text-slate-500 text-sm">{currentTasks.filter((t: Task) => t.done).length} of {currentTasks.length} tasks completed</p>
          </div>
          <span className="text-4xl font-display font-black text-indigo-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      <div className="space-y-4">
        {currentTasks.map((task: Task) => (
          <div 
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`group flex items-center gap-5 p-6 rounded-3xl border transition-all cursor-pointer ${
              task.done 
                ? "bg-slate-900/30 border-slate-800/50 opacity-60" 
                : "bg-[#1e293b]/50 border-slate-800 hover:border-indigo-500/30 hover:bg-slate-800/50"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              task.done ? "bg-emerald-500 text-white" : "bg-slate-800 border border-slate-700 text-slate-500 group-hover:border-indigo-500 group-hover:text-indigo-400"
            }`}>
              {task.done ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-indigo-500" />}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold transition-all ${task.done ? "text-slate-500 line-through" : "text-slate-100"}`}>{task.title}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-slate-900 text-slate-500 border border-slate-800">
                  {task.assignee}
                </span>
                <span className="text-xs text-slate-600 flex items-center gap-1">
                   <Clock size={12} /> Today
                </span>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-white transition-all">
              <MoreVertical size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentView({ state, setState, showToast, addActivity, user }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ContentEntry>>({ status: "Draft", platform: "LinkedIn" });

  const handleAdd = async () => {
    if (!newItem.idea || !newItem.date || !user) return;
    const entry = {
      user_id: user.id,
      date: newItem.date!,
      platform: newItem.platform as Platform,
      idea: newItem.idea!,
      status: newItem.status as any
    };
    const { data, error } = await supabase.from('content').insert([entry]).select().single();
    if (error) return;

    setState((prev: AppState) => ({ ...prev, content: [data, ...prev.content] }));
    addActivity(`Content drafted: ${entry.idea.substring(0, 20)}...`, "create");
    showToast("Content scheduled");
    setIsModalOpen(false);
    setNewItem({ status: "Draft", platform: "LinkedIn" });
  };

  const markPosted = async (id: string) => {
    const { error } = await supabase.from('content').update({ status: "Posted" }).eq('id', id);
    if (error) return;

    setState((prev: AppState) => ({
      ...prev,
      content: prev.content.map(c => c.id === id ? { ...c, status: "Posted" } : c)
    }));
    showToast("Content marked as posted!");
    addActivity("Content marked as posted");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Upcoming Content</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-violet-500/20 transition-all"
        >
          <Plus size={20} /> Plan Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.content.map((item: ContentEntry) => (
          <div key={item.id} className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl hover:border-violet-500/30 transition-all group relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                   item.status === "Posted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                   item.status === "Scheduled" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                   "bg-slate-900 text-slate-500 border-slate-800"
                }`}>
                  {item.status}
                </div>
                <div className="text-slate-500 text-xs font-medium flex items-center gap-1">
                   <Calendar size={12} /> {item.date}
                </div>
             </div>
             <p className="text-lg font-semibold text-slate-200 mb-6 line-clamp-3 leading-relaxed">
               "{item.idea}"
             </p>
             <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400">
                   <Link2 size={16} />
                   <span className="text-xs font-bold">{item.platform}</span>
                </div>
                {item.status !== "Posted" && (
                  <button 
                    onClick={() => markPosted(item.id)}
                    className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Mark Posted
                  </button>
                )}
             </div>
          </div>
        ))}
      </div>

       {/* Simple Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-display font-bold text-white mb-6">Plan New Post</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Date</label>
                <input 
                  type="date" 
                  value={newItem.date || ""}
                  onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Idea</label>
                <textarea 
                  value={newItem.idea || ""}
                  onChange={(e) => setNewItem({...newItem, idea: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl outline-none h-24"
                  placeholder="What's the post about?"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-800 text-slate-400">Cancel</button>
                <button onClick={handleAdd} className="flex-1 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-violet-500/20 transition-all">Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamView({ state, setState, showToast }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {state.team.map((member: TeamMember) => (
        <div key={member.id} className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:w-32 group-hover:h-32" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-display font-black text-2xl mb-6">
            {member.name ? member.name[0] : "T"}
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-6">{member.role}</p>
          <div className="space-y-4">
             <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Daily Focus</p>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">{member.focus}</p>
             </div>
             <button className="w-full py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs hover:border-slate-600 hover:text-slate-200 transition-all">
                VIEW ASSIGNMENTS
             </button>
          </div>
        </div>
      ))}
      <button className="bg-slate-900/30 border-2 border-dashed border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-indigo-500/50 transition-all">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
          <Plus size={24} />
        </div>
        <p className="font-bold text-slate-500 group-hover:text-slate-300">Hire Team Member</p>
      </button>
    </div>
  );
}

function ActivityView({ state }: { state: AppState }) {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
           <h3 className="text-lg font-bold text-white">System Feed</h3>
           <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Updates
           </div>
        </div>
        <div className="divide-y divide-slate-800">
          {state.activity.map((log) => (
            <div key={log.id} className="p-6 flex items-start gap-4 hover:bg-slate-800/20 transition-colors">
              <div className={`mt-1 p-2 rounded-lg ${
                log.type === 'create' ? 'bg-emerald-500/10 text-emerald-400' :
                log.type === 'delete' ? 'bg-rose-500/10 text-rose-400' :
                log.type === 'system' ? 'bg-indigo-500/10 text-indigo-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {log.type === 'create' ? <Plus size={16} /> : 
                 log.type === 'delete' ? <Trash2 size={16} /> : 
                 log.type === 'system' ? <AlertCircle size={16} /> :
                 <Edit2 size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-slate-200 text-sm font-medium leading-relaxed">{log.text}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {state.activity.length === 0 && (
            <div className="p-20 text-center text-slate-500">
               No activity logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
