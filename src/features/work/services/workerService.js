import { supabase } from '../../../shared/services/supabaseClient';
import { getProfilePhotoUrl } from '../../../shared/utils/profilePhoto';
import {
  createSellerService,
  fetchSellerProfile,
  fetchSellerServices,
  fetchUserProfileBundle,
  syncWorkerSetup,
} from '../../../shared/services/authService';

const normalizeRateBasis = (value) => {
  const raw = String(value || '').trim().toLowerCase().replace(/_/g, '-');
  if (raw === 'per-hour' || raw === 'hourly') return 'per-hour';
  if (raw === 'per-day' || raw === 'daily') return 'per-day';
  if (raw === 'per-week' || raw === 'weekly') return 'per-week';
  if (raw === 'per-month' || raw === 'monthly') return 'per-month';
  if (raw === 'per-project' || raw === 'project' || raw === 'package' || raw === 'fixed' || raw === 'custom') return 'per-project';
  return '';
};

export const getPricingModelFromService = (service) => {
  const model = String(
    service?.metadata?.pricing_model || service?.metadata?.pricingModel || service?.pricing_model || ''
  ).trim().toLowerCase();
  return model === 'inquiry' ? 'inquiry' : 'fixed';
};

export const getActiveAdBoosterFromService = (service = {}) => {
  const adBooster = service?.metadata?.ad_booster || service?.metadata?.adBooster || null;
  const boostEndsAt = adBooster?.ends_at || adBooster?.endsAt || null;
  const boostEndsTime = boostEndsAt ? new Date(boostEndsAt).getTime() : null;
  const hasValidEnd = boostEndsTime === null || Number.isFinite(boostEndsTime);
  const isBoosted = Boolean(adBooster?.active)
    && hasValidEnd
    && (boostEndsTime === null || boostEndsTime > Date.now());

  return {
    adBooster,
    boostBudget: Number(adBooster?.budget_php ?? adBooster?.budgetPhp ?? 0) || 0,
    boostEndsAt,
    isBoosted,
  };
};

export const mapSellerRowToUiProfile = (sellerRow = null, workerProfile = null, fallbackProfile = null) => {
  const sellerName =
    sellerRow?.display_name ||
    sellerRow?.search_meta?.name ||
    workerProfile?.fullName ||
    fallbackProfile?.fullName ||
    'Service Provider';
  const serviceType =
    workerProfile?.serviceType ||
    workerProfile?.customServiceType ||
    sellerRow?.headline ||
    sellerRow?.search_meta?.service_type ||
    fallbackProfile?.serviceType ||
    'Service Type';
  const profilePhoto = getProfilePhotoUrl(
    workerProfile?.profilePhoto ||
    workerProfile?.profile_photo ||
    sellerRow?.profile_photo ||
    sellerRow?.avatar_url ||
    fallbackProfile?.profilePhoto ||
    fallbackProfile?.profile_photo ||
    ''
  );
  const location = {
    address: workerProfile?.address || sellerRow?.search_meta?.location?.address || fallbackProfile?.location?.address || '',
    barangay: workerProfile?.barangay || sellerRow?.search_meta?.location?.barangay || fallbackProfile?.location?.barangay || '',
    city: workerProfile?.city || sellerRow?.search_meta?.location?.city || fallbackProfile?.location?.city || '',
    province: workerProfile?.province || sellerRow?.search_meta?.location?.province || fallbackProfile?.location?.province || '',
  };

  return {
    fullName: sellerName,
    serviceType,
    description: workerProfile?.bio || sellerRow?.about || sellerRow?.tagline || fallbackProfile?.bio || '',
    pricingModel: workerProfile?.pricingModel || 'fixed',
    fixedPrice: workerProfile?.fixedPrice ?? '',
    hourlyRate: workerProfile?.hourlyRate ?? '',
    dailyRate: workerProfile?.dailyRate ?? '',
    weeklyRate: workerProfile?.weeklyRate ?? '',
    monthlyRate: workerProfile?.monthlyRate ?? '',
    projectRate: workerProfile?.projectRate ?? '',
    rateBasis: workerProfile?.rateBasis || 'per-project',
    bookingMode: workerProfile?.bookingMode || sellerRow?.search_meta?.booking_mode || 'with-slots',
    paymentAdvance: workerProfile?.paymentAdvance ?? false,
    paymentAfterService: workerProfile?.paymentAfterService ?? true,
    afterServicePaymentType: workerProfile?.afterServicePaymentType || 'both',
    gcashNumber: workerProfile?.gcashNumber || sellerRow?.gcash_number || '',
    profilePhoto,
    location,
    raw: null,
  };
};

export const mapServiceRowToWorkerService = (service, sellerRow = null, fallbackProfile = null) => {
  const rateBasis = normalizeRateBasis(service?.metadata?.rate_basis || service?.rate_basis || service?.price_type) || 'per-project';
  const boostState = getActiveAdBoosterFromService(service);
  const sellerDisplayName =
    sellerRow?.display_name ||
    sellerRow?.search_meta?.name ||
    fallbackProfile?.fullName ||
    fallbackProfile?.full_name ||
    service?.title ||
    'Service';
  const profilePhoto = getProfilePhotoUrl(
    sellerRow?.profile_photo ||
    sellerRow?.avatar_url ||
    fallbackProfile?.profilePhoto ||
    fallbackProfile?.profile_photo ||
    ''
  );

  return {
    fullName: sellerDisplayName,
    profilePhoto,
    serviceType: service?.title || service?.metadata?.service_type || 'Service',
    description: service?.description || service?.short_description || '',
    pricingModel: getPricingModelFromService(service),
    fixedPrice: service?.base_price || '',
    rateBasis,
    hourlyRate: rateBasis === 'per-hour' ? (service?.base_price || '') : '',
    dailyRate: rateBasis === 'per-day' ? (service?.base_price || '') : '',
    weeklyRate: rateBasis === 'per-week' ? (service?.base_price || '') : '',
    monthlyRate: rateBasis === 'per-month' ? (service?.base_price || '') : '',
    projectRate: rateBasis === 'per-project' ? (service?.base_price || '') : '',
    paymentAdvance: sellerRow?.payment_advance ?? false,
    paymentAfterService: sellerRow?.payment_after_service ?? true,
    afterServicePaymentType: sellerRow?.after_service_payment_type || 'both',
    gcashNumber: sellerRow?.gcash_number || '',
    bookingMode: service?.metadata?.booking_mode || sellerRow?.booking_mode || sellerRow?.search_meta?.booking_mode || 'with-slots',
    adBooster: boostState.adBooster,
    boostBudget: boostState.boostBudget,
    boostEndsAt: boostState.boostEndsAt,
    isBoosted: boostState.isBoosted,
    location: {
      barangay: sellerRow?.search_meta?.location?.barangay || sellerRow?.location?.barangay || '',
      city: sellerRow?.search_meta?.location?.city || sellerRow?.location?.city || '',
      province: sellerRow?.search_meta?.location?.province || sellerRow?.location?.province || '',
    },
    raw: service,
  };
};

export const getAuthenticatedWorkUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user || null;
};

export const loadWorkerProfileServices = async ({ userId, fallbackProfile = null } = {}) => {
  if (!userId) {
    return {
      sellerData: null,
      workerProfileBundle: null,
      sellerDbServices: [],
      workerServices: [],
      sellerUiProfile: null,
      sellerId: null,
      sellerRatingAggregate: null,
    };
  }

  const [seller, workerBundle] = await Promise.all([
    fetchSellerProfile(userId),
    fetchUserProfileBundle(userId),
  ]);

  if (!seller) {
    return {
      sellerData: null,
      workerProfileBundle: workerBundle || null,
      sellerDbServices: [],
      workerServices: [],
      sellerUiProfile: mapSellerRowToUiProfile(null, workerBundle, fallbackProfile),
      sellerId: userId,
      sellerRatingAggregate: null,
    };
  }

  const sellerId = seller.user_id || seller.id || userId;
  const [services, ratingAggregateResult] = await Promise.all([
    fetchSellerServices(sellerId),
    supabase
      .from('seller_rating_aggregates')
      .select('avg_rating, rating_count')
      .eq('seller_id', sellerId)
      .maybeSingle(),
  ]);

  if (ratingAggregateResult.error && ratingAggregateResult.error.code !== 'PGRST116') {
    throw ratingAggregateResult.error;
  }

  const sellerUiProfile = mapSellerRowToUiProfile(seller, workerBundle, fallbackProfile);
  const workerServices = (services || []).map((service) =>
    mapServiceRowToWorkerService(service, seller, sellerUiProfile || fallbackProfile)
  );

  return {
    sellerData: seller,
    workerProfileBundle: workerBundle || null,
    sellerDbServices: services || [],
    workerServices,
    sellerUiProfile,
    sellerId,
    sellerRatingAggregate: ratingAggregateResult.data || null,
  };
};

export const createWorkerService = async ({ sellerId, serviceData, sellerData, fallbackProfile }) => {
  const created = await createSellerService(sellerId, serviceData);
  return {
    raw: created,
    mapped: mapServiceRowToWorkerService(created, sellerData, fallbackProfile),
  };
};

export const updateWorkerProfile = async ({ userId, profileData }) => {
  if (!userId) throw new Error('Missing authenticated user.');
  return syncWorkerSetup(userId, profileData);
};

export const subscribeToWorkProfileChanges = ({ sellerId, onSellerChange, onServiceChange }) => {
  if (!sellerId) return () => {};

  const serviceChannel = supabase
    .channel(`seller-services-${sellerId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'services', filter: `seller_id=eq.${sellerId}` },
      (payload) => {
        if (typeof onServiceChange === 'function') onServiceChange(payload);
      }
    )
    .subscribe();

  const sellerChannel = supabase
    .channel(`seller-row-${sellerId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sellers', filter: `user_id=eq.${sellerId}` },
      (payload) => {
        if (typeof onSellerChange === 'function') onSellerChange(payload);
      }
    )
    .subscribe();

  return () => {
    try { supabase.removeChannel(serviceChannel); } catch (error) { /* ignore cleanup */ }
    try { supabase.removeChannel(sellerChannel); } catch (error) { /* ignore cleanup */ }
  };
};

const workerService = {
  createWorkerService,
  getAuthenticatedWorkUser,
  getPricingModelFromService,
  loadWorkerProfileServices,
  mapSellerRowToUiProfile,
  mapServiceRowToWorkerService,
  subscribeToWorkProfileChanges,
  updateWorkerProfile,
};

export default workerService;
