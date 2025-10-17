import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TheorySection from '../components/TheorySection';
import CacheManagement from '../components/CacheManagement';
import ContactForm from '../components/ContactForm';
import LatestUpdates from '../components/LatestUpdates';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import LabSection from '../components/LabSection';
import MinCodeSection from '../components/MinCodeSection';
import { LatestUpdate } from '../hooks/useLatestUpdates';
import './dashboard.css';

const DashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showCacheManagement, setShowCacheManagement] = useState(false);
  const [isViewingPDF, setIsViewingPDF] = useState(false);
  const [isInEditor, setIsInEditor] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Code snippets array removed - for future implementation

  useEffect(() => {
    // Theme detection
    const theme = localStorage.getItem('theme') || 'light';
    setIsDarkTheme(theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);

    // Particle animation
    createParticles();

    // Cleanup
    return () => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach(particle => particle.remove());
    };
  }, []);

  const createParticles = () => {
    const particleContainer = document.querySelector('.particles');
    if (!particleContainer) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.width = Math.random() * 4 + 2 + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      particleContainer.appendChild(particle);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.classList.toggle('menu-open', !mobileMenuOpen);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  const handleLogout = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to logout?');
    
    if (!isConfirmed) {
      return; // User cancelled logout
    }

    try {
      await logout();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <>
            {/* Hero Section */}
            <section className="hero" ref={heroRef}>
              <div className="particles"></div>
              <div className="hero-glow"></div>
              <div className="hero-glow"></div>
              <div className="hero-glow"></div>
              
              <div className="hero-content">
                <h1 className="hero-title shimmer">
                  Welcome to Semprepzie
                </h1>
                <p className="hero-subtitle">
                  Semprepzie is your smart study companion — a platform to securely store, access, and manage learning materials anytime, anywhere. With offline access and seamless syncing, your knowledge is always within reach.
                </p>
                <div className="hero-buttons">
                  <button 
                    className="btn-primary"
                    onClick={() => handleSectionChange('theory')}
                  >
                    Start Learning
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => handleSectionChange('lab')}
                  >
                    Practice Labs
                  </button>
                </div>
              </div>

              <div className="hero-animation">
                <div className="floating-cube"></div>
                <div className="floating-sphere"></div>
              </div>
            </section>

            {/* Latest Updates Section */}
            <LatestUpdates 
              limit={8}
              darkMode={isDarkTheme}
              onDocumentClick={(update: LatestUpdate) => {
                // Open the document in a new tab
                window.open(update.url, '_blank', 'noopener,noreferrer');
              }}
            />

            {/* About Section */}
            <div className="home-section-divider">
              <div className="home-about-section">
                <div className="container">
                  <h2 className="section-title gradient-text" data-text="About Semprepzie">
                    About Semprepzie
                  </h2>
                  <div className="about-content">
                    <div className="about-text">
                      <h3>Empowering Students Through Smart Learning</h3>
                      <p>
                        At Semprepzie, we believe learning should be simple, accessible, and always available. That's why we built a platform where students can upload, organize, and view their study resources in one place — even offline. Powered by modern technologies like Firebase, Supabase, and Render, our mission is to provide a reliable and user-friendly experience that helps learners focus on what truly matters: studying smarter and achieving more.
                      </p>
                    </div>
                    <div className="features">
                      <div className="feature">
                        <div className="feature-icon">📚</div>
                        <div className="feature-content">
                          <h4>Comprehensive Theory</h4>
                          <p>In-depth coverage of Java concepts from basics to advanced topics with clear explanations and examples.</p>
                        </div>
                      </div>
                      <div className="feature">
                        <div className="feature-icon">🔬</div>
                        <div className="feature-content">
                          <h4>Interactive Labs</h4>
                          <p>Hands-on exercises and projects that reinforce learning through practical application.</p>
                        </div>
                      </div>
                      <div className="feature">
                        <div className="feature-icon">💡</div>
                        <div className="feature-content">
                          <h4>Code Examples</h4>
                          <p>Ready-to-use code snippets and complete programs for reference and practice.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="home-section-divider">
              <div className="home-contact-section">
                <div className="container">
                  <h2 className="section-title gradient-text" data-text="Get in Touch">
                    Get in Touch
                  </h2>
                  <div className="contact-content">
                    <div className="contact-info">
                      <h3>Connect With Us</h3>
                      <div className="contact-item">
                        <div className="contact-icon">📧</div>
                        <div className="contact-details">
                          <strong>Email</strong>
                          <p>semprepzie@gmail.com</p>
                        </div>
                      </div>
                      <div className="contact-item">
                        <div className="contact-icon">🏫</div>
                        <div className="contact-details">
                          <strong>Institution</strong>
                          <p>AITS Rajampet</p>
                        </div>
                      </div>
                      <div className="contact-item">
                        <div className="contact-icon">⏰</div>
                        <div className="contact-details">
                          <strong>Support Hours</strong>
                          <p>Mon-Fri: 9:00 AM - 6:00 PM</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="contact-form">
                      <h3>Send us a Message</h3>
                      <ContactForm />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'theory':
        return <TheorySection onPDFViewingChange={handlePDFViewingChange} darkMode={isDarkTheme} />;

      case 'lab':
        return <LabSection darkMode={isDarkTheme} onEditorStateChange={setIsInEditor} />;

      case 'mincode':
        return <MinCodeSection darkMode={isDarkTheme} onEditorStateChange={setIsInEditor} />;

      case 'contact':
        return (
          <section className="section active">
            <div className="container">
              <h2 className="section-title">Contact Us</h2>
              <div className="contact-content">
                <div className="contact-info">
                  <h3>Get in Touch</h3>
                  <div className="contact-item">
                    <div className="contact-icon">📧</div>
                    <div className="contact-details">
                      <strong>Email</strong>
                      <p>semprepzie@gmail.com</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">🏫</div>
                    <div className="contact-details">
                      <strong>Institution</strong>
                      <p>AITS Rajampet</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">⏰</div>
                    <div className="contact-details">
                      <strong>Support Hours</strong>
                      <p>Mon-Fri: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="contact-form">
                  <h3>Send us a Message</h3>
                  <ContactForm />
                </div>
              </div>
            </div>
          </section>
        );

      case 'about':
        return (
          <section className="section active">
            <div className="container">
              <h2 className="section-title">About Semprepzie</h2>
              <div className="about-content">
                <div className="about-text">
                  <h3>Empowering Students Through Smart Learning</h3>
                  <p>
                    At Semprepzie, we believe learning should be simple, accessible, and always available. That's why we built a platform where students can upload, organize, and view their study resources in one place — even offline. Powered by modern technologies like Firebase, Supabase, and Render, our mission is to provide a reliable and user-friendly experience that helps learners focus on what truly matters: studying smarter and achieving more.
                  </p>
                </div>
                <div className="features">
                  <div className="feature">
                    <div className="feature-icon">📚</div>
                    <div className="feature-content">
                      <h4>Comprehensive Theory</h4>
                      <p>In-depth coverage of Java concepts from basics to advanced topics with clear explanations.</p>
                    </div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">🔬</div>
                    <div className="feature-content">
                      <h4>Interactive Labs</h4>
                      <p>Hands-on exercises and projects that reinforce learning through practical application.</p>
                    </div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">💡</div>
                    <div className="feature-content">
                      <h4>Code Examples</h4>
                      <p>Ready-to-use code snippets and complete programs for reference and practice.</p>
                    </div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">🎯</div>
                    <div className="feature-content">
                      <h4>Personalized Learning</h4>
                      <p>Adaptive content that adjusts to your learning pace and preferences.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const handlePDFViewingChange = (viewingPDF: boolean) => {
    setIsViewingPDF(viewingPDF);
  };

  return (
    <div className="dashboard-container">
      {/* Navigation - Hidden when viewing PDF or in editor */}
      {!isViewingPDF && !isInEditor && (
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <h1>✨ Semprepzie</h1>
            </div>
          
          <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <li>
              <a 
                href="#home" 
                className={activeSection === 'home' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleSectionChange('home'); }}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#theory" 
                className={activeSection === 'theory' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleSectionChange('theory'); }}
              >
                Theory
              </a>
            </li>
            <li>
              <a 
                href="#lab" 
                className={activeSection === 'lab' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleSectionChange('lab'); }}
              >
                Lab
              </a>
            </li>
            <li>
              <a 
                href="#mincode" 
                className={activeSection === 'mincode' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleSectionChange('mincode'); }}
              >
                MinCode
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                className={activeSection === 'contact' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleSectionChange('contact'); }}
              >
                Contact
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                className={activeSection === 'about' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleSectionChange('about'); }}
              >
                About
              </a>
            </li>
          </ul>

          <div className="nav-controls">
            {isAdmin && (
              <div className="admin-toggle">
                <button 
                  onClick={() => navigate('/admin')}
                  title="Admin Dashboard"
                  className="admin-btn"
                >
                  ⚙️
                </button>
              </div>
            )}

            <div className="theme-toggle">
              <button onClick={toggleTheme}>
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
            </div>

            <div className="cache-toggle">
              <button 
                onClick={() => setShowCacheManagement(true)}
                title="Cache Management"
                className="cache-btn"
              >
                💾
              </button>
            </div>

            <div className="logout-toggle">
              <button 
                onClick={handleLogout}
                title="Logout"
                className="logout-btn"
              >
                🚪
              </button>
            </div>
            
            <button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
      )}

      {/* Email Verification Banner */}
      <EmailVerificationBanner show={true} />

      {/* Main Content */}
      <main className={`main-site ${(isViewingPDF || isInEditor) ? 'no-margin-top' : ''}`}>
        {renderSection()}
      </main>

      {/* Cache Management Modal */}
      <CacheManagement
        isOpen={showCacheManagement}
        onClose={() => setShowCacheManagement(false)}
      />
    </div>
  );
};

export default DashboardPage;
