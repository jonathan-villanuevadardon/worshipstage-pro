import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { Toaster } from 'sonner';

import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import RoleBasedDashboard from './pages/dashboards/RoleBasedDashboard';
import SettingsPage from './pages/settings/SettingsPage';
import OrganizationSettingsPage from './pages/settings/OrganizationSettingsPage';

import UserManagementPage from './pages/management/UserManagementPage';
import TeamManagementPage from './pages/management/TeamManagementPage';
import RoleManagementPage from './pages/management/RoleManagementPage.jsx';

import SongLibraryPage from './pages/songs/SongLibraryPage';
import SongFormPage from './pages/songs/SongFormPage';
import SongDetailPage from './pages/songs/SongDetailPage';
import SongCategoriesPage from './pages/songs/SongCategoriesPage';

import RepertoireLibraryPage from './pages/repertoires/RepertoireLibraryPage.jsx';
import RepertoireCreatePage from './pages/repertoires/RepertoireCreatePage';
import RepertoireEditPage from './pages/repertoires/RepertoireEditPage';
import RepertoireDetailPage from './pages/repertoires/RepertoireDetailPage.jsx';
import RepertoirePreviewPage from './pages/repertoires/RepertoirePreviewPage';

import CalendarPage from './pages/scheduling/CalendarPage';
import TeamAssignmentPanel from './pages/scheduling/TeamAssignmentPanel';
import AvailabilityCalendar from './pages/scheduling/AvailabilityCalendar';

import ChatPage from './pages/chat/ChatPage.jsx';
import NotificationPanel from './pages/notifications/NotificationPanel.jsx';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<RoleBasedDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              <Route 
                path="/organizations" 
                element={<ProtectedRoute allowedRoles={['super_admin']}><OrganizationSettingsPage /></ProtectedRoute>} 
              />
              <Route 
                path="/users" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader']}><UserManagementPage /></ProtectedRoute>} 
              />
              <Route 
                path="/teams" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader']}><TeamManagementPage /></ProtectedRoute>}
              />
              <Route 
                path="/role-management" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader']}><RoleManagementPage /></ProtectedRoute>} 
              />
              
              <Route path="/songs" element={<SongLibraryPage />} />
              <Route 
                path="/songs/new" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader']}><SongFormPage /></ProtectedRoute>} 
              />
              <Route path="/songs/:id" element={<SongDetailPage />} />
              <Route 
                path="/songs/:id/edit" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader']}><SongFormPage /></ProtectedRoute>} 
              />
              <Route 
                path="/songs/categories" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor']}><SongCategoriesPage /></ProtectedRoute>} 
              />

              <Route 
                path="/repertoires" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader', 'musician', 'volunteer']}><RepertoireLibraryPage /></ProtectedRoute>} 
              />
              <Route 
                path="/repertoires/new" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader']}><RepertoireCreatePage /></ProtectedRoute>} 
              />
              <Route 
                path="/repertoires/:id" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader', 'musician', 'volunteer']}><RepertoireDetailPage /></ProtectedRoute>} 
              />
              <Route 
                path="/repertoires/:id/edit" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader']}><RepertoireEditPage /></ProtectedRoute>} 
              />
              <Route path="/repertoires/:id/preview" element={<RepertoirePreviewPage />} />

              <Route 
                path="/calendar" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader', 'musician', 'volunteer']}><CalendarPage /></ProtectedRoute>} 
              />
              <Route 
                path="/assignments" 
                element={<ProtectedRoute allowedRoles={['super_admin', 'church_admin', 'pastor', 'worship_leader']}><TeamAssignmentPanel /></ProtectedRoute>} 
              />
              <Route path="/availability" element={<AvailabilityCalendar />} />
              
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/notifications" element={<NotificationPanel />} />

              <Route path="/services" element={<Navigate to="/calendar" replace />} />
              <Route path="/schedule" element={<Navigate to="/calendar" replace />} />
            </Route>

            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground mb-8">Page not found</p>
                <a href="/" className="text-primary hover:underline">Back to home</a>
              </div>
            } />
          </Routes>
          
          <Toaster richColors position="top-right" theme="dark" />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
