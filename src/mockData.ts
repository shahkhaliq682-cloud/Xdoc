import { Hospital, Doctor, Staff, Token } from './types';

export const hospitals: Hospital[] = [
  {
    id: 'h1',
    name: "St. Mary's General Hospital",
    type: 'Private Hospital',
    category: 'Private',
    city: 'Karachi',
    area: 'Clifton',
    rating: 4.9,
    reviewsCount: 2400,
    specializations: ['Cardiology', 'Neurology', 'Oncology'],
    facilities: ['Emergency', 'ICU', 'Modern Lab', 'Pharmacy', 'Ambulance'],
    insurancePanels: ['Sehat Card', 'Jubilee', 'State Life'],
    startingFee: 2000,
    emergencyFee: 3500,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUqBl115Y0i83lvAQk-7kM8fvESU9Y88xUqryjMXvSUpA5t9GczH29oIY3rc_X_h6o3k-cR8160qJYOIzKs8f-LJ0GxwHj8y5eMMjjcYz7akMSDpEIgQm6I88yn-ZWxEm8Qct4NTuUpSqNsfKrvl1a5ZEJd24qDwrDzKvaWZR6pf9bKrPDr9HXMw-umPpKF0-390HZOTtpYdOq75oI1X_4xnLaMIMXLv5ncl4peV2USFpcuSH5TdNC_9U_j74S3xIq4CSRLw_MvTE',
    verified: true,
    isOpen: true,
    address: 'Block 5, Clifton, Karachi, Pakistan',
    phone: '+92 21 111 222 333',
    whatsapp: '+92 300 1234567',
    emergencyContact: '+92 21 35832111',
    about: "St. Mary's General Hospital has been a beacon of excellence in healthcare for over 45 years. We specialize in advanced cardiology, neurosurgery, and intensive patient rehabilitation.",
    openingTime: '00:00',
    closingTime: '23:59',
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    hasEmergency247: true,
    isApproved: true,
    isSuspended: false,
    staffStats: {
      doctors: 45,
      nurses: 120,
      admin: 30,
      support: 50
    }
  },
  {
    id: 'h2',
    name: "Mayo Hospital Central",
    type: 'Government Hospital',
    category: 'Government',
    city: 'Lahore',
    area: 'Mall Road',
    rating: 4.5,
    reviewsCount: 1800,
    specializations: ['Pediatrics', 'Maternity', 'Emergency'],
    facilities: ['Emergency Ward', 'Pathology Lab', 'Ambulance', 'Blood Bank'],
    insurancePanels: ['Sehat Card'],
    startingFee: 0,
    emergencyFee: 0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWirmv8s4_nv3uMkrUvtPPmnvuY1R3Nc6yLfDFaNM3OzmN6-rfvB6UuYvkLGEVrHaMG1xoMizGUXNiaMB2cplHt4yZRZH3ReUqC6cMn9vS_idMrSMNRGKRMH9E_nLXSRT4IQe4AD--i3wYQFpYX7o243dECXiv7J_NfyRj6es9gR4vPk26FA3Xm3GE0oBH_7L7RCOih-FfHP4mAEbocYY4wz6ublY2LamKHUWoDEEWRvZpTfnURO75CQ3Cu_-k-_kI3ULtzZeviyY',
    verified: true,
    isOpen: true,
    address: 'Hospital Road, Lahore, Pakistan',
    phone: '+92 42 99211100',
    whatsapp: '+92 321 0000000',
    emergencyContact: '+92 42 1122',
    about: 'A historical government medical complex providing affordable care to millions.',
    openingTime: '00:00',
    closingTime: '23:59',
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    hasEmergency247: true,
    isApproved: true,
    isSuspended: false,
    staffStats: {
      doctors: 250,
      nurses: 600,
      admin: 150,
      support: 400
    }
  }
];

export const doctors: Doctor[] = [
  {
    id: 'd1',
    hospitalId: 'h1',
    name: 'Dr. James Wilson',
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD', 'FCPS'],
    fee: 2500,
    availableToday: true,
    nextSlot: '02:30 PM',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN2mWJ2Mk6Z5QBscWoL-dYbESKMqLlcWI7HgNxL6VY8r9zxGYsbgP8d8gV6fCW1K0bBLgoFe7yyEGWW3b7yYqb-iafGNIcbslAytW4HnXc7BEhxfCWMrH4IerTqN4H8ioSYAdjphWACJD4WIoFKQpX-0WjA19xz9-8eVXWFYttFvt6sTDRFdBd9O3KGADufn8Tab8pwJ8432vd2NCdGEi8yzBEMzvuTafNROT-HIjpqiXdLvhxnqaeLoScAfBsQffKNzb_5EfEFNI',
    verified: true,
    title: 'Senior Cardiologist'
  },
  {
    id: 'd2',
    hospitalId: 'h1',
    name: 'Dr. Sarah Chen',
    specialization: 'Neurology',
    qualifications: ['MBBS', 'FRCS', 'PhD'],
    fee: 3000,
    availableToday: true,
    nextSlot: '04:00 PM',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtBQtLOHa0n5RgbBEl2iLGmCGgO2bjKlKgwlOK4cROKGFbaQeeJUZu2-V586CSp3eH0hfb982Jo_sZSpyz5qlR22w8j1THjgjWgQUpSekWgyfi2UxvtQ2pw1t6MjiwpV_9JPtQzMt9Ch2JwxQ3ae_dFoTg9Oc_EnSQtlTfbP5ok-LepnhcYX_gZBJ4DOA92CKm9N-xvWl3lHWLJ0FANHYLpLFP_IWjkMYbsBdQ36w4hSd4WJX-KqcMJsJRlLvhejmdWKq_5o9LWtQ',
    verified: true,
    title: 'Consultant Neurologist'
  }
];

export const staffMembers: Staff[] = [
  {
    id: 's1',
    hospitalId: 'h1',
    name: 'Asim Raza',
    cnic: '42101-1234567-1',
    role: 'Nursing Supervisor',
    department: 'Nursing',
    shift: 'Morning',
    status: 'PRESENT',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDNJ5jSjY5ABhhhC-7lCABPxGKPV4CSGyuti1dAHc3MlA5DwDvoG-JV4rPJcBhD5jal_0S6JYM5l2MylYA78azLsyW6HYBzkNTpyQFRJ5xAjySrY-6Ce9niIqAPQDAA6usMbSAaDZzvMVLeBFl_zgXyG74JRwB_WPu819WD1NkZfRgaTwIKTjZiwZ7pgQJ9JYx45WyriJJxbU2rRz-bK510ezO9MdklDLq5yM6qzvfm_nOxljyJRr8WsEgMydn3uilxOXmgGgG5Nk',
    joiningDate: '2022-01-15',
    phone: '+92 300 0000001'
  },
  {
    id: 's2',
    hospitalId: 'h1',
    name: 'Fatima Malik',
    cnic: '42101-7654321-2',
    role: 'Admin Officer',
    department: 'Admin',
    shift: 'Morning',
    status: 'PRESENT',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnUMLmt6oBrCoQa6H_hMlCHK6Ik45dOqWQ2Y62CcCwIbp11xZoikIl4iwPZCQYzS9uAqqsFxD-abqMO6dnF3iWPp5KePhcCdRvWJyJctEWUiR-3v5PyebrpAl7wpkbMxCU4cj4Mp2sevGcBJIaXE-o-qwEzUYr1YtLBZlc1PlyembP0arRWToK0StPHl6NCw95gFQgONO430SsmIG1XJl7bRLZmDWTdL-RydD5yx_YhWaZ3Jb_F0Js7Dm-iiPiRZHFmYjUdlDdGo4',
    joiningDate: '2023-05-20',
    phone: '+92 321 9999999'
  }
];

export const queueTokens: Token[] = [
  {
    id: 't1',
    hospitalId: 'h1',
    number: 'A-43',
    patientName: 'Ahmed Khan',
    patientPhone: '+92 300 9876543',
    doctorName: 'Dr. James Wilson',
    timeSlot: '10:45 AM',
    status: 'Waiting',
    createdAt: '2023-10-24T09:00:00Z',
    fee: 2500,
    paymentMethod: 'Cash'
  },
  {
    id: 't2',
    hospitalId: 'h1',
    number: 'A-44',
    patientName: 'Sara Ahmed',
    patientPhone: '+92 333 1112223',
    doctorName: 'Dr. James Wilson',
    timeSlot: '10:50 AM',
    status: 'Emergency',
    isEmergency: true,
    createdAt: '2023-10-24T09:15:00Z',
    fee: 3500,
    paymentMethod: 'JazzCash'
  }
];
