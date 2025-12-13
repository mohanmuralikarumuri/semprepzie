import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import MinCodeSection from '../components/MinCodeSection';

interface OutletContext {
  darkMode: boolean;
}

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const MinCodePage: React.FC = () => {
  const { darkMode } = useOutletContext<OutletContext>();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.3 }}
    >
      <MinCodeSection 
        darkMode={darkMode} 
        onEditorStateChange={() => {}} 
        source="dashboard" 
      />
    </motion.div>
  );
};

export default MinCodePage;
