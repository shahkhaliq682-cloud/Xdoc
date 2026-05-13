import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, Phone, Clock, Calendar, 
  Star, Share2, Heart, ShieldCheck, CheckCircle2,
  Stethoscope, Activity, Layers, Bell, User,
  Thermometer, FlaskConical, Ambulance, Utensils,
  ParkingCircle, DoorOpen, Accessibility, PhoneCall
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { SmartImage } from './ui/SmartImage';
import { HospitalDetailSkeleton } from './ui/Skeleton';

interface HospitalDetailPageProps {
  hospital: any;
  onBack: () => void;
  onBook: (doctor: any) => void;
}

const HospitalDetailPage: React.FC<HospitalDetailPageProps> = ({ hospital, onBack, onBook }) => {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const docsRef = collection(db, `hospitals/${hospital.id}/doctors`);
        const snapshot = await getDocs(docsRef);
        setDoctors(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [hospital.id]);

  const facilityIcons: Record<string, any> = {
    'Emergency Ward': Thermometer,
    'ICU': Activity,
    'CCU': Heart,
    'Operation Theater': Layers,
    'Labour Room': DoorOpen,
    'NICU': ShieldCheck,
    'Pathology Lab': FlaskConical,
    'X-Ray': FlaskConical,
    'Ultrasound': FlaskConical,
    'MRI': FlaskConical,
    'CT Scan': FlaskConical,
    'Blood Bank': FlaskConical,
    'Pharmacy': Stethoscope,
    'Ambulance': Ambulance,
    'Cafeteria': Utensils,
    'Parking': ParkingCircle,
    'Wheelchair': Accessibility,
    'Elevator': Layers,
    'Telemedicine': PhoneCall
  };

  const isGovt = hospital.type?.toLowerCase().includes('government');
  
  if (loading) {
    return <HospitalDetailSkeleton />;
  }
  
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const [openHour, openMin] = (hospital.openingTime || "09:00").split(':').map(Number);
  const [closeHour, closeMin] = (hospital.closingTime || "21:00").split(':').map(Number);
  
  const isOpen = (currentHour > openHour || (currentHour === openHour && currentMinute >= openMin)) &&
                 (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMin));

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Image */}
      <div className="h-72 md:h-[450px] relative">
        <SmartImage 
          src={hospital.imageUrl || hospital.photo || `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200&h=600&sig=${hospital.id}`} 
          className="w-full h-full"
          alt={hospital.hospitalName}
          fallbackInitials={hospital.hospitalName?.[0]}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-white/40 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20">
              <Share2 size={20} />
            </button>
            <button className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20">
              <Heart size={20} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-8 right-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${isGovt ? 'bg-success-green text-white' : 'bg-primary text-white'}`}>
              {isGovt ? t.patient.categories.govt : t.patient.categories.private}
            </span>
            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
              {isOpen ? 'Open Now' : 'Closed'}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{hospital.hospitalName}</h1>
          <div className="flex flex-wrap items-center gap-6 opacity-80">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <span className="font-bold">{hospital.area}, {hospital.city}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <Star size={18} fill="currentColor" />
              <span className="font-bold">{hospital.rating || '4.8'} (2.4k Reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <a href={`tel:${hospital.phone}`} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:scale-105 transition-all text-center group">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all">
              <Phone size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.signup.labels.phone}</p>
            <p className="text-sm font-bold text-slate-800">{hospital.phone}</p>
          </a>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-center">
            <div className="w-12 h-12 bg-health-teal/10 rounded-2xl flex items-center justify-center text-health-teal mx-auto mb-3">
              <Clock size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TIMINGS</p>
            <p className="text-sm font-bold text-slate-800">
              {hospital.openingTime && hospital.closingTime 
                ? `${hospital.openingTime} - ${hospital.closingTime}` 
                : 'Contact hospital'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-center">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-3">
              <Calendar size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">OPEN DAYS</p>
            <p className="text-sm font-bold text-slate-800">{(hospital.openDays || []).join(', ')}</p>
          </div>
          <div className={`p-6 rounded-[32px] shadow-sm border text-center ${hospital.emergency === 'Yes' ? 'bg-emergency-red/5 border-emergency-red/20' : 'bg-white border-slate-100'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${hospital.emergency === 'Yes' ? 'bg-emergency-red text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
              <ShieldCheck size={24} />
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${hospital.emergency === 'Yes' ? 'text-emergency-red' : 'text-slate-400'}`}>EMERGENCY</p>
            <p className={`text-sm font-bold ${hospital.emergency === 'Yes' ? 'text-emergency-red' : 'text-slate-800'}`}>{hospital.emergency === 'Yes' ? 'Available 24/7' : 'Not 24/7'}</p>
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.dashboard.nav.specialists}</h2>
          <div className="flex flex-wrap gap-2">
            {(hospital.specialties || []).map((spec: string, idx: number) => (
              <span key={idx} className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 shadow-sm">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.patient.details.facilities}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(hospital.facilities || []).map((fac: string, idx: number) => {
              const Icon = facilityIcons[fac] || CheckCircle2;
              return (
                <div key={idx} className="bg-white p-5 rounded-[32px] border border-slate-100 flex flex-col items-center text-center group hover:bg-primary/5 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 group-hover:text-primary transition-colors">
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-tight">{fac}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctors */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Our Doctors</h2>
            <div className="flex items-center gap-2 text-slate-400">
               <Stethoscope size={20} />
               <span className="font-bold">{doctors.length} Doctors Registered</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 py-20 bg-white rounded-[40px] text-center">
                 <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-slate-400 font-bold">Fetching specialists...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="col-span-2 py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                 <p className="text-slate-400 font-bold text-xl mb-2">Doctors jald add ho jayenge!</p>
                 <p className="text-slate-300 font-medium">This hospital hasn't registered doctors yet.</p>
              </div>
            ) : (
              doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col hover:shadow-xl transition-all group">
                   <div className="flex items-start gap-5 mb-8">
                      <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shadow-lg shadow-primary/5 overflow-hidden">
                         <SmartImage 
                           src={doctor.photo} 
                           alt={doctor.name} 
                           className="w-full h-full" 
                           fallbackInitials={doctor.name?.[0] || 'D'} 
                         />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xl font-bold text-slate-900">Dr. {doctor.name}</h4>
                            <div className="flex items-center gap-1 text-amber-500">
                               <Star size={14} fill="currentColor" />
                               <span className="text-sm font-bold">4.9</span>
                            </div>
                         </div>
                         <div className="inline-block px-3 py-1 bg-health-teal/10 text-health-teal rounded-lg text-[10px] font-bold uppercase tracking-wider mb-2">
                           {doctor.specialization}
                         </div>
                         <p className="text-sm text-slate-400 font-medium">{doctor.qualification}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.patient.booking.consultationFee}</p>
                         <p className="text-lg font-bold text-slate-900">{isGovt ? t.patient.hospitalCard.free : `Rs. ${doctor.fee}`}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.patient.booking.experience}</p>
                         <p className="text-lg font-bold text-slate-900">{doctor.experience || '10'}+ {t.patient.booking.years}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-xs font-bold text-emerald-600">{t.patient.hospitalCard.availableToday}</span>
                      </div>
                      <button 
                        onClick={() => onBook(doctor)}
                        className="px-8 py-3.5 bg-health-teal text-white rounded-2xl font-bold text-sm shadow-lg shadow-health-teal/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        {t.patient.booking.bookToken}
                      </button>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
        {/* Reviews */}
        <div className="mt-12 pb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <User className="text-indigo-500" /> {t.patient.details.reviews}
          </h2>
          <div className="space-y-4">
            {[
              { name: "Ali Ahmed", rating: 5, comment: "Excellent facilities and professional staff. The token system is very efficient.", date: "Today" },
              { name: "Sana Khan", rating: 4, comment: "JPMC is one of the best for free treatment but waiting time is long. App helps!", date: "2 days ago" }
            ].map((review, i) => (
              <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{review.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={12} className={idx < review.rating ? 'text-amber-500' : 'text-slate-200'} fill={idx < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default HospitalDetailPage;
