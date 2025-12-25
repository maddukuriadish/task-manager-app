import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthProvider';
import { useAuth } from './utils/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Tasks from './pages/Tasks';

/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication
 * If user is not logged in, redirect to login page
 * If user is logged in, show the requested page
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  // Logged in, show the page
  return children;
}

/**
 * Main App Component
 * 
 * Structure:
 * 1. BrowserRouter - enables routing
 * 2. AuthProvider - provides auth context to all routes
 * 3. Routes - defines all pages
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - anyone can access */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes - must be logged in */}
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } 
      />
      
      {/* Default route - redirect to tasks if logged in, login if not */}
      <Route path="/" element={<RedirectHome />} />
      
      {/* 404 - any other route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Home redirect logic
 * If logged in → go to tasks
 * If not logged in → go to login
 */
function RedirectHome() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/tasks' : '/login'} replace />;
}

/**
 * Root App Component
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}