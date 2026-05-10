/**
 * workerService.js
 * Data operations for worker profiles, services, and inquiries
 * 
 * Handles:
 * - Worker profile data
 * - Services management
 * - Inquiry/quote handling
 * - Service metadata
 */

// Mock worker profile data
const getMockWorkerProfile = () => ({
  userId: 'worker-001',
  fullName: 'Joshua Paul Santos',
  serviceType: 'Tutor',
  customServiceType: '',
  bio: 'Professional tutor with 5+ years of experience in online tutoring.',
  email: 'joshua@example.com',
  city: 'Bulacan',
  barangay: 'San Jose',
  address: '123 Main Street',
  province: 'Bulacan',
  age: 28,
  experienceYears: 5,
  pricingModel: 'fixed',
  fixedPrice: 500,
  hourlyRate: 500,
  dailyRate: 3000,
  weeklyRate: 12000,
  monthlyRate: 40000,
  projectRate: null,
  rateBasis: 'per-hour',
  bookingMode: 'with-slots',
  paymentAdvance: true,
  paymentAfterService: true,
  afterServicePaymentType: 'both',
  gcashNumber: '09054891105',
  qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=09054891105',
  profilePhoto: null,
  verificationStatus: 'verified',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2026-05-10T10:00:00Z',
});

// Mock services list
const getMockWorkerServices = () => [
  {
    id: 'svc-001',
    title: 'Math Tutoring - High School',
    shortDescription: 'One-on-one math tutoring for high school students',
    description: 'Comprehensive math tutoring covering algebra, geometry, and trigonometry',
    category: 'Education',
    basePrice: 500,
    priceType: 'fixed',
    rateBasis: 'per-hour',
    bookingMode: 'with-slots',
    currency: 'PHP',
    durationMinutes: 60,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2026-05-10T10:00:00Z',
    metadata: {
      pricing_model: 'fixed',
      rate_basis: 'per-hour',
      booking_mode: 'with-slots',
    },
  },
  {
    id: 'svc-002',
    title: 'Science Tutoring - All Levels',
    shortDescription: 'Physics, Chemistry, and Biology tutoring',
    description: 'Expert science tutoring for all academic levels',
    category: 'Education',
    basePrice: 600,
    priceType: 'fixed',
    rateBasis: 'per-hour',
    bookingMode: 'with-slots',
    currency: 'PHP',
    durationMinutes: 60,
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2026-05-10T10:00:00Z',
    metadata: {
      pricing_model: 'fixed',
      rate_basis: 'per-hour',
      booking_mode: 'with-slots',
    },
  },
];

// Mock inquiries data
const getMockInquiries = () => [
  {
    id: 'inq-001',
    clientName: 'Maria Garcia',
    clientPhoto: 'https://api.placeholder.com/photo/maria.jpg',
    clientRating: 4.8,
    clientReviewCount: 12,
    serviceType: 'Math Tutoring - High School',
    description: 'Need help with trigonometry for my college entrance exam',
    requestDate: '2026-05-08T14:30:00Z',
    status: 'pending', // pending | negotiating | quoted | accepted | completed
    quoteAmount: 500,
    quotedAt: null,
    acceptedAt: null,
  },
  {
    id: 'inq-002',
    clientName: 'Juan Dela Cruz',
    clientPhoto: 'https://api.placeholder.com/photo/juan.jpg',
    clientRating: 5.0,
    clientReviewCount: 8,
    serviceType: 'Science Tutoring - All Levels',
    description: 'Looking for chemistry help for my daughter, weekly sessions preferred',
    requestDate: '2026-05-09T09:15:00Z',
    status: 'negotiating',
    quoteAmount: null,
    quotedAt: null,
    acceptedAt: null,
  },
  {
    id: 'inq-003',
    clientName: 'Ana Santos',
    clientPhoto: 'https://api.placeholder.com/photo/ana.jpg',
    clientRating: 4.5,
    clientReviewCount: 15,
    serviceType: 'Math Tutoring - High School',
    description: 'Monthly tutoring package for my son',
    requestDate: '2026-05-06T16:45:00Z',
    status: 'quoted',
    quoteAmount: 12000,
    quotedAt: '2026-05-07T10:00:00Z',
    acceptedAt: null,
  },
];

/**
 * Get worker profile
 */
export const getWorkerProfile = () => {
  try {
    // In production: fetch from Supabase
    // const { data, error } = await supabase.from('worker_profiles').select('*').single();
    return getMockWorkerProfile();
  } catch (error) {
    console.error('Error fetching worker profile:', error);
    return getMockWorkerProfile();
  }
};

/**
 * Update worker profile
 */
export const updateWorkerProfile = (profileData) => {
  try {
    // In production: update in Supabase
    // const { data, error } = await supabase.from('worker_profiles').update(profileData).eq('user_id', userId);
    const updated = { ...getMockWorkerProfile(), ...profileData };
    return updated;
  } catch (error) {
    console.error('Error updating worker profile:', error);
    return null;
  }
};

/**
 * Get worker services
 */
export const getWorkerServices = () => {
  try {
    // In production: fetch from Supabase
    // const { data, error } = await supabase.from('services').select('*').eq('worker_id', userId);
    return getMockWorkerServices();
  } catch (error) {
    console.error('Error fetching worker services:', error);
    return getMockWorkerServices();
  }
};

/**
 * Create new service
 */
export const createService = (serviceData) => {
  try {
    // In production: insert into Supabase
    // const { data, error } = await supabase.from('services').insert([serviceData]);
    const newService = {
      id: `svc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...serviceData,
    };
    return newService;
  } catch (error) {
    console.error('Error creating service:', error);
    return null;
  }
};

/**
 * Update service
 */
export const updateService = (serviceId, updates) => {
  try {
    // In production: update in Supabase
    const services = getMockWorkerServices();
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      return { ...service, ...updates, updatedAt: new Date().toISOString() };
    }
    return null;
  } catch (error) {
    console.error('Error updating service:', error);
    return null;
  }
};

/**
 * Get inquiries
 */
export const getInquiries = () => {
  try {
    // In production: fetch from Supabase
    // const { data, error } = await supabase.from('inquiries').select('*').eq('worker_id', userId);
    return getMockInquiries();
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return getMockInquiries();
  }
};

/**
 * Update inquiry status
 */
export const updateInquiryStatus = (inquiryId, status, quoteAmount = null) => {
  try {
    // In production: update in Supabase
    const inquiry = getMockInquiries().find((i) => i.id === inquiryId);
    if (inquiry) {
      return {
        ...inquiry,
        status,
        quoteAmount: quoteAmount ?? inquiry.quoteAmount,
        quotedAt: status === 'quoted' ? new Date().toISOString() : inquiry.quotedAt,
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return null;
  }
};

/**
 * Send quote for inquiry
 */
export const sendQuote = (inquiryId, quoteAmount) => {
  return updateInquiryStatus(inquiryId, 'quoted', quoteAmount);
};

/**
 * Accept inquiry (mark as accepted)
 */
export const acceptInquiry = (inquiryId) => {
  return updateInquiryStatus(inquiryId, 'accepted');
};

/**
 * Reject inquiry
 */
export const rejectInquiry = (inquiryId) => {
  return updateInquiryStatus(inquiryId, 'rejected');
};

/**
 * Get inquiry details
 */
export const getInquiryDetails = (inquiryId) => {
  const inquiries = getMockInquiries();
  return inquiries.find((i) => i.id === inquiryId) || null;
};

/**
 * Mark inquiry as completed/done
 */
export const completeInquiry = (inquiryId) => {
  return updateInquiryStatus(inquiryId, 'completed');
};

export default {
  getWorkerProfile,
  updateWorkerProfile,
  getWorkerServices,
  createService,
  updateService,
  getInquiries,
  updateInquiryStatus,
  sendQuote,
  acceptInquiry,
  rejectInquiry,
  getInquiryDetails,
  completeInquiry,
};
