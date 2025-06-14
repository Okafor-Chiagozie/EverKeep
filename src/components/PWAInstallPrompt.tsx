import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="p-4 bg-slate-900/95 backdrop-blur-xl border-slate-700/50 max-w-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Install EverKeep</h3>
                  <p className="text-xs text-slate-400">Add to your home screen</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="p-1 h-auto text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-slate-300 mb-4">
              Install EverKeep for quick access and offline functionality.
            </p>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Install
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Later
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}