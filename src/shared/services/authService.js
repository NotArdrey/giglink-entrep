import { supabase } from './supabaseClient';

const PROFILE_PHOTO_BUCKET = 'profile-photos';

const getCleanString = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const normalizeEmail = (value) => getCleanString(value).toLowerCase();

const getNullableString = (value) => {
  const cleanValue = getCleanString(value);
  return cleanValue.length > 0 ? cleanValue : null;
};

const getNullableNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const splitNameParts = (value = '') => {
  const parts = getCleanString(value).split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: '', middleName: '', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' };
  }

  if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1] };
  }

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
};

const buildDisplayName = ({ firstName = '', middleName = '', lastName = '' } = {}) =>
  [firstName, middleName, lastName].map(getCleanString).filter(Boolean).join(' ').trim();

const readNameField = (source = {}, keys = []) => {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return '';
};

const resolveNameParts = (source = {}, metadata = {}, existingProfile = null) => {
  const explicitFirst = readNameField(source, ['firstName', 'first_name']) || readNameField(metadata, ['first_name']);
  const explicitMiddle = readNameField(source, ['middleName', 'middle_name']) || readNameField(metadata, ['middle_name']);
  const explicitLast = readNameField(source, ['lastName', 'last_name']) || readNameField(metadata, ['last_name']);

  if (explicitFirst || explicitMiddle || explicitLast) {
    return {
      firstName: explicitFirst,
      middleName: explicitMiddle,
      lastName: explicitLast,
    };
  }

  const fallbackName = readNameField(source, ['fullName', 'name'])
    || readNameField(metadata, ['full_name', 'name'])
    || readNameField(existingProfile || {}, ['full_name']);

  return splitNameParts(fallbackName);
};

const VALID_ROLES = ['client', 'worker', 'admin'];

const getNormalizedRole = (value, fallback = 'client') => {
  const candidate = getCleanString(value).toLowerCase();
  if (VALID_ROLES.includes(candidate)) return candidate;
  return fallback;
};

const toReadableDatabaseSetupError = (error) => {
  const message = String(error?.message || '');
  if (/Could not find the table 'public\.profiles' in the schema cache/i.test(message)) {
    return new Error('Database setup incomplete: table public.profiles is not available to the API yet. Run supabase/schema.sql in the same project and ensure schema "public" is exposed in API settings.');
  }
  return error;
};

const getTimestamp = () => new Date().toISOString();

const buildMetadataFromProfileFields = (fields = {}) => {
  const metadata = {};

  if (fields.firstName !== undefined) metadata.first_name = fields.firstName;
  if (fields.middleName !== undefined) metadata.middle_name = fields.middleName;
  if (fields.lastName !== undefined) metadata.last_name = fields.lastName;
  if (fields.fullName !== undefined) metadata.full_name = fields.fullName;
  if (metadata.full_name === undefined && (metadata.first_name || metadata.middle_name || metadata.last_name)) {
    metadata.full_name = buildDisplayName({
      firstName: metadata.first_name,
      middleName: metadata.middle_name,
      lastName: metadata.last_name,
    });
  }
  if (fields.phoneNumber !== undefined) metadata.phone_number = fields.phoneNumber;
  if (fields.profilePhoto !== undefined) metadata.profile_photo = fields.profilePhoto;
  if (fields.bio !== undefined) metadata.bio = fields.bio;
  if (fields.province !== undefined) metadata.province = fields.province;
  if (fields.city !== undefined) metadata.city = fields.city;
  if (fields.barangay !== undefined) metadata.barangay = fields.barangay;
  if (fields.address !== undefined) metadata.address = fields.address;

  return metadata;
};

const buildLocationPayload = (source = {}) => ({
  province: getNullableString(source.province),
  city: getNullableString(source.city),
  barangay: getNullableString(source.barangay),
  address: getNullableString(source.address),
});

const buildProfilePayload = (user, source = {}, existingProfile = null) => {
  const metadata = user?.user_metadata || {};
  const location = buildLocationPayload({
    province: source.province ?? metadata.province ?? existingProfile?.province,
    city: source.city ?? metadata.city ?? existingProfile?.city,
    barangay: source.barangay ?? metadata.barangay ?? existingProfile?.barangay,
    address: source.address ?? metadata.address ?? existingProfile?.address,
  });
  const nameParts = resolveNameParts(source, metadata, existingProfile);
  const fullName = buildDisplayName(nameParts) || readNameField(source, ['fullName', 'name']) || readNameField(metadata, ['full_name', 'name']) || user.email?.split('@')[0] || 'GigLink User';
  const resolvedRole = getNormalizedRole(
    source.role
      || metadata.role
      || existingProfile?.role
      || (source.isWorker ?? metadata.is_worker ?? existingProfile?.is_worker ? 'worker' : 'client'),
    'client'
  );

  return {
    user_id: user.id,
    first_name: getNullableString(nameParts.firstName),
    middle_name: getNullableString(nameParts.middleName),
    last_name: getNullableString(nameParts.lastName),
    full_name: getNullableString(fullName) || 'GigLink User',
    email: user.email,
    phone_number: getNullableString(source.phoneNumber ?? metadata.phone_number ?? existingProfile?.phone_number),
    profile_photo: getNullableString(source.profilePhoto ?? metadata.profile_photo ?? existingProfile?.profile_photo),
    bio: getNullableString(source.bio ?? metadata.bio ?? existingProfile?.bio),
    province: location.province,
    city: location.city,
    barangay: location.barangay,
    address: location.address,
    is_client: true,
    is_worker: Boolean(source.isWorker ?? metadata.is_worker ?? existingProfile?.is_worker ?? false),
    role: resolvedRole,
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

const ensureWorkerProfileBaseRow = async (userId, source = {}) => {
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingProfileError) throw toReadableDatabaseSetupError(existingProfileError);

  const existingFullName = getNullableString(existingProfile?.full_name);
  const existingEmail = getNullableString(existingProfile?.email);

  if (existingFullName && existingEmail) {
    return;
  }

  let resolvedEmail = existingEmail || normalizeEmail(source.email || '');
  if (!resolvedEmail) {
    const { data: userData, error: authUserError } = await supabase.auth.getUser();
    if (authUserError) throw authUserError;
    resolvedEmail = normalizeEmail(userData?.user?.email || '');
  }

  if (!resolvedEmail) {
    throw new Error('Unable to complete seller setup because the account email is missing. Please log out and log back in, then try again.');
  }

  const resolvedFullName =
    existingFullName
    || buildDisplayName(resolveNameParts(source, {}, { full_name: existingFullName }))
    || getNullableString(source.fullName || source.name)
    || resolvedEmail.split('@')[0]
    || 'GigLink User';

  const nameParts = resolveNameParts(source, {}, { full_name: existingFullName });

  const { error: profileUpsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        first_name: getNullableString(nameParts.firstName),
        middle_name: getNullableString(nameParts.middleName),
        last_name: getNullableString(nameParts.lastName),
        full_name: resolvedFullName,
        email: resolvedEmail,
        is_client: true,
        is_worker: true,
        role: 'worker',
        updated_at: getTimestamp(),
      },
      { onConflict: 'user_id' }
    );

  if (profileUpsertError) throw toReadableDatabaseSetupError(profileUpsertError);
};

const mapLocation = (profileRow) => ({
  province: profileRow?.province || '',
  city: profileRow?.city || '',
  barangay: profileRow?.barangay || '',
  address: profileRow?.address || '',
});

const mapAppProfile = (profileRow = null, workerRow = null) => {
  if (!profileRow && !workerRow) return null;

  const location = mapLocation(profileRow);

  const resolvedRole = getNormalizedRole(
    profileRow?.role || (profileRow?.is_worker || workerRow ? 'worker' : 'client'),
    'client'
  );

  return {
    userId: profileRow?.user_id || workerRow?.user_id || null,
    firstName: profileRow?.first_name || splitNameParts(profileRow?.full_name || '').firstName,
    middleName: profileRow?.middle_name || splitNameParts(profileRow?.full_name || '').middleName,
    lastName: profileRow?.last_name || splitNameParts(profileRow?.full_name || '').lastName,
    fullName: buildDisplayName({
      firstName: profileRow?.first_name || splitNameParts(profileRow?.full_name || '').firstName,
      middleName: profileRow?.middle_name || splitNameParts(profileRow?.full_name || '').middleName,
      lastName: profileRow?.last_name || splitNameParts(profileRow?.full_name || '').lastName,
    }) || profileRow?.full_name || '',
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
    role: resolvedRole,
    isAdmin: resolvedRole === 'admin',
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

  if (profileError) throw toReadableDatabaseSetupError(profileError);

  const { data: workerRow, error: workerError } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (workerError) throw toReadableDatabaseSetupError(workerError);

  return mapAppProfile(profileRow, workerRow);
};

export const upsertClientProfile = async (user, source = {}) => {
  if (!user?.id) throw new Error('Missing authenticated user.');

  const { data: existingProfile, error: existingError } = await supabase
    .from('profiles')
    .select('is_worker, role, full_name, phone_number, profile_photo, bio, province, city, barangay, address')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingError) throw toReadableDatabaseSetupError(existingError);

  const payload = buildProfilePayload(user, source, existingProfile);
  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) throw toReadableDatabaseSetupError(error);

  return fetchUserProfileBundle(user.id);
};

export const updateUserProfileFields = async (user, fields = {}) => {
  if (!user?.id) throw new Error('Missing authenticated user.');

  const currentProfile = await fetchUserProfileBundle(user.id);
  const resolvedEmail = normalizeEmail(
    currentProfile?.email
    || user.email
    || user.user_metadata?.email
    || user.user_metadata?.public_email
    || ''
  );

  if (!resolvedEmail) {
    throw new Error('Unable to save profile because the account email is missing. Please log out and log back in, then try again.');
  }

  const mergedLocation = buildLocationPayload({
    province: fields.province ?? currentProfile?.province,
    city: fields.city ?? currentProfile?.city,
    barangay: fields.barangay ?? currentProfile?.barangay,
    address: fields.address ?? currentProfile?.address,
  });

  const payload = {
    user_id: user.id,
    first_name: getNullableString(fields.firstName ?? currentProfile?.firstName),
    middle_name: getNullableString(fields.middleName ?? currentProfile?.middleName),
    last_name: getNullableString(fields.lastName ?? currentProfile?.lastName),
    full_name: getNullableString(
      fields.fullName
      ?? buildDisplayName({
        firstName: fields.firstName ?? currentProfile?.firstName,
        middleName: fields.middleName ?? currentProfile?.middleName,
        lastName: fields.lastName ?? currentProfile?.lastName,
      })
      ?? currentProfile?.fullName
      ?? user.user_metadata?.full_name
      ?? user.user_metadata?.name
    ),
    email: resolvedEmail,
    phone_number: getNullableString(fields.phoneNumber ?? currentProfile?.phoneNumber),
    profile_photo: getNullableString(fields.profilePhoto ?? currentProfile?.profilePhoto),
    bio: getNullableString(fields.bio ?? currentProfile?.bio),
    province: mergedLocation.province,
    city: mergedLocation.city,
    barangay: mergedLocation.barangay,
    address: mergedLocation.address,
    is_client: currentProfile?.isClient !== false,
    is_worker: Boolean(currentProfile?.isWorker),
    role: currentProfile?.role || 'client',
    updated_at: getTimestamp(),
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) throw toReadableDatabaseSetupError(error);

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: buildMetadataFromProfileFields(fields),
  });

  if (authUpdateError) throw authUpdateError;

  return fetchUserProfileBundle(user.id);
};

export const updateUserPassword = async ({ email, currentPassword, newPassword }) => {
  const normalizedEmail = normalizeEmail(email);
  const cleanCurrentPassword = typeof currentPassword === 'string' ? currentPassword : '';
  const cleanNewPassword = typeof newPassword === 'string' ? newPassword : '';

  if (!normalizedEmail) throw new Error('Missing account email.');
  if (!cleanCurrentPassword || !cleanNewPassword) throw new Error('Please complete all password fields.');

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: cleanCurrentPassword,
  });

  if (signInError) {
    throw new Error('Current password is incorrect.');
  }

  const { error: passwordError } = await supabase.auth.updateUser({
    password: cleanNewPassword,
  });

  if (passwordError) throw passwordError;

  return true;
};

export const upsertWorkerProfile = async (userId, source = {}) => {
  if (!userId) throw new Error('Missing authenticated user.');

  await ensureWorkerProfileBaseRow(userId, source);

  const payload = buildWorkerProfilePayload(userId, source);
  const { error: workerError } = await supabase
    .from('worker_profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (workerError) throw toReadableDatabaseSetupError(workerError);

  const { data: currentProfileRole, error: currentRoleError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (currentRoleError) throw toReadableDatabaseSetupError(currentRoleError);

  const nextRole = getNormalizedRole(currentProfileRole?.role, 'client') === 'admin' ? 'admin' : 'worker';

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      is_worker: true,
      role: nextRole,
      updated_at: getTimestamp(),
    })
    .eq('user_id', userId);

  if (profileError) throw toReadableDatabaseSetupError(profileError);

  return fetchUserProfileBundle(userId);
};

export const signInWithEmail = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const cleanPassword = typeof password === 'string' ? password : '';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: cleanPassword,
  });

  if (error) {
    const message = String(error?.message || '');
    if (/email not confirmed/i.test(message)) {
      throw new Error('Email not verified yet. Please verify your email first, then log in.');
    }
    if (/invalid login credentials/i.test(message)) {
      throw new Error('Invalid login credentials. Check your email/password. If you just signed up, verify your email first.');
    }
    throw error;
  }

  return data.session?.user || data.user || null;
};

export const signUpWithEmail = async (formData = {}) => {
  const normalizedEmail = normalizeEmail(formData.email);
  const cleanPassword = typeof formData.password === 'string' ? formData.password : '';

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: cleanPassword,
    options: {
      data: {
        first_name: formData.firstName || '',
        middle_name: formData.middleName || '',
        last_name: formData.lastName || '',
        full_name: buildDisplayName({
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
        }) || formData.name || '',
        phone_number: formData.phoneNumber || '',
        province: formData.province || '',
        city: formData.city || '',
        barangay: formData.barangay || '',
        address: formData.address || '',
        bio: formData.bio || '',
        profile_photo: formData.profilePhoto || '',
        is_client: true,
        is_worker: false,
        role: 'client',
      },
    },
  });

  if (error) throw error;

  if (!data.session?.user) {
    return {
      user: data.user || null,
      profile: null,
      requiresEmailVerification: true,
    };
  }

  const profile = await upsertClientProfile(data.session.user, formData);
  return {
    user: data.session.user,
    profile,
    requiresEmailVerification: false,
  };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resendSignupVerificationEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Please enter your email address first.');
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalizedEmail,
  });

  if (error) throw error;
};

export const sendPasswordResetEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Please enter your email address.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
  });

  if (error) throw error;
};

export const syncAuthenticatedUserProfile = async (user, source = {}) => {
  if (!user?.id) throw new Error('Missing authenticated user.');

  const existingProfile = await fetchUserProfileBundle(user.id);
  const hasSourceUpdates = Object.keys(source || {}).length > 0;

  if (existingProfile && !hasSourceUpdates) {
    return existingProfile;
  }

  const profile = await upsertClientProfile(user, source);
  return profile;
};

export const syncWorkerSetup = async (userId, source = {}) => {
  const profile = await upsertWorkerProfile(userId, source);
  return profile;
};

export const uploadProfilePhoto = async ({ userId, file }) => {
  if (!userId) throw new Error('Missing authenticated user.');
  if (!file) throw new Error('No profile photo file selected.');

  const fileType = String(file.type || '').toLowerCase();
  if (!fileType.startsWith('image/')) {
    throw new Error('Please upload a valid image file.');
  }

  const sanitizedName = String(file.name || 'profile-photo')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase();
  const extension = sanitizedName.includes('.') ? sanitizedName.split('.').pop() : 'jpg';
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error: uploadError } = await supabase
    .storage
    .from(PROFILE_PHOTO_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

  if (uploadError) {
    throw new Error(
      'Unable to upload profile photo to Supabase Storage. Ensure bucket "profile-photos" exists and has upload/read policies for authenticated users.'
    );
  }

  const { data: publicUrlData } = supabase
    .storage
    .from(PROFILE_PHOTO_BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    throw new Error('Profile photo uploaded but no public URL was returned.');
  }

  return `${publicUrl}?v=${Date.now()}`;
};
