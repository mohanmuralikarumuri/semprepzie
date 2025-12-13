import React, { useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import LatestUpdates from '../components/LatestUpdates';
import ContactForm from '../components/ContactForm';
import { LatestUpdate } from '../hooks/useLatestUpdates';

interface OutletContext {
  darkMode: boolean;
}

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5
    }
  })
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { darkMode } = useOutletContext<OutletContext>();

  useEffect(() => {
    // Particle animation
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

    createParticles();

    // Cleanup
    return () => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach(particle => particle.remove());
    };
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.3 }}
    >
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
            <motion.button 
              className="btn-primary"
              onClick={() => navigate('/dashboard/theory')}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Start Learning
            </motion.button>
            <motion.button 
              className="btn-secondary"
              onClick={() => navigate('/dashboard/lab')}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Practice Labs
            </motion.button>
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
        darkMode={darkMode}
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
                {[
                  { icon: '📚', title: 'Comprehensive Theory', desc: 'In-depth coverage of Java concepts from basics to advanced topics with clear explanations and examples.' },
                  { icon: '🔬', title: 'Interactive Labs', desc: 'Hands-on exercises and projects that reinforce learning through practical application.' },
                  { icon: '💡', title: 'Code Examples', desc: 'Ready-to-use code snippets and complete programs for reference and practice.' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    className="feature"
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={featureVariants}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-content">
                      <h4>{feature.title}</h4>
                      <p>{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
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
    </motion.div>
  );
};

export default HomePage;
