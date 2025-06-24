import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Trash2, 
  X,
  Shield,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVaults } from '@/contexts/VaultContext';

interface DeleteVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultId: string;
  vaultName: string;
  onDeleted?: () => void;
}

export function DeleteVaultDialog({ 
  open, 
  onOpenChange, 
  vaultId, 
  vaultName, 
  onDeleted 
}: DeleteVaultDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  
  const { deleteVault } = useVaults();
  
  const isConfirmed = confirmationText === vaultName;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    
    setIsDeleting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    deleteVault(vaultId);
    setIsDeleting(false);
    setIsDeleted(true);
    
    // Show success state briefly, then close and callback
    setTimeout(() => {
      setIsDeleted(false);
      setConfirmationText('');
      onOpenChange(false);
      onDeleted?.();
    }, 1500);
  };

  const handleClose = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setConfirmationText('');
    setIsDeleted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-slate-900/95 border-slate-700 mx-4 sm:mx-0">
        <DialogTitle className="sr-only">Delete Vault Confirmation</DialogTitle>
        
        <div className="p-6 sm:p-8 relative">
          {/* Close Button */}
          {!isDeleting && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {isDeleted ? (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">Vault Deleted</h3>
              <p className="text-slate-400">
                "{vaultName}" has been permanently deleted.
              </p>
            </motion.div>
          ) : (
            // Confirmation State
            <>
              <DialogHeader className="pr-12 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      Delete Vault
                    </DialogTitle>
                    <p className="text-sm text-slate-400">This action cannot be undone</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Warning Message */}
                <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                  <h4 className="font-semibold text-red-300 mb-2 flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Warning: Permanent Deletion</span>
                  </h4>
                  <div className="text-sm text-red-200 space-y-2">
                    <p>You are about to permanently delete:</p>
                    <div className="font-medium bg-red-800/30 p-2 rounded border-l-4 border-red-500">
                      "{vaultName}"
                    </div>
                    <p>This will permanently delete:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>All messages and content in this vault</li>
                      <li>All media files and attachments</li>
                      <li>Recipient assignments and delivery settings</li>
                      <li>All vault history and metadata</li>
                    </ul>
                  </div>
                </div>

                {/* Confirmation Input */}
                <div>
                  <Label htmlFor="confirmation" className="text-slate-300">
                    Type the vault name to confirm deletion:
                  </Label>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm text-slate-400 font-mono bg-slate-800/50 p-2 rounded border">
                      {vaultName}
                    </div>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Type vault name here"
                      className="bg-slate-800/50 border-slate-600 text-white"
                      disabled={isDeleting}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isDeleting}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={!isConfirmed || isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Vault</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}