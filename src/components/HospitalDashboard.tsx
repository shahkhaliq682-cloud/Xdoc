import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CalendarCheck2, 
  Ticket, 
  Wallet, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  MoreVertical,
  Plus,
  Clock,
  CheckCircle2,
  Globe,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface HospitalDashboardProps {
  hospitalData: any;
  onSignOut: () => void;
}

const HospitalDashboard = ({ hospitalData, onSignOut }: HospitalDashboardProps) => {
  const { t, language, setLanguage } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const d = t.dashboard;

  const sampleChartData = [
    { day: 'Mon', patients: 45, revenue: 12000 },
    { day: 'Tue', patients: 52, revenue: 15400 },
    { day: 'Wed', patients: 38, revenue: 9800 },
    { day: 'Thu', patients: 65, revenue: 21000 },
    { day: 'Fri', patients: 48, revenue: 13500 },
    { day: 'Sat', patients: 70, revenue: 24000 },
    { day: 'Sun', patients: 30, revenue: 8500 },
  ];

  const doctors = [
    { name: 'Dr. Sarah Ahmed', spec: 'Cardiologist', status: 'present', patients: 12, avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Dr. Kamran Khan', spec: 'Pediatrician', status: 'absent', patients: 0, avatar: 'https://i.pravatar.cc/150?u=kamran' },
    { name: 'Dr. Zainab Aziz', spec: 'Dermatologist', status: 'present', patients: 8, avatar: 'https://i.pravatar.cc/150?u=zainab' },
    { name: 'Dr. Faisal Malik', spec: 'Neurologist', status: 'leave', patients: 0, avatar: 'https://i.pravatar.cc/150?u=faisal' },
  ];

  const recentTokens = [
    { id: 'T-001', patient: 'Aisha Bibi', doctor: 'Dr. Sarah Ahmed', time: '10:15 AM', status: 'Completed', fee: '1500' },
    { id: 'T-002', patient: 'Muhammad Ali', doctor: 'Dr. Zainab Aziz', time: '10:30 AM', status: 'In Progress', fee: '1200' },
    { id: 'T-003', patient: 'Fatima Zahra', doctor: 'Dr. Sarah Ahmed', time: '10:45 AM', status: 'Waiting', fee: '1500' },
    { id: 'T-004', patient: 'Umar Farooq', doctor: 'Dr. Kamran Khan', time: '11:00 AM', status: 'Cancelled', fee: '0' },
  ];

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: d.nav.dashboard },
    { id: 'doctors', icon: Stethoscope, label: d.nav.doctors },
    { id: 'staff', icon: Users, label: d.nav.staff },
    { id: 'attendance', icon: CalendarCheck2, label: d.nav.attendance },
    { id: 'tokens', icon: Ticket, label: d.nav.tokens },
    { id: 'revenue', icon: Wallet, label: d.nav.revenue },
    { id: 'settings', icon: Settings, label: d.nav.settings },
  ];

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex ${language === 'UR' ? 'flex-row-reverse font-urdu' : 'font-sans'} `} dir={language === 'UR' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 z-50 bg-[#0F2236] text-white transition-all duration-300 transform 
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full'}
          ${language === 'UR' ? (isSidebarOpen ? 'right-0' : '-right-full lg:right-0') : (isSidebarOpen ? 'left-0' : '-left-full lg:left-0')}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">X</span>
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-xl font-bold tracking-tight"
              >
                Xdoc Hospital
              </motion.span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <button
              onClick={() => setLanguage(language === 'UR' ? 'EN' : 'UR')}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <Globe size={22} />
              {isSidebarOpen && <span className="font-medium">{language === 'UR' ? 'English' : 'اردو'}</span>}
            </button>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={22} />
              {isSidebarOpen && <span className="font-medium">{d.nav.signOut}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? (language === 'UR' ? 'mr-64' : 'ml-64') : (language === 'UR' ? 'mr-0 lg:mr-20' : 'ml-0 lg:ml-20')}`}>
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl lg:hidden">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold font-primary text-slate-900">{hospitalData?.hospitalName || 'Xdoc General Hospital'}</h1>
          </div>

          <div className="hidden md:flex flex-col items-center">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{currentTime.toLocaleDateString(language === 'UR' ? 'ur-PK' : 'en-US', { weekday: 'long' })}</span>
            <span className="text-lg font-bold text-primary">{currentTime.toLocaleDateString(language === 'UR' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white overflow-hidden shadow-sm">
              <img src="https://ui-avatars.com/api/?name=Admin&background=0F2236&color=fff" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        <div className="p-8 pb-32">
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-8 rounded-[40px] bg-gradient-to-br from-[#0F2236] to-[#1a3a5a] text-white relative overflow-hidden shadow-2xl"
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{d.setup.welcome}</h2>
                <p className="text-white/60 font-medium max-w-md">Complete your profile to unlock all features and start providing better healthcare services.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2">
                  <Plus size={18} /> {d.setup.addDoctor}
                </button>
                <button className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md transition-all text-sm flex items-center gap-2">
                  <Users size={18} /> {d.setup.addStaff}
                </button>
                <button className="px-6 py-3.5 bg-health-teal text-white font-bold rounded-2xl shadow-lg shadow-health-teal/20 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2">
                  <Ticket size={18} /> {d.setup.setupTokens}
                </button>
              </div>
            </div>
            {/* Abstract Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: d.stats.todayTokens, value: '84', icon: Ticket, color: 'text-[#0B5FFF]', bg: 'bg-[#0B5FFF]/10', sub: '+12% from yesterday' },
              { label: d.stats.patientsWaiting, value: '18', icon: Clock, color: 'text-[#FFB800]', bg: 'bg-[#FFB800]/10', sub: 'Avg wait: 24m' },
              { label: d.stats.completedToday, value: '62', icon: CheckCircle2, color: 'text-[#00C16A]', bg: 'bg-[#00C16A]/10', sub: '92% completion rate' },
              { label: d.stats.todayRevenue, value: 'Rs. 42,500', icon: Wallet, color: 'text-[#00C9B1]', bg: 'bg-[#00C9B1]/10', sub: 'Target: Rs. 50k' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <stat.icon size={28} />
                  </div>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <TrendingUp size={12} className="text-green-500" />
                  <span>{stat.sub}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Live Queue */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-health-teal rounded-full"></div>
                    <h3 className="text-xl font-bold text-slate-900">{d.liveQueue.title}</h3>
                  </div>
                  <button className="text-primary text-sm font-bold hover:underline">View All</button>
                </div>
                
                <div className="p-8 flex flex-col md:flex-row gap-8">
                  {/* Serving Card */}
                  <div className="flex-1 p-8 rounded-[32px] bg-primary text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-4 py-1.5 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-md uppercase tracking-wider">{d.liveQueue.serving}</span>
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md text-white animate-pulse">
                          <Plus size={20} />
                        </div>
                      </div>
                      <div className="mb-8">
                        <h4 className="text-6xl font-black mb-2 font-mono tracking-tighter transition-transform group-hover:scale-105 duration-500">T-001</h4>
                        <div className="flex flex-col">
                          <span className="text-xl font-bold">Muhammad Hussain</span>
                          <span className="text-white/60 text-sm font-medium">Dr. Sarah Ahmed (Cardiology)</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="flex-1 py-4 bg-health-teal text-white font-bold rounded-2xl shadow-lg shadow-health-teal/20 transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2">
                          {d.liveQueue.callNext} <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    {/* Background Graphic */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                  </div>

                  {/* Next List */}
                  <div className="flex-1 space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 mb-4">{d.liveQueue.nextTokens}</h4>
                    {['Muhammad Ali', 'Fatima Zahra', 'Zeeshan Ahmed'].map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white text-slate-900 rounded-xl flex items-center justify-center font-bold font-mono shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                            T-00{i+2}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{name}</span>
                            <span className="text-xs text-slate-400 font-medium">Waiting: {15 + i*8}m</span>
                          </div>
                        </div>
                        <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    ))}
                    <button className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                      <Plus size={20} /> {d.liveQueue.issueNew}
                    </button>
                  </div>
                </div>
              </div>

              {/* Weekly Chart */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-xl font-bold text-slate-900">Hospital Performance</h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg shadow-lg shadow-primary/20 transition-all uppercase tracking-widest">Patients</button>
                    <button className="px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest hover:bg-slate-100">Revenue</button>
                  </div>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sampleChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} 
                      />
                      <Tooltip 
                        cursor={{ fill: '#F1F5F9' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                      <Bar dataKey="patients" fill="#0B5FFF" radius={[10, 10, 0, 0]} barSize={24}>
                        {sampleChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 5 ? '#0B5FFF' : '#E2E8F0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Doctors List */}
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#FFB800] rounded-full"></div>
                    <h3 className="text-xl font-bold text-slate-900">{d.doctors.title}</h3>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="p-4 flex-1">
                  <div className="space-y-2">
                    {doctors.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={doc.avatar} alt={doc.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" />
                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${
                              doc.status === 'present' ? 'bg-green-500' : doc.status === 'absent' ? 'bg-red-500' : 'bg-orange-500'
                            }`}></span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{doc.name}</span>
                            <span className="text-xs text-slate-400 font-medium">{doc.spec}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                          doc.status === 'present' ? 'bg-green-100 text-green-600' : doc.status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {doc.patients} Patients
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-8 bg-slate-50 rounded-b-[40px]">
                  <button className="w-full py-4 text-primary font-bold text-sm bg-white border border-slate-200 rounded-2xl hover:border-primary transition-all shadow-sm">
                    View Doctor Records
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                 <button className="p-6 bg-[#00C9B1] text-white rounded-[32px] flex flex-col items-center justify-center gap-3 shadow-lg shadow-[#00C9B1]/20 hover:scale-105 transition-all">
                    <Users size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">Add Patient</span>
                 </button>
                 <button className="p-6 bg-[#FF5C00] text-white rounded-[32px] flex flex-col items-center justify-center gap-3 shadow-lg shadow-[#FF5C00]/20 hover:scale-105 transition-all">
                    <UserSquare2 size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">Medical Staff</span>
                 </button>
                 <button className="p-6 bg-primary text-white rounded-[32px] flex flex-col items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    <Bell size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">Announce</span>
                 </button>
                 <button className="p-6 bg-[#0F2236] text-white rounded-[32px] flex flex-col items-center justify-center gap-3 shadow-lg shadow-slate-900/20 hover:scale-105 transition-all">
                    <Settings size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">Configure</span>
                 </button>
              </div>
            </div>
          </div>

          {/* Recent Tokens Table */}
          <div className="mt-10 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900">{d.recentTokens.title}</h3>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search token or patient..." 
                  className="pl-12 pr-6 py-2.5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm font-medium w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{d.recentTokens.tokenNum}</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{d.recentTokens.patient}</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{d.recentTokens.doctor}</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{d.recentTokens.time}</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{d.recentTokens.status}</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{d.recentTokens.fee}</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTokens.map((token, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="font-mono font-bold text-slate-900">{token.id}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-bold text-slate-900">{token.patient}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-medium text-slate-600">{token.doctor}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-slate-400">{token.time}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          token.status === 'Completed' ? 'bg-green-100 text-green-600' :
                          token.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                          token.status === 'Waiting' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {token.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-bold text-slate-900">Rs. {token.fee}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                            <MoreVertical size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalDashboard;
