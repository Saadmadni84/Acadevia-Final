import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSyncStore } from '@/stores/useSyncStore';

const OnlineStatusBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const pendingCount = useSyncStore((s) => s.pendingCount);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-warning text-gray-900 py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2"
        >
          <WifiOff className="h-4 w-4" />
          <span>You're offline. Changes will sync when connected.</span>
          {pendingCount > 0 && <span className="ml-2 bg-white/30 rounded-full px-2 py-0.5 text-xs">{pendingCount} pending</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { OnlineStatusBanner };
