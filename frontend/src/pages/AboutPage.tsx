import React from 'react';
import { motion } from 'framer-motion';

const pageTransition = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4
    }
  })
};

const AboutPage: React.FC = () => {
  return (
    <motion.section
      className="section active"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.3 }}
    >
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          About Semprepzie
        </motion.h2>
        <div className="about-content">
          <motion.div 
            className="about-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3>Empowering Students Through Smart Learning</h3>
            <p>
              At Semprepzie, we believe learning should be simple, accessible, and always available. That's why we built a platform where students can upload, organize, and view their study resources in one place — even offline. Powered by modern technologies like Firebase, Supabase, and Render, our mission is to provide a reliable and user-friendly experience that helps learners focus on what truly matters: studying smarter and achieving more.
            </p>
          </motion.div>
          <div className="features">
            {[
              { icon: '📚', title: 'Comprehensive Theory', desc: 'In-depth coverage of Java concepts from basics to advanced topics with clear explanations.' },
              { icon: '🔬', title: 'Interactive Labs', desc: 'Hands-on exercises and projects that reinforce learning through practical application.' },
              { icon: '💡', title: 'Code Examples', desc: 'Ready-to-use code snippets and complete programs for reference and practice.' },
              { icon: '🎯', title: 'Personalized Learning', desc: 'Adaptive content that adjusts to your learning pace and preferences.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="feature"
                custom={i}
                initial="hidden"
                animate="visible"
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
    </motion.section>
  );
};

export default AboutPage;
