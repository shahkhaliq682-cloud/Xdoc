export interface PlanFeatures {
  tokenSystem: boolean;
  basicDashboard: boolean;
  doctorManagement: boolean;
  patientManagement: boolean;
  appointments: boolean;
  prescriptions: boolean;
  medicalRecords: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
}

export interface PlanLimits {
  doctors: number;
  patients: number;
}

export interface PlanConfig {
  label: string;
  name: string;
  duration: number;
  price: number;
  color: string;
  features: PlanFeatures;
  limits: PlanLimits;
}

export const PLAN_FEATURES: Record<string, PlanConfig> = {
  trial: {
    label: "Free Trial",
    name: "Free Trial",
    duration: 7,
    price: 0,
    color: "gray",
    features: {
      tokenSystem: true,
      basicDashboard: true,
      doctorManagement: true,
      patientManagement: true,
      appointments: false,
      prescriptions: false,
      medicalRecords: false,
      advancedAnalytics: false,
      customBranding: false,
      prioritySupport: false,
    },
    limits: { doctors: 1, patients: 20 }
  },
  basic: {
    label: "Basic",
    name: "Basic",
    duration: 30,
    price: 1000,
    color: "blue",
    features: {
      tokenSystem: true,
      basicDashboard: true,
      doctorManagement: true,
      patientManagement: true,
      appointments: false,
      prescriptions: false,
      medicalRecords: false,
      advancedAnalytics: false,
      customBranding: false,
      prioritySupport: false,
    },
    limits: { doctors: 1, patients: 50 }
  },
  standard: {
    label: "Standard",
    name: "Standard",
    duration: 30,
    price: 2500,
    color: "purple",
    features: {
      tokenSystem: true,
      basicDashboard: true,
      doctorManagement: true,
      patientManagement: true,
      appointments: true,
      prescriptions: true,
      medicalRecords: false,
      advancedAnalytics: false,
      customBranding: false,
      prioritySupport: true,
    },
    limits: { doctors: 5, patients: 200 }
  },
  premium: {
    label: "Premium-Pro",
    name: "Premium-Pro",
    duration: 30,
    price: 5000,
    color: "gold",
    features: {
      tokenSystem: true,
      basicDashboard: true,
      doctorManagement: true,
      patientManagement: true,
      appointments: true,
      prescriptions: true,
      medicalRecords: true,
      advancedAnalytics: true,
      customBranding: true,
      prioritySupport: true,
    },
    limits: { doctors: Infinity, patients: Infinity }
  }
};

export const PLANS = PLAN_FEATURES;
