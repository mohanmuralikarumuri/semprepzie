import React, { useState, useEffect, useRef } from 'react';
import TheorySection from '../components/TheorySection';
import CacheManagement from '../components/CacheManagement';
import './dashboard.css';

interface LabExercise {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
}

const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showCacheManagement, setShowCacheManagement] = useState(false);
  const [isViewingPDF, setIsViewingPDF] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const labExercises: LabExercise[] = [
    {
      id: 'basic-syntax',
      title: 'Basic Syntax Practice',
      icon: '📝',
      description: 'Hands-on exercises for Java syntax and basic programming constructs.'
    },
    {
      id: 'control-structures',
      title: 'Control Structures',
      icon: '🔄',
      description: 'Practice loops, conditionals, and control flow statements.'
    },
    {
      id: 'class-objects',
      title: 'Classes & Objects',
      icon: '🎯',
      description: 'Build real-world applications using OOP principles.'
    },
    {
      id: 'collections',
      title: 'Collections Framework',
      icon: '📦',
      description: 'Work with Java collections and data manipulation.'
    },
    {
      id: 'exception-handling',
      title: 'Exception Handling',
      icon: '⚠️',
      description: 'Learn robust error handling and debugging techniques.'
    },
    {
      id: 'file-io',
      title: 'File I/O Operations',
      icon: '📁',
      description: 'Master file operations and data persistence in Java.'
    }
  ];

  const codeSnippets: CodeSnippet[] = [
    {
      id: 'hello-world',
      title: 'Hello World Program',
      description: 'Your first Java program with detailed explanations.',
      language: 'java'
    },
    {
      id: 'calculator',
      title: 'Simple Calculator',
      description: 'Basic arithmetic operations with user input.',
      language: 'java'
    },
    {
      id: 'student-management',
      title: 'Student Management System',
      description: 'Complete CRUD operations for student data.',
      language: 'java'
    },
    {
      id: 'sorting-algorithms',
      title: 'Sorting Algorithms',
      description: 'Implementation of various sorting techniques.',
      language: 'java'
    }
  ];

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
                  Your comprehensive Java learning platform with interactive theory, practical labs, and coding exercises.
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

            {/* About Section */}
            <div className="home-section-divider">
              <div className="home-about-section">
                <div className="container">
                  <h2 className="section-title gradient-text" data-text="About Semprepzie">
                    About Semprepzie
                  </h2>
                  <div className="about-content">
                    <div className="about-text">
                      <h3>Empowering Students Through Java Education</h3>
                      <p>
                        Semprepzie is designed to provide a comprehensive learning experience for Java programming. 
                        Our platform combines theoretical knowledge with practical application, ensuring students 
                        develop both understanding and hands-on skills.
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
                          <p>support@semprepzie.edu</p>
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
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                          <input type="text" placeholder="Your Name" required />
                        </div>
                        <div className="form-group">
                          <input type="email" placeholder="Your Email" required />
                        </div>
                        <div className="form-group">
                          <textarea placeholder="Your Message" rows={5} required></textarea>
                        </div>
                        <button type="submit">Send Message</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'theory':
        return <TheorySection onPDFViewingChange={handlePDFViewingChange} />;

      case 'lab':
        return (
          <section className="section active">
            <div className="container">
              <h2 className="section-title">Lab Exercises</h2>
              <div className="lab-grid">
                {labExercises.map((lab) => (
                  <div key={lab.id} className="lab-card" onClick={() => handleLabClick(lab.id)}>
                    <div className="course-content">
                      <span className="lab-icon">{lab.icon}</span>
                      <h3>{lab.title}</h3>
                      <p>{lab.description}</p>
                      <button className="view-btn">Start Exercise</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'mincode':
        return (
          <section className="section active">
            <div className="container">
              <h2 className="section-title">Code Snippets</h2>
              <div className="code-grid">
                {codeSnippets.map((snippet) => (
                  <div key={snippet.id} className="code-card" onClick={() => handleCodeClick(snippet.id)}>
                    <div className="course-content">
                      <h3>{snippet.title}</h3>
                      <p>{snippet.description}</p>
                      <span className="language-tag">{snippet.language}</span>
                      <button className="view-btn">View Code</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

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
                      <p>support@semprepzie.edu</p>
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
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                      <input type="text" placeholder="Your Name" required />
                    </div>
                    <div className="form-group">
                      <input type="email" placeholder="Your Email" required />
                    </div>
                    <div className="form-group">
                      <textarea placeholder="Your Message" rows={5} required></textarea>
                    </div>
                    <button type="submit">Send Message</button>
                  </form>
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
                  <h3>Empowering Students Through Java Education</h3>
                  <p>
                    Semprepzie is designed to provide a comprehensive learning experience for Java programming. 
                    Our platform combines theoretical knowledge with practical application, ensuring students 
                    develop both understanding and hands-on skills.
                  </p>
                  <p>
                    Whether you're a beginner starting your programming journey or an advanced student looking 
                    to master complex concepts, Semprepzie provides the resources and guidance you need to succeed.
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

  const handleLabClick = (labId: string) => {
    console.log('Lab clicked:', labId);
    // Implement lab navigation logic
  };

  const handleCodeClick = (codeId: string) => {
    console.log('Code snippet clicked:', codeId);
    // Implement code viewing logic
  };

  const handlePDFViewingChange = (viewingPDF: boolean) => {
    setIsViewingPDF(viewingPDF);
  };

  return (
    <div className="dashboard-container">
      {/* Navigation - Hidden when viewing PDF */}
      {!isViewingPDF && (
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

      {/* Main Content */}
      <main className="main-site">
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
