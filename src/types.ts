export type HospitalType = 'Government' | 'Private' | 'Semi-Government' | 'NGO';
export type StaffStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON LEAVE';
export type TokenStatus = 'Waiting' | 'Called' | 'In-Progress' | 'Completed' | 'Skipped' | 'Emergency';

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  city: string;
  area: string;
  rating: number;
  reviewsCount: number;
  specializations: string[];
  facilities: string[];
  startingFee: number;
  imageUrl: string;
  verified: boolean;
  isOpen: boolean;
  address: string;
  phone: string;
  about: string;
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
  name: string;
  role: string;
  department: string;
  status: StaffStatus;
  imageUrl: string;
  lateMinutes?: number;
}

export interface Token {
  id: string;
  number: string;
  patientName: string;
  doctorName: string;
  timeSlot: string;
  status: TokenStatus;
  isEmergency?: boolean;
}
