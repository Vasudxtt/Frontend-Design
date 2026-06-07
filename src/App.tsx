import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { CreateTestPage } from './pages/CreateTest';
import { QuestionCreationPage } from './pages/QuestionCreation';
import { ConfirmationPage } from './pages/Confirmation';
import { TestTrackingPage } from './pages/TestTracking';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 2 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/create"
            element={
              <ProtectedRoute>
                <CreateTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/edit"
            element={
              <ProtectedRoute>
                <CreateTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/questions"
            element={
              <ProtectedRoute>
                <QuestionCreationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/confirmation"
            element={
              <ProtectedRoute>
                <ConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <TestTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '10px', fontSize: '14px' },
          success: { style: { background: '#ECFDF5', color: '#065F46', border: '1px solid #D1FAE5' } },
          error: { style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FEE2E2' } },
        }}
      />
    </QueryClientProvider>
  );
}
