import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout: React.FC = () => (
  <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
    <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary to-secondary p-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Welcome to Acadevia</h1>
        <p className="text-lg text-white/80">India's most engaging gamified learning platform. Learn, play, and grow together.</p>
      </motion.div>
    </div>
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Outlet />
      </motion.div>
    </div>
  </div>
);

export { AuthLayout };
