import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'

export function SharedVaultView() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vaultData, setVaultData] = useState<any>(null)

  useEffect(() => {
    const fetchVault = async () => {
      setLoading(true)
      setError('')
      setVaultData(null)
      try {
        if (!token) {
          setError('No share token provided')
          setLoading(false)
          return
        }
        // Call backend share verification endpoint
        const { data } = await api.post('/vaults/share/verify', { token })
        if (!data?.success) {
          setError(data?.message || 'Invalid or expired share link')
        } else {
          setVaultData(data?.data)
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to validate share link')
      } finally {
        setLoading(false)
      }
    }
    fetchVault()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Validating vault access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/95 border-red-500/30">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to EverKeep
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // If vaultData is loaded, show the decrypted vault content
  if (vaultData) {
    const { vault, entries, recipients } = vaultData
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="p-6 mb-6 bg-slate-900/95 border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Digital Vault Access</h1>
                <p className="text-slate-400">You've been granted access to a secure digital vault</p>
              </div>
            </div>
          </Card>

          {/* Vault Content */}
          <Card className="p-6 mb-6 bg-green-900/20 border-green-500/30">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-300 mb-2">Vault: {vault?.name}</h3>
              {vault?.description && <p className="text-green-200 mb-2">{vault.description}</p>}
            </div>
            <div>
              <h4 className="text-green-200 font-semibold mb-2">Entries:</h4>
              {entries && entries.length > 0 ? (
                <ul className="space-y-2">
                  {entries.map((entry: any) => (
                    <li key={entry.id} className="bg-slate-800/50 rounded p-3">
                      <div className="text-slate-100 font-bold">{entry.type}</div>
                      <div className="text-slate-300 whitespace-pre-wrap break-words">{entry.content}</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-400">No entries found in this vault.</div>
              )}
            </div>
          </Card>

          {/* Recipients (optional, for transparency) */}
          <Card className="p-6 bg-blue-900/20 border-blue-500/30">
            <h4 className="text-blue-200 font-semibold mb-2">Designated Recipients:</h4>
            {recipients && recipients.length > 0 ? (
              <ul className="space-y-2">
                {recipients.map((r: any) => (
                  <li key={r.id} className="text-blue-100">
                    {r.contacts?.name} ({r.contacts?.email})
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-blue-400">No recipients found for this vault.</div>
            )}
          </Card>
        </div>
      </div>
    )
  }

  // Fallback (should not reach here)
  return null
}