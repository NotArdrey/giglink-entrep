import { supabase } from './supabaseClient';

const STORAGE_KEY = 'giglink.identitySignup.v1';

export const DIDIT_DOCUMENT_TYPES = [
  { key: 'id_card', label: 'National ID / ID card', mode: 'didit' },
  { key: 'passport', label: 'Passport', mode: 'didit' },
  { key: 'drivers_license', label: "Driver's license", mode: 'didit' },
];

export const MANUAL_DOCUMENT_TYPES = [
  { key: 'umid', label: 'UMID', mode: 'manual' },
  { key: 'postal_id', label: 'Postal ID', mode: 'manual' },
  { key: 'voter_id', label: "Voter's ID", mode: 'manual' },
  { key: 'prc_id', label: 'PRC ID', mode: 'manual' },
  { key: 'health_insurance', label: 'Health insurance ID', mode: 'manual' },
  { key: 'custom_document', label: 'Other government document', mode: 'manual' },
];

export const IDENTITY_DOCUMENT_TYPES = [...DIDIT_DOCUMENT_TYPES, ...MANUAL_DOCUMENT_TYPES];

export const IDENTITY_STATUS = {
  ACTIVE: ['PENDING', 'NOT_STARTED', 'IN_PROGRESS', 'PROCESSING', 'SUBMITTED', 'STARTED', 'CREATED'],
  APPROVED: 'APPROVED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  TERMINAL_FAILURE: ['DECLINED', 'REJECTED', 'DENIED', 'ABANDONED', 'EXPIRED', 'CANCELLED', 'CANCELED', 'KYC_EXPIRED'],
};

const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

export const normalizeEmail = (value) => cleanString(value).toLowerCase();

export const getDocumentType = (key) =>
  IDENTITY_DOCUMENT_TYPES.find((item) => item.key === key) || IDENTITY_DOCUMENT_TYPES[0];

export const getIdentityRoleFromAppRole = (role) => (role === 'worker' ? 'musician' : 'fan');

export const getAppRoleFromIdentityRole = (role) => (role === 'musician' ? 'worker' : 'client');

export const normalizeIdentityStatus = (value) => {
  const normalized = cleanString(value).replace(/[\s-]+/g, '_').toUpperCase();
  if (!normalized) return 'PENDING';
  if (['APPROVED'].includes(normalized)) return 'APPROVED';
  if (['IN_REVIEW', 'PENDING_REVIEW', 'PENDING_MANUAL_REVIEW', 'MANUAL_REVIEW'].includes(normalized)) {
    return 'PENDING_REVIEW';
  }
  if (['DECLINED', 'REJECTED', 'DENIED'].includes(normalized)) return 'DECLINED';
  if (['ABANDONED', 'EXPIRED', 'CANCELLED', 'CANCELED', 'KYC_EXPIRED'].includes(normalized)) {
    return normalized === 'CANCELED' ? 'CANCELLED' : normalized;
  }
  if (['NOT_STARTED', 'IN_PROGRESS', 'PENDING', 'PROCESSING', 'SUBMITTED', 'STARTED', 'CREATED'].includes(normalized)) {
    return 'PENDING';
  }
  return normalized;
};

export const isTerminalIdentityFailure = (status) =>
  IDENTITY_STATUS.TERMINAL_FAILURE.includes(normalizeIdentityStatus(status));

export const isActiveIdentityStatus = (status) =>
  IDENTITY_STATUS.ACTIVE.includes(normalizeIdentityStatus(status));

const getWindowOrigin = () => (typeof window === 'undefined' ? '' : window.location.origin);

export const getIdentityRedirectUrl = () => `${getWindowOrigin()}/?check_verification=true#identity-register`;

const buildTempSignupRef = () => {
  const suffix = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `TEMP_WEB_SIGNUP_${suffix}`;
};

export const saveIdentitySignupState = (state) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...state,
    savedAt: new Date().toISOString(),
  }));
};

export const loadIdentitySignupState = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to read identity signup state:', error);
    return null;
  }
};

export const clearIdentitySignupState = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
};

const invokeFunction = async (functionName, body) => {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    throw new Error(error.message || `Unable to call ${functionName}.`);
  }

  if (data?.success === false || data?.error) {
    throw new Error(data.error || `Unable to complete ${functionName}.`);
  }

  return data || {};
};

export const startDiditIdentitySession = async (formData) => {
  const normalizedEmail = normalizeEmail(formData.email);
  const appRole = formData.accountRole === 'worker' ? 'worker' : 'client';
  const identityRole = getIdentityRoleFromAppRole(appRole);
  const documentType = getDocumentType(formData.documentTypeKey);
  const tempUserRef = formData.tempUserRef || buildTempSignupRef();

  const data = await invokeFunction('create-didit-session', {
    userId: tempUserRef,
    email: normalizedEmail,
    role: identityRole,
    app_role: appRole,
    document_type: documentType.key,
    redirect_url: getIdentityRedirectUrl(),
    callback: getIdentityRedirectUrl(),
    existing_session_id: formData.existingSessionId || undefined,
  });

  const sessionId = data.sessionId || data.session_id;
  const verificationUrl = data.verificationUrl || data.verification_url || data.url;

  if (!sessionId || !verificationUrl) {
    throw new Error('Didit did not return a usable verification session.');
  }

  const nextState = {
    tempUserRef,
    email: normalizedEmail,
    password: formData.password,
    fullName: formData.fullName,
    appRole,
    identityRole,
    documentTypeKey: documentType.key,
    documentTypeLabel: documentType.label,
    diditSessionId: sessionId,
    sessionNonce: data.sessionNonce || data.session_nonce || '',
    verificationUrl,
    workflowId: data.workflowId || data.workflow_id || null,
  };

  saveIdentitySignupState(nextState);
  return nextState;
};

export const fetchDiditIdentitySession = async (sessionId) => {
  if (!sessionId) throw new Error('Missing Didit session.');

  const data = await invokeFunction('create-didit-session', {
    action: 'get_session',
    session_id: sessionId,
  });

  const status = normalizeIdentityStatus(
    data.businessStatus
      || data.diditResolvedStatus
      || data.status
      || data.verification_data?.status
      || data.rawDiditStatus
  );

  return { ...data, status };
};

export const finishDiditIdentitySignup = async (state, status) => {
  if (!state?.diditSessionId) throw new Error('Missing Didit session.');

  const data = await invokeFunction('create-unverified-user', {
    email: state.email,
    password: state.password,
    role: state.identityRole,
    appRole: state.appRole || getAppRoleFromIdentityRole(state.identityRole),
    fullName: state.fullName,
    diditSessionId: state.diditSessionId,
    sessionNonce: state.sessionNonce,
    selectedDocumentType: state.documentTypeLabel,
    selectedDocumentTypeKey: state.documentTypeKey,
    verificationMode: 'didit',
    redirectTo: `${getWindowOrigin()}/#login`,
    diditStatus: normalizeIdentityStatus(status),
  });

  clearIdentitySignupState();
  return data;
};

const fileToImagePayload = (file) => new Promise((resolve, reject) => {
  if (!file) {
    resolve(null);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result || '');
    const extension = cleanString(file.name).split('.').pop() || 'jpg';
    resolve({
      base64: result,
      mimeType: file.type || 'image/jpeg',
      fileName: file.name || `identity-${Date.now()}.${extension}`,
      extension,
    });
  };
  reader.onerror = () => reject(new Error(`Unable to read ${file.name || 'selected image'}.`));
  reader.readAsDataURL(file);
});

export const submitManualIdentityReview = async (formData) => {
  const appRole = formData.accountRole === 'worker' ? 'worker' : 'client';
  const identityRole = getIdentityRoleFromAppRole(appRole);
  const documentType = getDocumentType(formData.documentTypeKey);
  const [frontImage, backImage, selfieImage] = await Promise.all([
    fileToImagePayload(formData.frontImage),
    fileToImagePayload(formData.backImage),
    fileToImagePayload(formData.selfieImage),
  ]);

  const data = await invokeFunction('manual-identity-review', {
    action: 'submit_manual_review_signup',
    email: normalizeEmail(formData.email),
    password: formData.password,
    role: identityRole,
    appRole,
    fullName: formData.manualFullName || formData.fullName,
    documentType: documentType.label,
    documentTypeKey: documentType.key,
    identityDocumentNumber: formData.identityDocumentNumber,
    idDocumentExpiry: formData.idDocumentExpiry,
    frontImage,
    backImage,
    selfieImage,
    source: 'MANUAL_UPLOAD',
  });

  clearIdentitySignupState();
  return data;
};
