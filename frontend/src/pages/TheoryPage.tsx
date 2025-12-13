import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import TheorySection from '../components/TheorySection';

interface OutletContext {
  darkMode: boolean;
}

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const TheoryPage: React.FC = () => {
  const { darkMode } = useOutletContext<OutletContext>();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.3 }}
    >
      <TheorySection 
        onPDFViewingChange={() => {}} 
        darkMode={darkMode} 
      />
    </motion.div>
  );
};

export default TheoryPage;
