import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const demoHospitals = [
  {
    id: 'govt_jpmc_karachi',
    uid: 'demo_jpmc',
    hospitalName: 'Jinnah Postgraduate Medical Centre (JPMC)',
    ownerName: 'Government of Pakistan',
    city: 'Karachi',
    area: 'Rafiqi Sheed Road',
    type: 'Government Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 0,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    openingTime: '08:00',
    closingTime: '20:00',
    phone: '021-99201300',
    rating: 4.5,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Dentistry', 'Eye', 'ENT', 
      'Psychiatry', 'Urology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'CCU', 'Operation Theater', 'Labour Room',
      'NICU', 'Pathology Lab', 'X-Ray', 'Ultrasound', 'MRI', 'CT Scan',
      'Blood Bank', 'Pharmacy', 'Ambulance'
    ]
  },
  {
    id: 'govt_civil_karachi',
    uid: 'demo_civil',
    hospitalName: 'Civil Hospital Karachi',
    ownerName: 'Government of Sindh',
    city: 'Karachi',
    area: 'Karachi City',
    type: 'Government Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 0,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '021-99214300',
    rating: 4.2,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Dermatology', 'Eye', 'ENT',
      'Psychiatry', 'Urology', 'Gastroenterology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'Operation Theater', 'Labour Room',
      'Pathology Lab', 'X-Ray', 'Ultrasound', 'Blood Bank',
      'Pharmacy', 'Ambulance'
    ]
  },
  {
    id: 'govt_mayo_lahore',
    uid: 'demo_mayo',
    hospitalName: 'Mayo Hospital Lahore',
    ownerName: 'Government of Punjab',
    city: 'Lahore',
    area: 'Nila Gumbad',
    type: 'Government Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 0,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '042-99200600',
    rating: 4.4,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Dermatology', 'Eye', 'ENT',
      'Oncology', 'Nephrology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'CCU', 'Operation Theater', 'Labour Room',
      'NICU', 'Burns Unit', 'Dialysis Center', 'Pathology Lab', 'X-Ray',
      'MRI', 'CT Scan', 'Blood Bank', 'Pharmacy', 'Ambulance'
    ]
  },
  {
    id: 'govt_pims_islamabad',
    uid: 'demo_pims',
    hospitalName: 'Pakistan Institute of Medical Sciences (PIMS)',
    ownerName: 'Government of Pakistan',
    city: 'Islamabad',
    area: 'G-8/3 Islamabad',
    type: 'Government Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 0,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '051-9261170',
    rating: 4.6,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Psychiatry', 'Oncology',
      'Nephrology', 'Pulmonology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'CCU', 'Operation Theater', 'Labour Room',
      'NICU', 'Chemotherapy Unit', 'Dialysis Center', 'Pathology Lab', 
      'X-Ray', 'MRI', 'CT Scan', 'Blood Bank', 'Pharmacy', 'Ambulance'
    ]
  },
  {
    id: 'govt_kth_peshawar',
    uid: 'demo_kth',
    hospitalName: 'Khyber Teaching Hospital',
    ownerName: 'Government of KPK',
    city: 'Peshawar',
    area: 'Peshawar Cantt',
    type: 'Government Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 0,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '091-9216401',
    rating: 4.3,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Eye', 'ENT', 'Psychiatry'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'Operation Theater', 'Labour Room',
      'Pathology Lab', 'X-Ray', 'Ultrasound', 'Blood Bank',
      'Pharmacy', 'Ambulance'
    ]
  },
  {
    id: 'private_aku_karachi',
    uid: 'demo_aku',
    hospitalName: 'Aga Khan University Hospital',
    ownerName: 'AKU Foundation',
    city: 'Karachi',
    area: 'Stadium Road',
    type: 'Private Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 3500,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '021-111-911-911',
    rating: 4.9,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Dermatology', 'Eye', 'ENT',
      'Psychiatry', 'Oncology', 'Nephrology', 'Gastroenterology',
      'Pulmonology', 'Endocrinology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'CCU', 'Operation Theater', 'Labour Room',
      'NICU', 'Burns Unit', 'Dialysis Center', 'Chemotherapy Unit',
      'Physiotherapy', 'Pathology Lab', 'X-Ray', 'Ultrasound', 'MRI',
      'CT Scan', 'ECG', 'Echo Cardiography', 'Blood Bank', 'Pharmacy',
      'Ambulance', 'Private Rooms', 'Cafeteria', 'Parking',
      'Prayer Room', 'Wheelchair', 'Elevator', 'Telemedicine',
      'Online Reports'
    ]
  },
  {
    id: 'private_skm_lahore',
    uid: 'demo_skm',
    hospitalName: 'Shaukat Khanum Memorial Cancer Hospital',
    ownerName: 'SKM Trust',
    city: 'Lahore',
    area: 'Johar Town',
    type: 'Private Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 2000,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '042-111-155-555',
    rating: 4.9,
    specializations: [
      'Oncology', 'General Physician', 'Gynecology', 'Pediatrics',
      'Radiology', 'Pathology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'Chemotherapy Unit', 'Operation Theater',
      'Pathology Lab', 'X-Ray', 'MRI', 'CT Scan', 'Blood Bank',
      'Pharmacy', 'Ambulance', 'Private Rooms', 'Cafeteria',
      'Parking', 'Prayer Room', 'Elevator'
    ]
  },
  {
    id: 'private_southcity_karachi',
    uid: 'demo_southcity',
    hospitalName: 'South City Hospital',
    ownerName: 'Private Board',
    city: 'Karachi',
    area: 'PECHS Block 2',
    type: 'Private Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 2000,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '021-111-742-742',
    rating: 4.7,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Dermatology', 'Eye', 'ENT',
      'Gastroenterology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'CCU', 'Operation Theater', 'Labour Room',
      'Pathology Lab', 'X-Ray', 'Ultrasound', 'MRI', 'ECG',
      'Blood Bank', 'Pharmacy', 'Ambulance', 'Private Rooms',
      'Parking', 'Prayer Room', 'Elevator'
    ]
  },
  {
    id: 'private_lnh_karachi',
    uid: 'demo_lnh',
    hospitalName: 'Liaquat National Hospital',
    ownerName: 'Liaquat Foundation',
    city: 'Karachi',
    area: 'Stadium Road',
    type: 'Private Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 1500,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '021-111-456-789',
    rating: 4.6,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Dermatology', 'Eye', 'ENT',
      'Urology', 'Nephrology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'CCU', 'Operation Theater', 'Labour Room',
      'NICU', 'Dialysis Center', 'Pathology Lab', 'X-Ray', 'Ultrasound',
      'MRI', 'CT Scan', 'ECG', 'Blood Bank', 'Pharmacy', 'Ambulance',
      'Private Rooms', 'Cafeteria', 'Parking', 'Elevator'
    ]
  },
  {
    id: 'private_shifa_islamabad',
    uid: 'demo_shifa',
    hospitalName: 'Shifa International Hospital',
    ownerName: 'Shifa International',
    city: 'Islamabad',
    area: 'H-8/4 Islamabad',
    type: 'Private Hospital',
    status: 'active',
    approved: true,
    emergency: 'Yes',
    startingFee: 2500,
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    openingTime: '00:00',
    closingTime: '23:59',
    phone: '051-846-3000',
    rating: 4.8,
    specializations: [
      'General Physician', 'Cardiology', 'Neurology', 'Orthopedic',
      'Gynecology', 'Pediatrics', 'Dermatology', 'Eye', 'ENT',
      'Psychiatry', 'Oncology', 'Nephrology', 'Pulmonology'
    ],
    facilities: [
      'Emergency Ward', 'ICU', 'CCU', 'Operation Theater', 'Labour Room',
      'NICU', 'Dialysis Center', 'Chemotherapy Unit', 'Pathology Lab',
      'X-Ray', 'Ultrasound', 'MRI', 'CT Scan', 'ECG', 'Echo Cardiography',
      'Blood Bank', 'Pharmacy', 'Ambulance', 'Private Rooms',
      'Cafeteria', 'Parking', 'Prayer Room', 'Elevator', 'Telemedicine'
    ]
  }
];

export const seedHospitals = async () => {
  for (const hospital of demoHospitals) {
    const hospitalRef = doc(db, 'hospitals', hospital.id);
    await setDoc(hospitalRef, {
      ...hospital,
      createdAt: serverTimestamp()
    });

    // Also create a entry in users collection to keep roles consistent
    const userRef = doc(db, 'users', hospital.uid);
    await setDoc(userRef, {
      uid: hospital.uid,
      name: hospital.hospitalName,
      email: `${hospital.id}@demo.xdoc.pk`,
      role: 'hospital_admin',
      status: 'active',
      approved: true,
      createdAt: serverTimestamp()
    });

    // Add some demo doctors to each hospital
    const doctorsRef = collection(db, `hospitals/${hospital.id}/doctors`);
    const demoDoctors = [
      { name: 'Dr. Ahmed Khan', specialization: 'Cardiology', qualification: 'MBBS, FCPS', fee: hospital.startingFee + 500, status: 'active' },
      { name: 'Dr. Sarah Ali', specialization: 'Pediatrics', qualification: 'MBBS, MCPS', fee: hospital.startingFee + 300, status: 'active' },
      { name: 'Dr. Usman Sheikh', specialization: 'General Physician', qualification: 'MBBS', fee: hospital.startingFee, status: 'active' }
    ];

    for (const docInfo of demoDoctors) {
      const docRef = doc(doctorsRef);
      await setDoc(docRef, {
        ...docInfo,
        id: docRef.id,
        createdAt: serverTimestamp()
      });
    }
  }
};
