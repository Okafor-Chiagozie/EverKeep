import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { VaultProvider } from '@/contexts/VaultContext';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import Navigation from '@/components/Navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { PricingPage } from '@/pages/PricingPage';
import { ContactPage } from '@/pages/ContactPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { Dashboard } from '@/pages/Dashboard';
import { VaultsPage } from '@/pages/VaultsPage';
import { VaultDetailPage } from '@/pages/VaultDetailPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { TimelinePage } from '@/pages/TimelinePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { RecipientView } from '@/pages/RecipientView';
import { SharedVaultView } from '@/pages/SharedVaultView'; // NEW IMPORT

import './App.css';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/vault/:id/recipient" element={<RecipientView />} />
          
          {/* NEW ROUTE - Public vault sharing (no auth required) */}
          <Route path="/vault/share/:token" element={<SharedVaultView />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="flex min-h-[100dvh]">
                <Navigation />
                <main className="flex-1 min-w-0 overflow-y-auto">
                  <Dashboard />
                </main>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/vaults" element={
            <ProtectedRoute>
              <div className="flex min-h-[100dvh]">
                <Navigation />
                <main className="flex-1 min-w-0 overflow-y-auto">
                  <VaultsPage />
                </main>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/vaults/:id" element={
            <ProtectedRoute>
              <div className="flex min-h-[100dvh]">
                <Navigation />
                <main className="flex-1 min-w-0 overflow-y-auto">
                  <VaultDetailPage />
                </main>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/contacts" element={
            <ProtectedRoute>
              <div className="flex min-h-[100dvh]">
                <Navigation />
                <main className="flex-1 min-w-0 overflow-y-auto">
                  <ContactsPage />
                </main>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/timeline" element={
            <ProtectedRoute>
              <div className="flex min-h-[100dvh]">
                <Navigation />
                <main className="flex-1 min-w-0 overflow-y-auto">
                  <TimelinePage />
                </main>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="flex min-h-[100dvh]">
                <Navigation />
                <main className="flex-1 min-w-0 overflow-y-auto">
                  <SettingsPage />
                </main>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Footer />
        <PWAInstallPrompt />
        <Toaster />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <VaultProvider>
          <AppContent />
        </VaultProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;