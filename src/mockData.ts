import { Hospital, Doctor, Staff, Token } from './types';

export const hospitals: Hospital[] = [
  {
    id: 'h1',
    name: "St. Mary's General Hospital",
    type: 'Private',
    city: 'San Francisco',
    area: 'Downtown',
    rating: 4.9,
    reviewsCount: 2400,
    specializations: ['CARDIOLOGY', 'NEUROLOGY', 'ONCOLOGY'],
    facilities: ['Emergency', 'ICU', 'Modern Lab', 'Pharmacy'],
    startingFee: 120,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUqBl115Y0i83lvAQk-7kM8fvESU9Y88xUqryjMXvSUpA5t9GczH29oIY3rc_X_h6o3k-cR8160qJYOIzKs8f-LJ0GxwHj8y5eMMjjcYz7akMSDpEIgQm6I88yn-ZWxEm8Qct4NTuUpSqNsfKrvl1a5ZEJd24qDwrDzKvaWZR6pf9bKrPDr9HXMw-umPpKF0-390HZOTtpYdOq75oI1X_4xnLaMIMXLv5ncl4peV2USFpcuSH5TdNC_9U_j74S3xIq4CSRLw_MvTE',
    verified: true,
    isOpen: true,
    address: '1248 Medical Plaza, East Wing, Central District, New York, NY 10012',
    phone: '+1 (212) 555-0198',
    about: "St. Mary's General Hospital has been a beacon of excellence in healthcare for over 45 years. We specialize in advanced cardiology, neurosurgery, and intensive patient rehabilitation. Our facility is equipped with the latest robotic surgical systems and a dedicated 24/7 emergency response team."
  },
  {
    id: 'h2',
    name: "Central Govt Medical Center",
    type: 'Government',
    city: 'San Francisco',
    area: 'Civic Center',
    rating: 4.5,
    reviewsCount: 1800,
    specializations: ['PEDIATRICS', 'MATERNITY', 'EMERGENCY'],
    facilities: ['Govt Facility', 'Public Health', 'Subsidized Care'],
    startingFee: 20,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWirmv8s4_nv3uMkrUvtPPmnvuY1R3Nc6yLfDFaNM3OzmN6-rfvB6UuYvkLGEVrHaMG1xoMizGUXNiaMB2cplHt4yZRZH3ReUqC6cMn9vS_idMrSMNRGKRMH9E_nLXSRT4IQe4AD--i3wYQFpYX7o243dECXiv7J_NfyRj6es9gR4vPk26FA3Xm3GE0oBH_7L7RCOih-FfHP4mAEbocYY4wz6ublY2LamKHUWoDEEWRvZpTfnURO75CQ3Cu_-k-_kI3ULtzZeviyY',
    verified: true,
    isOpen: true,
    address: 'Civic Center Plaza, San Francisco, CA',
    phone: '+1 (415) 555-7890',
    about: 'A large, structured government medical complex with institutional architecture. The scene is well-lit with natural morning sunlight, featuring clear signage and accessibility ramps.'
  },
  {
    id: 'h3',
    name: "Heart & Vascular Institute",
    type: 'Private',
    city: 'San Francisco',
    area: 'Richmond District',
    rating: 5.0,
    reviewsCount: 950,
    specializations: ['CARDIAC SURGERY', 'DIAGNOSTICS', 'REHAB'],
    facilities: ['Private Specialty', 'Heart Care', 'Post-Op Care'],
    startingFee: 180,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhL7kkeVkq066cV2W9KSj24t3kEXAVOz-rscY4fAa17BjoKSXIsgkhZWh1HcCo6VwU3Vd8IgjDSg2IlqFqcod9f7R3u1U81NsGk4AVcaHUFrvbmntv3hP1LJ9sbNcGay-gZv8jzPejsAAy9wUgIMrOsTy9TIesDjWEPiv1VdBbGnxWQ6sS5Eq3M569m5JwXqu_T9LQImzpJUPv3jQCghDZxiFs98ovLQAT0-BLsO79FKtg68NhZAQmCz8Q6pNUeD-A2LUtV5eiEJc',
    verified: true,
    isOpen: true,
    address: 'Richmond District, San Francisco, CA',
    phone: '+1 (415) 555-4321',
    about: 'A high-tech cardiology center with state-of-the-art medical imaging equipment visible through clean glass partitions.'
  }
];

export const doctors: Doctor[] = [
  {
    id: 'd1',
    hospitalId: 'h1',
    name: 'Dr. James Wilson',
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD'],
    fee: 150,
    availableToday: true,
    nextSlot: '14:30 PM',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN2mWJ2Mk6Z5QBscWoL-dYbESKMqLlcWI7HgNxL6VY8r9zxGYsbgP8d8gV6fCW1K0bBLgoFe7yyEGWW3b7yYqb-iafGNIcbslAytW4HnXc7BEhxfCWMrH4IerTqN4H8ioSYAdjphWACJD4WIoFKQpX-0WjA19xz9-8eVXWFYttFvt6sTDRFdBd9O3KGADufn8Tab8pwJ8432vd2NCdGEi8yzBEMzvuTafNROT-HIjpqiXdLvhxnqaeLoScAfBsQffKNzb_5EfEFNI',
    verified: true,
    title: 'Senior Cardiologist'
  },
  {
    id: 'd2',
    hospitalId: 'h1',
    name: 'Dr. Sarah Chen',
    specialization: 'Neurology',
    qualifications: ['FRCS', 'PhD'],
    fee: 180,
    availableToday: true,
    nextSlot: '16:00 PM',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtBQtLOHa0n5RgbBEl2iLGmCGgO2bjKlKgwlOK4cROKGFbaQeeJUZu2-V586CSp3eH0hfb982Jo_sZSpyz5qlR22w8j1THjgjWgQUpSekWgyfi2UxvtQ2pw1t6MjiwpV_9JPtQzMt9Ch2JwxQ3ae_dFoTg9Oc_EnSQtlTfbP5ok-LepnhcYX_gZBJ4DOA92CKm9N-xvWl3lHWLJ0FANHYLpLFP_IWjkMYbsBdQ36w4hSd4WJX-KqcMJsJRlLvhejmdWKq_5o9LWtQ',
    verified: true,
    title: 'Neurologist'
  }
];

export const staffMembers: Staff[] = [
  {
    id: 's1',
    name: 'Dr. Sarah Chen',
    role: 'Senior Cardiologist',
    department: 'Medical',
    status: 'PRESENT',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqoMHaIpSfQAhipUDt1pTzYWcBfS2u77a0y-sCJOI-zOxBvODFClwfWNxfUFY7-RxN2Fur6iInd8D1OPSQEjyoNUXk-4c1RICMr8QTvVHzO_jaqZBxvwhHXx29hX7vHQlvHYV9FqL39lqC301-E9j_5j4owO-hQeMFwXQk1llbwTZl6VXdGxt6sB361xwngEhMr8pqjY1_KQTjCuWgi_pDSkRcd67e4SY5HuV7m7y9Ieq7tc5DXSMOj89Dv_W2WCWREEPsRp8g4UY'
  },
  {
    id: 's2',
    name: 'Marcus Holloway',
    role: 'Nursing Supervisor',
    department: 'Nursing',
    status: 'ABSENT',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDNJ5jSjY5ABhhhC-7lCABPxGKPV4CSGyuti1dAHc3MlA5DwDvoG-JV4rPJcBhD5jal_0S6JYM5l2MylYA78azLsyW6HYBzkNTpyQFRJ5xAjySrY-6Ce9niIqAPQDAA6usMbSAaDZzvMVLeBFl_zgXyG74JRwB_WPu819WD1NkZfRgaTwIKTjZiwZ7pgQJ9JYx45WyriJJxbU2rRz-bK510ezO9MdklDLq5yM6qzvfm_nOxljyJRr8WsEgMydn3uilxOXmgGgG5Nk'
  },
  {
    id: 's3',
    name: 'Elena Rodriguez',
    role: 'Operations Manager',
    department: 'Admin',
    status: 'ON LEAVE',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnUMLmt6oBrCoQa6H_hMlCHK6Ik45dOqWQ2Y62CcCwIbp11xZoikIl4iwPZCQYzS9uAqqsFxD-abqMO6dnF3iWPp5KePhcCdRvWJyJctEWUiR-3v5PyebrpAl7wpkbMxCU4cj4Mp2sevGcBJIaXE-o-qwEzUYr1YtLBZlc1PlyembP0arRWToK0StPHl6NCw95gFQgONO430SsmIG1XJl7bRLZmDWTdL-RydD5yx_YhWaZ3Jb_F0Js7Dm-iiPiRZHFmYjUdlDdGo4'
  },
  {
    id: 's4',
    name: 'Dr. Amara Okafor',
    role: 'Radiology Lead',
    department: 'Medical',
    status: 'LATE',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABPAL6x-acvS38mvbVRyM9lHlFv9HGXtBx8KX-Fk9Jlwm8NVZoHEgECuKM0Lfm_4MIBScfDLYEz9loOWhEEtCYSJciBW2jWMw2OqD0SIyWHuKP9-bWJejYkhGoMLbnG0F9ugW7QJghBmOlbQp_McmF3q9QElb9NmZ8PH0W0eLTiLS-faeG4kqj6ZING4GGWVuJRhcon88pRy8FtkEQjhC1fw6P8xxU2NjGP7sMGHkYnpWQf3qjV4f-wwKp4zCBmLd89im7tfrIUuU',
    lateMinutes: 15
  }
];

export const queueTokens: Token[] = [
  {
    id: 't1',
    number: '43',
    patientName: 'Robert Fox',
    doctorName: 'Dr. James Wilson',
    timeSlot: '10:45 AM',
    status: 'Waiting'
  },
  {
    id: 't2',
    number: '44',
    patientName: 'Esther Howard',
    doctorName: 'Dr. James Wilson',
    timeSlot: '10:50 AM',
    status: 'Emergency',
    isEmergency: true
  },
  {
    id: 't3',
    number: '45',
    patientName: 'Jenny Wilson',
    doctorName: 'Dr. James Wilson',
    timeSlot: '11:00 AM',
    status: 'Waiting'
  }
];
