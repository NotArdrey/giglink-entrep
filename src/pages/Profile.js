import { useEffect, useRef, useState } from 'react';
import DigitalPortfolioModal from '../components/DigitalPortfolioModal';

function Profile({ sellerProfile, userLocation, onManageAccount, onBackToDashboard, onUpdateProfile }) {
  const fallbackName = 'Juan Dela Cruz';
  const fallbackBio = 'Dedicated service provider focused on quality, punctuality, and client satisfaction.';
  const fallbackPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';

  const [displayName, setDisplayName] = useState(sellerProfile?.fullName || fallbackName);
  const [displayBio, setDisplayBio] = useState(sellerProfile?.bio || fallbackBio);
  const [profilePhoto, setProfilePhoto] = useState(sellerProfile?.profilePhoto || fallbackPhoto);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [draftName, setDraftName] = useState(displayName);
  const [draftBio, setDraftBio] = useState(displayBio);
  const [isPhotoSourceOpen, setIsPhotoSourceOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isHeadingHovered, setIsHeadingHovered] = useState(false);
  const [isManageHovered, setIsManageHovered] = useState(false);
  const [isPortfolioHovered, setIsPortfolioHovered] = useState(false);

  const cameraInputRef = useRef(null);
  const deviceInputRef = useRef(null);

  useEffect(() => {
    const nextName = sellerProfile?.fullName || fallbackName;
    const nextBio = sellerProfile?.bio || fallbackBio;
    const nextPhoto = sellerProfile?.profilePhoto || fallbackPhoto;
    setDisplayName(nextName);
    setDisplayBio(nextBio);
    setProfilePhoto(nextPhoto);
    setDraftName(nextName);
    setDraftBio(nextBio);
  }, [sellerProfile?.fullName, sellerProfile?.bio, sellerProfile?.profilePhoto]);

  const localizedAddress = userLocation
    ? `${userLocation.barangay || 'Sabang'}, ${userLocation.city || 'Baliwag'}, ${userLocation.province || 'Bulacan'}`
    : 'Sabang, Baliwag, Bulacan';

  const isVerifiedWorker = Boolean(sellerProfile?.serviceType);

  const saveName = () => {
    const nextName = draftName.trim() || fallbackName;
    setDisplayName(nextName);
    setIsEditingName(false);
    onUpdateProfile && onUpdateProfile({ fullName: nextName });
  };

  const saveBio = () => {
    const nextBio = draftBio.trim() || fallbackBio;
    setDisplayBio(nextBio);
    setIsEditingBio(false);
    onUpdateProfile && onUpdateProfile({ bio: nextBio });
  };

  const handleImageSelection = async (event) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = typeof reader.result === 'string' ? reader.result : fallbackPhoto;
      setProfilePhoto(imageDataUrl);
      onUpdateProfile && onUpdateProfile({ profilePhoto: imageDataUrl });
    };
    reader.readAsDataURL(selectedFile);

    setIsPhotoSourceOpen(false);
    event.target.value = '';
  };

  const styles = {
    page: { minHeight: '100vh', background: '#ffffff', color: '#2c3e50', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    header: { backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' },
    backBtn: { border: `1px solid ${isBackHovered ? '#2563eb' : '#e5e7eb'}`, background: isBackHovered ? '#f9f9f9' : 'transparent', color: isBackHovered ? '#2563eb' : '#2c3e50', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' },
    title: { fontSize: '24px', fontWeight: 700, margin: 0, color: '#2c3e50' },
    headerSpacer: { width: '92px' },
    main: { maxWidth: '800px', margin: '0 auto', padding: '32px 16px' },
    card: { width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', padding: '32px' },
    hero: { textAlign: 'center', margin: '0 0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    profilePhotoButton: { border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
    profilePhoto: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e5e7eb', display: 'block', margin: '0 auto' },
    profilePhotoEdit: { fontSize: '12px', fontWeight: 700, color: '#2563eb' },
    inlineEditRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', justifyContent: 'center', flexWrap: 'wrap' },
    inlineEditInput: { minWidth: '260px', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 10px', fontSize: '16px' },
    inlineEditSave: { border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontWeight: 700, background: '#2563eb', color: '#ffffff' },
    inlineEditCancel: { border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontWeight: 700, background: '#e5e7eb', color: '#1f2937' },
    editableHeading: { margin: '12px 0 8px', color: isHeadingHovered ? '#2563eb' : '#1f2937', cursor: 'pointer' },
    verifiedBadge: { display: 'inline-block', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '999px', padding: '6px 12px', fontSize: '12px', fontWeight: 700 },
    profileSection: { marginBottom: '18px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#f8fafc' },
    portfolioSection: { background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', border: '2px solid #bfdbfe' },
    h2: { margin: '0 0 8px', color: '#2c3e50', fontSize: '18px' },
    h2Portfolio: { margin: '0 0 8px', color: '#0c4a6e', fontSize: '18px' },
    sectionHeadingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
    sectionEditBtn: { border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: '#1f2937', padding: '4px 10px', fontWeight: 700, cursor: 'pointer' },
    bioEditWrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
    bioEditInput: { border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', resize: 'vertical', minHeight: '90px' },
    bioEditActions: { display: 'flex', gap: '8px' },
    paragraph: { margin: 0, color: '#4b5563', lineHeight: 1.55 },
    portfolioParagraph: { margin: 0, color: '#1e40af', lineHeight: 1.55 },
    generatePortfolioBtn: { width: '100%', border: 'none', borderRadius: '8px', padding: '12px', background: isPortfolioHovered ? '#1d4ed8' : '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginTop: '8px', transition: 'all 0.3s ease', transform: isPortfolioHovered ? 'translateY(-2px)' : 'translateY(0)', boxShadow: isPortfolioHovered ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none' },
    manageAccountBtn: { width: '100%', border: 'none', borderRadius: '10px', padding: '14px', background: isManageHovered ? '#1f3042' : '#2c3e50', color: '#ffffff', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
    photoSourceOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 220 },
    photoSourceModal: { width: 'min(360px, 90vw)', background: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.2)' },
    modalTitle: { margin: '0 0 8px' },
    modalText: { margin: '0 0 12px', color: '#4b5563' },
    photoSourceActions: { display: 'grid', gap: '8px' },
    photoActionBtn: { border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: 700, background: '#2563eb', color: '#ffffff' },
    cancelBtn: { border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: 700, background: '#e5e7eb', color: '#1f2937' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
          onClick={onBackToDashboard}
        >
          ? Back
        </button>
        <h1 style={styles.title}>Profile</h1>
        <div style={styles.headerSpacer}></div>
      </div>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.hero}>
            <button style={styles.profilePhotoButton} onClick={() => setIsPhotoSourceOpen(true)}>
              <img src={profilePhoto} alt={displayName} style={styles.profilePhoto} />
              <span style={styles.profilePhotoEdit}>Change Photo</span>
            </button>

            {isEditingName ? (
              <div style={styles.inlineEditRow}>
                <input
                  style={styles.inlineEditInput}
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  maxLength={80}
                />
                <button style={styles.inlineEditSave} onClick={saveName}>Save</button>
                <button style={styles.inlineEditCancel} onClick={() => { setIsEditingName(false); setDraftName(displayName); }}>
                  Cancel
                </button>
              </div>
            ) : (
              <h1
                style={styles.editableHeading}
                onMouseEnter={() => setIsHeadingHovered(true)}
                onMouseLeave={() => setIsHeadingHovered(false)}
                onClick={() => setIsEditingName(true)}
              >
                {displayName}
              </h1>
            )}

            {isVerifiedWorker && <span style={styles.verifiedBadge}>Verified Worker</span>}
          </div>

          <section style={styles.profileSection}>
            <div style={styles.sectionHeadingRow}>
              <h2 style={styles.h2}>Bio</h2>
              {!isEditingBio && (
                <button style={styles.sectionEditBtn} onClick={() => setIsEditingBio(true)}>
                  Edit
                </button>
              )}
            </div>

            {isEditingBio ? (
              <div style={styles.bioEditWrap}>
                <textarea
                  style={styles.bioEditInput}
                  rows={4}
                  value={draftBio}
                  onChange={(event) => setDraftBio(event.target.value)}
                  maxLength={280}
                ></textarea>
                <div style={styles.bioEditActions}>
                  <button style={styles.inlineEditSave} onClick={saveBio}>Save</button>
                  <button style={styles.inlineEditCancel} onClick={() => { setIsEditingBio(false); setDraftBio(displayBio); }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p style={styles.paragraph}>{displayBio}</p>
            )}
          </section>

          <section style={styles.profileSection}>
            <h2 style={styles.h2}>Localized Address</h2>
            <p style={styles.paragraph}>{localizedAddress}</p>
          </section>

          {isVerifiedWorker && (
            <section style={{ ...styles.profileSection, ...styles.portfolioSection }}>
              <h2 style={styles.h2Portfolio}>Digital Professional Portfolio</h2>
              <p style={styles.portfolioParagraph}>Generate and download your professional resume with QR code verification for clients.</p>
              <button
                style={styles.generatePortfolioBtn}
                onMouseEnter={() => setIsPortfolioHovered(true)}
                onMouseLeave={() => setIsPortfolioHovered(false)}
                onClick={() => setIsPortfolioModalOpen(true)}
              >
                ?? Generate & Download Portfolio
              </button>
            </section>
          )}

          <button
            style={styles.manageAccountBtn}
            onMouseEnter={() => setIsManageHovered(true)}
            onMouseLeave={() => setIsManageHovered(false)}
            onClick={onManageAccount}
          >
            Manage Account & Privacy
          </button>

          {isPhotoSourceOpen && (
            <div style={styles.photoSourceOverlay}>
              <div style={styles.photoSourceModal}>
                <h3 style={styles.modalTitle}>Change Profile Photo</h3>
                <p style={styles.modalText}>Select image source:</p>
                <div style={styles.photoSourceActions}>
                  <button style={styles.photoActionBtn} onClick={() => cameraInputRef.current && cameraInputRef.current.click()}>Use Camera</button>
                  <button style={styles.photoActionBtn} onClick={() => deviceInputRef.current && deviceInputRef.current.click()}>From Device</button>
                  <button style={styles.cancelBtn} onClick={() => setIsPhotoSourceOpen(false)}>Cancel</button>
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  style={{ display: 'none' }}
                  onChange={handleImageSelection}
                />
                <input
                  ref={deviceInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelection}
                />
              </div>
            </div>
          )}

          <DigitalPortfolioModal
            isOpen={isPortfolioModalOpen}
            workerName={displayName}
            serviceType={sellerProfile?.serviceType ? (sellerProfile.serviceType === 'Others' ? sellerProfile.customServiceType : sellerProfile.serviceType) : 'General Service'}
            bio={displayBio}
            location={localizedAddress}
            rating={4.8}
            gcashNumber={sellerProfile?.gcashNumber || '09XXXXXXXXX'}
            onClose={() => setIsPortfolioModalOpen(false)}
          />
        </div>
      </main>
    </div>
  );
}

export default Profile;
