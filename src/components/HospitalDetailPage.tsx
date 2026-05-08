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

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Image */}
      <div className="h-64 md:h-96 relative">
        <img 
          src={hospital.imageUrl || hospital.photo || `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200&h=600&sig=${hospital.id}`} 
          className="w-full h-full object-cover"
          alt={hospital.hospitalName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-xl p-8 md:p-12 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isGovt ? 'bg-success-green/10 text-success-green' : 'bg-primary/10 text-primary'}`}>
                  {isGovt ? t.patient.categories.govt : t.patient.categories.private}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold text-slate-900">{hospital.rating || '4.5'}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{hospital.hospitalName}</h1>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={18} />
                <span className="font-medium">{hospital.area}, {hospital.city}, Pakistan</span>
              </div>
            </div>
            {hospital.emergency === 'Yes' && (
              <div className="bg-emergency-red/10 text-emergency-red px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm">
                <Bell size={18} className="animate-pulse" />
                {t.patient.details.emergency}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{t.signup.labels.phone}</p>
                <a href={`tel:${hospital.phone}`} className="text-sm font-bold text-slate-900">{hospital.phone}</a>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-health-teal shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">TIMINGS</p>
                <p className="text-sm font-bold text-slate-900">{hospital.openingTime} - {hospital.closingTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">OPEN DAYS</p>
                <p className="text-sm font-bold text-slate-900">{(hospital.openDays || []).length} Days / Week</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Facilities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Layers className="text-primary" /> {t.patient.details.facilities}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(hospital.facilities || []).map((fac: string, idx: number) => {
              const Icon = facilityIcons[fac] || CheckCircle2;
              return (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{fac}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctors */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Stethoscope className="text-health-teal" /> {t.patient.details.doctors}
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-bold">Loading Doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="p-12 bg-white rounded-[40px] text-center text-slate-400 font-bold border-2 border-dashed">No doctors listed for today</div>
            ) : (
              doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${doctor.id}`} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{doctor.name}</h4>
                      <p className="text-sm font-bold text-primary">{doctor.specialization}</p>
                      <p className="text-xs text-slate-400 font-medium">{doctor.qualification}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                       <span className="bg-health-teal/10 text-health-teal px-3 py-1 rounded-lg text-[10px] font-bold">
                         {t.patient.hospitalCard.availableToday}
                       </span>
                       <span className="text-lg font-bold text-slate-900">
                         {isGovt ? t.patient.hospitalCard.free : `Rs. ${doctor.fee}`}
                       </span>
                    </div>
                    <button 
                      onClick={() => onBook(doctor)}
                      className="px-8 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {t.patient.hospitalCard.bookToken}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reviews */}
        <div>
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
    </div>
  );
};

export default HospitalDetailPage;
