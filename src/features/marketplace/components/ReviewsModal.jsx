import React from 'react';

const ReviewsModal = ({ isOpen, onClose, provider, reviews = [] , appTheme='light'}) => {
  if (!isOpen || !provider) return null;

  const isDark = appTheme === 'dark';
  const overlay = {
    position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400,
    background: isDark ? 'rgba(10,12,16,0.7)' : 'rgba(0,0,0,0.35)'
  };

  const card = {
    width: 'min(820px, 96vw)', maxHeight: '86vh', overflowY: 'auto', borderRadius: 12, padding: 18,
    background: isDark ? '#2b333b' : '#fff', border: `1px solid ${isDark ? '#3f4750' : '#e6eef8'}`
  };

  const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 };
  const title = { margin: 0, fontSize: 18, fontWeight: 800 };
  const subtitle = { margin: 0, fontSize: 13, color: isDark ? '#c7ceda' : '#64748b' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>
            <h3 style={title}>{provider.name} — Reviews</h3>
            <p style={subtitle}>{provider.rating} ★ • {provider.reviews} reviews</p>
          </div>
          <div>
            <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews && reviews.length > 0 ? (
            reviews.map((r, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 8, background: isDark ? '#32383f' : '#f8fbff', border: `1px solid ${isDark ? '#3f4750' : '#e6eef8'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>{r.clientName}</div>
                  <div style={{ fontWeight: 800 }}>{r.rating} ★</div>
                </div>
                <div style={{ marginTop: 6, color: isDark ? '#c7ceda' : '#334155' }}>{r.comment}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: isDark ? '#9aa5b5' : '#64748b' }}>{r.date}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: 12, borderRadius: 8, background: isDark ? '#32383f' : '#f8fbff' }}>No reviews yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
