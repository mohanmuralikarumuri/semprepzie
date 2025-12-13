import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import LabSection from '../components/LabSection';

interface OutletContext {
  darkMode: boolean;
}

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const LabPage: React.FC = () => {
  const { darkMode } = useOutletContext<OutletContext>();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.3 }}
    >
      <LabSection 
        darkMode={darkMode} 
        onEditorStateChange={() => {}} 
        source="dashboard" 
      />
    </motion.div>
  );
};

export default LabPage;
