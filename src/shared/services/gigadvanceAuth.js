import { supabase } from './supabaseClient';

const getCleanString = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const getNullableString = (value) => {
  const cleanValue = getCleanString(value);
  return cleanValue.length > 0 ? cleanValue : null;
};

const getNullableNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getTimestamp = () => new Date().toISOString();

const buildLocationPayload = (source = {}) => ({
  province: getNullableString(source.province),
  city: getNullableString(source.city),
  barangay: getNullableString(source.barangay),
  address: getNullableString(source.address),
});

const buildProfilePayload = (user, source = {}, existingProfile = null) => {
  const metadata = user?.user_metadata || {};
  const location = buildLocationPayload(source);

  return {
    user_id: user.id,
    full_name: getNullableString(source.name || metadata.full_name || metadata.name || user.email?.split('@')[0]) || 'GigLink User',
    email: user.email,
    phone_number: getNullableString(source.phoneNumber || metadata.phone_number),
    profile_photo: getNullableString(source.profilePhoto || metadata.profile_photo),
    bio: getNullableString(source.bio || metadata.bio),
    province: location.province,
    city: location.city,
    barangay: location.barangay,
    address: location.address,
    is_client: true,
    is_worker: Boolean(source.isWorker ?? metadata.is_worker ?? existingProfile?.is_worker ?? false),
    updated_at: getTimestamp(),
  };
};

const buildWorkerProfilePayload = (userId, source = {}) => ({
  user_id: userId,
  service_type: getNullableString(source.serviceType),
  custom_service_type: getNullableString(source.customServiceType),
  bio: getNullableString(source.bio),
  pricing_model: source.pricingModel || 'fixed',
  fixed_price: getNullableNumber(source.fixedPrice),
  hourly_rate: getNullableNumber(source.hourlyRate),
  daily_rate: getNullableNumber(source.dailyRate),
  weekly_rate: getNullableNumber(source.weeklyRate),
  monthly_rate: getNullableNumber(source.monthlyRate),
  booking_mode: source.bookingMode || 'with-slots',
  rate_basis: source.rateBasis || 'per-hour',
  payment_advance: Boolean(source.paymentAdvance),
  payment_after_service: source.paymentAfterService !== false,
  after_service_payment_type: source.afterServicePaymentType || 'both',
  gcash_number: getNullableString(source.gcashNumber),
  qr_file_name: getNullableString(source.qrFileName),
  verification_status: source.verificationStatus || 'pending',
  updated_at: getTimestamp(),
});

const mapLocation = (profileRow) => ({
  province: profileRow?.province || '',
  city: profileRow?.city || '',
  barangay: profileRow?.barangay || '',
  address: profileRow?.address || '',
});

const mapAppProfile = (profileRow = null, workerRow = null) => {
  if (!profileRow && !workerRow) return null;

  const location = mapLocation(profileRow);

  return {
    userId: profileRow?.user_id || workerRow?.user_id || null,
    fullName: profileRow?.full_name || '',
    email: profileRow?.email || '',
    phoneNumber: profileRow?.phone_number || '',
    profilePhoto: profileRow?.profile_photo || '',
    bio: profileRow?.bio || '',
    province: location.province,
    city: location.city,
    barangay: location.barangay,
    address: location.address,
    location,
    isClient: profileRow?.is_client !== false,
    isWorker: Boolean(profileRow?.is_worker || workerRow),
    serviceType: workerRow?.service_type || '',
    customServiceType: workerRow?.custom_service_type || '',
    pricingModel: workerRow?.pricing_model || 'fixed',
    fixedPrice: workerRow?.fixed_price ?? '',
    hourlyRate: workerRow?.hourly_rate ?? '',
    dailyRate: workerRow?.daily_rate ?? '',
    weeklyRate: workerRow?.weekly_rate ?? '',
    monthlyRate: workerRow?.monthly_rate ?? '',
    bookingMode: workerRow?.booking_mode || 'with-slots',
    rateBasis: workerRow?.rate_basis || 'per-hour',
    paymentAdvance: workerRow?.payment_advance ?? false,
    paymentAfterService: workerRow?.payment_after_service ?? true,
    afterServicePaymentType: workerRow?.after_service_payment_type || 'both',
    gcashNumber: workerRow?.gcash_number || '',
    qrFileName: workerRow?.qr_file_name || '',
    verificationStatus: workerRow?.verification_status || 'pending',
    workerUpdatedAt: workerRow?.updated_at || null,
    profileUpdatedAt: profileRow?.updated_at || null,
  };
};

export const fetchUserProfileBundle = async (userId) => {
  if (!userId) return null;

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) throw profileError;

  const { data: workerRow, error: workerError } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (workerError) throw workerError;

  return mapAppProfile(profileRow, workerRow);
};

export const upsertClientProfile = async (user, source = {}) => {
  if (!user?.id) throw new Error('Missing authenticated user.');

  const { data: existingProfile, error: existingError } = await supabase
    .from('profiles')
    .select('is_worker')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingError) throw existingError;

  const payload = buildProfilePayload(user, source, existingProfile);
  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) throw error;

  return fetchUserProfileBundle(user.id);
};

export const upsertWorkerProfile = async (userId, source = {}) => {
  if (!userId) throw new Error('Missing authenticated user.');

  const payload = buildWorkerProfilePayload(userId, source);
  const { error: workerError } = await supabase
    .from('worker_profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (workerError) throw workerError;

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        is_worker: true,
        updated_at: getTimestamp(),
      },
      { onConflict: 'user_id' }
    );

  if (profileError) throw profileError;

  return fetchUserProfileBundle(userId);
};

export const signInWithEmail = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session?.user || data.user || null;
};

export const signUpWithEmail = async (formData = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name || '',
        phone_number: formData.phoneNumber || '',
        province: formData.province || '',
        city: formData.city || '',
        barangay: formData.barangay || '',
        address: formData.address || '',
        bio: formData.bio || '',
        profile_photo: formData.profilePhoto || '',
        is_client: true,
        is_worker: false,
      },
    },
  });

  if (error) throw error;

  if (!data.session?.user) {
    throw new Error('Account created. Please check your email to verify your account, then log in.');
  }

  const profile = await upsertClientProfile(data.session.user, formData);
  return {
    user: data.session.user,
    profile,
  };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const syncAuthenticatedUserProfile = async (user, source = {}) => {
  const profile = await upsertClientProfile(user, source);
  return profile;
};

export const syncWorkerSetup = async (userId, source = {}) => {
  const profile = await upsertWorkerProfile(userId, source);
  return profile;
};
