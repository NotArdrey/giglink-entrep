import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../../shared/services/supabaseClient';
import {
  createWorkerService,
  getAuthenticatedWorkUser,
  loadWorkerProfileServices,
  mapSellerRowToUiProfile,
  mapServiceRowToWorkerService,
  subscribeToWorkProfileChanges,
  updateWorkerProfile,
} from '../services/workerService';

const DEFAULT_NEW_SERVICE = {
  title: '',
  shortDescription: '',
  basePrice: '',
  priceType: 'fixed',
  rateBasis: 'per-project',
  bookingMode: 'with-slots',
  currency: 'PHP',
  durationMinutes: '',
};

export const useWorkProfileServices = ({ sellerProfile } = {}) => {
  const [authUser, setAuthUser] = useState(null);
  const [workerServices, setWorkerServices] = useState([]);
  const [activeServiceIndex] = useState(0);
  const [sellerData, setSellerData] = useState(null);
  const [workerProfileBundle, setWorkerProfileBundle] = useState(null);
  const [sellerDbServices, setSellerDbServices] = useState([]);
  const [isLoadingSellerData, setIsLoadingSellerData] = useState(true);
  const [sellerDataError, setSellerDataError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [newService, setNewService] = useState(DEFAULT_NEW_SERVICE);
  const sellerDataRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    getAuthenticatedWorkUser()
      .then((user) => {
        if (isMounted) setAuthUser(user);
      })
      .catch((error) => {
        console.error('Unable to resolve authenticated work user:', error);
        if (isMounted) setAuthUser(null);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const refreshWorkData = useCallback(async () => {
    if (!authUser?.id) {
      setIsLoadingSellerData(false);
      return;
    }

    try {
      setIsLoadingSellerData(true);
      setSellerDataError(null);

      const result = await loadWorkerProfileServices({
        userId: authUser.id,
        fallbackProfile: sellerProfile,
      });

      setSellerData(result.sellerData);
      sellerDataRef.current = result.sellerData;
      setWorkerProfileBundle(result.workerProfileBundle);
      setSellerDbServices(result.sellerDbServices);
      setWorkerServices(result.workerServices);
    } catch (error) {
      console.error('Failed to load seller data:', error);
      setSellerDataError(error?.message || 'Failed to load seller profile');
    } finally {
      setIsLoadingSellerData(false);
    }
  }, [authUser?.id, sellerProfile]);

  useEffect(() => {
    refreshWorkData();
  }, [refreshWorkData]);

  const sellerId = sellerData?.user_id || sellerData?.id || authUser?.id || null;

  useEffect(() => {
    if (!sellerId) return undefined;

    return subscribeToWorkProfileChanges({
      sellerId,
      onSellerChange: (payload) => {
        const row = payload.new || payload.record || null;
        if (!row) return;
        setSellerData(row);
        sellerDataRef.current = row;
      },
      onServiceChange: (payload) => {
        const eventType = payload.eventType || payload.event || payload.type || '';
        const row = payload.new || payload.record || null;
        const oldRow = payload.old || null;

        if ((eventType === 'INSERT' || eventType === 'UPDATE') && row) {
          setSellerDbServices((prev) => {
            const others = (prev || []).filter((service) => service.id !== row.id);
            return [row, ...others];
          });
          setWorkerServices((prev) => {
            const sellerSnapshot = sellerDataRef.current || {};
            const mapped = mapServiceRowToWorkerService(row, sellerSnapshot, sellerProfile);
            const others = (prev || []).filter((service) => service.raw?.id !== row.id);
            return [mapped, ...others];
          });
        }

        if (eventType === 'DELETE') {
          const idToRemove = oldRow?.id || payload.record?.id;
          setSellerDbServices((prev) => (prev || []).filter((service) => service.id !== idToRemove));
          setWorkerServices((prev) => (prev || []).filter((service) => service.raw?.id !== idToRemove));
        }
      },
    });
  }, [sellerId, sellerProfile]);

  const sellerUiProfile = useMemo(
    () => mapSellerRowToUiProfile(sellerData, workerProfileBundle, sellerProfile),
    [sellerData, workerProfileBundle, sellerProfile]
  );

  const currentProfile = workerServices[activeServiceIndex] || sellerUiProfile || sellerProfile || {
    fullName: sellerProfile?.fullName || 'Service Provider',
    serviceType: sellerProfile?.serviceType || 'Service',
    location: sellerProfile?.location || { barangay: '', city: '', province: '' },
    bookingMode: sellerProfile?.bookingMode || 'with-slots',
  };

  const hasSellerRecord = Boolean(
    sellerData?.user_id ||
    sellerData?.display_name ||
    sellerProfile?.isWorker ||
    sellerProfile?.role === 'worker' ||
    sellerProfile?.role === 'admin'
  );
  const hasService = (workerServices || []).length > 0;
  const showSetupBanner = !isLoadingSellerData && !hasSellerRecord;

  const closeCreateService = useCallback(() => setIsCreateServiceOpen(false), []);

  const handleCreateServiceChange = useCallback((field, value) => {
    setNewService((previous) => ({ ...previous, [field]: value }));
  }, []);

  const handleCreateServiceSubmit = useCallback(async () => {
    if (!sellerId) {
      setSellerDataError('Seller record missing. Complete onboarding first.');
      return;
    }

    try {
      const payload = {
        title: newService.title,
        shortDescription: newService.shortDescription,
        basePrice: Number(newService.basePrice) || null,
        priceType: newService.priceType,
        currency: newService.currency || 'PHP',
        durationMinutes: newService.durationMinutes ? Number(newService.durationMinutes) : null,
        metadata: {
          createdVia: 'ui',
          rate_basis: newService.rateBasis || 'per-project',
          booking_mode: newService.bookingMode || 'with-slots',
        },
      };

      const created = await createWorkerService({
        sellerId,
        serviceData: payload,
        sellerData,
        fallbackProfile: sellerProfile,
      });

      setSellerDbServices((prev) => [created.raw, ...(prev || [])]);
      setWorkerServices((prev) => [created.mapped, ...(prev || [])]);
      setNewService(DEFAULT_NEW_SERVICE);
      setSuccessMessage('Service created successfully');
      window.setTimeout(() => setSuccessMessage(''), 3000);
      closeCreateService();
      return created.raw;
    } catch (error) {
      console.error('Create service failed:', error);
      setSellerDataError(error?.message || 'Failed to create service');
      return null;
    }
  }, [closeCreateService, newService, sellerData, sellerId, sellerProfile]);

  const handleSaveProfileEdit = useCallback(async (updatedData) => {
    try {
      const merged = await updateWorkerProfile({
        userId: authUser?.id,
        profileData: updatedData,
      });

      if (merged) setWorkerProfileBundle(merged);

      setWorkerServices((prev) => {
        const next = [...(prev || [])];
        next[activeServiceIndex] = {
          ...next[activeServiceIndex],
          ...updatedData,
        };
        return next;
      });

      setSuccessMessage('Profile updated');
      window.setTimeout(() => setSuccessMessage(''), 3000);
      return merged;
    } catch (error) {
      console.error('Failed to save profile edit:', error);
      setSellerDataError(error?.message || 'Failed to update profile');
      return null;
    }
  }, [activeServiceIndex, authUser?.id]);

  return {
    activeServiceIndex,
    authUser,
    closeCreateService,
    currentProfile,
    handleCreateServiceChange,
    handleCreateServiceSubmit,
    handleSaveProfileEdit,
    hasSellerRecord,
    hasService,
    isCreateServiceOpen,
    isLoadingSellerData,
    newService,
    refreshWorkData,
    sellerData,
    sellerDataError,
    sellerDbServices,
    sellerId,
    sellerUiProfile,
    setIsCreateServiceOpen,
    setSellerDataError,
    setSuccessMessage,
    showSetupBanner,
    successMessage,
    workerProfileBundle,
    workerServices,
  };
};

export default useWorkProfileServices;
