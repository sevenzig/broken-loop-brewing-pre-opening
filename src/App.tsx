import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { BeerPage } from './pages/BeerPage';
import { IndividualBeerPage } from './pages/IndividualBeerPage';
import { RouteLoader } from './components/RouteLoader/RouteLoader';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { PreloadManager } from './components/PreloadManager/PreloadManager';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Analytics } from '@vercel/analytics/react';
import { useBusinessStatus } from './hooks/useBusinessStatus';
import { useAgeVerificationSettings } from './hooks/useAgeVerificationSettings';
import './App.css';

// Lazy load ALL non-critical components for faster initial load
const Header = lazy(() => import('./components/Header/Header').then(m => ({ default: m.Header })));
const Footer = lazy(() => import('./components/Footer/Footer').then(m => ({ default: m.Footer })));
const ComingSoonSplash = lazy(() => import('./components/ComingSoonSplash/ComingSoonSplash'));
const AgeVerificationModal = lazy(() => import('./components/AgeVerificationModal/AgeVerificationModal'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute/ProtectedRoute').then(m => ({ default: m.ProtectedRoute })));

// Lazy load admin routes (highest impact, least traffic)
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminBeerCreatePage = lazy(() => import('./pages/AdminBeerCreatePage'));
const AdminBeerEditPage = lazy(() => import('./pages/AdminBeerEditPage'));

// Lazy load demo/style guide pages (development-only routes)
const DebugPage = lazy(() => import('./pages/DebugPage'));
const ButtonDemoPage = lazy(() => import('./pages/ButtonDemoPage'));
const ResponsiveTestPage = lazy(() => import('./pages/ResponsiveTestPage'));
const StyleGuidePage = lazy(() => import('./pages/StyleGuidePage'));
const StyleDetailPage = lazy(() => import('./pages/StyleDetailPage'));

// Lazy load secondary pages (less critical)
const FoodPage = lazy(() => import('./pages/FoodPage'));
const IndividualFoodPage = lazy(() => import('./pages/IndividualFoodPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AIOptimizedFAQ = lazy(() => import('./pages/faq'));

function App() {
  // Use the business status hook for persistent business status
  const { loading: businessStatusLoading } = useBusinessStatus();
  
  // Use the age verification settings hook
  const { loading: ageVerificationSettingsLoading } = useAgeVerificationSettings();
  
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isCheckingAge, setIsCheckingAge] = useState(true);
  const location = useLocation();

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Determine if business is open (temporarily forced to false to always show ComingSoonSplash)
  const isBusinessOpen = true; // businessStatus?.isOpen ?? false;

  // Check if age verification is enabled (temporarily disabled)
  const isAgeVerificationEnabled = false; // ageVerificationSettings?.enabled ?? true;

  // Handle age verification
  const handleAgeVerification = () => {
    setIsAgeVerified(true);
    sessionStorage.setItem('ageVerified', 'true');
  };

  // Check if user has already verified their age in this session
  useEffect(() => {
    const hasVerified = sessionStorage.getItem('ageVerified');
    
    if (hasVerified) {
      setIsAgeVerified(true);
    } else {
      // Skip age verification and go straight to business status check
      setIsAgeVerified(true);
    }
    
    setIsCheckingAge(false);
  }, []);

  // Show loading state while checking age verification settings, business status, or age verification
  if (isCheckingAge || businessStatusLoading || ageVerificationSettingsLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#1a1a1a'
      }}>
        <div style={{ color: '#D4AF37', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <ToastProvider position="top-right">
      <AuthProvider>
        <PreloadManager>
          <div className="app">
            {/* Main app content - always rendered but blurred when not verified */}
            <div className={!isAgeVerified ? 'app-blurred' : ''}>
              <ScrollToTop />
              {!isAdminRoute && (
                <Suspense fallback={<div style={{ height: '80px', backgroundColor: '#1a1a1a' }} />}>
                  <Header />
                </Suspense>
              )}
              <main>
                <Routes>
                  {/* Critical path - keep synchronous for immediate loading */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/beer" element={<BeerPage />} />
                  <Route path="/beers/:slug" element={<IndividualBeerPage />} />
                  <Route path="/food" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <FoodPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/food/:slug" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <IndividualFoodPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/events" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <EventsPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/events/:slug" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <EventDetailPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/about" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <AboutPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  
                  {/* Lazy loaded demo/style guide pages */}
                  <Route path="/debug" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <DebugPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/button-demo" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <ButtonDemoPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/button-examples" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <ButtonDemoPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/responsive-test" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <ResponsiveTestPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/beers/style-guide" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <StyleGuidePage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/beers/style-guide/:styleCode" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <StyleDetailPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  
                  <Route path="/store" element={
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <h1>Online Store</h1>
                      <p>Coming Soon!</p>
                    </div>
                  } />
                  
                  {/* Lazy loaded FAQ */}
                  <Route path="/faq" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader />}>
                        <AIOptimizedFAQ />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  
                  {/* Lazy loaded admin routes */}
                  <Route path="/admin/login" element={
                    <ErrorBoundary>
                      <Suspense fallback={<RouteLoader message="Loading admin login..." />}>
                        <AdminLoginPage onLoginSuccess={() => {}} />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  
                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={
                    <Suspense fallback={<RouteLoader message="Loading admin panel..." />}>
                      <ProtectedRoute requiredPermissions={['admin:access']}>
                        <ErrorBoundary>
                          <AdminPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="/admin/beers/new" element={
                    <Suspense fallback={<RouteLoader message="Loading beer creation form..." />}>
                      <ProtectedRoute requiredPermissions={['admin:access', 'beer:create']}>
                        <ErrorBoundary>
                          <AdminBeerCreatePage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="/admin/beers/:uuid/edit" element={
                    <Suspense fallback={<RouteLoader message="Loading beer edit form..." />}>
                      <ProtectedRoute requiredPermissions={['admin:access', 'beer:update']}>
                        <ErrorBoundary>
                          <AdminBeerEditPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    </Suspense>
                  } />
                </Routes>
              </main>
              <Suspense fallback={<div style={{ height: '200px', backgroundColor: '#1a1a1a' }} />}>
                <Footer />
              </Suspense>
            </div>
            
            {/* Age verification modal overlay - exempt admin routes and when disabled */}
            {!isAgeVerified && !isAdminRoute && isAgeVerificationEnabled && (
              <Suspense fallback={null}>
                <AgeVerificationModal onVerify={handleAgeVerification} />
              </Suspense>
            )}
            
            {/* Coming soon splash overlay - shows after age verification if business is not open, exempt admin routes */}
            {isAgeVerified && !isBusinessOpen && !isAdminRoute && (
              <Suspense fallback={null}>
                <ComingSoonSplash />
              </Suspense>
            )}
            
            <Analytics mode="production" />
          </div>
        </PreloadManager>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
