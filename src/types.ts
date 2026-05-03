export type HospitalType = 'Private Hospital' | 'Government Hospital' | 'Private Clinic' | 'Government Clinic' | 'Diagnostic Lab' | 'Pharmacy' | 'Medical Store';
export type StaffStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF DAY' | 'ON LEAVE';
export type TokenStatus = 'Waiting' | 'Called' | 'In-Progress' | 'Completed' | 'Skipped' | 'Emergency';
export type PaymentMethod = 'Cash' | 'JazzCash' | 'EasyPaisa' | 'Card';

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  category: 'Government' | 'Private' | 'Semi-Government' | 'NGO';
  city: string;
  area: string;
  rating: number;
  reviewsCount: number;
  specializations: string[];
  facilities: string[];
  insurancePanels: string[];
  startingFee: number;
  emergencyFee: number;
  imageUrl: string;
  logoUrl?: string;
  verified: boolean;
  isOpen: boolean;
  address: string;
  phone: string;
  whatsapp: string;
  emergencyContact: string;
  about: string;
  openingTime: string;
  closingTime: string;
  openDays: string[];
  hasEmergency247: boolean;
  isApproved: boolean;
  isSuspended: boolean;
  staffStats?: {
    doctors: number;
    nurses: number;
    admin: number;
    support: number;
  };
}

export interface Doctor {
  id: string;
  hospitalId: string;
  name: string;
  specialization: string;
  qualifications: string[];
  fee: number;
  availableToday: boolean;
  nextSlot: string;
  imageUrl: string;
  verified: boolean;
  title: string; // e.g. Senior Cardiologist
}

export interface Staff {
  id: string;
  hospitalId: string;
  name: string;
  cnic: string;
  role: string;
  department: string;
  shift: 'Morning' | 'Evening' | 'Night' | 'Custom';
  status: StaffStatus;
  imageUrl: string;
  joiningDate: string;
  phone: string;
  lateMinutes?: number;
}

export interface Token {
  id: string;
  hospitalId: string;
  number: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  timeSlot: string;
  status: TokenStatus;
  isEmergency?: boolean;
  createdAt: string;
  fee: number;
  paymentMethod: PaymentMethod;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: StaffStatus;
  timeIn?: string;
  timeOut?: string;
}
