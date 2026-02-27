import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
      <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8">Oops! The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => window.history.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>Go Back</Button>
        <Link to={ROUTES.HOME}><Button variant="gradient" leftIcon={<Home className="h-4 w-4" />}>Home</Button></Link>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
