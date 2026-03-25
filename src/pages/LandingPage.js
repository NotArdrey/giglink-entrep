import { useState } from 'react';
import Navigation from '../components/Navigation';
import HeroSlider from '../modules/HeroSlider';
import LoginModal from '../components/LoginModal';
import '../styles/LandingPage.css';
import '../styles/goalssection.css';

const LANDING_STATS = [
  { id: 1, value: '80+', label: 'Active service categories' },
  { id: 2, value: '1,240+', label: 'Bookings completed this week' },
  { id: 3, value: '< 15 min', label: 'Average response time' },
];

const FOOTER_COLUMNS = [
  {
    title: 'Categories',
    links: [
      'Tutoring',
      'Technician Services',
      'Cleaning',
      'Graphic Design',
      'Gaming Coach',
      'Electrical Repair',
      'Pet Grooming',
      'Aircon Cleaning',
    ],
  },
  {
    title: 'For Clients',
    links: [
      'How GigLink Works',
      'Find a Professional',
      'Book by Schedule',
      'Track Bookings',
      'Client Support',
    ],
  },
  {
    title: 'For Freelancers',
    links: [
      'Become a Seller',
      'Set Your Rates',
      'Manage Your Slots',
      'Build Portfolio',
      'My Work Dashboard',
    ],
  },
  {
    title: 'Company',
    links: [
      'About GigLink',
      'Trust & Safety',
      'Terms of Service',
      'Privacy Policy',
      'Contact Us',
    ],
  },
];

const SOCIAL_LINKS = [
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
  { id: 'tiktok', label: 'TikTok', href: 'https://tiktok.com' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
];

function SocialIcon({ id }) {
  if (id === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.2c0-.9.3-1.5 1.6-1.5h1.2V5c-.2 0-1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3h2.3v7h2.7z" fill="currentColor" />
      </svg>
    );
  }

  if (id === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="4" width="16" height="16" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    );
  }

  if (id === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6.6 8.9h-3V20h3V8.9zm.2-3.3a1.8 1.8 0 11-3.6 0 1.8 1.8 0 013.6 0zM20.5 20h-3v-5.5c0-1.3-.5-2.2-1.7-2.2-.9 0-1.4.6-1.7 1.2-.1.2-.1.5-.1.8V20h-3V8.9h3v1.5c.4-.7 1.2-1.8 3-1.8 2.1 0 3.5 1.4 3.5 4.3V20z" fill="currentColor" />
      </svg>
    );
  }

  if (id === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15.7 4.5c.7 1.4 1.9 2.4 3.3 2.7v2.4c-1.2-.1-2.3-.5-3.3-1.1v5.8c0 2.8-2.2 5.1-5 5.1S5.7 17 5.7 14.2c0-2.6 2-4.8 4.5-5.1v2.5c-1.1.3-1.9 1.3-1.9 2.5 0 1.4 1.1 2.5 2.5 2.5s2.4-1.1 2.4-2.5V4.5h2.5z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21.8 8.7a3 3 0 00-2.1-2.1C17.8 6 12 6 12 6s-5.8 0-7.7.6a3 3 0 00-2.1 2.1C1.6 10.5 1.6 12 1.6 12s0 1.5.6 3.3a3 3 0 002.1 2.1C6.2 18 12 18 12 18s5.8 0 7.7-.6a3 3 0 002.1-2.1c.6-1.8.6-3.3.6-3.3s0-1.5-.6-3.3zM10 15.1V8.9l5.2 3.1-5.2 3.1z" fill="currentColor" />
    </svg>
  );
}

const GOAL_CARDS = [
  {
    id: 1,
    icon: '🎯',
    title: 'Find Your First Client',
    description: 'Set a goal to land your first gig within 30 days. We\'ll match you with clients who need your skills.',
    tag: 'Getting Started',
    color: '#2563EB',
  },
  {
    id: 2,
    icon: '💼',
    title: 'Build a Portfolio',
    description: 'Showcase 5 completed projects and attract higher-paying opportunities in your field.',
    tag: 'Growth',
    color: '#1D4ED8',
  },
  {
    id: 3,
    icon: '📈',
    title: 'Scale Your Income',
    description: 'Set a monthly earning target and track your progress. Top freelancers earn 3x more with clear goals.',
    tag: 'Income',
    color: '#3B82F6',
  },
  {
    id: 4,
    icon: '🤝',
    title: 'Expand Your Network',
    description: 'Connect with 10 professionals in your industry. Referrals drive 40% of gig bookings on GigLink.',
    tag: 'Networking',
    color: '#60A5FA',
  },
  {
    id: 5,
    icon: '⭐',
    title: 'Earn Top Rated Status',
    description: 'Maintain a 4.8+ rating across 20 reviews. Top Rated pros get 60% more profile views.',
    tag: 'Reputation',
    color: '#1E40AF',
  },
  {
    id: 6,
    icon: '🛠️',
    title: 'Master a New Skill',
    description: 'Add a high-demand skill to your profile and tap into a new market of clients waiting to hire.',
    tag: 'Skills',
    color: '#93C5FD',
  },
];

function GoalCard({ icon, title, description, tag, color, onSet }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`goal-card ${isHovered ? 'goal-card--hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--card-accent': color }}
    >
      <div className="goal-card__accent-bar" />
      <span className="goal-card__icon">{icon}</span>
      <span className="goal-card__tag">{tag}</span>
      <h3 className="goal-card__title">{title}</h3>
      <p className="goal-card__description">{description}</p>
      <button className="goal-card__btn" onClick={() => onSet(title)}>
        Set This Goal
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function GoalsSection({ onLoginClick }) {
  const [activeGoal, setActiveGoal] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleSetGoal = (title) => {
    setActiveGoal(title);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <section className="goals-section">
      {/* Section Header */}
      <div className="goals-section__header">
        <span className="goals-section__eyebrow">Powered by GigLink</span>
        <h2 className="goals-section__title">
          Set Your <em>Professional Goals</em>
        </h2>
        <p className="goals-section__subtitle">
          Turn your ambitions into milestones. Pick a goal and let GigLink connect you
          with the right opportunities, clients, and tools to get there.
        </p>
      </div>

      {/* Goal Cards Grid */}
      <div className="goals-grid">
        {GOAL_CARDS.map((card) => (
          <GoalCard
            key={card.id}
            {...card}
            onSet={handleSetGoal}
          />
        ))}
      </div>

      {/* CTA Strip */}
      <div className="goals-cta">
        <p className="goals-cta__text">
          Ready to take the first step?
        </p>
        <button className="goals-cta__btn goals-cta__btn--secondary">
          Browse All Goals
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="goals-toast" role="status" aria-live="polite">
          <span className="goals-toast__icon">✓</span>
          <span>
            <strong>"{activeGoal}"</strong> added! Sign in to track your progress.
          </span>
        </div>
      )}
    </section>
  );
}

function LandingPage({ onLogin }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSubmit = (formData) => {
    setIsLoginModalOpen(false);
    onLogin && onLogin(formData);
  };

  return (
    <div className="landing-page">
      {/* Navigation Component */}
      <Navigation onLoginClick={handleLoginClick} />

      {/* Main Content */}
      <main className="landing-main">
        {/* Hero Slider Component */}
        <HeroSlider onGetStarted={handleLoginClick} />

        {/* Goals Section */}
        <GoalsSection onLoginClick={handleLoginClick} />

        {/* KPI Strip */}
        <section className="landing-stats-section" aria-label="GigLink performance highlights">
          <div className="landing-stats-header">
            <span>Platform Snapshot</span>
            <h2>Why GigLink Delivers</h2>
            <p>Quick metrics that show activity and trust across our service marketplace.</p>
          </div>
          <div className="landing-stats-grid">
            {LANDING_STATS.map((item) => (
              <article key={item.id} className="landing-stat-card">
                <p className="landing-stat-value">{item.value}</p>
                <p className="landing-stat-label">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer Links Section */}
        <section className="landing-links-section" aria-label="GigLink quick links">
          <div className="landing-links-grid">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="landing-links-column">
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((linkText) => (
                    <li key={linkText}>
                      <a href="#landing-footer">{linkText}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="landing-footer-bottom" id="landing-footer">
            <p className="landing-copyright">© GigLink 2026. All rights reserved.</p>
            <div className="landing-social-links" aria-label="GigLink social media">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="landing-social-link"
                >
                  <SocialIcon id={social.id} />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Login Modal Component */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleLoginSubmit}
      />
    </div>
  );
}

export default LandingPage;