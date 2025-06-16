import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { VaultProvider } from '@/contexts/VaultContext';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { Navigation } from '@/components/Navigation';
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

import './App.css';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <VaultProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/vault/:id/recipient" element={<RecipientView />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Navigation />
                      <main className="flex-1 w-full lg:w-auto">
                        <Dashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/vaults" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Navigation />
                      <main className="flex-1 w-full lg:w-auto">
                        <VaultsPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/vaults/:id" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Navigation />
                      <main className="flex-1 w-full lg:w-auto">
                        <VaultDetailPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/contacts" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Navigation />
                      <main className="flex-1 w-full lg:w-auto">
                        <ContactsPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/timeline" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Navigation />
                      <main className="flex-1 w-full lg:w-auto">
                        <TimelinePage />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Navigation />
                      <main className="flex-1 w-full lg:w-auto">
                        <SettingsPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              <PWAInstallPrompt />
              <Toaster />
            </div>
          </Router>
        </VaultProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;