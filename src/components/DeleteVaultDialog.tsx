import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Trash2,
  Shield,
  FileText,
  Image,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Cloud
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { vaultService } from '@/services/vault';

interface DeleteVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultId: string;
  vaultName: string;
  onDeleted: () => void;
}

interface DeletionStats {
  entriesDeleted: number;
  itemsDeleted: number;
  recipientsDeleted: number;
  cloudinaryFiles: string[];
}

type DeletionStage = 'confirm' | 'deleting' | 'completed' | 'error';

export function DeleteVaultDialog({
  open,
  onOpenChange,
  vaultId,
  vaultName,
  onDeleted
}: DeleteVaultDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [understoodRisks, setUnderstoodRisks] = useState(false);
  const [stage, setStage] = useState<DeletionStage>('confirm');
  const [deletionStats, setDeletionStats] = useState<DeletionStats | null>(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('');

  const isDeleteEnabled = 
    confirmationText === vaultName &&
    understoodRisks &&
    stage === 'confirm';

  const handleDelete = async () => {
    if (!vaultId || !isDeleteEnabled) return;

    console.log('Starting vault deletion for:', vaultId);
    setStage('deleting');
    setCurrentStep('Preparing deletion...');

    try {
      // Step-by-step deletion with progress updates
      setCurrentStep('Analyzing vault contents...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep('Deleting messages and media...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStep('Removing recipients...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setCurrentStep('Cleaning up vault data...');
      
      console.log('Calling vaultService.deleteVault with ID:', vaultId);
      const response = await vaultService.deleteVault(vaultId);
      
      console.log('Vault deletion response:', response);

      if (response.isSuccessful && response.data) {
        setDeletionStats(response.data);
        setCurrentStep('Vault deleted successfully!');
        setStage('completed');
        
        console.log('Vault deletion completed successfully');
        
        // Auto-close and notify parent after showing success
        setTimeout(() => {
          console.log('Calling onDeleted callback');
          onDeleted();
          onOpenChange(false);
          resetDialog();
        }, 2500);
      } else {
        console.error('Vault deletion failed:', response);
        setError(response.errors[0]?.description || 'Failed to delete vault');
        setStage('error');
      }
    } catch (err) {
      console.error('Error deleting vault:', err);
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStage('error');
    }
  };

  const resetDialog = () => {
    console.log('Resetting dialog state');
    setConfirmationText('');
    setUnderstoodRisks(false);
    setStage('confirm');
    setDeletionStats(null);
    setError('');
    setCurrentStep('');
  };

  const handleClose = () => {
    if (stage === 'deleting') {
      console.log('Preventing close during deletion');
      return; // Prevent closing during deletion
    }
    console.log('Closing dialog');
    onOpenChange(false);
    setTimeout(resetDialog, 300);
  };

  const handleRetry = () => {
    console.log('Retrying deletion');
    setStage('confirm');
    setError('');
  };

  // Debug logs
  console.log('DeleteVaultDialog props:', { open, vaultId, vaultName });
  console.log('DeleteVaultDialog state:', { stage, confirmationText, understoodRisks, isDeleteEnabled });

  if (!vaultId || !vaultName) {
    console.error('Missing required props:', { vaultId, vaultName });
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-slate-900/95 border-slate-700 mx-4 sm:mx-0">
        <DialogTitle className="sr-only">Delete Vault</DialogTitle>
        
        <div className="p-6 sm:p-8 relative">
          {/* Close Button - only show when not deleting */}
          {stage !== 'deleting' && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="flex items-center space-x-4 mb-6 pr-12">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              stage === 'completed' 
                ? 'bg-green-500/20 border-green-500/30' 
                : stage === 'error'
                ? 'bg-red-500/20 border-red-500/30'
                : 'bg-red-500/20 border-red-500/30'
            }`}>
              {stage === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : stage === 'error' ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {stage === 'completed' ? 'Vault Deleted' : 
                 stage === 'error' ? 'Deletion Failed' : 'Delete Vault'}
              </h2>
              <p className="text-slate-400">
                {stage === 'completed' ? 'All data has been permanently removed' :
                 stage === 'error' ? 'An error occurred during deletion' :
                 'This action cannot be undone'}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Confirmation Stage */}
            {stage === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Vault Info */}
                <Card className="p-4 bg-slate-800/30 border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{vaultName}</h3>
                      <p className="text-sm text-slate-400">This vault will be permanently deleted</p>
                    </div>
                  </div>
                </Card>

                {/* Warning */}
                <Card className="p-4 bg-red-900/20 border-red-500/30">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-300">This will permanently delete:</h4>
                      <ul className="space-y-1 text-sm text-red-200">
                        <li>• All messages and memories in this vault</li>
                        <li>• All media files (photos, videos, documents)</li>
                        <li>• All recipient assignments</li>
                        <li>• The vault "{vaultName}" itself</li>
                        <li>• All associated metadata and timestamps</li>
                      </ul>
                      <div className="mt-3 p-3 bg-red-800/30 rounded-lg">
                        <p className="text-sm text-red-200 font-medium">
                          ⚠️ This action cannot be undone. All data will be permanently lost.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Confirmation Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Type the vault name to confirm: <span className="text-red-400 font-semibold">{vaultName}</span>
                    </label>
                    <Input
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={`Type "${vaultName}" to confirm`}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                      disabled={stage !== 'confirm'}
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="understand-risks"
                      checked={understoodRisks}
                      onCheckedChange={(checked) => setUnderstoodRisks(!!checked)}
                      disabled={stage !== 'confirm'}
                    />
                    <label htmlFor="understand-risks" className="text-sm text-slate-300 leading-relaxed">
                      I understand that this action is permanent and cannot be undone. 
                      All data associated with this vault will be permanently deleted.
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={!isDeleteEnabled}
                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Vault Permanently
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Deleting Stage */}
            {stage === 'deleting' && (
              <motion.div
                key="deleting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Deleting Vault</h3>
                  <p className="text-slate-400">{currentStep}</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <p className="text-sm text-slate-300">
                    Please wait while we safely remove all vault data...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Completed Stage */}
            {stage === 'completed' && deletionStats && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Vault Deleted Successfully</h3>
                  <p className="text-slate-400">All data has been permanently removed</p>
                </div>
                
                <Card className="p-4 bg-green-900/20 border-green-500/30">
                  <h4 className="font-semibold text-green-300 mb-3">Deletion Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-green-200">Entries Deleted</div>
                      <div className="text-lg font-semibold text-white">{deletionStats.entriesDeleted}</div>
                    </div>
                    <div>
                      <div className="text-green-200">Recipients Removed</div>
                      <div className="text-lg font-semibold text-white">{deletionStats.recipientsDeleted}</div>
                    </div>
                  </div>
                  {deletionStats.cloudinaryFiles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-500/20">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-green-200">
                          <Cloud className="w-4 h-4 mr-1" />
                          Media Files Cleaned
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {deletionStats.cloudinaryFiles.length} files
                        </Badge>
                      </div>
                    </div>
                  )}
                </Card>

                <p className="text-sm text-slate-400">
                  Redirecting back to vaults...
                </p>
              </motion.div>
            )}

            {/* Error Stage */}
            {stage === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Deletion Failed</h3>
                  <p className="text-slate-400">An error occurred while deleting the vault</p>
                </div>

                <Card className="p-4 bg-red-900/20 border-red-500/30">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-300 mb-1">Error Details</h4>
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRetry}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}