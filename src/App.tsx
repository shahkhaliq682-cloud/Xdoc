import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Map as MapIcon, 
  Home, 
  Calendar, 
  User, 
  ChevronDown, 
  Star, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  Clock, 
  Check, 
  Share2, 
  Heart, 
  ArrowRight,
  Plus,
  Bell,
  Activity,
  History,
  SkipForward,
  AlertTriangle,
  Volume2,
  Stethoscope,
  LayoutDashboard,
  ShieldAlert,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { hospitals, doctors, staffMembers, queueTokens } from './mockData';
import { Hospital, Doctor, Staff, Token } from './types';

// --- Shared Components ---

const Header = ({ darkMode = false, hospitalName = "Xdoc" }: { darkMode?: boolean, hospitalName?: string }) => (
  <header className={`flex justify-between items-center w-full px-6 py-3 sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
    darkMode 
      ? 'bg-bg-dark/80 border-white/10 text-white' 
      : 'bg-white/80 border-slate-100 text-primary'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
        darkMode ? 'bg-primary' : 'medical-cross-gradient'
      }`}>
        <Activity size={20} />
      </div>
      <h1 className="text-xl font-bold font-display tracking-tight whitespace-nowrap">{hospitalName}</h1>
    </div>
    
    <div className="flex items-center gap-4">
      {darkMode && (
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
          <Bell size={20} className="text-slate-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emergency-red rounded-full breathing-dot" />
        </button>
      )}
      {!darkMode && (
        <button className="p-2 rounded-full hover:bg-slate-50 transition-colors">
          <Search size={20} className="text-slate-600" />
        </button>
      )}
      <div className={`w-10 h-10 rounded-full border-2 overflow-hidden ${
        darkMode ? 'border-primary/30' : 'border-primary'
      }`}>
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpUnpAxGFzED-XqrffslwfCw5jBKG1pFUEUgx65FbxMzeTGuZpxmXDzaV26wzVB5Osqe-VNoOIg5MaN-ve-z70OYcfnJA1ExYkJBE0uRnidwfXBMeiEQiUdePkM68GNdfNWDf2r2S_Vu3lV55z248d10KypNv-1_GUWSxn7rU56qie2AXVb9Ej6kTvj90dlAB6gwNc2OQt1fqRCbTZ93xZdCZ3q4h1vCPBSE6_xz06Imvmtqd8ogpaLwc0cubpjrLpRngauOqsqV8" 
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </header>
);

const Navbar = ({ activeTab, setActiveTab, darkMode = false }: { activeTab: string, setActiveTab: (t: any) => void, darkMode?: boolean }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'hospitals', icon: Activity, label: 'Hospitals' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const adminTabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tokens', icon: History, label: 'Tokens' },
    { id: 'staff', icon: ShieldCheck, label: 'Staff' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const displayTabs = darkMode ? adminTabs : tabs;

  return (
    <nav className={`fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe border-t backdrop-blur-lg shadow-sm transition-colors duration-300 ${
      darkMode 
        ? 'bg-bg-dark/80 border-white/10' 
        : 'bg-white/90 border-slate-100'
    }`}>
      {displayTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center transition-all duration-300 ${
            activeTab === tab.id 
              ? (darkMode ? 'text-blue-400 scale-110 font-bold' : 'text-primary scale-110 font-bold')
              : 'text-slate-400 font-medium'
          }`}
        >
          <tab.icon size={22} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
          <span className="text-[10px] mt-1 uppercase tracking-tighter">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

// --- Pages ---

const LandingPage = ({ onStartBooking }: { onStartBooking: () => void }) => {
  const categories = [
    { icon: Heart, label: 'Cardiology' },
    { icon: Stethoscope, label: 'Dental' },
    { icon: Activity, label: 'Neurology' },
    { icon: User, label: 'Pediatrics' },
    { icon: Search, label: 'Eye' },
    { icon: ShieldAlert, label: 'Ortho' },
    { icon: Activity, label: 'Emergency', isEmergency: true }
  ];

  return (
    <div className="flex flex-col items-center">
      <section className="relative w-full pt-16 px-6 overflow-hidden bg-gradient-to-b from-blue-50/50 to-transparent pb-16">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#0b5fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="z-10 mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-blue-100">
            <span className="flex h-3 w-3 relative">
              <span className="breathing-dot absolute inline-flex h-full w-full rounded-full bg-health-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-health-teal"></span>
            </span>
            <span className="font-mono text-sm text-slate-600">
              <span className="font-bold text-health-teal">142</span> Hospitals Active Now
            </span>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="font-syne text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tighter">
            Apna Doctor Dhundein — <br/>
            <span className="bg-clip-text text-transparent cta-gradient">Ghar Baithe</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Seamlessly book tokens, find specialized consultants, and skip the waiting room at Pakistan's top-rated medical facilities.
          </p>
        </div>

        <div className="w-full max-w-5xl mx-auto bg-white p-2 rounded-[32px] shadow-xl border border-white flex flex-col md:flex-row items-stretch gap-2 mb-12">
          <div className="flex-1 flex items-center px-4 gap-3 md:border-r border-slate-100">
            <Search className="text-primary shrink-0" />
            <input 
              type="text" 
              placeholder="Search by doctor, illness, or hospital..." 
              className="w-full h-14 border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 bg-transparent"
            />
          </div>
          <div className="md:w-64 flex items-center px-4 gap-3">
            <MapPin className="text-slate-400 shrink-0" />
            <select className="w-full h-14 border-none focus:ring-0 text-slate-700 bg-transparent cursor-pointer">
              <option>Select City</option>
              <option>Karachi</option>
              <option>Lahore</option>
              <option>Islamabad</option>
            </select>
          </div>
          <button onClick={onStartBooking} className="cta-gradient hover:opacity-90 text-white font-bold px-10 py-4 rounded-[24px] transition-all active:scale-95">
            Search
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
          {categories.map((cat, i) => (
            <div key={i} className={`bg-white border border-slate-100 px-5 py-3 rounded-full flex items-center gap-2 hover:border-primary transition-colors cursor-pointer shadow-sm group ${cat.isEmergency ? 'bg-red-50 border-red-100' : ''}`}>
              <cat.icon size={18} className={`${cat.isEmergency ? 'text-emergency-red' : 'text-primary'} group-hover:scale-110 transition-transform`} />
              <span className={`text-sm font-bold ${cat.isEmergency ? 'text-emergency-red' : 'text-slate-700'}`}>{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl px-6 mb-16">
        <div className="group relative overflow-hidden bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="text-health-teal" />
            </div>
            <h3 className="text-2xl font-display font-bold">Government Hospitals</h3>
          </div>
          <p className="text-slate-500 mb-6">Access subsidized healthcare services across the national network of public facilities.</p>
          <button onClick={onStartBooking} className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
            Explore Facilities <ArrowRight size={18} />
          </button>
        </div>
        <div className="group relative overflow-hidden bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Star className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-display font-bold">Private Clinics</h3>
          </div>
          <p className="text-slate-500 mb-6">Book premium appointments with specialists and private healthcare providers near you.</p>
          <button onClick={onStartBooking} className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
            View Specialists <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const HospitalListPage = ({ onHospitalClick }: { onHospitalClick: (h: Hospital) => void }) => {
  return (
    <div className="px-6 py-8 pb-32 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold">Available Hospitals</h2>
          <p className="text-slate-500 mt-1">Showing {hospitals.length} results in San Francisco</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
            <Plus size={16} /> Sort: Recommended
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-colors">
            <MapIcon size={16} /> Map View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {hospitals.map(h => (
          <div 
            key={h.id} 
            onClick={() => onHospitalClick(h)}
            className="group bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer flex flex-col md:flex-row"
          >
            <div className="md:w-1/3 h-64 md:h-auto relative overflow-hidden">
              <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 bg-health-teal rounded-full breathing-dot" />
                <span className="font-mono text-[12px] font-bold">Open Now</span>
              </div>
            </div>
            <div className="p-8 md:w-2/3 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-display font-bold leading-tight">{h.name}</h3>
                    {h.verified && <CheckCircle2 size={20} className="text-primary" fill="currentColor" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={14} />
                    <span className="text-sm font-medium">{h.area}, {h.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl border border-amber-100">
                  <Star size={16} fill="currentColor" />
                  <span className="font-mono text-sm font-bold">{h.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 mb-6">
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-primary/20">
                  <ShieldCheck size={14} />
                  <span className="font-mono text-[10px] font-bold uppercase">{h.type} Facility</span>
                </div>
                {h.facilities.map((f, i) => (
                  <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase">{f}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {h.specializations.map((spec, i) => (
                  <span key={i} className="bg-blue-50 text-primary px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold border border-blue-100/50">{spec}</span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Consultation starts from</p>
                  <p className="text-2xl font-display font-bold text-slate-900">${h.startingFee.toFixed(2)} <span className="text-sm font-normal text-slate-400">/visit</span></p>
                </div>
                <button className="bg-[#5ffae0] text-[#005046] font-display font-bold px-8 py-3.5 rounded-2xl hover:shadow-[0_8px_30px_rgba(95,250,224,0.4)] transition-all active:scale-95">
                  Book Token
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HospitalDetailsPage = ({ hospital, onBook }: { hospital: Hospital, onBook: (d: Doctor) => void }) => {
  return (
    <div className="pb-32">
      <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <img className="w-full h-full object-cover" src={hospital.imageUrl} alt={hospital.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border border-white/20">
                <CheckCircle2 size={14} fill="currentColor" /> VERIFIED FACILITY
              </span>
            </div>
            <h1 className="font-display text-white text-4xl md:text-6xl font-bold flex items-center gap-4">
              {hospital.name}
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={24} fill="currentColor" />
              </div>
            </h1>
            <div className="flex items-center gap-6 mt-6 text-white/90">
              <div className="flex items-center gap-2 font-mono text-sm font-bold">
                <Star size={18} className="text-yellow-400" fill="currentColor" />
                {hospital.rating} <span className="font-normal opacity-70">({hospital.reviewsCount}+ reviews)</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm font-bold">
                <MapPin size={18} />
                {hospital.area}, {hospital.city}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all">
              <Share2 size={20} /> Share
            </button>
            <button className="bg-white text-primary px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-xl">
              <Heart size={20} fill="currentColor" /> Save
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-display font-bold mb-6">About the Hospital</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {hospital.about}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {['Emergency', 'ICU', 'Modern Lab', 'Pharmacy'].map((item, i) => (
                <div key={i} className="bg-blue-50/50 p-6 rounded-3xl flex flex-col items-center gap-4 border border-blue-100/50 group hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {i === 0 && <AlertTriangle />}
                    {i === 1 && <Activity />}
                    {i === 2 && <Volume2 />}
                    {i === 3 && <Clock />}
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-700 tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex border-b border-slate-200 mb-10 overflow-x-auto no-scrollbar">
              <button className="px-8 py-5 font-display text-lg font-bold text-primary border-b-4 border-primary whitespace-nowrap">Doctors</button>
              <button className="px-8 py-5 font-display text-lg font-bold text-slate-400 hover:text-slate-600 whitespace-nowrap">Reviews</button>
              <button className="px-8 py-5 font-display text-lg font-bold text-slate-400 hover:text-slate-600 whitespace-nowrap">Location</button>
            </div>

            <div className="space-y-6">
              {doctors.map(doc => (
                <div key={doc.id} className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all group overflow-hidden relative">
                  <div className="relative shrink-0">
                    <div className="w-40 h-40 rounded-3xl overflow-hidden bg-slate-100">
                      <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary border-4 border-white rounded-full flex items-center justify-center text-white shadow-xl">
                      <CheckCircle2 size={20} fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-display font-bold text-slate-900 leading-tight">{doc.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider">{doc.title}</span>
                          <div className="flex gap-1">
                            {doc.qualifications.map((q, i) => (
                              <span key={i} className="bg-emerald-50 text-health-teal px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">{q}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-display font-bold text-primary tracking-tight">${doc.fee.toFixed(2)}</div>
                        <div className="text-slate-400 font-mono text-[10px] font-bold uppercase">Consultation Fee</div>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-health-teal rounded-full breathing-dot" />
                        <span className="text-health-teal font-extrabold text-sm uppercase tracking-wide">Available Today</span>
                        <span className="text-slate-400 font-mono text-sm">Next slot: {doc.nextSlot}</span>
                      </div>
                      <button 
                        onClick={() => onBook(doc)}
                        className="bg-primary hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-display font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
            <h4 className="text-xl font-display font-bold mb-6">Facility Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-health-teal rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 leading-tight">Govt. Certified</div>
                    <div className="text-[10px] uppercase text-emerald-800/70 font-mono font-bold tracking-widest mt-1">N.H. Board</div>
                  </div>
                </div>
                <CheckCircle2 size={24} className="text-health-teal" />
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-3xl border border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 leading-tight">Private Facility</div>
                    <div className="text-[10px] uppercase text-amber-800/70 font-mono font-bold tracking-widest mt-1">Premier Status</div>
                  </div>
                </div>
                <CheckCircle2 size={24} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
            <h4 className="text-xl font-display font-bold mb-6">Location & Contact</h4>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <MapPin size={20} />
                </div>
                <span className="text-slate-600 font-medium leading-relaxed">{hospital.address}</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Phone size={20} />
                </div>
                <span className="text-slate-600 font-bold">{hospital.phone}</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="font-bold text-health-teal text-lg">Open 24/7</span>
                  <p className="text-slate-500 text-sm mt-1">Emergency Unit always active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationPage = ({ doctor }: { doctor: Doctor }) => (
  <div className="max-w-lg mx-auto px-6 py-12 pb-32">
    <div className="flex justify-between items-center mb-12 relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
      <div className="absolute top-1/2 left-0 w-full h-1 bg-health-teal/30 -translate-y-1/2 z-0" />
      {[1, 2, 3, 4].map(s => (
        <div key={s} className="relative z-10 w-10 h-10 rounded-full bg-emerald-100 text-health-teal flex items-center justify-center border-2 border-health-teal">
          <Check size={20} strokeWidth={3} />
        </div>
      ))}
      <div className="relative z-10 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 ring-4 ring-primary/20">
        <span className="font-mono font-bold text-lg">5</span>
      </div>
    </div>

    <div className="text-center mb-10">
      <h2 className="text-4xl font-display font-extrabold text-slate-900 mb-3 underline decoration-primary/20 decoration-8 underline-offset-8">Booking Confirmed!</h2>
      <p className="text-slate-500 text-lg">Your digital token has been generated.</p>
    </div>

    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden mb-10">
      <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12">
        <Activity size={300} strokeWidth={1} />
      </div>

      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-emerald-50 text-health-teal border border-emerald-100/50">
          <div className="w-2.5 h-2.5 rounded-full bg-health-teal breathing-dot" />
          <span className="font-mono text-xs font-bold tracking-widest uppercase">Live Token</span>
        </div>

        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-health-teal/10 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-white border-[6px] border-emerald-100 rounded-[32px] p-10 shadow-xl">
            <div className="font-syne text-7xl font-extrabold tracking-tighter text-slate-900 flex items-center justify-center gap-1">
              <span className="text-primary/10">T-</span>
              <span className="font-mono">0047</span>
            </div>
            <p className="mt-4 font-mono text-slate-400 uppercase tracking-[0.2em] text-[10px] font-bold text-center">Your Queue Position</p>
          </div>
        </div>

        <div className="w-full space-y-6 pt-8 border-t border-slate-50">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Doctor</p>
              <p className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                {doctor.name}
                <CheckCircle2 size={18} className="text-primary" fill="currentColor" />
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Date</p>
              <p className="font-mono font-bold text-slate-900">Oct 24, 2023</p>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Appointment</p>
              <p className="font-mono font-bold text-slate-900">10:30 AM — 11:00 AM</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Type</p>
              <p className="font-mono font-extrabold text-health-teal uppercase tracking-wider">In-Person</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 mb-10 flex gap-5">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
        <Share2 className="text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">WhatsApp Confirmation Sent</p>
        <p className="text-emerald-900/70 font-medium italic leading-snug">
          "Hello Ahmed! Your token T-0047 for St. Mary's General is confirmed for today at 10:30 AM. Track your position live here: m-connect.pk/t47"
        </p>
      </div>
    </div>

    <div className="space-y-4">
      <button className="w-full py-5 rounded-2xl cta-gradient text-white font-display font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all">
        <Calendar size={22} /> Add to Calendar
      </button>
      <button className="w-full py-5 rounded-2xl border-2 border-primary text-primary font-display font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary/5 transition-colors">
        <Share2 size={22} /> Share Token
      </button>
    </div>
  </div>
);

// --- Admin Section (Dark Mode) ---

const AdminDashboard = () => {
  const stats = [
    { label: "Today's Tokens", val: 124, diff: "+12%", icon: History, color: 'text-health-teal' },
    { label: "Waiting Now", val: 18, diff: "High", icon: Clock, color: 'text-amber-400' },
    { label: "Completed", val: 96, diff: "88%", icon: CheckCircle2, color: 'text-emerald-400' },
    { label: "Revenue", val: "k$4.2", diff: "Target", icon: Volume2, color: 'text-primary' }
  ];

  return (
    <div className="p-6 pb-32 space-y-8 max-w-lg mx-auto">
      <section>
        <p className="font-mono text-xs text-blue-400 uppercase tracking-[0.3em] font-bold mb-2">DASHBOARD OVERVIEW</p>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Live Activity</h1>
      </section>

      <section className="grid grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex justify-between items-start">
              <div className={`${s.color} opacity-80`}><s.icon size={24} /></div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">{s.diff}</span>
            </div>
            <div>
              <p className="text-4xl font-display font-black text-white leading-tight">{s.val}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-3xl opacity-20 ${s.color.replace('text', 'bg')}`} />
          </div>
        ))}
      </section>

      <section className="glass-card rounded-[40px] p-8 border-l-[8px] border-health-teal/50 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5">
           <Activity size={200} strokeWidth={1} />
        </div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-display font-bold text-white">Current Token</h3>
            <p className="text-slate-400 font-medium text-sm mt-1">Cardiology Dept - Room 4</p>
          </div>
          <div className="bg-health-teal/20 p-6 rounded-[24px] flex items-center justify-center border border-health-teal/30">
            <span className="text-5xl font-mono font-black text-white tracking-tighter">A-42</span>
          </div>
        </div>

        <div className="space-y-6 mb-10 relative z-10">
          {[
            { id: 'A-43', name: 'David Henderson', time: 'Next' },
            { id: 'A-44', name: 'Sarah Jenkins', time: '04m' },
            { id: 'A-45', name: 'Michael Chen', time: '09m' }
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-6 text-slate-400 border-b border-white/5 pb-4 last:border-0 hover:text-white transition-colors">
              <span className="font-mono text-xs font-bold w-12">{row.id}</span>
              <span className="flex-grow font-bold">{row.name}</span>
              <span className="text-xs font-mono uppercase tracking-widest opacity-60">{row.time}</span>
            </div>
          ))}
        </div>

        <button className="w-full py-6 rounded-[24px] bg-gradient-to-r from-health-teal to-primary text-white font-display font-bold text-xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-primary/20">
          <Volume2 size={24} /> Call Next Patient
        </button>
      </section>

      <section className="glass-card rounded-3xl p-6 group hover:bg-white/10 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-widest opacity-80">Staff Status</span>
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] cursor-pointer hover:underline">VIEW ALL</span>
        </div>
        <div className="flex -space-x-3 items-center">
          {['DR', 'MS', 'AK'].map((initials, i) => (
            <div key={i} className={`w-12 h-12 rounded-full border-2 border-bg-dark flex items-center justify-center text-xs text-white font-black shadow-lg ${
              i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-rose-600' : 'bg-amber-600'
            }`}>
              {initials}
            </div>
          ))}
          <div className="w-12 h-12 rounded-full border-2 border-bg-dark bg-slate-800 border-dashed border-white/30 flex items-center justify-center group-hover:border-primary transition-colors">
            <Plus size={20} className="text-white" />
          </div>
          <div className="pl-8 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-health-teal breathing-dot" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">12 Staff Online</span>
          </div>
        </div>
      </section>
    </div>
  );
};

const StaffScreen = () => {
  return (
    <div className="p-6 pb-32 space-y-8 max-w-lg mx-auto">
      <div className="flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-4xl font-display font-bold text-white tracking-tight">Staff Management</h2>
          <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">Monday, Oct 24</p>
        </div>
        <button className="cta-gradient p-4 rounded-2xl text-white shadow-xl active:scale-90 transition-all flex items-center gap-2">
          <ShieldCheck size={20} />
          <span className="font-mono font-bold text-xs uppercase tracking-wider">Mark Attendance</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Present', val: 142, color: 'text-emerald-400', active: true },
          { label: 'Absent', val: 12, color: 'text-emergency-red' },
          { label: 'Late', val: 8, color: 'text-amber-400' },
          { label: 'On Leave', val: 5, color: 'text-blue-400' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</span>
              {stat.active && <div className="w-2 h-2 rounded-full bg-emerald-400 breathing-dot" />}
            </div>
            <p className={`text-4xl font-display font-black ${stat.color}`}>{stat.val < 10 ? `0${stat.val}` : stat.val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {['All Staff', 'Medical', 'Admin', 'Nursing'].map((tab, i) => (
            <button key={i} className={`flex-shrink-0 px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-[0.1em] transition-all ${
              i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {staffMembers.map(s => (
            <div key={s.id} className="glass-card p-5 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800">
                    <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  {s.status === 'PRESENT' && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-bg-dark">
                      <Check size={12} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-white leading-tight">{s.name}</h4>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{s.role}</p>
                </div>
              </div>
              <div className={`flex items-center border rounded-full px-4 py-1.5 gap-2 ${
                s.status === 'PRESENT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                s.status === 'ABSENT' ? 'bg-emergency-red/10 border-emergency-red/20 text-emergency-red' :
                s.status === 'ON LEAVE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                'bg-amber-500/10 border-amber-500/20 text-amber-500'
              }`}>
                {(s.status === 'PRESENT' || s.status === 'LATE') && <div className="w-1.5 h-1.5 rounded-full bg-current breathing-dot" />}
                <span className="font-mono text-[9px] font-black uppercase tracking-widest">
                  {s.status}{s.lateMinutes ? ` (${s.lateMinutes}m)` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GlobalStatsScreen = () => {
  return (
    <div className="p-6 pb-32 space-y-8 max-w-lg mx-auto">
      <section className="glass-card p-8 rounded-[40px] relative overflow-hidden bg-gradient-to-br from-bg-dark to-slate-900 border-none shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
        <div className="absolute -right-8 -top-8 opacity-10">
          <Activity size={200} strokeWidth={1} className="text-blue-400" />
        </div>
        <div className="space-y-2 relative z-10">
          <p className="font-mono text-xs text-slate-400 uppercase tracking-widest font-bold">PLATFORM REVENUE</p>
          <h2 className="text-4xl font-display font-black text-white tracking-tighter leading-none">$128,450.00</h2>
          <div className="flex items-center gap-2 text-health-teal text-sm font-black mt-4">
            <ArrowRight size={16} className="-rotate-45" />
            <span className="uppercase tracking-widest">+14.2% from last month</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Hospitals', val: 482, icon: Activity, bg: 'medical-cross-gradient' },
          { label: 'Active Today', val: 315, icon: Clock, bg: 'bg-white/5' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl flex flex-col justify-between aspect-square">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${stat.bg}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <h3 className="text-3xl font-display font-black text-white tracking-tight">{stat.val}</h3>
              <p className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-2xl font-display font-bold text-white">Live Monitor</h3>
          <span className="text-blue-400 font-mono text-[9px] uppercase tracking-[0.3em] font-black">Real-time sync</span>
        </div>
        
        <div className="space-y-4">
          {hospitals.map((h) => (
            <div key={h.id} className="glass-card p-6 rounded-3xl space-y-6 group hover:bg-white/5 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-primary transition-all duration-500">
                    <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-lg tracking-tight">{h.name}</h4>
                      {h.verified && <CheckCircle2 size={16} className="text-blue-400" fill="currentColor" />}
                    </div>
                    <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mt-1">
                      <MapPin size={12} /> {h.city}, CA
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 breathing-dot" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-y border-white/5">
                <div className="text-center flex-1 border-r border-white/5">
                  <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.2em] mb-1">Tokens Today</p>
                  <p className="text-xl font-mono font-extrabold text-white">1,240</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.2em] mb-1">Uptime</p>
                  <p className="text-xl font-mono font-extrabold text-white">99.9%</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all">View</button>
                <button className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all">Approve</button>
                <button className="flex-1 py-3 rounded-xl bg-emergency-red/10 text-emergency-red font-mono text-[10px] font-bold uppercase tracking-widest border border-emergency-red/20 hover:bg-emergency-red/20 transition-all">Suspend</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-[32px] p-6 border-none">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 opacity-70">Platform Logs</h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
              <div className="w-[2px] h-full bg-white/5 mt-2 rounded-full" />
            </div>
            <div>
              <p className="text-xs text-white leading-relaxed font-medium">System: Global Token limit reached for "Downtown Clinic"</p>
              <p className="text-[10px] text-slate-500 font-mono font-bold mt-2 uppercase tracking-widest">2 mins ago</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-health-teal shadow-lg shadow-health-teal/50" />
              <div className="w-[2px] h-0 bg-white/5 mt-2 rounded-full" />
            </div>
            <div>
              <p className="text-xs text-white leading-relaxed font-medium">Revenue: Payout of $12,400 initiated for 14 facilities</p>
              <p className="text-[10px] text-slate-500 font-mono font-bold mt-2 uppercase tracking-widest">15 mins ago</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'hospitals' | 'bookings' | 'profile' | 'dashboard' | 'tokens' | 'staff' | 'settings' | 'global-stats'>('home');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingStep, setIsBookingStep] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode based on tab
  useEffect(() => {
    const adminTabs = ['dashboard', 'tokens', 'staff', 'settings', 'global-stats'];
    setIsDarkMode(adminTabs.includes(activeTab));
  }, [activeTab]);

  const renderContent = () => {
    if (activeTab === 'dashboard') return <AdminDashboard />;
    if (activeTab === 'staff') return <StaffScreen />;
    if (activeTab === 'global-stats') return <GlobalStatsScreen />;
    
    if (isBookingStep && selectedDoctor) {
      return <ConfirmationPage doctor={selectedDoctor} />;
    }

    if (selectedHospital) {
      return (
        <HospitalDetailsPage 
          hospital={selectedHospital} 
          onBook={(doc) => {
            setSelectedDoctor(doc);
            setIsBookingStep(true);
          }} 
        />
      );
    }

    if (activeTab === 'hospitals') {
      return <HospitalListPage onHospitalClick={(h) => setSelectedHospital(h)} />;
    }

    return <LandingPage onStartBooking={() => setActiveTab('hospitals')} />;
  };

  const handleBackToHome = () => {
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setIsBookingStep(false);
    setActiveTab('home');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-bg-dark' : 'bg-[#faf8ff]'}`}>
      <Header 
        darkMode={isDarkMode} 
        hospitalName={isDarkMode ? "St. Mary's General" : "Xdoc"} 
      />
      
      <main className="transition-opacity duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedHospital?.id || '') + (isBookingStep ? 'booking' : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FAB for the Demo - Toggle Dark/Admin Mode */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-4">
        {(selectedHospital || isBookingStep) && (
          <motion.button 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            onClick={handleBackToHome}
            className="w-14 h-14 rounded-full bg-white text-primary shadow-2xl flex items-center justify-center border border-slate-100"
          >
            <Home size={24} />
          </motion.button>
        )}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab(isDarkMode ? 'home' : 'dashboard')}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all ${
            isDarkMode ? 'bg-primary' : 'bg-bg-dark shadow-primary/40'
          }`}
        >
          {isDarkMode ? <LayoutDashboard size={24} /> : <ShieldAlert size={24} />}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('global-stats')}
          className="w-14 h-14 rounded-full bg-slate-900 border border-white/10 text-blue-400 shadow-2xl flex items-center justify-center"
        >
          <Activity size={24} />
        </motion.button>
      </div>

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={isDarkMode} 
      />
    </div>
  );
}
