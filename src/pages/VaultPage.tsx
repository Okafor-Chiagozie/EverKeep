import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/supabaseClient';
import { VaultService, Vault } from '@/lib/supabase/vaultService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VaultPage() {
  const { user } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultDescription, setNewVaultDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const vaultService = new VaultService(getSupabaseClient());

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await vaultService.getVaults();
      if (error) throw error;
      setVaults(data || []);
    } catch (error) {
      console.error('Error fetching vaults:', error);
      toast.error('Failed to fetch vaults');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVault = async () => {
    if (!newVaultName.trim()) {
      toast.error('Vault name is required');
      return;
    }

    try {
      setIsCreating(true);
      const { data, error } = await vaultService.createVault(newVaultName, newVaultDescription);
      if (error) throw error;

      setVaults(prev => [data!, ...prev]);
      setNewVaultName('');
      setNewVaultDescription('');
      setIsDialogOpen(false);
      toast.success('Vault created successfully');
    } catch (error) {
      console.error('Error creating vault:', error);
      toast.error('Failed to create vault');
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please sign in to access your vaults</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Vaults</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Vault
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Vault</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  value={newVaultName}
                  onChange={(e) => setNewVaultName(e.target.value)}
                  placeholder="Enter vault name"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newVaultDescription}
                  onChange={(e) => setNewVaultDescription(e.target.value)}
                  placeholder="Enter vault description"
                />
              </div>
              <Button
                onClick={handleCreateVault}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Vault'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : vaults.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-500">No vaults found. Create your first vault to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <Card key={vault.id}>
              <CardHeader>
                <CardTitle>{vault.name}</CardTitle>
                <CardDescription>
                  Created {new Date(vault.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{vault.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 