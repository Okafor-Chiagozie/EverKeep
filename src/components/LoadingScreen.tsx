import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-8 w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-semibold text-white mb-4">EverKeep</h2>
        
        <div className="flex items-center justify-center space-x-2 text-blue-300">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Securing your memories...</span>
        </div>
      </motion.div>
    </div>
  );
}