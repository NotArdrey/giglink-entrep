import { useEffect, useRef, useState } from 'react';
import DigitalPortfolioModal from '../components/DigitalPortfolioModal';
import '../styles/Profile.css';

/**
 * Navigation Flow:
 * - Users open this Profile Hub from the Header "Profile" menu.
 * - "Manage Account & Privacy" routes to AccountSettings page for sensitive edits.
 * - This page intentionally shows public-facing identity information only.
 */
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

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="profile-back-btn" onClick={onBackToDashboard}>
          ← Back
        </button>
        <h1 className="profile-title">Profile</h1>
        <div className="profile-header-spacer"></div>
      </div>

      <main className="profile-main">
        <div className="profile-card">

        <div className="profile-hero">
          <button className="profile-photo-button" onClick={() => setIsPhotoSourceOpen(true)}>
            <img src={profilePhoto} alt={displayName} className="profile-photo" />
            <span className="profile-photo-edit">Change Photo</span>
          </button>

          {isEditingName ? (
            <div className="inline-edit-row">
              <input
                className="inline-edit-input"
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                maxLength={80}
              />
              <button className="inline-edit-save" onClick={saveName}>Save</button>
              <button className="inline-edit-cancel" onClick={() => { setIsEditingName(false); setDraftName(displayName); }}>
                Cancel
              </button>
            </div>
          ) : (
            <h1 className="editable-heading" onClick={() => setIsEditingName(true)}>{displayName}</h1>
          )}

          {isVerifiedWorker && <span className="verified-badge">Verified Worker</span>}
        </div>

        <section className="profile-section">
          <div className="section-heading-row">
            <h2>Bio</h2>
            {!isEditingBio && (
              <button className="section-edit-btn" onClick={() => setIsEditingBio(true)}>
                Edit
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div className="bio-edit-wrap">
              <textarea
                className="bio-edit-input"
                rows={4}
                value={draftBio}
                onChange={(event) => setDraftBio(event.target.value)}
                maxLength={280}
              ></textarea>
              <div className="bio-edit-actions">
                <button className="inline-edit-save" onClick={saveBio}>Save</button>
                <button className="inline-edit-cancel" onClick={() => { setIsEditingBio(false); setDraftBio(displayBio); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p>{displayBio}</p>
          )}
        </section>

        <section className="profile-section">
          <h2>Localized Address</h2>
          <p>{localizedAddress}</p>
        </section>

        {isVerifiedWorker && (
          <section className="profile-section portfolio-section">
            <h2>Digital Professional Portfolio</h2>
            <p>Generate and download your professional resume with QR code verification for clients.</p>
            <button className="generate-portfolio-btn" onClick={() => setIsPortfolioModalOpen(true)}>
              📄 Generate & Download Portfolio
            </button>
          </section>
        )}

        <button className="manage-account-btn" onClick={onManageAccount}>
          Manage Account & Privacy
        </button>

        {isPhotoSourceOpen && (
          <div className="photo-source-overlay">
            <div className="photo-source-modal">
              <h3>Change Profile Photo</h3>
              <p>Select image source:</p>
              <div className="photo-source-actions">
                <button onClick={() => cameraInputRef.current && cameraInputRef.current.click()}>Use Camera</button>
                <button onClick={() => deviceInputRef.current && deviceInputRef.current.click()}>From Device</button>
                <button className="cancel" onClick={() => setIsPhotoSourceOpen(false)}>Cancel</button>
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
